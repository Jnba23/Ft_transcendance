import { Conversation } from "types/conversation";
import { client } from "./client";
import { Message } from "types/message"

interface CreateConversationReq {
	other_id: number
}

interface CreateConversationRes {
	conversation_id: number
}

interface CreateMessageReq {
	conversation_id: number,
	content: string
}

interface CreateMessageRes {
	message_id: number,
	sent_at: string
}

interface GetConversationsRes {
	conversations: Conversation[]
}

interface GetMessagesRes {
	messages: Message[]
}

interface MarkConversationReadRes {
	status: boolean
}

export const chatApi = {
	createConversation: async (data: CreateConversationReq) => {
		const response = await client.post<CreateConversationRes>('/conversations', data); // add path
		return response.data;
	},

	createMessage: async (data: CreateMessageReq) => {
		const response = await client.post<CreateMessageRes>('/messages', data);
		return response.data;
	},

	getConversations: async () => {
		const response = await client.get<GetConversationsRes>('/conversations');
		return response.data;
	},

	getMessages: async (conversation_id: number) => {
		const response = await client.get<GetMessagesRes>(`/conversations/${conversation_id}/messages`);
		return response.data;
	},

	markConversationRead: async (conversation_id: number) => {
		const response = await client.post<MarkConversationReadRes>(`/conversations/${conversation_id}/read`);
		return response.data;
	}
}