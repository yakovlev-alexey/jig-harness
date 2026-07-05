import { testCleanupSchema } from '@app/types/slices/users/user-contracts';

import { prisma } from '../common/prisma.js';

export async function cleanupTestNamespace(body: unknown) {
  const { namespace } = testCleanupSchema.parse(body);

  const result = await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: namespace,
      },
    },
  });

  return { deleted: result.count };
}
