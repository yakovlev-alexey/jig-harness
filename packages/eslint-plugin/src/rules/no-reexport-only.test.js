import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import { noReexportOnly } from './no-reexport-only.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

describe('no-reexport-only', () => {
  it('matches RED/GREEN fixtures', () => {
    ruleTester.run('no-reexport-only', noReexportOnly, {
      valid: [
        {
          code: `export function HeroBanner() { return null; }`,
        },
        {
          code: `import { x } from './x.js'; export { x };`,
        },
        {
          code: `export const value = 1;`,
        },
      ],
      invalid: [
        {
          code: `export { HeroBanner } from './hero-banner.js';`,
          errors: [{ messageId: 'reexportOnly' }],
        },
        {
          code: `export * from './hero-banner.js';`,
          errors: [{ messageId: 'reexportOnly' }],
        },
        {
          code: `export { a } from './a.js';\nexport { b } from './b.js';`,
          errors: [{ messageId: 'reexportOnly' }],
        },
      ],
    });
  });
});
