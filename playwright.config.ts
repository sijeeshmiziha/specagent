import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: '**/test_suite.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  reporter: [['list'], ['json', { outputFile: '.report.json' }]],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  outputDir: 'snapshots',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
