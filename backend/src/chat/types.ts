export interface ConversationRow {
  user_id_1: number;
  user_id_2: number;
}

export interface MessageRow {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  sent_at: string;
}

export interface ConversationListRow {
  conversation_id: number;
  // User part
  user_id: number;
  username: string;
  avatar_url: string;
  level: number;
  status: string;
  hasFriendRequest: number;
  //
  unread_count: number;
}
