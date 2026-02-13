import { create } from 'zustand'
import { User } from 'types/user'
import { Message } from 'types/message'
import { Conversation } from 'types/conversation'
import axios from 'axios'
import { get } from 'node:http'

interface ChatState {
	conversation_id: number | null,
	user: User | null,
	messages: Message[],
	update: (convo: Conversation, markConvoRead: () => void) => void
	addMessage: (content: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({ // active chat's state
	conversation_id: null,
	user: null,
	messages: [],

	update: async (convo, markConvoRead) => {
		set({
			conversation_id: convo.id,
			user: convo.user
		});

		const messagesRes = await fetchMessages(convo.id);
		const messages = messagesRes.data;

		set({ messages });

		if (convo.unread_count) {
			await markAsRead(convo.id);
			markConvoRead();
		}
	},

	addMessage: async (content) => {
		const messageRes = await postMessage(get().conversation_id!, content);

		const message = {
			id: messageRes.data.message_id,
			sender_id: 1, // get from jwt backend
			content,
			sent_at: messageRes.data.sent_at
		}

		set((state) => ({
			messages: [...state.messages, message]
		}));
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

async function markAsRead(conversation_id: number) {
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