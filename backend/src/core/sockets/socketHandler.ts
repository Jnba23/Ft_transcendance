import { Server } from 'socket.io';
import { socketAuthMiddleware } from '../../middleware/socketAuthMiddleware.js';
import { authService } from '../../auth/auth/service.js';

export const setupRootHandler = (io: Server) => {
  const usersNs = io.of('/users');
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const room = `user_${userId}`;

    socket.join(room);

    const roomSize = getRoomSize(io, room);

    if (roomSize === 1) {
      authService.updateOnlineStatus(userId, 'online');
      usersNs.emit('updateOnlineStatus', {
        userId,
        status: 'online',
      });
    }

    socket.on('disconnecting', () => {
      const roomSize = getRoomSize(io, room);

      if (roomSize === 1) {
        authService.updateOnlineStatus(userId, 'offline');
        usersNs.emit('updateOnlineStatus', {
          userId,
          status: 'offline',
        });
      }
    });
  });
};

function getRoomSize(io: Server, room: string) {
  return io.of('/').adapter.rooms.get(room)?.size ?? 0;
}
