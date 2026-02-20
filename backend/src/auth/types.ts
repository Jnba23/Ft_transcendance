export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  avatar_url: string;
  level: number;
  status: 'online' | 'offline' | 'in_game';
  is_2fa_enabled: number;
  two_fa_secret?: string | null;
  google_id?: string | null;
  created_at: string;
  // game stats
  pong_wins?: number;
  pong_losses?: number;
  chess_wins?: number;
  chess_losses?: number;
}

export interface UserInput {
  username: string;
  email: string;
  password_hash: string;
}

export type SafeUser = Omit<User, 'password_hash' | 'two_fa_secret'>;

export type PublicUser = Pick<
  User,
  'id' | 'username' | 'avatar_url' | 'level' | 'status'
>;
