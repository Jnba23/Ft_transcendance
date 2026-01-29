import axios from 'axios';

// Create axios instance with default config
export const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
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
    (error) => {
        // If unauthorized, you might want to redirect, but maybe not automatically here to avoid cycles
        return Promise.reject(error);
    }
);
