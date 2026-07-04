import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import { domainNoIo } from './domain-no-io.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

describe('domain-no-io', () => {
  it('matches RED/GREEN fixtures', () => {
    ruleTester.run('domain-no-io', domainNoIo, {
      valid: [
        {
          filename: '/app/src/slices/users/domain/normalize-user-email.ts',
          code: `export function normalizeUserEmail(email) { return email.trim().toLowerCase(); }`,
        },
        {
          filename: '/app/src/slices/users/usecases/create-user-usecase.ts',
          code: `import { prisma } from '../../../common/prisma.js';`,
        },
      ],
      invalid: [
        {
          filename: '/app/src/slices/users/domain/assert-user-can-be-created.ts',
          code: `import { prisma } from '@prisma/client';`,
          errors: [{ messageId: 'forbiddenImport' }],
        },
        {
          filename: '/app/src/slices/users/domain/assert-user-can-be-created.ts',
          code: `import { prisma } from '../../../common/prisma.js';`,
          errors: [{ messageId: 'forbiddenImport' }],
        },
        {
          filename: '/app/src/slices/users/domain/assert-user-can-be-created.ts',
          code: `import { findUserByEmailQuery } from '../queries/find-user-by-email-query.js';`,
          errors: [{ messageId: 'forbiddenImport' }],
        },
        {
          filename: '/app/src/slices/users/domain/assert-user-can-be-created.ts',
          code: `const x = process.env.API_KEY;`,
          errors: [{ messageId: 'forbiddenProcessEnv' }],
        },
      ],
    });
  });
});
