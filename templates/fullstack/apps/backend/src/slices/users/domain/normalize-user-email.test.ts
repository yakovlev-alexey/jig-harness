import { describe, expect, it } from 'vitest';

import { normalizeUserEmail } from './normalize-user-email.js';

describe('normalizeUserEmail', () => {
  it('trims and lowercases the email', () => {
    expect(normalizeUserEmail('  Alice@Example.COM  ')).toBe('alice@example.com');
  });
});
