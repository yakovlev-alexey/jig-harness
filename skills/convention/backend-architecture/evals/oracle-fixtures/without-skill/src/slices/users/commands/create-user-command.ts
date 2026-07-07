import { findUserByEmailQuery } from '../queries/find-user-by-email-query.js';
import { prisma } from '../../../common/prisma.js';

type CreateUserInput = {
  email: string;
  name?: string | null;
};

/** Anti-pattern: command imports query instead of composing in usecase. */
export async function createUserCommand(input: CreateUserInput) {
  const existing = await findUserByEmailQuery({ email: input.email });
  if (existing) {
    throw new Error('User already exists');
  }

  return prisma.user.create({
    data: {
      email: input.email,
      name: input.name ?? null,
    },
  });
}
