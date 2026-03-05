import axios from 'axios';

// Create axios instance with default config
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.defaults.withCredentials = true;

// Must match the backend refreshTokenCookieOptions.maxAge
// (currently 2 min for testing — change back to 3 * 24 * 60 * 60 * 1000 for prod)
export const REFRESH_TOKEN_MAX_AGE_MS = 2 * 60 * 1000;

/** Check whether the refresh token is likely expired based on session_start. */
export function isRefreshTokenExpired(): boolean {
  const start = localStorage.getItem('session_start');
  if (!start) return true;
  return Date.now() - Number(start) >= REFRESH_TOKEN_MAX_AGE_MS;
}

// Shared refresh state to deduplicate concurrent refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// Handle errors
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/signup') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      localStorage.getItem('has_session')
    ) {
      originalRequest._retry = true;

      // If the refresh token is known to be expired, skip the network call
      // entirely so no 401 appears in the console.
      if (isRefreshTokenExpired()) {
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }

      try {
        // Deduplicate: if a refresh is already in flight, wait for it
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = client
            .post('/auth/refresh')
            .then(() => {})
            .finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
        }

        await refreshPromise;
        return client(originalRequest);
      } catch {
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
