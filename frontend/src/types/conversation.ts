import { UserSummaryRes } from '@api/user.api'

export interface Conversation {
	id: number,
	user: UserSummaryRes,
	unread_count: number
}