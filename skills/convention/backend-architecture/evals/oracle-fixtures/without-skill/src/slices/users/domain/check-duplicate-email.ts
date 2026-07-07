import { prisma } from '../../../common/prisma.js';

/** Anti-pattern: domain performs I/O via Prisma client. */
export async function checkDuplicateEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}
