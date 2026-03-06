import { Server } from 'socket.io';
import { SessionManager } from '../../core/gameSessionManager.js';
import { RpsServ } from './RPS.js';
import { socketAuthMiddleware } from '../../../middleware/socketAuthMiddleware.js';
// import { saveCompleteGames } from '../../persistence/gamePersistence.js';
import * as RpsTypes from './types.js';

export const setupRpsHandler = (io: Server) => {
  const RpsNs = io.of('/rps').use(socketAuthMiddleware);
  RpsNs.on('connection', (socket) => {
    socket.on('join-game', (data: { gameId: string }) => {
      const { gameId } = data;
      const userId = socket.data.userId;
      console.log('🎮 Player joining:', userId, 'GameID:', gameId);
      const matchInfo = SessionManager.get(gameId);
      if (!matchInfo) {
        socket.emit('error', { message: 'Game session not found' });
        return;
      }
      if (!userId) {
        console.log('❌ No userId in socket.data');
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }
      console.log('✅ Auth passed for userId:', userId);
      if (
        matchInfo.player1.userId !== userId &&
        matchInfo.player2.userId != userId
      ) {
        socket.emit('error', {
          message: 'Not part of this game, Unauthorized',
        });
        return;
      }
      if (!RpsServ.getGame(gameId)) RpsServ.createGame(matchInfo);
      const game = RpsServ.getGame(gameId);
      if (!game) return;
      if (
        game.player1.userId === userId &&
        game.player1.isConnected &&
        game.player1.socketId !== socket.id
      ) {
        const prevSoc = RpsNs.sockets.get(game.player1.socketId);
        if (prevSoc) {
          prevSoc.emit('error', {
            message: 'You did connect from a new tab',
          });
          prevSoc.disconnect();
        }
      } else if (
        game.player2.userId === userId &&
        game.player2.isConnected &&
        game.player2.socketId !== socket.id
      ) {
        const prevSoc = RpsNs.sockets.get(game.player2.socketId);
        if (prevSoc) {
          prevSoc.emit('error', {
            message: 'You did connect from a new tab',
          });
          prevSoc.disconnect();
        }
      }
      socket.join(gameId);
      socket.data.gameId = gameId;
      RpsServ.markPlayerConnected(gameId, userId, socket.id);
      RpsServ.cancelReconnectionTimer(gameId);
      RpsNs.to(gameId).emit('opponent-reconnected', {
        message: 'Opponent reconnected!',
      });
      socket.emit('game_init', {
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
        game.phase = 'choosing';
        RpsNs.to(gameId).emit('game-start', {
          message: `Round ${game.gameId} - Make your choice!`,
          roundsToWin: game.roundsToWin,
        });
        [game.player1.userId, game.player2.userId].forEach((userId) => {
          const choices: RpsTypes.Choice[] = ['paper', 'rock', 'scissors'];
          const randChoice = choices[Math.floor(Math.random() * 3)];
          RpsServ.startAutoChoiceTimer(gameId, userId, () => {
            // if (game.timers.autoChoice) clearTimeout(game.timers.autoChoice);
            const targetSocket =
              userId === game.player1.userId
                ? game.player1.socketId
                : game.player2.socketId;
            RpsNs.to(targetSocket).emit('auto-choice-made', {
              message: `You took too long, random choice made`,
              choice: randChoice,
              userId: userId,
            });
          });
        });
      }
    });
    socket.on('make-choice', (data: { choice: RpsTypes.Choice }) => {
      console.log(data);
      const gameId = socket.data.gameId;
      const userId = socket.data.userId;

      if (!gameId || !userId) {
        socket.emit('error', { message: 'Not in a game' });
        return;
      }
      if (!['rock', 'paper', 'scissors'].includes(data.choice)) {
        socket.emit('error', { message: 'Invalid choice!' });
        return;
      }
      const success = RpsServ.makeChoice(gameId, userId, data.choice);
      if (!success) {
        socket.emit('error', { message: 'Failed to record choice' });
        return;
      }
      const game = RpsServ.getGame(gameId);
      if (!game) return;
      const player =
        socket.id === game.player1.socketId ? 'autoChoiceP1' : 'autoChoiceP2';
      if (game.timers[player]) {
        clearTimeout(game.timers[player]);
        game.timers[player] = undefined;
      }
      socket.emit('choice-recorded', {
        choice: data.choice,
        message: 'Waiting for opponent...',
      });
      if (RpsServ.bothPlayersReady(gameId)) {
        game.timers.roundReveal = setTimeout(() => {
          RpsNs.to(gameId).emit('round-results', {
            p1Choice: game.player1.currentChoice,
            p2Choice: game.player2.currentChoice,
            p1Score: game.player1.score,
            p2Score: game.player2.score,
            round: game.currentRound - 1,
          });
          game.player1.currentChoice = undefined;
          game.player2.currentChoice = undefined;
          if (game.phase === 'game-over') {
            if (!game.winner) {
              RpsNs.to(gameId).emit('error', {
                message: "Game can't end without a winner !",
              });
              return;
            }
            // saveCompleteGames({
            //   gameId: game.gameId,
            //   gameType: 'rps',
            //   player1Id: game.player1.userId,
            //   player2Id: game.player2.userId,
            //   player1Name: game.player1.name,
            //   player2Name: game.player2.name,
            //   winnerId: game.winner,
            //   player1Score: game.player1.score,
            //   player2Score: game.player2.score,
            // });
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
              SessionManager.remove(gameId);
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
                const choices: RpsTypes.Choice[] = [
                  'paper',
                  'rock',
                  'scissors',
                ];
                const randChoice = choices[Math.floor(Math.random() * 3)];
                RpsServ.startAutoChoiceTimer(gameId, userId, () => {
                  // if (game.timers.autoChoice) clearTimeout(game.timers.autoChoice);
                  const targetSocket =
                    userId === game.player1.userId
                      ? game.player1.socketId
                      : game.player2.socketId;
                  RpsNs.to(targetSocket).emit('auto-choice-made', {
                    message: `You took too long, random choice made`,
                    choice: randChoice,
                    userId: userId,
                  });
                });
              });
            }, 3000);
          }
        }, 1000);
      }
    });
    socket.on('disconnect', (reason) => {
      const gameId = socket.data.gameId;
      const userId = socket.data.userId;

      if (!gameId || !userId) return;

      const game = RpsServ.getGame(gameId);
      if (!game) return;
      RpsServ.markPlayerDisconnected(gameId, userId);
      RpsNs.to(gameId).emit('opponent-disconnected', {
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
        // saveCompleteGames({
        //   gameId: gameId,
        //   gameType: 'rps',
        //   player1Id: game.player1.userId,
        //   player2Id: game.player2.userId,
        //   player1Name: game.player1.name,
        //   player2Name: game.player2.name,
        //   player1Score: game.player1.score,
        //   player2Score: game.player2.score,
        //   winnerId: game.winner!,
        // });
        setTimeout(() => {
          SessionManager.remove(gameId);
          RpsServ.clearAllTimers(gameId);
          RpsServ.deleteGame(gameId);
        }, 3000);
      });
    });
  });
};
