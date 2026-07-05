import { test, expect } from '../src/fixtures.js';
import { namespacedEmail } from '../src/namespace.js';
import { createUserViaUiScenario } from '../src/scenarios/create-user-scenario.js';

test('creates a user via the UI', async ({ page, ns }) => {
  const { label, name } = createUserViaUiScenario;
  const email = namespacedEmail(ns, label);

  await page.goto('/users');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/name/i).fill(name);
  await page.getByRole('button', { name: /create user/i }).click();

  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByText(name)).toBeVisible();
});
