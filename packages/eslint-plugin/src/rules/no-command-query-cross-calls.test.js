import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import { noCommandQueryCrossCalls } from './no-command-query-cross-calls.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

describe('no-command-query-cross-calls', () => {
  it('matches RED/GREEN fixtures', () => {
    ruleTester.run('no-command-query-cross-calls', noCommandQueryCrossCalls, {
      valid: [
        {
          filename: '/app/src/slices/users/commands/create-user-command.ts',
          code: `import { prisma } from '../../../common/prisma.js';`,
        },
        {
          filename: '/app/src/slices/users/usecases/create-user-usecase.ts',
          code: `import { createUserCommand } from '../commands/create-user-command.js';
import { findUserByEmailQuery } from '../queries/find-user-by-email-query.js';`,
        },
      ],
      invalid: [
        {
          filename: '/app/src/slices/users/commands/create-user-command.ts',
          code: `import { findUserByEmailQuery } from '../queries/find-user-by-email-query.js';`,
          errors: [{ messageId: 'commandImportsQuery' }],
        },
        {
          filename: '/app/src/slices/users/queries/find-user-by-email-query.ts',
          code: `import { createUserCommand } from '../commands/create-user-command.js';`,
          errors: [{ messageId: 'queryImportsCommand' }],
        },
      ],
    });
  });
});
