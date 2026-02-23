import { Server } from 'socket.io';
import { SessionManager } from '../../core/sockets/gameSessionManager.js';
import { RpsServ } from './RpsGameManager.js';
import { saveCompleteGames } from '../gamePersistence.js';
import * as RpsTypes from '../types.js';

export const setupRpsHandler = (io: Server) => {
  const RpsNs = io.of('/rps');
  RpsNs.on('connection', (socket) => {
    socket.on('join-game', (data: { gameId: string; userId: number }) => {
      const { gameId, userId } = data;
      const matchInfo = SessionManager.getSession(gameId);
      if (!matchInfo) {
        socket.emit('error', { message: "Game session doesn't exist" });
        return;
      }
      if (
        matchInfo.player1.userId !== userId &&
        matchInfo.player2.userId != userId
      ) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }
      socket.join(gameId);
      socket.data.gameId = gameId;
      socket.data.userId = userId;
      if (!RpsServ.getGame(gameId)) RpsServ.createGame(matchInfo);
      RpsServ.markPlayerConnected(gameId, userId, socket.id);
      RpsServ.cancelReconnectionTimer(gameId);
      const game = RpsServ.getGame(gameId);
      socket.emit('joined-game', {
        gameId,
        gameState: {
          currentRound: game?.currentRound,
          player1: {
            userId: game?.player1.userId,
            name: game?.player1.name,
            score: game?.player1.score,
            isConnected: game?.player1.isConnected,
          },
          player2: {
            userId: game?.player2.userId,
            name: game?.player2.name,
            score: game?.player2.score,
            isConnected: game?.player2.isConnected,
          },
          phase: game?.phase,
          roundsToWin: game?.roundsToWin,
        },
      });

      if (RpsNs.adapter.rooms.get(gameId)?.size === 2) {
        const game = RpsServ.getGame(gameId);
        if (!game) return;
        RpsNs.to(gameId).emit('game-start', {
          message: `Round ${game.gameId} - Make your choice!`,
          roundsToWin: game.roundsToWin,
        });
        [game.player1.userId, game.player2.userId].forEach((userId) => {
          RpsServ.startAutoChoiceTimer(gameId, userId, () => {
            RpsNs.to(gameId).emit('auto-choice-made', {
              message: `The player ${userId} took too long, random choice mad`,
              userId: userId,
            });
          });
        });
      }
    });
    socket.on('make-choice', (data: { choice: RpsTypes.Choice }) => {
      const gameId = socket.data.gameId;
      const userId = socket.data.userId;

      if (!gameId || !userId) {
        socket.emit('Not in a game');
        return;
      }
      if (!['rock', 'paper', 'scissors'].includes(data.choice)) {
        socket.emit('Invalid choice!');
        return;
      }
      const success = RpsServ.makeChoice(gameId, userId, data.choice);
      if (!success) {
        socket.emit('error', { message: 'Failed to record choice' });
        return;
      }
      const game = RpsServ.getGame(gameId);
      if (!game) return;
      if (game.timers.autoChoice) {
        clearTimeout(game.timers.autoChoice);
        game.timers.autoChoice = undefined;
      }
      socket.emit('choice-recorded', {
        choice: data.choice,
        message: 'Waiting for opponnent...',
      });
      if (RpsServ.bothPlayersReady(gameId)) {
        game.phase = 'revealing';
        game.timers.roundReveal = setTimeout(() => {
          RpsNs.to(gameId).emit('round-results', {
            p1Coice: game.player1.currentChoice,
            p2Coice: game.player2.currentChoice,
            p1Score: game.player1.score,
            p2Score: game.player2.score,
            round: game.currentRound,
          });
          if (game.phase === 'game-over') {
            if (!game.winner) {
              RpsNs.to(gameId).emit('error', {
                message: "Game can't end without a winner !",
              });
              return;
            }
            saveCompleteGames({
              gameId: game.gameId,
              gameType: 'rps',
              player1Id: game.player1.userId,
              player2Id: game.player2.userId,
              player1Name: game.player1.name,
              player2Name: game.player2.name,
              winnerId: game.winner,
              player1Score: game.player1.score,
              player2Score: game.player2.score,
            });
            RpsNs.to(gameId).emit('game-over', {
              winnerId: game.winner,
              winnerName:
                game.winner === game.player1.userId
                  ? game.player1.name
                  : game.player2.name,
              finalScore: {
                player1: game.player1.score,
                player2: game.player2.score,
              },
            });
            game.timers.cleanup = setTimeout(() => {
              SessionManager.deleteSession(gameId);
              RpsServ.clearAllTimers(gameId);
              RpsServ.deleteGame(gameId);
            }, 3000);
          } else {
            game.phase = 'waiting';
            setTimeout(() => {
              RpsNs.to(gameId).emit('new-round', {
                round: game.currentRound,
                message: `Moving on to round number ${game.currentRound} - Make your choice !`,
              });
              [game.player1.userId, game.player2.userId].forEach((userId) => {
                RpsServ.startAutoChoiceTimer(gameId, userId, () => {
                  RpsNs.to(gameId).emit('auto-choice-made', {
                    message: `The player ${userId} took too long, random choice mad`,
                    userId: userId,
                  });
                });
              });
            }, 3000);
          }
        }, 1000);
      }
    });
    socket.on('disconnect', (_reason) => {
      const gameId = socket.data.gameId;
      const userId = socket.data.userId;

      if (!gameId || !userId) return;

      const game = RpsServ.getGame(gameId);
      if (!game) return;
      RpsServ.markPlayerDisconnected(gameId, userId);
      RpsNs.to(gameId).emit('Opponent-disconnected', {
        message: 'Opponent disconnected ! Waiting for reconnection ...',
      });
      RpsServ.startReconnectionTimer(gameId, userId, () => {
        RpsNs.to(gameId).emit('game-over', {
          winnerId: game.winner,
          winnerName:
            game.winner === game.player1.userId
              ? game.player1.name
              : game.player2.name,
          reason: 'Forfeit',
          message: 'Opponent failed to reconnect',
        });
        saveCompleteGames({
          gameId: gameId,
          gameType: 'rps',
          player1Id: game.player1.userId,
          player2Id: game.player2.userId,
          player1Name: game.player1.name,
          player2Name: game.player2.name,
          player1Score: game.player1.score,
          player2Score: game.player2.score,
          winnerId: game.winner!,
        });
        setTimeout(() => {
          SessionManager.deleteSession(gameId);
          RpsServ.clearAllTimers(gameId);
          RpsServ.deleteGame(gameId);
        }, 3000);
      });
    });
  });
};
