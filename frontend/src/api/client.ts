import axios from 'axios';

// Create axios instance with default config
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request (if you decide to store it in localStorage)
// Note: Your backend seems to use cookies for main tokens, but 2FA tempToken might need handling if passed in headers?
// Based on swagger, 2FA temp token is in body.
// Main auth tokens are in cookies (HttpOnly).
// So probably don't need to manually attach Bearer token for main auth.
// But we might need 'withCredentials: true' for cookies to be sent.

client.defaults.withCredentials = true;

// Handle errors
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops
    // AND skip refresh logic for login requests (401 on login means bad credentials, not expired token)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/signup')
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        await client.post('/auth/refresh');

        // Retry the original request
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh failed - user session has expired
        // Trigger a custom event so React can handle the logout
        window.dispatchEvent(new Event('auth:logout'));

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
