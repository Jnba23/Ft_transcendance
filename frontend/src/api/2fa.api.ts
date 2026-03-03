import { client } from './client';

// --- Types ---

export interface Verify2FALoginReq {
  code: string;
  tempToken: string;
}

export interface Enable2FAReq {
  code: string;
}

export interface Disable2FAReq {
  code: string;
}

export interface Generate2FARes {
  status: string;
  data: {
    qrcode: string;
    secret: string;
  };
}

export interface TwoFaSuccessRes {
  status: string;
  message: string;
}

// --- API ---

export const twoFaAPI = {
  // Verify 2FA code during login (uses tempToken)
  authenticate: async (data: Verify2FALoginReq) => {
    const response = await client.post<TwoFaSuccessRes>(
      '/auth/2fa/authenticate',
      data
    );
    // Mark session for checkAuth
    localStorage.setItem('has_session', 'true');
    return response.data;
  },

  // Generate QR Code (protected)
  generate: async () => {
    const response = await client.post<Generate2FARes>('/auth/2fa/generate');
    return response.data;
  },

  // Turn on 2FA (protected)
  turnOn: async (data: Enable2FAReq) => {
    const response = await client.post<TwoFaSuccessRes>(
      '/auth/2fa/turn-on',
      data
    );
    return response.data;
  },

  // Turn off 2FA (protected)
  turnOff: async (data: Disable2FAReq) => {
    const response = await client.post<TwoFaSuccessRes>(
      '/auth/2fa/turn-off',
      data
    );
    return response.data;
  },
};
