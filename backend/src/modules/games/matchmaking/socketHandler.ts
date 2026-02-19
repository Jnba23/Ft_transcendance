import { SessionManager } from '../../../core/sockets/gameSessionManager.js';
import { Server } from 'socket.io';
import { mmServ } from './MatchMakingService.js';
import * as types from './types.js';

export const setupMmHandlers = (io: Server) => {
  const matchMakingNs = io.of('/matchmaking');
  matchMakingNs.on('connection', (socket) => {
    socket.on('join-queue', (data) => {
      socket.data.userId = data.userId;
      const entry: types.QueueEntry = {
        userId: data.userId,
        username: data.visitorName,
        gameType: data.gameType,
        joinedAt: new Date(),
        socketId: socket.id,
      };
      const match = mmServ.addToQueue(entry);
      if (!match)
        socket.emit('waiting-for-op', {
          message: 'Searching for opponent',
          time: entry.joinedAt,
        });
      else {
        SessionManager.createNewSession(match);
        const p1_socket = matchMakingNs.sockets.get(match.player1.socketId);
        const p2_socket = matchMakingNs.sockets.get(match.player2.socketId);
        if (p1_socket && p2_socket) {
          [p1_socket, p2_socket].forEach((s) => {
            s.emit('match-found', {
              gameId: match.gameId,
              gameType: match.gameType,
              opponent:
                s.id === p1_socket.id
                  ? match.player2.username
                  : match.player1.username,
            });
          });
        }
      }
    });
    socket.on('disconnect', (reason) => {
      console.log(`Client with ${socket.id} disconnected: ${reason}`);
      if (socket.data.userId)
        mmServ.removeFromQueue(socket.data.userId.toString());
    });
  });
};
