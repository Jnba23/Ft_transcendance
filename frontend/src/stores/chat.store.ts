import { create } from 'zustand';
import { Message } from 'types/message';
import { Conversation } from 'types/conversation';
import { chatApi } from '@api/chat.api';
import { UserSummaryRes } from '@api/user.api';
import { useErrorStore } from './error.store';

interface ChatState {
  isOpen: boolean;
  isLoading: boolean;
  conversation_id: number | null;
  user: UserSummaryRes | null;
  messages: Message[];
  openChat: () => void;
  closeChat: () => void;
  setConversationId: (conversation_id: number) => void;
  update: (
    convo: Conversation | null,
    user: UserSummaryRes,
    markConvoRead: ((convo: Conversation) => void) | null
  ) => void;
  appendMessage: (message: Message) => void;
  sendMessage: (content: string) => void;
  setHasFriendRequest: (userId: number, hasFriendReq: number) => void;
  updateUserStatus: (userId: number, status: 'online' | 'offline') => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // active chat's state
  isOpen: false,
  isLoading: true,
  conversation_id: null,
  user: null,
  messages: [],

  openChat: () => {
    set({ isOpen: true });
  },

  closeChat: () => {
    set({ isOpen: false });
  },

  setConversationId: (conversation_id) => {
    set({ conversation_id });
  },

  update: async (convo, user, markConvoRead) => {
    const errorStore = useErrorStore.getState();

    set({
      isLoading: true,
      conversation_id: convo?.id,
      user,
      messages: [],
    });

    if (!convo) {
      set({ isLoading: false });
      return;
    }

    try {
      const response = await chatApi.getMessages(convo.id);
      const messages = response.data.messages;
      set({ messages, isLoading: false });
    } catch {
      errorStore.showError('Failed to fetch messages');
    } finally {
      set({ isLoading: false });
    }

    try {
      if (convo.unread_count) {
        await chatApi.markConversationRead(convo.id);
        markConvoRead?.(convo);
      }
    } catch {
      errorStore.showError('Failed to mark conversation as read');
    }
  },

  appendMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  sendMessage: async (content) => {
    let conversation_id = get().conversation_id;
    const user_id = get().user?.id;
    const errorStore = useErrorStore.getState();

    try {
      if (!conversation_id) {
        const response = await chatApi.createConversation({ other_id: user_id! });
        conversation_id = response.data.conversation_id;
      }

      await chatApi.createMessage({ conversation_id, content });
    } catch {
      errorStore.showError('failed to send message');
    }
  },

  setHasFriendRequest: (userId, hasFriendReq) => {
    const user = get().user;

    if (user?.id !== userId) return;

    user.hasFriendRequest = hasFriendReq;
    set({ user });
  },

  updateUserStatus: (userId, status) => {
    const user = get().user;

    if (user?.id !== userId) return;

    user.status = status;
    set({ user });
  },
}));
