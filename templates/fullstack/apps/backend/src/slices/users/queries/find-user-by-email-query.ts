import type { User } from '@prisma/client';

import { prisma } from '../../../common/prisma.js';
import type { PrismaExecutor } from '../../../common/prisma-executor.js';

type FindUserByEmailInput = {
  email: string;
};

export async function findUserByEmailQuery(
  input: FindUserByEmailInput,
  db: PrismaExecutor = prisma,
): Promise<User | null> {
  return db.user.findUnique({
    where: {
      email: input.email,
    },
  });
}
