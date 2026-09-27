import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './browser',
  metadata: { node: process.version, platform: process.platform, architecture: process.arch },
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // A retry must not hide a regression behind an eventually green run.
  retries: 0,
  workers: 2,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/browser-results.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4180',
    headless: true,
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'python3 -m http.server 4180 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4180/demo/',
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
