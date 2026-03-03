import { Conversation } from 'types/conversation';
import { client } from './client';
import { Message } from 'types/message';

interface CreateConversationReq {
  other_id: number;
}

interface CreateConversationRes {
  status: string;
  data: {
    conversation_id: number;
  };
}

interface CreateMessageReq {
  conversation_id: number;
  content: string;
}

interface CreateMessageRes {
  status: string;
  data: {
    message_id: number;
    sent_at: string;
  };
}

interface GetConversationsRes {
  status: string;
  results: number;
  data: {
    conversations: Conversation[];
  };
}

interface GetMessagesRes {
  status: string;
  results: number;
  data: {
    messages: Message[];
  };
}

interface MarkConversationReadRes {
  status: string;
}

export const chatApi = {
  createConversation: async (data: CreateConversationReq) => {
    const response = await client.post<CreateConversationRes>(
      '/chat/conversations',
      data
    );
    return response.data;
  },

  createMessage: async (data: CreateMessageReq) => {
    const response = await client.post<CreateMessageRes>(
      '/chat/messages',
      data
    );
    return response.data;
  },

  getConversations: async () => {
    const response = await client.get<GetConversationsRes>(
      '/chat/conversations'
    );
    return response.data;
  },

  getMessages: async (conversation_id: number) => {
    const response = await client.get<GetMessagesRes>(
      `/chat/conversations/${conversation_id}/messages`
    );
    return response.data;
  },

  markConversationRead: async (conversation_id: number) => {
    const response = await client.post<MarkConversationReadRes>(
      `/chat/conversations/${conversation_id}/read`
    );
    return response.data;
  },
};
