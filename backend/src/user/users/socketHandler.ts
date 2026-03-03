import { Server } from "socket.io";
import { socketAuthMiddleware } from "../../middleware/socketAuthMiddleware.js";

export const setupUsersHandler = (io: Server) => {
	const usersNs = io.of('/users');

	usersNs.use(socketAuthMiddleware);

	usersNs.on('connection', (socket) => {
		console.log('usersNs: Socket connected', socket.id);

		socket.on('disconnect', () => {
			console.log('usersNs: Socket disconnected: ', socket.id);
		});
	});
}