import { User } from 'types/user';

export interface newConversationPayload {
  conversation_id: number;
  user: User;
}
