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
const sharedConfig = [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
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
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
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
      '@jig-harness/no-reexport-only': 'error',
      '@jig-harness/no-command-query-cross-calls': 'error',
      '@jig-harness/domain-no-io': 'error',
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
      '@jig-harness/no-reexport-only': 'off',
    },
  },
  {
    files: ['**/turbo/generators/config.ts', 'packages/generators/**'],
    rules: {
      'import-x/no-default-export': 'off',
      'check-file/no-index': 'off',
      '@jig-harness/no-reexport-only': 'off',
    },
  },
];

/** @type {import('eslint').Linter.Config[]} */
const frontendBoundariesConfig = [
  {
    settings: {
      react: {
        version: 'detect',
      },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/App.tsx' },
        { type: 'common', pattern: 'src/common/**' },
        { type: 'slice', pattern: 'src/slices/*/**', mode: 'folder' },
        { type: 'page', pattern: 'src/slices/*/pages/**' },
        { type: 'widget', pattern: 'src/slices/*/widgets/**/*.widget.tsx' },
        { type: 'component', pattern: 'src/slices/*/components/**' },
        { type: 'widget-ui', pattern: 'src/slices/*/widgets/**/!(*.widget).tsx' },
        { type: 'entry', pattern: 'src/main.tsx' },
      ],
      'boundaries/include': ['src/**'],
      'import-x/resolver': {
        typescript: true,
        node: true,
      },
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/**',
              from: '../backend/src/**',
              message:
                'Frontend must not import backend implementation (ct-no-frontend-backend-impl-imports).',
            },
          ],
        },
      ],
      'boundaries/element-types': [
        'warn',
        {
          default: 'disallow',
          rules: [
            { from: 'entry', allow: ['app', 'common', 'slice', 'page'] },
            { from: 'app', allow: ['common', 'slice', 'page'] },
            { from: 'common', allow: ['common'] },
            { from: 'slice', allow: ['common', 'slice'] },
            { from: 'page', allow: ['common', 'component', 'widget', 'widget-ui'] },
            { from: 'widget', allow: ['common', 'component', 'widget-ui'] },
            { from: 'widget-ui', allow: ['common', 'component'] },
            { from: 'component', allow: ['common', 'component'] },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/slices/*/components/**/*.{ts,tsx}',
      'src/common/components/**/*.{ts,tsx}',
      'src/slices/*/widgets/**/*.tsx',
    ],
    ignores: ['**/*.widget.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@tanstack/react-query',
              message:
                'Only widget entries (*.widget.tsx) and pages access data/state (sd-no-store-in-presentational).',
            },
            {
              name: 'nanostores',
              message:
                'Only widget entries (*.widget.tsx) and pages access data/state (sd-no-store-in-presentational).',
            },
            {
              name: '@nanostores/react',
              message:
                'Only widget entries (*.widget.tsx) and pages access data/state (sd-no-store-in-presentational).',
            },
          ],
          patterns: [
            {
              group: ['**/store/**'],
              message:
                'Presentational files must not import store; do it in the widget entry (*.widget.tsx) or page (sd-no-store-in-presentational).',
            },
          ],
        },
      ],
    },
  },
];

/** @type {import('eslint').Linter.Config[]} */
const backendBoundariesConfig = [
  {
    settings: {
      'boundaries/elements': [
        { type: 'backend-common', pattern: 'src/common/**' },
        { type: 'backend-slice', pattern: 'src/slices/*', mode: 'folder' },
        { type: 'backend-domain', pattern: 'src/slices/*/domain/**' },
        { type: 'backend-usecase', pattern: 'src/slices/*/usecases/**' },
        { type: 'backend-command', pattern: 'src/slices/*/commands/**' },
        { type: 'backend-query', pattern: 'src/slices/*/queries/**' },
        { type: 'backend-endpoint', pattern: 'src/slices/*/endpoints/**' },
        { type: 'backend-plugin', pattern: 'src/slices/*/plugins/**' },
        { type: 'backend-schema', pattern: 'src/slices/*/schemas/**' },
      ],
      'boundaries/include': ['src/**'],
      'import-x/resolver': {
        typescript: true,
        node: true,
      },
    },
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'backend-common', allow: ['backend-common'] },
            { from: 'backend-plugin', allow: ['backend-endpoint', 'backend-common'] },
            {
              from: 'backend-endpoint',
              allow: ['backend-usecase', 'backend-schema', 'backend-common'],
            },
            {
              from: 'backend-usecase',
              allow: ['backend-domain', 'backend-command', 'backend-query', 'backend-common'],
            },
            { from: 'backend-command', allow: ['backend-common'] },
            { from: 'backend-query', allow: ['backend-common'] },
            { from: 'backend-domain', allow: ['backend-domain'] },
            { from: 'backend-schema', allow: ['backend-schema', 'backend-common'] },
          ],
        },
      ],
    },
  },
];

/** @type {import('eslint').Linter.Config[]} */
const testFilesConfig = [
  {
    files: [
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/tests/**',
      '**/e2e/**',
      '**/fixtures.ts',
      '**/fixtures/**',
    ],
    rules: {
      'boundaries/element-types': 'off',
      '@jig-harness/no-command-query-cross-calls': 'off',
      '@jig-harness/domain-no-io': 'off',
      'no-restricted-imports': 'off',
    },
  },
];

/** @type {import('eslint').Linter.Config[]} */
export const nodeConfig = [
  ...sharedConfig,
  ...testFilesConfig,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@jig-harness/no-command-query-cross-calls': 'off',
      '@jig-harness/domain-no-io': 'off',
    },
  },
];

/** @type {import('eslint').Linter.Config[]} */
export const reactConfig = [
  ...sharedConfig,
  ...frontendBoundariesConfig,
  ...testFilesConfig,
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
      '@jig-harness/no-command-query-cross-calls': 'off',
      '@jig-harness/domain-no-io': 'off',
    },
  },
];

/** @type {import('eslint').Linter.Config[]} */
export const backendConfig = [...sharedConfig, ...backendBoundariesConfig, ...testFilesConfig];

export default reactConfig;
