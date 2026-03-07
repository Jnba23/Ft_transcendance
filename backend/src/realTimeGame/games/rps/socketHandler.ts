import { Server } from 'socket.io';
import { SessionManager } from '../../core/gameSessionManager.js';
import { RpsServ } from './RPS.js';
import { socketAuthMiddleware } from '../../../middleware/socketAuthMiddleware.js';
import { saveCompleteGames } from '../../persistence/gamePersistence.js';
import * as RpsTypes from './types.js';

export const setupRpsHandler = (io: Server) => {
  const RpsNs = io.of('/rps').use(socketAuthMiddleware);
  RpsNs.on('connection', (socket) => {
    console.log(
      `rps socket connected: ${socket.id} | user ID: ${socket.data.userId}`
    );
    socket.on('join-game', (data: { gameId: string }) => {
      const { gameId } = data;
      const userId = socket.data.userId;

      if (!userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const matchInfo = SessionManager.get(gameId);
      if (!matchInfo) {
        socket.emit('error', { message: 'Game session not found' });
        return;
      }
      if (
        matchInfo.player1.userId !== userId &&
        matchInfo.player2.userId !== userId
      ) {
        socket.emit('error', { message: 'Not part of this game' });
        socket.disconnect();
        return;
      }

      // Create game state if this is the first connection
      if (!RpsServ.getGame(gameId)) RpsServ.createGame(matchInfo);

      const game = RpsServ.getGame(gameId);
      if (!game) return;

      // Kick stale socket if the same player reconnects from another tab
      if (
        game.player1.userId === userId &&
        game.player1.isConnected &&
        game.player1.socketId !== socket.id
      ) {
        const oldSocket = RpsNs.sockets.get(game.player1.socketId);
        if (oldSocket) {
          oldSocket.emit('error', {
            message: 'Already connected from another tab',
          });
          oldSocket.disconnect();
        }
      } else if (
        game.player2.userId === userId &&
        game.player2.isConnected &&
        game.player2.socketId !== socket.id
      ) {
        const oldSocket = RpsNs.sockets.get(game.player2.socketId);
        if (oldSocket) {
          oldSocket.emit('error', {
            message: 'Already connected from another tab',
          });
          oldSocket.disconnect();
        }
      }

      socket.join(gameId);
      socket.data.gameId = gameId;

      // Cancel any pending reconnection timer and mark player connected
      RpsServ.cancelReconnectionTimer(gameId);
      RpsServ.markPlayerConnected(gameId, userId, socket.id);

      // Notify the other player that this player (re)connected, but only if game already started
      if (game.phase !== 'waiting') {
        RpsNs.to(gameId).emit('opponent-reconnected', {
          message: 'Opponent reconnected!',
        });
      }

      // Determine if this join triggers game start (both players connected for the first time)
      const isGameStart =
        game.player1.isConnected &&
        game.player2.isConnected &&
        game.phase === 'waiting';

      if (isGameStart) {
        game.phase = 'choosing';
      }

      const gameStatePayload = {
        gameId,
        gameState: {
          currentRound: game.currentRound,
          player1: {
            userId: game.player1.userId,
            name: game.player1.name,
            score: game.player1.score,
            isConnected: game.player1.isConnected,
          },
          player2: {
            userId: game.player2.userId,
            name: game.player2.name,
            score: game.player2.score,
            isConnected: game.player2.isConnected,
          },
          phase: game.phase,
          roundsToWin: game.roundsToWin,
        },
      };

      // Always send joined-game directly to the joining socket
      socket.emit('joined-game', gameStatePayload);

      if (isGameStart) {
        // Also send updated state to the other player (so they see both connected + phase=choosing)
        const otherSocketId =
          userId === game.player1.userId
            ? game.player2.socketId
            : game.player1.socketId;
        if (otherSocketId) {
          RpsNs.to(otherSocketId).emit('joined-game', gameStatePayload);
        }

        // Notify both players game is starting
        RpsNs.to(gameId).emit('game-start', {
          message: `Round ${game.currentRound} - Make your choice!`,
          roundsToWin: game.roundsToWin,
        });

        [game.player1.userId, game.player2.userId].forEach((uId) => {
          const choices: RpsTypes.Choice[] = ['paper', 'rock', 'scissors'];
          const randChoice = choices[Math.floor(Math.random() * 3)];
          RpsServ.startAutoChoiceTimer(gameId, uId, () => {
            const targetSocket =
              uId === game.player1.userId
                ? game.player1.socketId
                : game.player2.socketId;
            if (targetSocket) {
              RpsNs.to(targetSocket).emit('auto-choice-made', {
                message: `You took too long, random choice made`,
                choice: randChoice,
                userId: uId,
              });
            }
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
        // Don't override phase here - resolveRound already set it
        game.timers.roundReveal = setTimeout(() => {
          RpsNs.to(gameId).emit('round-results', {
            p1Choice: game.player1.currentChoice,
            p2Choice: game.player2.currentChoice,
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
            // Remove session immediately so players can rematch right away
            SessionManager.remove(gameId);
            game.timers.cleanup = setTimeout(() => {
              RpsServ.clearAllTimers(gameId);
              RpsServ.deleteGame(gameId);
            }, 3000);
          } else {
            // Clear choices from previous round
            game.player1.currentChoice = undefined;
            game.player2.currentChoice = undefined;
            game.phase = 'choosing';
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
    socket.on('disconnect', (_reason) => {
      console.log(
      `rps socket disconnected: ${socket.id} | user ID: ${socket.data.userId}`
    );
      const gameId = socket.data.gameId;
      const userId = socket.data.userId;

      if (!gameId || !userId) return;

      const game = RpsServ.getGame(gameId);
      if (!game) return;
      RpsServ.markPlayerDisconnected(gameId, userId);

      // If both players are now disconnected, end the match without saving
      if (!game.player1.isConnected && !game.player2.isConnected) {
        RpsServ.clearAllTimers(gameId);
        SessionManager.remove(gameId);
        RpsServ.deleteGame(gameId);
        return;
      }

      RpsNs.to(gameId).emit('opponent-disconnected', {
        message: 'Opponent disconnected ! Waiting for reconnection ...',
      });
      RpsServ.startReconnectionTimer(gameId, userId, () => {
        // If the remaining player also disconnected while waiting, skip save
        if (!game.player1.isConnected && !game.player2.isConnected) {
          SessionManager.remove(gameId);
          RpsServ.clearAllTimers(gameId);
          RpsServ.deleteGame(gameId);
          return;
        }
        RpsNs.to(gameId).emit('game-over', {
          winnerId: game.winner,
          winnerName:
            game.winner === game.player1.userId
              ? game.player1.name
              : game.player2.name,
          reason: 'Forfeit',
          message: 'Opponent failed to reconnect',
          finalScore: {
            player1: game.player1.score,
            player2: game.player2.score,
          },
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
        // Remove session immediately so players can rematch right away
        SessionManager.remove(gameId);
        setTimeout(() => {
          RpsServ.clearAllTimers(gameId);
          RpsServ.deleteGame(gameId);
        }, 3000);
      });
    });
  });
};
