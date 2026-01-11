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
This API uses JWT (JSON Web Tokens) for authentication. Include the access token in the Authorization header:
\`\`\`
Authorization: Bearer <your_access_token>
\`\`\`

## 2FA Flow
When 2FA is enabled, the login process requires two steps:
1. Submit credentials → Receive \`tempToken\`
2. Submit \`tempToken\` + OTP code → Receive access/refresh tokens
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
                    description: 'Enter your JWT access token',
                },
            },
        },
    },
    apis: ['./src/auth/routes/*.ts', './src/auth/schemas/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
