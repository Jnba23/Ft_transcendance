import { getSocket } from "@services/socket";
import { handleNewConversation, handleNewMessage } from "./handlers";

export function registerSocketEvents() {
	const socket = getSocket();

	socket.on('newMessage', handleNewMessage);
	socket.on('newConversation', handleNewConversation);
}