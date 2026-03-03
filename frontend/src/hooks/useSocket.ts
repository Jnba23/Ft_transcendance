import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export const useSocket = (namespace: string) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		const newSocket = io(`${SOCKET_URL}${namespace}`, {
			withCredentials: true,
			autoConnect: true
		});

		newSocket.on('connect', () => {
			console.log(`Connected to ${namespace}`);
			setIsConnected(true);
		})

		newSocket.on('disconnect', () => {
			console.log(`Disconnected from ${namespace}`);
			setIsConnected(false);
		})

		setSocket(newSocket);
		return (() => {
			newSocket.close();
		});
	}, [namespace]);
	return { socket, isConnected };
}