import { testSeedSchema } from '@app/types/slices/users/user-contracts';

import { prisma } from '../common/prisma.js';
import { normalizeUserEmail } from '../slices/users/domain/normalize-user-email.js';

export async function seedTestUsers(body: unknown) {
  const { users } = testSeedSchema.parse(body);

  const created = await Promise.all(
    users.map((user) =>
      prisma.user.create({
        data: {
          email: normalizeUserEmail(user.email),
          name: user.name ?? null,
        },
      }),
    ),
  );

  return { ids: created.map((user) => user.id) };
}
