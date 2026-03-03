import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { setupMmHandlers } from '../../realTimeGame/matchmaking/socketHandler.js';
import { setupPongHandler } from '../../realTimeGame/games/pong/socketHandler.js';
import { setupRpsHandler } from '../../realTimeGame/games/rps/socketHandler.js';
import { setupChatHandler } from '../../chat/socketHandler.js';
import { config } from '../../config/index.js';
import { setupFriendsHandler } from '../../user/friends/socketHandler.js';
import { setupRootHandler } from './socketHandler.js';
import { setupUsersHandler } from '../../user/users/socketHandler.js';

export let io: Server;

export const initSocketIo = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  setupRootHandler(io);
  setupMmHandlers(io);
  setupPongHandler(io);
  setupRpsHandler(io);
  setupChatHandler(io);
  setupFriendsHandler(io);
  setupUsersHandler(io);
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
