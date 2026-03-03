import { z } from "zod";

export const createMessageSchema = z.object({
	body: z.object({
		content: z
		.string()
		.trim()
		.min(1, 'Message cannot be empty')
		.max(200, 'Message too long')
	})
});