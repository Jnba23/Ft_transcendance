import { User } from 'types/user'

export interface Conversation {
	id: number,
	user: User,
	unread_count: number
}