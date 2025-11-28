export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  email_verified: boolean;
  status: 'online' | 'offline' | 'in-game';
  created_at: string;
  updated_at: string;
}

import { Type, Static } from '@sinclair/typebox';

export const RegisterSchema = Type.Object({
  username: Type.String({
    minLength: 3,
    maxLength: 20,
    description: 'Username must be between 3 and 20 characters',
  }),
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
