import z from "zod";

export const messageSchema = z.object({
	message: z
	.string()
	.trim()
	.min(1, "Message cannot be empty")
	.max(200, "Message too long")
});