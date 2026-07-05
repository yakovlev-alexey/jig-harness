import type { SeedUserInput } from '../fixtures.js';

export const listUsersSeedScenario = [
  { label: 'alpha', name: 'Alpha User' },
  { label: 'beta', name: 'Beta User' },
] as const satisfies readonly SeedUserInput[];
