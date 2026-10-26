import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: 'output/playwright/results',
  use: {
    baseURL: 'http://127.0.0.1:17473',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @liuzu/web preview --host 127.0.0.1 --port 17473',
      url: 'http://127.0.0.1:17473',
      reuseExistingServer: false,
    },
    {
      command: 'pnpm --filter @liuzu/admin preview --host 127.0.0.1 --port 17474',
      url: 'http://127.0.0.1:17474/admin/',
      reuseExistingServer: false,
    },
  ],
});
