import { client } from './client';

// --- Types ---

export interface ApiError {
  status: string;
  message: string;
  stack?: string;
}

export interface SignupReq {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupRes {
  status: string;
  message: string;
  data: {
    user: {
      id: number;
      username: string;
      email: string;
    };
  };
}

export interface LoginReq {
  identifier: string;
  password: string;
}

export interface LoginRes {
  status: string;
  message: string;
}

export interface Login2FARequiredRes {
  status: string;
  message: string;
  action_required: string;
  tempToken: string;
}

export interface RefreshTokenRes {
  status: string;
  message: string;
}

// --- API ---

export const authAPI = {
  signup: async (data: SignupReq) => {
    const response = await client.post<SignupRes>('/auth/signup', data);
    // Mark session for checkAuth
    localStorage.setItem('has_session', 'true');
    return response.data;
  },

  login: async (data: LoginReq) => {
    // Response can be LoginRes OR Login2FARequiredRes
    const response = await client.post<LoginRes | Login2FARequiredRes>(
      '/auth/login',
      data
    );
    // Mark session so checkAuth knows it can call /users/me
    if (response.data.status === 'success') {
      localStorage.setItem('has_session', 'true');
    }
    return response.data;
  },

  logout: async () => {
    const response = await client.post<{ status: string; message: string }>(
      '/auth/logout'
    );
    return response.data;
  },

  refresh: async () => {
    const response = await client.post<RefreshTokenRes>('/auth/refresh');
    return response.data;
  },
};
