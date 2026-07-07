import { prisma } from '../../../common/prisma.js';

type CreateUserInput = {
  email: string;
  name?: string;
};

/** Anti-pattern: usecase calls Prisma directly instead of query/command. */
export async function createUserUsecase(input: CreateUserInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

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
