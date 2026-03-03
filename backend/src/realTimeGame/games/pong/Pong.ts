import { MatchResult } from '../../matchmaking/types.js';
import { createInitialGameState, updateGame } from './engine.js';
import { KeyboardState } from './game.types.js';
import { PongGameState } from './types.js';
import { Namespace } from 'socket.io';
import { SessionManager } from '../../core/gameSessionManager.js';
import { saveCompleteGames } from '../../persistence/gamePersistence.js';

class PongGameManager {
  private games: Map<string, PongGameState> = new Map();

  createGame(match: MatchResult) {
    const game: PongGameState = {
      gameId: match.gameId,
      player1: {
        userId: match.player1.userId,
        name: match.player1.username,
        socketId: match.player1.socketId,
        isConnected: false,
        isReady: false,
      },
      player2: {
        userId: match.player2.userId,
        name: match.player2.username,
        socketId: match.player2.socketId,
        isConnected: false,
        isReady: false,
      },
      state: createInitialGameState(),

      player1Keys: {
        ArrowUp: false,
        ArrowDown: false,
        KeyW: false,
        KeyS: false,
      },
      player2Keys: {
        ArrowUp: false,
        ArrowDown: false,
        KeyW: false,
        KeyS: false,
      },
      winner: null,
    };

    this.games.set(match.gameId, game);
  }

  getGame(gameId: string) {
    return this.games.get(gameId);
  }

  updatePlayerKeys(gameId: string, userId: number, keys: KeyboardState) {
    const game = this.games.get(gameId);
    if (!game) return;

    if (game.player1.userId === userId) game.player1Keys = keys;
    else if (game.player2.userId === userId) game.player2Keys = keys;
  }

  setPlayerReady(gameId: string, userId: number, io: Namespace) {
    const game = this.games.get(gameId);
    if (!game) return;

    if (game.player1.userId === userId) {
      game.player1.isReady = true;
      game.state.player1Ready = true;
    } else if (game.player2.userId === userId) {
      game.player2.isReady = true;
      game.state.player2Ready = true;
    }

    // Broadcast readiness update
    io.to(gameId).emit('game_update', game.state);

    if (game.player1.isReady && game.player2.isReady && !game.intervalId)
      this.startGameLoop(gameId, io);
  }

  resumeGameLoop(gameId: string, io: Namespace) {
    this.startGameLoop(gameId, io);
  }

  private startGameLoop(gameId: string, io: Namespace) {
    const game = this.games.get(gameId);
    if (!game || game.intervalId) return;

    // Double check interval doesn't already exist and is just out of sync
    if (game.intervalId) {
      clearInterval(game.intervalId);
      game.intervalId = undefined;
    }

    game.state.isPlaying = true;

    game.intervalId = setInterval(() => {
      const mergedKeys = {
        ArrowUp: game.player1Keys.ArrowUp || game.player2Keys.ArrowUp,
        ArrowDown: game.player1Keys.ArrowDown || game.player2Keys.ArrowDown,
        KeyW: game.player1Keys.KeyW || game.player2Keys.KeyW,
        KeyS: game.player1Keys.KeyS || game.player2Keys.KeyS,
      };

      game.state = updateGame(game.state, mergedKeys, 0.016);
      io.to(gameId).emit('game_update', game.state);
      if (game.state.winner) {
        io.to(gameId).emit('game_over');

        const winnerId =
          game.state.winner === 'player1'
            ? game.player1.userId
            : game.player2.userId;

        io.to(gameId).emit('match_results', {
          player1Score: game.state.score.player1,
          player2Score: game.state.score.player2,
          player1Name: game.player1.name,
          player2Name: game.player2.name,
          winnerId,
          player1Id: game.player1.userId,
          player2Id: game.player2.userId,
        });

        saveCompleteGames({
          gameId,
          gameType: 'pong',
          player1Id: game.player1.userId,
          player2Id: game.player2.userId,
          player1Name: game.player1.name,
          player2Name: game.player2.name,
          winnerId,
          player1Score: game.state.score.player1,
          player2Score: game.state.score.player2,
        });

        this.deleteGame(gameId);
        SessionManager.remove(gameId);
      }
    }, 16);
  }

  stopGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    if (game.intervalId) {
      clearInterval(game.intervalId);
      game.intervalId = undefined;
    }

    game.winner =
      game.state.winner === 'player1'
        ? game.player1.userId
        : game.player2.userId;
  }

  deleteGame(gameId: string) {
    this.stopGame(gameId);
    this.games.delete(gameId);
  }
}

export const PongServ = new PongGameManager();
