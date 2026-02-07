import { Server, Socket } from 'socket.io';
import { Server as HttpServer} from 'http';
import { config } from '../../auth/config/index.js';

export let io: Server;

export const initSocket = (server: HttpServer) => {
	io = new Server(server, {
		cors:{
			origin: config.corsOrigin,
			methods: ['GET','POST'],
			credentials: true
		}
	});
	io.on('connection', (socket: Socket) => {
		console.log(`New connection on ${socket.id}`);
		socket.on('disconnect', () => {
			console.log(`User disconnected on ${socket.id}`);
		});
	});
	return io;
}