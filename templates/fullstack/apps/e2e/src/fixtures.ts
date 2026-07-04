import { test as base, expect } from '@playwright/test';
import { testCleanupSchema, testSeedSchema } from '@app/types/slices/users/user-contracts';
import { buildNamespace, namespacedEmail } from './namespace.js';

const apiUrl = (process.env.E2E_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const testToken = process.env.TEST_ROUTES_TOKEN ?? '';

export type SeedUserInput = {
  label: string;
  name?: string;
};

async function postTestRoute(path: string, body: unknown): Promise<void> {
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-test-token': testToken,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${path} failed (${response.status}): ${detail}`);
  }
}

export const test = base.extend<{
  ns: string;
  seed: (users: SeedUserInput[]) => Promise<void>;
}>({
  ns: async ({}, use, testInfo) => {
    const ns = buildNamespace(testInfo.workerIndex);
    await use(ns);
    await postTestRoute('/__test__/cleanup', testCleanupSchema.parse({ namespace: ns }));
  },
  seed: async ({ ns }, use) => {
    await use(async (users) => {
      const payload = testSeedSchema.parse({
        users: users.map(({ label, name }) => ({
          email: namespacedEmail(ns, label),
          name: name ?? label,
        })),
      });
      await postTestRoute('/__test__/seed', payload);
    });
  },
});

export { expect };
