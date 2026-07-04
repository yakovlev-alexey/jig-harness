import { describe, expect, it } from 'vitest';

import { assertUserCanBeCreated } from './assert-user-can-be-created.js';
import { UserAlreadyExistsError } from './user-already-exists-error.js';

describe('assertUserCanBeCreated', () => {
  it('does nothing when no user exists', () => {
    expect(() => assertUserCanBeCreated(null)).not.toThrow();
  });

  it('throws UserAlreadyExistsError when a user exists', () => {
    expect(() =>
      assertUserCanBeCreated({
        id: 'user-1',
        email: 'alice@example.com',
        name: 'Alice',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow(UserAlreadyExistsError);
  });
});
