import { z } from 'zod';
export const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
    name: z.string().min(2).max(100).optional().nullable(),
    role: z.enum(["USER", "ADMIN"]).optional()
});
export type CreateUserInput = z.infer<typeof userSchema>;