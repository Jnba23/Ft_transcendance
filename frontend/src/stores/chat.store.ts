import { create } from 'zustand'
import { Message } from 'types/message'
import { Conversation } from 'types/conversation'
import { chatApi } from '@api/chat.api'
import { UserSummaryRes } from '@api/user.api'

interface ChatState {
	isOpen: boolean,
	conversation_id: number | null,
	user: UserSummaryRes | null,
	messages: Message[],
	openChat: () => void
	closeChat: () => void
	setConversationId: (conversation_id: number) => void,
	update: (convo: Conversation | null, user: UserSummaryRes, markConvoRead: ((convo: Conversation) => void) | null) => void
	appendMessage: (message: Message) => void,	
	addMessage: (content: string) => void,
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

		const response = await chatApi.getMessages(convo.id);

		set({ messages: response.messages });

		if (convo.unread_count) {
			await chatApi.markConversationRead(convo.id);
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

		if (!conversation_id) {
			const response = await chatApi.createConversation({other_id: user_id!});
			conversation_id = response.conversation_id;
		}

		await chatApi.createMessage({conversation_id, content});
	}
}))