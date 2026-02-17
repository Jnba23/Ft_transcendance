import { useEffect } from 'react';
import { useUserDirectoryStore } from "@stores/userDirectory.store";
import { useFriendRequestsStore } from '@stores/friendRequests.store';
import { useDirectMessagesStore } from "@stores/directMessages.store"
import { getSocket } from '@services/socket';
import { newMessagePayload } from 'types/newMessagePayload';
import { markAsRead, useChatStore } from '@stores/chat.store';
import { newConversationPayload } from 'types/newConversationPayload';
import { Conversation } from 'types/conversation';

function useAppHydration() {
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
		intializeUserDirectory();
		initializeDirectMessages();
		// initializeFriendRequests();
	}, [intializeUserDirectory, initializeFriendRequests, initializeDirectMessages]);

	useEffect(() => {
		const socket = getSocket();
		socket.emit('register', 1);
	});

	useEffect(() => {
		const socket = getSocket();

		const handleNewMessage = async (payload: newMessagePayload) => {
			console.log("new message received!");

			const chatStore = useChatStore.getState();
			const dmStore = useDirectMessagesStore.getState();

			const isActive = chatStore.isOpen &&
				payload.conversation_id === chatStore.conversation_id;

			if (isActive) {
				chatStore.appendMessage(payload.message);
				if (payload.message.sender_id !== 1)
					await markAsRead(payload.conversation_id);
			} else if (payload.message.sender_id !== 1) {
				dmStore.incrementUnread(payload.conversation_id);
			}
		}

		socket.on('newMessage', handleNewMessage);

		return () => {
			socket.off('newMessage', handleNewMessage);
		};
	}, []);

	useEffect(() => {
		const socket = getSocket();

		const handleNewConversation = (payload: newConversationPayload) => {
			const dmStore = useDirectMessagesStore.getState();
			const chatstore = useChatStore.getState();

			const newConvo: Conversation = {
				id: payload.conversation_id,
				user: payload.user,
				unread_count: 0
			}

			dmStore.addConversation(newConvo);

			// to let the user create their own conversation using this event
			//
			// we want to set the received convo id to the open chat
			//  if it is open with the user we created the convo with

			if (chatstore.isOpen && newConvo.user.id === chatstore.user?.id) {
				chatstore.setConversationId(newConvo.id);
			}
		};

		socket.on('newConversation', handleNewConversation);

		return () => {
			socket.off('newConversation', handleNewConversation);
		};
	}, []);
}

export default useAppHydration;