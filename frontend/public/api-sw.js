/**
 * Service Worker that proxies API requests to suppress browser console errors.
 *
 * How it works:
 *   1. The page makes a fetch/XHR to the API.
 *   2. The SW intercepts it and does the real network request.
 *   3. If the server returns a non-2xx status, the SW wraps the response
 *      in a 200 and puts the real status in an X-Original-Status header.
 *   4. The page (axios interceptor) reads the header and recreates the error
 *      in JavaScript — no browser-level network error is logged.
 */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only proxy API requests (pathname starting with /api)
  if (!url.pathname.startsWith('/api')) return;

  event.respondWith(proxyRequest(event.request));
});

async function proxyRequest(request) {
  try {
    const response = await fetch(request);

    // 2xx — pass through unchanged
    if (response.ok) return response;

    // Non-2xx — wrap in 200 so the browser doesn't log a console error
    const body = await response.blob();
    const headers = new Headers();

    // Copy safe headers (Set-Cookie is handled by the browser before we get here)
    for (const [key, value] of response.headers.entries()) {
      try {
        headers.set(key, value);
      } catch {
        // Skip forbidden headers
      }
    }

    headers.set('X-Original-Status', String(response.status));

    return new Response(body, {
      status: 200,
      statusText: 'OK',
      headers,
    });
  } catch {
    // Network failure (offline, DNS error, etc.)
    return new Response(JSON.stringify({ message: 'Network error' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Original-Status': '0',
      },
    });
  }
}
