import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { reactConfig } from './index.js';

const RESTRICTED_IMPORT_RULE = 'no-restricted-imports';

async function lintRestrictedImports(code, filePath) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: reactConfig,
  });

  const [result] = await eslint.lintText(code, { filePath });

  return result.messages.filter((message) => message.ruleId === RESTRICTED_IMPORT_RULE);
}

describe('sd-no-store-in-presentational', () => {
  it('blocks relative store imports in widget-ui', async () => {
    const messages = await lintRestrictedImports(
      `import { usersQuery } from '../../store/queries/users-query';`,
      'src/slices/users/widgets/user-list/user-list.tsx',
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].message).toMatch(/sd-no-store-in-presentational/);
  });

  it('blocks aliased store imports in widget-ui', async () => {
    const messages = await lintRestrictedImports(
      `import { usersQuery } from '@/slices/users/store/queries/users-query';`,
      'src/slices/users/widgets/user-list/user-list.tsx',
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].message).toMatch(/sd-no-store-in-presentational/);
  });

  it('blocks data libraries in slice components', async () => {
    const messages = await lintRestrictedImports(
      `import { useQuery } from '@tanstack/react-query';
       import { atom } from 'nanostores';
       import { useStore } from '@nanostores/react';`,
      'src/slices/users/components/user-badge/user-badge.tsx',
    );

    expect(messages).toHaveLength(3);
    expect(
      messages.every((message) => message.message.includes('sd-no-store-in-presentational')),
    ).toBe(true);
  });

  it('blocks store imports in common components', async () => {
    const messages = await lintRestrictedImports(
      `import { usersQuery } from '@/slices/users/store/queries/users-query';`,
      'src/common/components/user-badge/user-badge.tsx',
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].message).toMatch(/sd-no-store-in-presentational/);
  });

  it('allows store and data imports in widget entry files', async () => {
    const messages = await lintRestrictedImports(
      `import { useQuery } from '@tanstack/react-query';
       import { useStore } from '@nanostores/react';
       import { usersQuery } from '../../store/queries/users-query';
       import { usersFilterAtom } from '@/slices/users/store/model/users-filter-store';`,
      'src/slices/users/widgets/user-list/user-list.widget.tsx',
    );

    expect(messages).toEqual([]);
  });

  it('allows store and data imports on pages', async () => {
    const messages = await lintRestrictedImports(
      `import { useQuery } from '@tanstack/react-query';
       import { usersQuery } from '../store/queries/users-query';`,
      'src/routes/users.tsx',
    );

    expect(messages).toEqual([]);
  });
});
