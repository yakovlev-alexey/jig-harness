import { test, expect } from '../src/fixtures.js';
import { namespacedEmail } from '../src/namespace.js';
import { listUsersSeedScenario } from '../src/scenarios/list-users-scenario.js';

test('lists seeded namespaced users', async ({ page, ns, seed }) => {
  await seed([...listUsersSeedScenario]);

  await page.goto('/users');

  for (const user of listUsersSeedScenario) {
    const email = namespacedEmail(ns, user.label);
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText(user.name)).toBeVisible();
  }
});
