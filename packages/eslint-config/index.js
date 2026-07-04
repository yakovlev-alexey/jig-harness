import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';
import checkFile from 'eslint-plugin-check-file';
import unicorn from 'eslint-plugin-unicorn';
import boundaries from 'eslint-plugin-boundaries';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import jigPlugin from '@jig-harness/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
const baseConfig = [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.turbo/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'import-x': importX,
      'check-file': checkFile,
      unicorn,
      boundaries,
      '@jig-harness': jigPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/App.tsx' },
        { type: 'common', pattern: 'src/common/**' },
        { type: 'slice', pattern: 'src/slices/*/**', mode: 'folder' },
        { type: 'entry', pattern: 'src/main.tsx' },
      ],
      'boundaries/include': ['src/**'],
      'import-x/resolver': {
        typescript: true,
        node: true,
      },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'import-x/no-default-export': 'error',
      'check-file/no-index': 'error',
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
        },
      ],
      'boundaries/element-types': [
        'warn',
        {
          default: 'disallow',
          rules: [
            { from: 'entry', allow: ['app', 'common', 'slice'] },
            { from: 'app', allow: ['common', 'slice'] },
            { from: 'common', allow: ['common'] },
            { from: 'slice', allow: ['common', 'slice'] },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.stories.ts', '**/*.stories.tsx'],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },
  {
    files: ['**/App.tsx', '**/main.tsx'],
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
  {
    files: ['**/*.config.{js,ts,mjs,cjs}', 'eslint.config.js'],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },
];

/** @type {import('eslint').Linter.Config[]} */
export const nodeConfig = [
  ...baseConfig,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: globals.node,
    },
  },
];

/** @type {import('eslint').Linter.Config[]} */
export const reactConfig = [
  ...baseConfig,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
    },
  },
];

export default reactConfig;
