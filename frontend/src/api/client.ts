import axios from 'axios';

// Create axios instance with default config
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.defaults.withCredentials = true;

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
      !originalRequest._skipAuthRefresh &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/signup') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      localStorage.getItem('has_session')
    ) {
      originalRequest._retry = true;

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
