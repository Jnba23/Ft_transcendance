import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { hashPassword, verifyPassword } from '../../utils/password';
import { RegisterSchema, LoginSchema, RegisterSchemaType, LoginSchemaType } from '../types'

async function userRoutes(fastify: FastifyInstance) {
    // Creat new user
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
                        user: {
                            id: { type: 'number' },
                            username: { type: 'string' },
                            email: 'string',
                        }
                    }
                },
                400: {
                    description: 'Bad request - validation error',
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                },
                409: {
                    description: 'Conflict - user already exists',
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                },
                500: {
                    description: 'Internal server error',
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request: FastifyRequest<{ Body: RegisterSchemaType }>, reply: FastifyReply) => {
            try {
                const { username, email, password, password_confirmation } = request.body;

                if (password !== password_confirmation) {
                    return reply.code(400).send({
                        error: 'Passwords do not match',
                    });
                }

                const existingUser = fastify.db.prepare(
                    'SELECT id, email, username FROM users WHERE email = ? OR username = ?'
                ).get(email, username) as {id: number; email: string; username: string} | undefined;

                if (existingUser) {
                    const conflictField = existingUser.username === username ? 'username':'email';
                    return reply.code(409).send({
                        error: `User with this ${conflictField} already exists`,
                    });
                }

                const passwordHash = await hashPassword(password);

                const result = fastify.db.prepare(
                    `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`
                ).run(username, email, passwordHash);

                const userId = result.lastInsertRowid as number;

                return reply.code(201).send({
                    message: 'User registered successfully',
                    user: {
                        id: userId,
                        username,
                        email,
                    }
                })
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({
                    error: 'Internal server error'
                });
            }
        }

    });
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
                        message: {type: 'string' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                username: { type: 'string' },
                                email: { type: 'string' }
                            }
                        }
                    }
                },
                400: {
                    description: 'Bad request',
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                },
                401: {
                    description: 'Unauthorized - invalid credentials',
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request: FastifyRequest<{ Body: LoginSchemaType }>, reply: FastifyReply) => {
            try {
                const { identifier, password } = request.body;
                
                const user = fastify.db.prepare(
                    'SELECT id, username, email, password_hash FROM users WHERE email = ? OR username = ?'
                ).get(identifier, identifier) as {
                    id: number,
                    username: string,
                    email: string,
                    password_hash: string
                } | undefined;

                if (!user) {
                    return reply.code(401).send({
                        error: 'Invalid credentials'
                    });
                }

                const isVallidPassword = await verifyPassword(password, user.password_hash);
                
                if (!isVallidPassword) {
                    return reply.code(401).send({
                        error: 'Invalid credentials'
                    })
                }

                return reply.code(200).send({
                    messsage: 'Login successful',
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    }
                });
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({
                    error: 'Internal server error. Please try again later.'
                })
            }
        }
    });

    // Get all users (no password hashes)
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
                            email: { type: 'string' }
                        }
                    }
                }
            }
        },
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const users = fastify.db.prepare(
                    'SELECT id, username, email FROM users'
                ).all() as Array<{ id: number; username: string; email: string }>;

                return reply.code(200).send(users);
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ error: 'Internal server error' });
            }
        }
    });

    // Get a user by id
    fastify.route({
        method: 'GET',
        url: '/api/auth/users/:id',
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'integer' }
                },
                required: ['id']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        username: { type: 'string' },
                        email: { type: 'string' }
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
        handler: async (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
            try {
                const id = Number((request.params as any).id);
                if (Number.isNaN(id)) {
                    return reply.code(400).send({ error: 'Invalid user id' });
                }

                const user = fastify.db.prepare(
                    'SELECT id, username, email FROM users WHERE id = ?'
                ).get(id) as { id: number; username: string; email: string } | undefined;

                if (!user) {
                    return reply.code(404).send({ error: 'User not found' });
                }

                return reply.code(200).send(user);
            } catch (err) {
                fastify.log.error(err);
                return reply.code(500).send({ error: 'Internal server error' });
            }
        }
    });
}

export default userRoutes;
