import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },

  fullyParallel: false,
  retries: 1,

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    // ['./src/reporters/spira-reporter.ts'], // Enable when Spira integration is configured
  ],

  use: {
    baseURL: 'https://v3.libraryinformationsystem.org',
    navigationTimeout: 30_000,
    actionTimeout: 10_000,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'demo',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        launchOptions: { slowMo: 500 },
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  outputDir: 'test-results',
});
