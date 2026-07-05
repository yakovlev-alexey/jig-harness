import { describe, expect, it } from 'vitest';
import type { UserResponse } from '@app/types/slices/users/user-contracts';
import { filterUsers } from './filter-users';

const sampleUsers: UserResponse[] = [
  {
    id: '1',
    email: 'alice@example.com',
    name: 'Alice',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    email: 'bob@example.com',
    name: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('filterUsers', () => {
  it('returns all users when query is empty', () => {
    expect(filterUsers(sampleUsers, '')).toEqual(sampleUsers);
    expect(filterUsers(sampleUsers, '   ')).toEqual(sampleUsers);
  });

  it('filters by name case-insensitively', () => {
    expect(filterUsers(sampleUsers, 'alice')).toEqual([sampleUsers[0]]);
    expect(filterUsers(sampleUsers, 'ALICE')).toEqual([sampleUsers[0]]);
  });

  it('filters by email when name is null', () => {
    expect(filterUsers(sampleUsers, 'bob@')).toEqual([sampleUsers[1]]);
  });

  it('returns empty array when nothing matches', () => {
    expect(filterUsers(sampleUsers, 'charlie')).toEqual([]);
  });
});
