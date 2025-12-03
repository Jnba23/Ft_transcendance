import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { hashPassword, verifyPassword } from '../../utils/password';
import { LoginSchemaType, RegisterSchemaType } from '../types';

export function createUserHandlers(fastify: FastifyInstance) {
  type RegisterRequest = FastifyRequest<{ Body: RegisterSchemaType }>;
  type LoginRequest = FastifyRequest<{ Body: LoginSchemaType }>;

  const register = async (
    request: RegisterRequest,
    reply: FastifyReply,
  ) => {
    try {
      const { username, email, password, password_confirmation, display_name } = request.body as RegisterSchemaType;

      if (password !== password_confirmation) {
        return reply.code(400).send({
          error: 'Passwords do not match',
        });
      }

      // Logic: If display_name is not provided, default it to username
      const finalDisplayName = display_name || username;

      // Check for existing user (username, email, OR display_name)
      const existingUser = fastify.db
        .prepare('SELECT id, email, username, display_name FROM users WHERE email = ? OR username = ? OR display_name = ?')
        .get(email, username, finalDisplayName) as { id: number; email: string; username: string; display_name?: string } | undefined;

      if (existingUser) {
        let conflictField = 'email';
        if (existingUser.username === username) conflictField = 'username';
        if (existingUser.display_name === finalDisplayName) conflictField = 'display_name';
        
        return reply.code(409).send({
          error: `User with this ${conflictField} already exists`,
        });
      }

      const passwordHash = await hashPassword(password);

      // Insert with display_name
      const result = fastify.db
        .prepare('INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)')
        .run(username, email, passwordHash, finalDisplayName);

      const userId = result.lastInsertRowid as number;

      return reply.code(201).send({
        message: 'User registered successfully',
        user: {
          id: userId,
          username,
          email,
          display_name: finalDisplayName,
        },
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({
        error: 'Internal server error',
      });
    }
  };

  const login = async (
    request: LoginRequest,
    reply: FastifyReply,
  ) => {
    try {
      const { identifier, password } = request.body as LoginSchemaType;

      const user = fastify.db
        .prepare('SELECT id, username, email, display_name, password_hash FROM users WHERE email = ? OR username = ?')
        .get(identifier, identifier) as {
          id: number;
          username: string;
          email: string;
          display_name: string;
          password_hash: string;
        } | undefined;

      if (!user) {
        return reply.code(401).send({
          error: 'Invalid credentials',
        });
      }

      const isValidPassword = await verifyPassword(password, user.password_hash);

      if (!isValidPassword) {
        return reply.code(401).send({
          error: 'Invalid credentials',
        });
      }

      return reply.code(200).send({
        messsage: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          display_name: user.display_name,
        },
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({
        error: 'Internal server error. Please try again later.',
      });
    }
  };

  const listUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Updated to fetch display_name and level as well
      const users = fastify.db.prepare('SELECT id, username, display_name, email, level, avatar_url, status FROM users').all();
      return reply.code(200).send(users);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  };

  const getUserById = async (
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply,
  ) => {
    try {
      const id = Number((request.params as any).id);
      if (Number.isNaN(id)) {
        return reply.code(400).send({ error: 'Invalid user id' });
      }

      // Updated to select new profile fields
      const user = fastify.db
        .prepare(`
          SELECT 
            id, username, email, display_name, avatar_url, level, status,
            pong_wins, pong_losses, chess_wins, chess_losses, win_streak
          FROM users WHERE id = ?
        `)
        .get(id);

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return reply.code(200).send(user);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  };

  return {
    register,
    login,
    listUsers,
    getUserById,
  };
}
