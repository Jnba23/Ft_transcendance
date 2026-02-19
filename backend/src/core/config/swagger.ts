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

## 🔓 Accessing Protected Routes
Protected routes (marked with 🔒) require authentication. Since we use cookies:

1. **Login first**: Call POST /auth/signup or POST /auth/login
2. **Cookies are set automatically**: Your accessToken is stored
3. **Make requests**: Protected endpoints work automatically in browser/Postman
4. **Swagger UI Limitation**: The 🔒 lock icon is for documentation only - Swagger UI doesn't handle cookies well

**For Testing Protected Routes:**
- ✅ **Postman**: Works perfectly (cookies auto-sent)
- ✅ **Browser/fetch**: Works automatically  
- ⚠️ **Swagger UI**: May not work - use Postman instead

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
        description:
          'Authentication endpoints (login, signup, logout, token refresh, 2FA)',
      },
      {
        name: 'Users',
        description: 'User management and profile endpoints',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description:
            'JWT access token stored in HTTP-only cookie. Login/Signup to set the cookie automatically.',
        },
      },
      schemas: {
        ApiError: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'fail',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: [
    './src/modules/auth/*.ts',
    './src/modules/2fa/*.ts',
    './src/modules/oauth/*.ts',
    './src/modules/users/*.ts',
    './src/modules/friends/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
