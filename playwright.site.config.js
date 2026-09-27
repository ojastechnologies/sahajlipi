import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './website/tests',
  outputDir: 'site-test-results/artifacts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 2,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'site-playwright-report' }],
    ['json', { outputFile: 'site-test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4181/sahajlipi/',
    headless: true,
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'python3 -m http.server 4181 --bind 127.0.0.1 --directory .site-dist',
    url: 'http://127.0.0.1:4181/sahajlipi/',
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
