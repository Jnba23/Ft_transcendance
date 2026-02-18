import { Server, Socket } from 'socket.io';
import { Server as HttpServer} from 'http';
import { setupMmHandlers } from '../../realTimeGames/matchmaking/socketHandler.js';
import { setupPongHandler } from '../../realTimeGames/game/socketHandler.js';
import { setupRpsHandler } from '../../realTimeGames/scnd_game/socketHandler.js';
import { setupChatHandler } from '../../chat/socketHandler.js';
import { config } from '../../auth/config/index.js';

export let io: Server;

export const initSocketIo = (server: HttpServer) => {
	io = new Server(server, {
		cors:{
			origin: config.corsOrigin,
			methods: ['GET','POST'],
			credentials: true
		}
	});
	setupMmHandlers(io);
	setupPongHandler(io);
	setupRpsHandler(io);
	setupChatHandler(io);
	return io;
}