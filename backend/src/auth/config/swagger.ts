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
This API uses JWT (JSON Web Tokens) for authentication. 

### For Protected Endpoints (with 🔒 lock icon)
Click the **Authorize** button at the top, then enter your access token:
\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`
**Note:** Do NOT include the word "Bearer" - just paste the token.

### Token Lifetimes
- Access Token: 15 minutes
- Refresh Token: 3 days  
- Temp Token for 2FA: 5 minutes

## 2FA Flow
When 2FA is enabled, the login process requires two steps:

**Step 1:** Call POST /auth/login with credentials → Receive a temporary token (valid 5 min)

**Step 2:** Call POST /auth/2fa/authenticate with temp token + OTP code → Receive full access/refresh tokens

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
