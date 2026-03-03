import { Server } from 'socket.io';
import { socketAuthMiddleware } from '../../middleware/socketAuthMiddleware.js';

export const setupFriendsHandler = (io: Server) => {
  const friendsNs = io.of('friends');

  friendsNs.use(socketAuthMiddleware);

  friendsNs.on('connection', (socket) => {
    socket.join(`user_${socket.data.userId}`);

    socket.on('disconnect', () => {});
  });
};
