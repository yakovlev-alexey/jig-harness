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

export const usersListResponseSchema = z.array(userResponseSchema);

export const testSeedSchema = z.object({
  users: z.array(createUserBodySchema),
});

export const testCleanupSchema = z.object({
  namespace: z.string().min(1),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UsersListResponse = z.infer<typeof usersListResponseSchema>;
export type TestSeedBody = z.infer<typeof testSeedSchema>;
export type TestCleanupBody = z.infer<typeof testCleanupSchema>;
