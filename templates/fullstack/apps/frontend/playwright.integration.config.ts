import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:4173',
  },
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    reuseExistingServer: !process.env.CI,
    url: 'http://localhost:4173',
  },
});
