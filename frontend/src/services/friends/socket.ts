import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null;

export function getFriendsSocket() {
	if (!socket) {
		socket = io(`${import.meta.env.VITE_SOCKET_URL}/friends`, {
			withCredentials: true
		});
	}
	return socket;
}