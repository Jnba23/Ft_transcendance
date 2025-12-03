export interface User {
  id: number;
  username: string;
  email: string;
  display_name?: string; // Optional initially
  avatar_url?: string;
  level: number;
  status: 'online' | 'offline' | 'in_game';
  
  // Stats
  pong_wins: number;
  pong_losses: number;
  chess_wins: number;
  chess_losses: number;
  win_streak: number;

  created_at: string;
}

import { Type, Static } from '@sinclair/typebox';

export const RegisterSchema = Type.Object({
  username: Type.String({
    minLength: 3,
    maxLength: 20,
    description: 'Username must be between 3 and 20 characters',
  }),
  // New field: display_name (Optional)
  display_name: Type.Optional(Type.String({
    minLength: 3,
    maxLength: 20,
    description: 'Public name for tournaments (defaults to username if empty)',
  })),
  email: Type.String({
    format: 'email',
    description: 'Must be a valid email address',
  }),
  password: Type.String({
    minLength: 8,
    description: 'Password must be at least 8 characters long',
  }),
  password_confirmation: Type.String({
    minLength: 8,
    description: 'Password confirmation must match password',
  }),
});

export const LoginSchema = Type.Object({
  identifier: Type.String({
    minLength: 3,
    description: 'Email or username required',
  }),
  password: Type.String({
    minLength: 8,
    description: 'Password is required',
  }),
});

export type RegisterSchemaType = Static<typeof RegisterSchema>;
export type LoginSchemaType = Static<typeof LoginSchema>;
