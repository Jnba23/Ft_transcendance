import axios, { AxiosError } from 'axios';

// Create axios instance with default config
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  adapter: 'fetch',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.defaults.withCredentials = true;

// Shared refresh state to deduplicate concurrent refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// ── Interceptor 1: Unwrap Service Worker proxy ──
// The SW wraps non-2xx API responses in a 200 to prevent browser console errors.
// This interceptor detects the X-Original-Status header and recreates the error
// in JavaScript so downstream interceptors/catch blocks still work normally.
client.interceptors.response.use((response) => {
  const realStatus = response.headers['x-original-status'];
  if (!realStatus) return response;

  const status = parseInt(realStatus, 10);

  // Build a response object that looks like what axios would normally produce
  const fakeResponse = { ...response, status };

  return Promise.reject(
    new AxiosError(
      `Request failed with status code ${status}`,
      status >= 500
        ? AxiosError.ERR_BAD_RESPONSE
        : AxiosError.ERR_BAD_REQUEST,
      response.config,
      response.request,
      fakeResponse
    )
  );
});

// ── Interceptor 2: Handle 401 → refresh access token ──
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
