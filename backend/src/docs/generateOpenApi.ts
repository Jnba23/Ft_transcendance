import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Import Schemas
import {
  signupSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from '../auth/auth/schema.js';
import {
  twoFaSchema,
  verify2FaSchema,
  turnOff2FaSchema,
} from '../auth/2fa/schema.js';
import { updateUserSchema, updateStatusSchema } from '../user/users/schema.js';
import {
  friendActionSchema,
  friendRequestParamSchema,
} from '../user/friends/schema.js';

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// --- Auth Auth ---

registry.registerPath({
  method: 'post',
  path: '/api/auth/signup',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: signupSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created successfully',
    },
    400: {
      description: 'Validation Error',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Auth'],
  summary: 'Login user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
    },
    401: {
      description: 'Invalid credentials',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/refresh',
  tags: ['Auth'],
  summary: 'Refresh access token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: refreshSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Token refreshed',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/logout',
  tags: ['Auth'],
  summary: 'Logout user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: logoutSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Logged out successfully',
    },
  },
});

// --- Auth 2FA ---

const securityScheme = registry.registerComponent(
  'securitySchemes',
  'bearerAuth',
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  }
);

registry.registerPath({
  method: 'post',
  path: '/api/auth/2fa/authenticate',
  tags: ['2FA'],
  summary: 'Authenticate with 2FA code',
  request: {
    body: {
      content: {
        'application/json': {
          schema: verify2FaSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: '2FA Authentication successful',
    },
    401: {
      description: 'Invalid code or token',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/2fa/generate',
  tags: ['2FA'],
  summary: 'Generate 2FA QR Code',
  security: [{ [securityScheme.name]: [] }],
  responses: {
    200: {
      description: 'QR Code generated',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/2fa/turn-on',
  tags: ['2FA'],
  summary: 'Enable 2FA',
  security: [{ [securityScheme.name]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: twoFaSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: '2FA enabled successfully',
    },
    401: {
      description: 'Unauthorized or invalid code',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/2fa/turn-off',
  tags: ['2FA'],
  summary: 'Disable 2FA',
  security: [{ [securityScheme.name]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: turnOff2FaSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: '2FA disabled successfully',
    },
    401: {
      description: 'Unauthorized or invalid password',
    },
  },
});

// --- Auth OAuth ---

registry.registerPath({
  method: 'get',
  path: '/api/oauth/google',
  tags: ['OAuth'],
  summary: 'Initiate Google OAuth',
  responses: {
    302: {
      description: 'Redirects to Google Login',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/oauth/google/callback',
  tags: ['OAuth'],
  summary: 'Google OAuth Callback',
  responses: {
    302: {
      description: 'Redirects to frontend with tokens',
    },
  },
});

// --- User Users ---

registry.registerPath({
  method: 'get',
  path: '/api/users',
  tags: ['Users'],
  summary: 'Get all users',
  security: [{ [securityScheme.name]: [] }],
  parameters: [
    {
      name: 'search',
      in: 'query',
      schema: { type: 'string' },
      description: 'Search users by username',
    },
  ],
  responses: {
    200: {
      description: 'List of users',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/users/me',
  tags: ['Users'],
  summary: 'Get current user profile',
  security: [{ [securityScheme.name]: [] }],
  responses: {
    200: {
      description: 'User profile',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/users/me',
  tags: ['Users'],
  summary: 'Update current user profile',
  security: [{ [securityScheme.name]: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              avatar: { type: 'string', format: 'binary' },
            },
          },
        },
        'application/json': {
          schema: updateUserSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Profile updated',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/users/me/avatar',
  tags: ['Users'],
  summary: 'Reset user avatar',
  security: [{ [securityScheme.name]: [] }],
  responses: {
    200: {
      description: 'Avatar reset',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/users/status',
  tags: ['Users'],
  summary: 'Update user status',
  security: [{ [securityScheme.name]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: updateStatusSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Status updated',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/users/{id}',
  tags: ['Users'],
  summary: 'Get user by ID',
  security: [{ [securityScheme.name]: [] }],
  parameters: [
    {
      name: 'id',
      in: 'path',
      schema: { type: 'string' },
      required: true,
    },
  ],
  responses: {
    200: {
      description: 'User details',
    },
    404: {
      description: 'User not found',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/users/avatar/{filename}',
  tags: ['Users'],
  summary: 'Get user avatar',
  security: [{ [securityScheme.name]: [] }],
  parameters: [
    {
      name: 'filename',
      in: 'path',
      schema: { type: 'string' },
      required: true,
    },
  ],
  responses: {
    200: {
      description: 'Avatar image',
      content: {
        'image/*': {
          schema: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
    404: {
      description: 'Avatar not found',
    },
  },
});

// --- User Friends ---

registry.registerPath({
  method: 'get',
  path: '/api/friends',
  tags: ['Friends'],
  summary: 'Get friends list',
  security: [{ [securityScheme.name]: [] }],
  responses: {
    200: {
      description: 'List of friends',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/friends/requests',
  tags: ['Friends'],
  summary: 'Get friend requests',
  security: [{ [securityScheme.name]: [] }],
  responses: {
    200: {
      description: 'List of friend requests',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/friends/requests/{id}',
  tags: ['Friends'],
  summary: 'Send friend request',
  security: [{ [securityScheme.name]: [] }],
  parameters: [
    {
      name: 'id',
      in: 'path',
      schema: { type: 'string' },
      required: true,
      description: 'User ID to send request to',
    },
  ],
  responses: {
    201: {
      description: 'Friend request sent',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/friends/requests/action',
  tags: ['Friends'],
  summary: 'Handle friend request action',
  security: [{ [securityScheme.name]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: friendActionSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Action processed',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/friends/requests/check/{id}',
  tags: ['Friends'],
  summary: 'Check friendship status',
  security: [{ [securityScheme.name]: [] }],
  parameters: [
    {
      name: 'id',
      in: 'path',
      schema: { type: 'string' },
      required: true,
      description: 'User ID to check',
    },
  ],
  responses: {
    200: {
      description: 'Friendship status',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/friends/requests/{id}',
  tags: ['Friends'],
  summary: 'Remove friend request',
  security: [{ [securityScheme.name]: [] }],
  parameters: [
    {
      name: 'id',
      in: 'path',
      schema: { type: 'string' },
      required: true,
      description: 'Use ID to remove friend Request',
    },
  ],
  responses: {
    200: {
      description: 'Friendship removed',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

// --- Generation ---

const generator = new OpenApiGeneratorV3(registry.definitions);

const doc = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'FT_Transcendence API',
    description: 'API Documentation for FT_Transcendence Project',
  },
  servers: [{ url: '/api/v1' }], // Adjust as needed
});

const outputPath = path.resolve(process.cwd(), 'src/docs/openapi.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(doc, null, 2));

console.log(`OpenAPI specification generated at ${outputPath}`);
