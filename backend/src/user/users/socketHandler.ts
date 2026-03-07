import { Server } from 'socket.io';
import { socketAuthMiddleware } from '../../middleware/socketAuthMiddleware.js';

export const setupUsersHandler = (io: Server) => {
  const usersNs = io.of('/users');

  usersNs.use(socketAuthMiddleware);

  usersNs.on('connection', (socket) => {
    socket.on('disconnect', () => {});
  });
};
