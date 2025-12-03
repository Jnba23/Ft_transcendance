import { FastifyInstance } from 'fastify';
import { RegisterSchema, LoginSchema } from '../types'
import { createUserHandlers } from '../handlers/users';

async function userRoutes(fastify: FastifyInstance) {
    const handlers = createUserHandlers(fastify);

    // Reusable user object schema to avoid repetition
    const UserResponseSchema = {
        type: 'object',
        properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            display_name: { type: 'string' }, // Added
            email: { type: 'string' },
            avatar_url: { type: 'string' },
            level: { type: 'number' },        // Added
            status: { type: 'string' },       // Added
            // Stats (Optional: include these if you want them on login/register, or keep them for profile only)
            win_streak: { type: 'number' }
        }
    };

    // Create new user
    fastify.route({
        method: 'POST',
        url: '/api/auth/register',
        schema: {
            body: RegisterSchema,
            response: {
                201: {
                    description: 'User registered successfully',
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        user: UserResponseSchema
                    }
                },
                400: {
                    description: 'Bad request - validation error',
                    type: 'object',
                    properties: { error: { type: 'string' } }
                },
                409: {
                    description: 'Conflict - user already exists',
                    type: 'object',
                    properties: { error: { type: 'string' } }
                },
                500: {
                    description: 'Internal server error',
                    type: 'object',
                    properties: { error: { type: 'string' } }
                }
            }
        },
        handler: handlers.register
    });

    // Login
    fastify.route({
        method: 'POST',
        url: '/api/auth/login',
        schema: {
            body: LoginSchema,
            response: {
                200: {
                    description: 'Login successful',
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        user: UserResponseSchema
                    }
                },
                400: {
                    type: 'object',
                    properties: { error: { type: 'string' } }
                },
                401: {
                    description: 'Unauthorized - invalid credentials',
                    type: 'object',
                    properties: { error: { type: 'string' } }
                }
            }
        },
        handler: handlers.login
    });

    // Get all users (Simplified view)
    fastify.route({
        method: 'GET',
        url: '/api/auth/users',
        schema: {
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            username: { type: 'string' },
                            display_name: { type: 'string' },
                            avatar_url: { type: 'string' },
                            level: { type: 'number' },
                            status: { type: 'string' }
                        }
                    }
                }
            }
        },
        handler: handlers.listUsers
    });

    // Get a user by id (Full Profile View)
    fastify.route({
        method: 'GET',
        url: '/api/auth/users/:id',
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'integer' } },
                required: ['id']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        username: { type: 'string' },
                        display_name: { type: 'string' },
                        email: { type: 'string' },
                        avatar_url: { type: 'string' },
                        level: { type: 'number' },
                        status: { type: 'string' },
                        // Full Stats for Profile
                        pong_wins: { type: 'number' },
                        pong_losses: { type: 'number' },
                        chess_wins: { type: 'number' },
                        chess_losses: { type: 'number' },
                        win_streak: { type: 'number' }
                    }
                },
                400: {
                    type: 'object',
                    properties: { error: { type: 'string' } }
                },
                404: {
                    type: 'object',
                    properties: { error: { type: 'string' } }
                }
            }
        },
        handler: handlers.getUserById
    });
}

export default userRoutes;
