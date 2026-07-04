import type { User } from '@prisma/client';

export function assertUserCanBeCreated(existingUser: User | null): void {
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
}
