import { Manager } from 'socket.io-client';

let manager: Manager | null = null;

export function getManager() {
  if (!manager) {
    // Use undefined to connect to same origin (respects current protocol)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || undefined;
    manager = new Manager(socketUrl, {
      withCredentials: true,
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
