import type { User } from '@prisma/client';

import { createUserCommand } from '../commands/create-user-command.js';
import { assertUserCanBeCreated } from '../domain/assert-user-can-be-created.js';
import { normalizeUserEmail } from '../domain/normalize-user-email.js';
import { findUserByEmailQuery } from '../queries/find-user-by-email-query.js';

type CreateUserInput = {
  email: string;
  name?: string;
};

export async function createUserUsecase(input: CreateUserInput): Promise<User> {
  const email = normalizeUserEmail(input.email);
  const existingUser = await findUserByEmailQuery({ email });

  assertUserCanBeCreated(existingUser);

  return createUserCommand({
    email,
    name: input.name,
  });
}
