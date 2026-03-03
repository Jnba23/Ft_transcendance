import { Server } from  'socket.io'
import { socketAuthMiddleware } from '../../middleware/socketAuthMiddleware.js'

export const setupFriendsHandler = (io: Server) => {
	const friendsNs = io.of('friends');

	friendsNs.use(socketAuthMiddleware);

	friendsNs.on('connection', (socket) => {
		console.log('friendsNs: Socket connected', socket.id);
		socket.join(`user_${socket.data.userId}`);

		socket.on('disconnect', () => {
			console.log('friendsNs: Socket disconnected: ', socket.id);
		});
	});
}