import { create } from 'zustand'
import { User } from 'types/user'
import { Message } from 'types/message'
import { Conversation } from 'types/conversation'
import axios from 'axios'

interface AddMessageResult {
	isNewConversation: boolean,
	conversation: Conversation
}

interface ChatState {
	isOpen: boolean,
	conversation_id: number | null,
	user: User | null,
	messages: Message[],
	openChat: () => void
	closeChat: () => void
	setConversationId: (conversation_id: number) => void,
	update: (convo: Conversation | null, user: User, markConvoRead: ((convo: Conversation) => void) | null) => void
	appendMessage: (message: Message) => void,	
	addMessage: (content: string) => Promise<AddMessageResult>
}

export const useChatStore = create<ChatState>((set, get) => ({ // active chat's state
	isOpen: false,
	conversation_id: null,
	user: null,
	messages: [],
	isLoading: true,

	openChat: () => {
		set({isOpen: true});
	},

	closeChat: () => {
		set({isOpen: false});
	},

	setConversationId: (conversation_id) => {
		set({conversation_id});
	},

	update: async (convo, user, markConvoRead) => {
		set({
			conversation_id: convo?.id,
			user,
			messages: [],
		});

		if (!convo) return;

		const messagesRes = await fetchMessages(convo.id);
		const messages = messagesRes.data;
		set({ messages });

		if (convo.unread_count) {
			await markAsRead(convo.id);
			markConvoRead?.(convo);
		}
	},

	appendMessage: (message) => {
		set((state) => ({
			messages: [...state.messages, message]
		}));
	},

	addMessage: async (content) => {
		let conversation_id = get().conversation_id;
		const user_id = get().user?.id;
		let isNewConversation = false;

		if (!conversation_id) {
			const convoRes = await postConversation(1, user_id!); // get uid_1 from me
			conversation_id = convoRes.data.conversation_id;

			set({ conversation_id });

			isNewConversation = true;
		}

		await postMessage(conversation_id!, content);

		const result : AddMessageResult = {
			isNewConversation,
			conversation: {
				id: conversation_id!,
				user: get().user!,
				unread_count: 0
			}
		}

		return (result);
	}
}))

async function fetchMessages(conversation_id: number)
{
	return (
		axios.get(
			`http://localhost:4950/api/conversations/${conversation_id}/messages`
		)
	);
}

export async function markAsRead(conversation_id: number) {
	return (
		axios.post(
			`http://localhost:4950/api/conversations/${conversation_id}/read`,
			{user_id: 1}
		)
	);
}

async function postMessage(conversation_id: number, content: string) {
	return axios.post(`http://localhost:4950/api/messages`, {
		conversation_id,
		sender_id: 1, // replace with authed user id
		content
	});
}

async function postConversation(user_id_1: number, user_id_2: number)
{
	return axios.post('http://localhost:4950/api/conversations', {
		user_id_1,
		user_id_2
	});
}
