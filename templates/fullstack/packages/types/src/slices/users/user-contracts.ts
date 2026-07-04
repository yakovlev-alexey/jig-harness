import { z } from 'zod';

export const createUserBodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
});

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
