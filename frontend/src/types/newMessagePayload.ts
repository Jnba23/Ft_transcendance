import { Message } from "types/message"

export interface newMessagePayload {
	conversation_id: number,
	message: Message
}