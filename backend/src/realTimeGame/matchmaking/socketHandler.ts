import { Server } from 'socket.io';
import { mmServ } from './MatchMakingService.js';
import * as types from './types.js';
import { SessionManager } from '../core/gameSessionManager.js';
import { socketAuthMiddleware } from '../../middleware/socketAuthMiddleware.js';
import { getDb } from '../../core/database.js';

export const setupMmHandlers = (io: Server) => {
  const matchMakingNs = io.of('/matchmaking').use(socketAuthMiddleware);

  matchMakingNs.on('connection', (socket) => {
    console.log('connected to matchmaking');
    socket.on('join-queue', (data) => {
      console.log('Joined queue');
      const userId = socket.data.userId;

      const gameId = SessionManager.getGameId(userId);
      if (gameId) {
        socket.emit('reconnect-game', gameId);
        return;
      }
      // End

      if (!userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const db = getDb();
      const user = db
        .prepare('SELECT username FROM users WHERE id = ?')
        .get(userId) as { username: string } | undefined;

      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      const entry: types.QueueEntry = {
        userId,
        username: user.username,
        gameType: data.gameType,
        joinedAt: new Date(),
        socketId: socket.id,
      };

      const match = mmServ.addToQueue(entry);

      if (match) {
        SessionManager.add(match);
        console.log('matched');
        const p1Socket = matchMakingNs.sockets.get(match.player1.socketId);
        const p2Socket = matchMakingNs.sockets.get(match.player2.socketId);

        if (p1Socket && p2Socket) {
          [p1Socket, p2Socket].forEach((s) => {
            s.emit('match-found', {
              gameId: match.gameId,
              gameType: match.gameType,
              opponent:
                s.id === p1Socket.id
                  ? match.player2.username
                  : match.player1.username,
            });
          });
        }
      }
    });

    socket.on('leave-queue', () => {
      const userId = socket.data.userId;
      if (userId) mmServ.removeFromQueue(userId);
    });

    socket.on('disconnect', () => {
      if (socket.data.userId) mmServ.removeFromQueue(socket.data.userId);
    });
  });
};
