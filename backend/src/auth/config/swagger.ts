import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index.js';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ft_transcendence API',
            version: '1.0.0',
            description: `
## Overview
RESTful API for the ft_transcendence project - a multiplayer gaming platform featuring Pong and Chess.

## Authentication
This API uses **HTTP-only cookies** for secure JWT token storage.

### Cookie-Based Authentication
Tokens are automatically sent via secure HTTP-only cookies. No manual token management needed!

**Benefits:**
- 🔒 Secure: Cookies are HTTP-only (not accessible via JavaScript)
- 🛡️ Protected: CSRF protection via SameSite=strict
- 🚀 Automatic: Browser handles token sending

### Token Lifetimes
- **Access Token**: 15 minutes (auto-refreshed)
- **Refresh Token**: 3 days
- **Temp Token** (2FA): 5 minutes

### How It Works
1. **Login/Signup**: Tokens stored in cookies automatically
2. **API Calls**: Browser sends cookies with each request
3. **Refresh**: Call POST /auth/refresh to get new access token
4. **Logout**: Cookies cleared and tokens blacklisted

## Testing in Swagger UI
⚠️ **Important**: Swagger UI may not show cookies properly. For full testing:
- Use **Postman** (enable "Send cookies" in settings)
- Use **Browser** (cookies work automatically)
- Or use curl with -c and -b flags

## 2FA Flow
When 2FA is enabled, the login process requires two steps:

**Step 1:** Call POST /auth/login with credentials → Receive temporary token in response body (valid 5 min)

**Step 2:** Call POST /auth/2fa/authenticate with temp token + OTP code → Tokens set in cookies

### Setting Up 2FA
**Step 1:** Call POST /auth/2fa/generate (requires login) → Get QR code

**Step 2:** Scan QR with authenticator app (Google Authenticator, Authy, etc.)

**Step 3:** Call POST /auth/2fa/turn-on → Send 6-digit code → Enable 2FA

**Step 4:** Call POST /auth/2fa/turn-off → Send password → Disable 2FA
            `,
            contact: {
                name: 'ft_transcendence Team',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: `http://localhost:${config.port}/api`,
                description: 'Development server',
            },
        ],
        tags: [
            {
                name: 'Auth',
                description: 'Authentication endpoints (login, signup, logout, token refresh, 2FA)',
            },
            {
                name: 'Users',
                description: 'User management and profile endpoints',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT access token (do not include "Bearer" prefix - just paste the token)',
                },
            },
        },
    },
    apis: ['./src/auth/routes/*.ts', './src/auth/schemas/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
