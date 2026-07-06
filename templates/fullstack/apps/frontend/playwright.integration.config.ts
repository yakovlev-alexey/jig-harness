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
    baseURL: 'http://localhost:5174',
  },
  webServer: {
    command: 'pnpm build && vite preview --outDir dist/client --port 5174 --strictPort',
    reuseExistingServer: !process.env.CI,
    url: 'http://localhost:5174',
  },
});
