import { Server } from 'socket.io';
import { socketAuthMiddleware } from '../middleware/socketAuthMiddleware.js';

export const setupChatHandler = (io: Server) => {
  const chatNs = io.of('/chat');

  chatNs.use(socketAuthMiddleware);

  chatNs.on('connection', (socket) => {
    // console.log('Chat is connected: ', socket.id);
    socket.join(`user_${socket.data.userId}`);
    socket.on('disconnect', () => {
      // console.log('Chat is disconnected: ', socket.id);
    });
  });
};
