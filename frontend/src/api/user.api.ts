import { client } from './client';

// --- Types ---

export interface UserSummaryRes {
  id: number;
  username: string;
  avatar_url: string;
  level: number;
  status: 'online' | 'offline' | 'in_game';
}

export interface MyProfileRes {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  level: number;
  is_2fa_enabled: boolean;
  status: 'online' | 'offline' | 'in_game';
  created_at: string;
  pong_wins: number;
  pong_losses: number;
  chess_wins: number;
  chess_losses: number;
  win_streak: number;
}

export interface UpdateProfileReq {
  username?: string;
  avatarUrl?: string; // Note: Schema said avatarUrl in request body
}

export interface UserProfileRes {
  id: number;
  username: string;
  avatar_url: string;
  level: number;
  status: 'online' | 'offline' | 'in_game';
  created_at: string;
  pong_wins: number;
  pong_losses: number;
  chess_wins: number;
  chess_losses: number;
  win_streak: number;
}

export interface GetAllUsersRes {
  status: string;
  results: number;
  data: {
    users: UserSummaryRes[];
  };
}

export interface GetUserRes {
  status: string;
  data: {
    user: UserProfileRes; // or MyProfileRes? Schema says UserProfileRes for /:id
  };
}

export interface GetMeRes {
  status: string;
  data: {
    user: MyProfileRes;
  };
}

// --- API ---

export const userAPI = {
  getMe: async () => {
    const response = await client.get<GetMeRes>('/users/me');
    return response.data;
  },

  updateMe: async (data: UpdateProfileReq) => {
    const response = await client.patch<GetMeRes>('/users/me', data);
    return response.data;
  },

  getAll: async () => {
    const response = await client.get<GetAllUsersRes>('/users');
    return response.data;
  },

  getById: async (id: number | string) => {
    const response = await client.get<GetUserRes>(`/users/${id}`);
    return response.data;
  },
};
