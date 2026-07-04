import type { User } from '@prisma/client';

import { UserAlreadyExistsError } from './user-already-exists-error.js';

export function assertUserCanBeCreated(existingUser: User | null): void {
  if (existingUser) {
    throw new UserAlreadyExistsError();
  }
}
