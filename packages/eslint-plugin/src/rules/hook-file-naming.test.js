import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import { hookFileNaming } from './hook-file-naming.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

describe('hook-file-naming', () => {
  it('matches RED/GREEN fixtures', () => {
    ruleTester.run('hook-file-naming', hookFileNaming, {
      valid: [
        {
          filename: '/app/src/slices/profile/widgets/profile-stats/use-profile-stats.ts',
          code: `export function useProfileStats() { return {}; }`,
        },
        {
          filename: '/app/src/slices/profile/components/hero-banner/hero-banner.tsx',
          code: `export function HeroBanner() { return null; }`,
        },
      ],
      invalid: [
        {
          filename: '/app/src/slices/profile/widgets/profile-stats/profile-stats.ts',
          code: `export function useProfileStats() { return {}; }`,
          errors: [{ messageId: 'wrongFilename' }],
        },
        {
          filename: '/app/src/slices/profile/widgets/profile-stats/use-profile-stats.ts',
          code: `
            export function useProfileStats() { return {}; }
            export function useOtherHook() { return {}; }
          `,
          errors: [{ messageId: 'multipleHooks' }],
        },
      ],
    });
  });
});
