import type { User } from '@prisma/client';

import { prisma } from '../../../common/prisma.js';
import type { PrismaExecutor } from '../../../common/prisma-executor.js';

export async function listUsersQuery(db: PrismaExecutor = prisma): Promise<User[]> {
  return db.user.findMany({
    orderBy: {
      createdAt: 'asc',
    },
  });
}
