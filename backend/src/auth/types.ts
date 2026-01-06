export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  avatar_url: string;
  level: number;
  is_2fa_enabled: number;
  status: 'online' | 'offline' | 'in_game';
  created_at: string;
}

export interface UserInput {
  username: string;
  email: string;
  password_hash: string;
}
