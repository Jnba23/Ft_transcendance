import { create } from 'zustand'
import { Conversation } from 'types/conversation';
import { chatApi } from '@api/chat.api';

interface DirectMessagesState {
	conversations: Conversation[],
	isLoading: boolean,

	initialze: () => void,

	addConversation: (convo: Conversation) => void,
	removeConversation: (id: number) => void,
	getConversationById: (id: number) => Conversation | undefined,
	getConversationByUserId: (userId: number) => Conversation | undefined,
	replaceConversation: (updated: Conversation) => void,
	incrementUnread: (convo_id: number) => void
}

export const useDirectMessagesStore = create<DirectMessagesState>((set, get) => ({
	conversations: [],
	isLoading: true,

	initialze: async () => {
		const response = await chatApi.getConversations();
		const { conversations } = response.data;

		set({conversations, isLoading: false});
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
	},

	getConversationById: (id) => {
		const conversations = get().conversations;
		const result = conversations.find(c => c.id === id);

		return result;
	},

	getConversationByUserId: (userId) => {
		const conversations = get().conversations;
		const result = conversations.find(c => c.user.id == userId);

		return result;
	},

	replaceConversation: (updated) => {
		set((state) => ({
			conversations: state.conversations.map(c => 
				c.id == updated.id ? updated : c
			)
		}));
	},

	incrementUnread: (convo_id) => {
		let convo = get().getConversationById(convo_id);

		convo!.unread_count += 1;

		get().removeConversation(convo_id);
		get().addConversation(convo!);
	},
}));