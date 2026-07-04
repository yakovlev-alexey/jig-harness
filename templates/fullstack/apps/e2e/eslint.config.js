import { nodeConfig } from '@jig-harness/eslint-config';

export default [
  ...nodeConfig,
  {
    files: ['global-setup.ts'],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', 'src/fixtures.ts', 'src/scenarios/**'],
    rules: {
      'boundaries/element-types': 'off',
      'no-empty-pattern': 'off',
    },
  },
];
