import { z } from 'zod';

export const friendActionSchema = z.object({
    body: z.object({
        request_id: z.number({ required_error: 'request_id is required' }),
        action: z.enum(['accept', 'decline', 'cancel'], {
            required_error: 'action is required'
        })
    })
})

export const friendRequestParamSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'Invalid user ID'),
    }),
});
