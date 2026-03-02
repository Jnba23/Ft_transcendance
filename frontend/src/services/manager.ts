import { Manager } from 'socket.io-client'

let manager: Manager | null = null;

export function getManager() {
	if (!manager) {
		manager = new Manager(import.meta.env.VITE_SOCKET_URL, {
			withCredentials: true
		});
		manager.socket('/');
	}

	return manager;
}

export function destroyManager() {
	if (manager) {
		manager._close();
		manager = null;
	}
}