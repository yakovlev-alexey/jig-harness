import type { UserResponse } from '@app/types/slices/users/user-contracts';

export function filterUsers(users: UserResponse[], query: string): UserResponse[] {
  const normalized = query.trim().toLowerCase();

  if (normalized === '') {
    return users;
  }

  return users.filter(
    (user) =>
      user.email.toLowerCase().includes(normalized) ||
      (user.name?.toLowerCase().includes(normalized) ?? false),
  );
}
