import type { User } from '@prisma/client';

import { prisma } from '../../../common/prisma.js';
import type { PrismaExecutor } from '../../../common/prisma-executor.js';

type CreateUserInput = {
  email: string;
  name?: string | null;
};

export async function createUserCommand(
  input: CreateUserInput,
  db: PrismaExecutor = prisma,
): Promise<User> {
  return db.user.create({
    data: {
      email: input.email,
      name: input.name ?? null,
    },
  });
}
