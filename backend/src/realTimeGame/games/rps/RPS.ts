import * as RpsTypes from './types.js';
import * as MmTypes from '../../matchmaking/types.js';

class RpsGameManager {
  private games: Map<string, RpsTypes.RpsGameState> = new Map();
  createGame(match: MmTypes.MatchResult): void {
    const rpsGame: RpsTypes.RpsGameState = {
      gameId: match.gameId,
      player1: {
        userId: match.player1.userId,
        name: match.player1.username,
        score: 0,
        isConnected: true,
        socketId: match.player1.socketId,
      },
      player2: {
        userId: match.player2.userId,
        name: match.player2.username,
        score: 0,
        isConnected: true,
        socketId: match.player2.socketId,
      },
      currentRound: 1,
      roundsToWin: 3,
      phase: 'waiting',
      winner: null,
      timers: {
        autoChoiceP1: undefined,
        autoChoiceP2: undefined,
        reconnection: undefined,
        roundReveal: undefined,
        cleanup: undefined,
      },
    };
    this.games.set(match.gameId, rpsGame);
  }

  clearAllTimers(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) return;
    if (game.timers.autoChoiceP1) clearTimeout(game.timers.autoChoiceP1);
    if (game.timers.autoChoiceP2) clearTimeout(game.timers.autoChoiceP2);
    if (game.timers.reconnection) clearTimeout(game.timers.reconnection);
    if (game.timers.roundReveal) clearTimeout(game.timers.roundReveal);
    if (game.timers.cleanup) clearTimeout(game.timers.cleanup);
    game.timers = {};
  }

  startAutoChoiceTimer(
    gameId: string,
    userId: number,
    letEmKnow: () => void
  ): void {
    const game = this.games.get(gameId);
    if (!game) return;
    const key = game.player1.userId === userId ? 'autoChoiceP1' : 'autoChoiceP2';
    game.timers[key] = setTimeout(letEmKnow, 5000);
  }

  startReconnectionTimer(
    gameId: string,
    userId: number,
    onTimeout: () => void
  ): void {
    const game = this.games.get(gameId);
    if (!game) return;
    game.timers.reconnection = setTimeout(() => {
      const winner =
        game.player1.userId === userId
          ? game.player2.userId
          : game.player1.userId;
      game.phase = 'game-over';
      game.winner = winner;
      onTimeout();
    }, 5000);
  }

  cancelReconnectionTimer(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;
    if (game.timers.reconnection) {
      clearTimeout(game.timers.reconnection);
      game.timers.reconnection = undefined;
    }
  }

  markPlayerConnected(gameId: string, userId: number, socketId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;
    const player = game.player1.userId === userId ? game.player1 : game.player2;
    player.isConnected = true;
    player.socketId = socketId;
  }

  markPlayerDisconnected(gameId: string, userId: number): void {
    const game = this.games.get(gameId);
    if (!game) return;
    const player = game.player1.userId === userId ? game.player1 : game.player2;
    player.isConnected = false;
  }

  makeChoice(gameId: string, userId: number, choice: RpsTypes.Choice): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;
    if (game.phase !== 'choosing'){
      console.log(`⚠️ Ignoring choice - game phase is '${game.phase}', not 'choosing'`);
      return false;
    };
    if (userId === game.player1.userId){
      if (game.player1.currentChoice){
        console.log('P1 made a choice');
        return false;
      }
      game.player1.currentChoice = choice;
      console.log('P1' + choice);
    }
    else if (userId === game.player2.userId){
      if (game.player2.currentChoice){
        console.log('P2 made a choice');
        return false;
      }
      game.player2.currentChoice = choice;
      console.log('P2' + choice);
    }
    if (game.player1.currentChoice && game.player2.currentChoice)
      this.resolveRound(game);
    return true;
  }

  bothPlayersReady(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;
    if (!game.player1.currentChoice || !game.player2.currentChoice)
      return false;
    return true;
  }

  private resolveRound(game: RpsTypes.RpsGameState) {
    const choice1 = game.player1.currentChoice;
    const choice2 = game.player2.currentChoice;
    if (!choice1 || !choice2) return;
    const roundWinner = this.determineWinner(choice1, choice2);
    if (roundWinner === 1) game.player1.score++;
    else if (roundWinner === 2) game.player2.score++;
    else {
      // eslint-disable-next-line no-console
      console.log("It's a tie");
    }
    
    if (game.player1.score >= game.roundsToWin) {
      game.phase = 'game-over';
      game.winner = game.player1.userId;
    } else if (game.player2.score >= game.roundsToWin) {
      game.phase = 'game-over';
      game.winner = game.player2.userId;
    } else {
      game.phase = 'revealing';
      game.currentRound++;
    }
  }

  // determine winner returns 1 for p1, 2 for p2 or 0 for a tie
  private determineWinner(
    choice1: RpsTypes.Choice,
    choice2: RpsTypes.Choice
  ): number {
    if (choice1 === choice2) return 0;
    const winConditions: Record<RpsTypes.Choice, RpsTypes.Choice> = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper',
    };
    return winConditions[choice1] === choice2 ? 1 : 2;
  }
  getGame(gameId: string): undefined | RpsTypes.RpsGameState {
    return this.games.get(gameId);
  }

  deleteGame(gameId: string): boolean {
    return this.games.delete(gameId);
  }
}
export const RpsServ = new RpsGameManager();
