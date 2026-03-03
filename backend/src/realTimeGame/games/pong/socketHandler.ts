import { Server } from 'socket.io';
import { SessionManager } from '../../core/gameSessionManager.js';
import { PongServ } from './Pong.js';
import { socketAuthMiddleware } from '../../../middleware/socketAuthMiddleware.js';
import { saveCompleteGames } from '../../persistence/gamePersistence.js';

export const setupPongHandler = (io: Server) => {
  const PongNs = io.of('/pong').use(socketAuthMiddleware);

  PongNs.on('connection', (socket) => {
    socket.on('join-game', ({ gameId }) => {
      const session = SessionManager.get(gameId);
      const userId = socket.data.userId;

      if (!session) {
        socket.emit('error', { message: 'Game session not found' });
        return;
      }

      if (!userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      if (
        session.player1.userId !== userId &&
        session.player2.userId !== userId
      ) {
        socket.emit('error', { message: 'Not part of this game' });
        socket.disconnect();
        return;
      }

      // Create game if first time
      if (!PongServ.getGame(gameId)) PongServ.createGame(session);

      const game = PongServ.getGame(gameId);
      if (!game) return;

      if (
        (game.player1.userId === userId &&
          game.player1.isConnected &&
          game.player1.socketId !== socket.id) ||
        (game.player2.userId === userId &&
          game.player2.isConnected &&
          game.player2.socketId !== socket.id)
      ) {
        socket.emit('error', { message: 'Already connected from another tab' });
        socket.disconnect();
        return;
      }

      socket.join(gameId);
      socket.data.gameId = gameId;

      // Reconnection logic

      if (game.reconnectionTimer) {
        clearTimeout(game.reconnectionTimer);
        game.reconnectionTimer = undefined;
      }

      if (game.player1.userId === userId) {
        game.player1.isConnected = true;
        game.player1.socketId = socket.id;
      } else if (game.player2.userId === userId) {
        game.player2.isConnected = true;
        game.player2.socketId = socket.id;
      }

      game.state.isPaused = false;

      socket.emit('game_init', {
        state: game.state,
        player1N: game.player1.name,
        player2N: game.player2.name,
      });

      if (
        game.player1.isConnected &&
        game.player2.isConnected &&
        game.state.isPlaying
      )
        PongServ.resumeGameLoop(gameId, PongNs);
    });

    socket.on('start_game', () => {
      const gameId = socket.data.gameId;
      const userId = socket.data.userId;
      if (!gameId || !userId) return;

      PongServ.setPlayerReady(gameId, userId, PongNs);
    });

    socket.on('input', (keys) => {
      const gameId = socket.data.gameId;
      const userId = socket.data.userId;

      if (!gameId || !userId) return;
      PongServ.updatePlayerKeys(gameId, userId, keys);
    });

    socket.on('disconnect', () => {
      const gameId = socket.data.gameId;
      const userId = socket.data.userId;

      if (!gameId || !userId) return;

      const game = PongServ.getGame(gameId);
      if (!game) return;

      // stop game loop
      if (game.intervalId) {
        clearInterval(game.intervalId);
        game.intervalId = undefined;
      }

      game.state.isPaused = true;

      // mark player disconnected
      if (game.player1.userId === userId) game.player1.isConnected = false;
      else if (game.player2.userId === userId) game.player2.isConnected = false;

      // Broadcast the paused state to the remaining player
      PongNs.to(gameId).emit('game_update', game.state);

      // Check for Double Disconnect (Abort Game Rule)
      if (!game.player1.isConnected && !game.player2.isConnected) {
        if (game.reconnectionTimer) {
          clearTimeout(game.reconnectionTimer);
          game.reconnectionTimer = undefined;
        }

        PongNs.to(gameId).emit('game_aborted');
        PongServ.deleteGame(gameId);
        SessionManager.remove(gameId);
        return;
      }

      // start reconnection timer (10 sec)
      game.reconnectionTimer = setTimeout(() => {
        const winner =
          game.player1.userId === userId
            ? game.player2.userId
            : game.player1.userId;

        PongNs.to(gameId).emit('match_results', {
          player1Score: game.state.score.player1,
          player2Score: game.state.score.player2,
          player1Name: game.player1.name,
          player2Name: game.player2.name,
          winnerId: winner,
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
          winnerId: winner,
          player1Score: game.state.score.player1,
          player2Score: game.state.score.player2,
        });

        PongServ.deleteGame(gameId);
        SessionManager.remove(gameId);

        PongNs.to(gameId).emit('player_left');
      }, 10000);
    });
  });
};
