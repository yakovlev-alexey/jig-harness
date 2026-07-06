import { defineConfig, devices } from '@playwright/test';

const isRemote = Boolean(process.env.E2E_BASE_URL);
const baseURL = (process.env.E2E_BASE_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const testRoutesToken = process.env.TEST_ROUTES_TOKEN ?? 'e2e-local-token';
const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/jig_dev?schema=public';

process.env.TEST_ROUTES_TOKEN ??= testRoutesToken;
process.env.E2E_API_URL ??= baseURL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  globalSetup: isRemote ? undefined : './global-setup.ts',
  webServer: isRemote
    ? undefined
    : {
        command: 'pnpm --filter @app/backend start:test',
        url: `${baseURL}/api/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          ENABLE_TEST_ROUTES: 'true',
          TEST_ROUTES_TOKEN: testRoutesToken,
          PORT: '3001',
          SSR_API_ORIGIN: baseURL,
        },
      },
});
