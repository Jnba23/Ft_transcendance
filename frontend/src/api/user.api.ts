import { client } from './client';

// --- Types ---

export interface UserSummaryRes {
  id: number;
  username: string;
  avatar_url: string;
  level: number;
  status: 'online' | 'offline';
  hasFriendRequest: number;
}

export interface MyProfileRes {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  level: number;
  is_2fa_enabled: boolean;
  status: 'online' | 'offline';
  created_at: string;
  pong_wins: number;
  pong_losses: number;
  pong_winStreak: number;
  RPS_wins: number;
  RPS_losses: number;
  RPS_winStreak: number;
}

export interface UserProfileRes {
  id: number;
  username: string;
  avatar_url: string;
  level: number;
  status: 'online' | 'offline';
  created_at: string;
  pong_wins: number;
  pong_losses: number;
  RPS_wins: number;
  RPS_losses: number;
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
    user: UserProfileRes | MyProfileRes;
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

  updateMe: async (data: { username?: string; avatar?: File }) => {
    // If there's a file, use FormData (multipart)
    if (data.avatar) {
      const formData = new FormData();
      if (data.username) {
        formData.append('username', data.username);
      }
      formData.append('avatar', data.avatar);

      const response = await client.patch<GetMeRes>('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    // No file - send Json
    const response = await client.patch<GetMeRes>('/users/me', {
      username: data.username,
    });
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

  getAvatar: async (id: number | string) => {
    const response = await client.get(`/users/avatar/${id}?t=${Date.now()}`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },
};
