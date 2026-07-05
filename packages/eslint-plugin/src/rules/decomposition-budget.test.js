import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import { decompositionBudget } from './decomposition-budget.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

describe('decomposition-budget', () => {
  it('matches RED/GREEN fixtures', () => {
    ruleTester.run('decomposition-budget', decompositionBudget, {
      valid: [
        {
          code: `export function short() { return 1; }`,
          options: [{ file: 10, function: 5 }],
        },
        {
          code: `
            export function fits() {
              return 1;
            }
          `,
          options: [{ file: 10, function: 5 }],
        },
      ],
      invalid: [
        {
          code: `
            // comment
            export function a() { return 1; }
            export function b() { return 2; }
            export function c() { return 3; }
            export function d() { return 4; }
            export function e() { return 5; }
            export function f() { return 6; }
            export function g() { return 7; }
            export function h() { return 8; }
          `,
          options: [{ file: 5, function: 100 }],
          errors: [{ messageId: 'fileBudget' }],
        },
        {
          code: `
            export function tooLong() {
              const a = 1;
              const b = 2;
              const c = 3;
              const d = 4;
              const e = 5;
              const f = 6;
              return a + b + c + d + e + f;
            }
          `,
          options: [{ file: 100, function: 3 }],
          errors: [{ messageId: 'functionBudget' }],
        },
      ],
    });
  });
});
