import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@styles/tailwind.css';

// Register the API proxy service worker to suppress browser console errors
// for non-2xx API responses (401, 409, etc.)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/api-sw.js').catch(() => {
    // SW registration failed — API calls still work, just with console noise
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
