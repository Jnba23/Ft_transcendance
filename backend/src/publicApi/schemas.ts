import { z } from 'zod';

export const userSchema = z.object({
	username: z.string().min(3).max(10),
	email: z.string().email(),
	avatar_url: z.string().url().optional(),
	level: z.number().int().min(1).optional(),
	status: z.enum(['online', 'offline', 'in_game']).optional(),
});

export type UserDto = z.infer<typeof userSchema>;
