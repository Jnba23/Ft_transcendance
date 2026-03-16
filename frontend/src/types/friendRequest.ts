export interface Friendship {
  id: number;
  user_id_1: number;
  user_id_2: number;
  status: 'pending' | 'accepted';
  created_at: string;
}

export interface FriendRequestWithUser extends Friendship {
  user_id: number;
  username: string;
  avatar_url: string;
  user_status: string;
}

export type FriendAction = 'accept' | 'decline' | 'cancel' | 'remove';
