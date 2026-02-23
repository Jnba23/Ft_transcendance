import { useEffect } from 'react';
import { useUserDirectoryStore } from "@stores/userDirectory.store";
import { useFriendRequestsStore } from '@stores/friendRequests.store';
import { useDirectMessagesStore } from "@stores/directMessages.store"
import { getSocket } from '@services/chat/socket';
import { useAuth } from '@context/AuthContext';
import { handleNewConversation, handleNewMessage } from '@realtime/handlers';

function useAppHydration() {
	const { user: me } = useAuth();
	const currentUserId = me?.id;

	const intializeUserDirectory = useUserDirectoryStore(
		(state) => state.initialize
	);
	const initializeDirectMessages = useDirectMessagesStore(
		(state) => state.initialze
	);
	const initializeFriendRequests = useFriendRequestsStore(
    	(state) => state.initialize
  	);

	useEffect(() => {
		intializeUserDirectory(me);
		initializeDirectMessages();
		initializeFriendRequests();
	}, [intializeUserDirectory, initializeFriendRequests, initializeDirectMessages]);

	useEffect(() => {
		if (!currentUserId) return;

		const socket = getSocket();
		socket.emit('register', currentUserId);

		// register socket events
		socket.on('newConversation', handleNewConversation);
		socket.on('newMessage', handleNewMessage);

		return () => {
			socket.off('newConversation', handleNewConversation);
			socket.off('newMessage', handleNewMessage);
		};
	}, [currentUserId]);
}

export default useAppHydration;