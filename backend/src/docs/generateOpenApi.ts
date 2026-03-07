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
import { updateUserSchema } from '../user/users/schema.js';
import { friendActionSchema } from '../user/friends/schema.js';
import { userSchema } from '../publicApi/schemas.js';

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
  'cookieAuth',
  {
    type: 'apiKey',
    in: 'cookie',
    name: 'accessToken',
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
  path: '/api/users/avatar/{id}',
  tags: ['Users'],
  summary: 'Get user avatar',
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
  parameters: [
    {
      name: 'type',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['sent', 'received'],
        default: 'received',
      },
      description: 'Filter by sent or received requests',
    },
  ],
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
  path: '/api/friends/requests',
  tags: ['Friends'],
  summary: 'Send friend request',
  security: [{ [securityScheme.name]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              receiver_id: { type: 'number' },
            },
            required: ['receiver_id'],
          },
        },
      },
    },
  },
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

// --- Chat ---

registry.registerPath({
  method: 'post',
  path: '/api/chat/conversations',
  tags: ['Chat'],
  summary: 'Create a new conversation',
  security: [{ [securityScheme.name]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              other_id: { type: 'number' },
            },
            required: ['other_id'],
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Conversation created',
    },
    400: {
      description: 'Other user ID required',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/chat/messages',
  tags: ['Chat'],
  summary: 'Send a message',
  security: [{ [securityScheme.name]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              conversation_id: { type: 'number' },
              content: { type: 'string', minLength: 1, maxLength: 200 },
            },
            required: ['conversation_id', 'content'],
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Message sent',
    },
    400: {
      description: 'Missing fields',
    },
    404: {
      description: 'Conversation not found',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/chat/conversations/{id}/read',
  tags: ['Chat'],
  summary: 'Mark conversation as read',
  security: [{ [securityScheme.name]: [] }],
  parameters: [
    {
      name: 'id',
      in: 'path',
      schema: { type: 'string' },
      required: true,
      description: 'Conversation ID',
    },
  ],
  responses: {
    200: {
      description: 'Conversation marked as read',
    },
    404: {
      description: 'Conversation not found',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/chat/conversations',
  tags: ['Chat'],
  summary: 'Get all conversations',
  security: [{ [securityScheme.name]: [] }],
  responses: {
    200: {
      description: 'List of conversations',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/chat/conversations/{id}/messages',
  tags: ['Chat'],
  summary: 'Get messages for a conversation',
  security: [{ [securityScheme.name]: [] }],
  parameters: [
    {
      name: 'id',
      in: 'path',
      schema: { type: 'string' },
      required: true,
      description: 'Conversation ID',
    },
  ],
  responses: {
    200: {
      description: 'List of messages',
    },
    404: {
      description: 'Conversation not found',
    },
  },
});

// --- Public API Users ---
const publicApiKeyScheme = registry.registerComponent(
  'securitySchemes',
  'api_key',
  {
    type: 'apiKey',
    in: 'header',
    name: 'x-api-key',
  }
);

registry.registerPath({
  method: 'get',
  path: '/api/public/users',
  tags: ['Public API'],
  summary: 'Get all users',
  security: [{ [publicApiKeyScheme.name]: [] }],
  responses: {
    200: { description: 'List of users' },
    429: { description: 'Too many requests' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/public/users/{id}',
  tags: ['Public API'],
  summary: 'Get specific user',
  security: [{ [publicApiKeyScheme.name]: [] }],
  parameters: [
    { name: 'id', in: 'path', schema: { type: 'string' }, required: true },
  ],
  responses: {
    200: { description: 'User details' },
    404: { description: 'User not found' },
    429: { description: 'Too many requests' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/public/users',
  tags: ['Public API'],
  summary: 'Create a new user record',
  security: [{ [publicApiKeyScheme.name]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: userSchema,
        },
      },
    },
  },
  responses: {
    201: { description: 'User created' },
    400: { description: 'Validation error' },
    409: { description: 'Username or email exists' },
    429: { description: 'Too many requests' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/public/users/{id}',
  tags: ['Public API'],
  summary: 'Update an existing user',
  security: [{ [publicApiKeyScheme.name]: [] }],
  parameters: [
    { name: 'id', in: 'path', schema: { type: 'string' }, required: true },
  ],
  request: {
    body: {
      content: {
        'application/json': {
          schema: userSchema,
        },
      },
    },
  },
  responses: {
    200: { description: 'User updated' },
    400: { description: 'Validation error' },
    404: { description: 'User not found' },
    409: { description: 'Username or email exists' },
    429: { description: 'Too many requests' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/public/users/{id}',
  tags: ['Public API'],
  summary: 'Delete a user record',
  security: [{ [publicApiKeyScheme.name]: [] }],
  parameters: [
    { name: 'id', in: 'path', schema: { type: 'string' }, required: true },
  ],
  responses: {
    204: { description: 'User deleted' },
    404: { description: 'User not found' },
    429: { description: 'Too many requests' },
    401: { description: 'Unauthorized' },
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
});

const outputPath = path.resolve(process.cwd(), 'src/docs/openapi.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(doc, null, 2));

// eslint-disable-next-line no-console
console.log(`OpenAPI specification generated at ${outputPath}`);
