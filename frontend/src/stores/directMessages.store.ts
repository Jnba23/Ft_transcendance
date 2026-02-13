import { create } from 'zustand'
import { Conversation } from 'types/conversation';
import axios from 'axios';

interface DirectMessagesState {
	conversations: Conversation[],

	initialze: () => void,

	addConversation: (convo: Conversation) => void,
	removeConversation: (id: number) => void
}

export const useDirectMessagesStore = create<DirectMessagesState>((set) => ({
	conversations: [],

	initialze: async () => {
		const convosRes = await axios.get("http://localhost:4950/api/users/1/conversations"); // future take from jwt
		const conversations = convosRes.data;

		set({conversations});
	},

	addConversation: (convo) => {
		set((state) => ({
			conversations: [convo, ...state.conversations]
		}));
	},

	removeConversation: (id) => {
		set((state) => ({
			conversations: state.conversations.filter(c => c.id != id)
		}))
	}
}));