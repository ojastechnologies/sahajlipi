import { test as base, expect } from '@playwright/test';

const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await use(page);
    expect(errors, 'uncaught consumer example errors').toEqual([]);
  },
});

test.beforeEach(async ({ browser }, testInfo) => {
  testInfo.annotations.push({ type: 'browser-version', description: browser.version() });
});

test('installed vanilla consumer converts marked fields, exposes candidates, and preserves English', async ({ page }) => {
  await page.goto('/browser/.generated/vanilla/index.html');
  await expect(page.locator('#adapter-status')).toHaveText('Nepali typing enabled');
  const field = page.locator('#nepali-message');
  await field.focus();
  await page.keyboard.type('mahila');
  await expect(field).toHaveValue('महिला');
  await expect(page.locator('#candidate-options button')).toHaveText(['महिला', 'माहिला']);
  await page.locator('#candidate-options button[data-candidate-index="1"]').click();
  await expect(field).toHaveValue('माहिला');
  await page.keyboard.type(' 123|');
  await expect(field).toHaveValue('माहिला १२३।');

  const second = page.locator('#nepali-name');
  await second.focus();
  await page.keyboard.type('paani');
  await expect(second).toHaveValue('पानी');
  const english = page.locator('#english-message');
  await english.focus();
  await page.keyboard.type('camera 123');
  await expect(english).toHaveValue('camera 123');

  await page.locator('#mode-toggle').click();
  await expect(page.locator('#adapter-status')).toHaveText('English typing enabled');
  await field.focus();
  await page.keyboard.press('End');
  await page.keyboard.type(' camera 123');
  await expect(field).toHaveValue('माहिला १२३। camera 123');
  await page.locator('#mode-toggle').click();
  await field.focus();
  await page.keyboard.press('End');
  await page.keyboard.type(' paani');
  await expect(field).toHaveValue('माहिला १२३। camera 123 पानी');
});

test('installed vanilla consumer teardown leaves text literal and disables its controls', async ({ page }) => {
  await page.goto('/browser/.generated/vanilla/index.html');
  await expect(page.locator('#adapter-status')).toHaveText('Nepali typing enabled');
  const field = page.locator('#nepali-message');
  await field.focus();
  await page.keyboard.type('paani');
  await expect(field).toHaveValue('पानी');
  await page.locator('#cleanup-button').click();
  await expect(page.locator('#adapter-status')).toHaveText('Typing adapters detached');
  await expect(page.locator('#mode-toggle')).toBeDisabled();
  await expect(page.locator('#cleanup-button')).toBeDisabled();
  await field.focus();
  await page.keyboard.press('End');
  await page.keyboard.type(' kam 123');
  await expect(field).toHaveValue('पानी kam 123');
  const second = page.locator('#nepali-name');
  await second.focus();
  await page.keyboard.type('paani');
  await expect(second).toHaveValue('paani');
  await expect(page.locator('#candidate-options')).toBeHidden();
});

test('installed React uncontrolled consumer handles StrictMode, callbacks, mode, and remount cleanup', async ({ page }) => {
  await page.goto('/browser/.generated/react/index.html');
  // The development React build performs effect setup, cleanup, then setup.
  await expect(page.locator('#lifecycle-status')).toHaveText('Attached: 2; destroyed: 1');
  const field = page.locator('#react-nepali-input');
  await field.focus();
  await page.keyboard.type('kam');
  await expect(field).toHaveValue('कम');
  await expect(page.locator('#react-current-text')).toHaveText('कम');
  await expect(page.locator('#react-candidates button')).toHaveText(['कम', 'काम']);
  await page.locator('#react-candidates button[data-candidate-index="1"]').click();
  await expect(field).toHaveValue('काम');
  await expect(page.locator('#react-current-text')).toHaveText('काम');
  await page.keyboard.type(' 123|');
  await expect(field).toHaveValue('काम १२३।');
  await expect(page.locator('#react-current-text')).toHaveText('काम १२३।');

  await page.locator('#react-mode-toggle').click();
  await expect(page.locator('#react-mode-toggle')).toHaveText('Switch to Nepali');
  await field.focus();
  await page.keyboard.press('End');
  await page.keyboard.type(' camera 123');
  await expect(field).toHaveValue('काम १२३। camera 123');
  await expect(page.locator('#react-current-text')).toHaveText('काम १२३। camera 123');
  const english = page.locator('#react-english-input');
  await english.focus();
  await page.keyboard.type('camera 123');
  await expect(english).toHaveValue('camera 123');

  // StrictMode cleanup removed the first controller. Unmount removes the active
  // controller, and the new node has a new controller in Nepali mode.
  await page.locator('#toggle-editor').click();
  await expect(field).toHaveCount(0);
  await expect(page.locator('#lifecycle-status')).toHaveText('Attached: 2; destroyed: 2');
  await page.locator('#toggle-editor').click();
  await expect(page.locator('#lifecycle-status')).toHaveText('Attached: 4; destroyed: 3');
  await expect(field).toHaveValue('');
  await expect(page.locator('#react-mode-toggle')).toHaveText('Switch to English');
  await field.focus();
  await page.keyboard.type('paani 123');
  await expect(field).toHaveValue('पानी १२३');
  await expect(page.locator('#react-current-text')).toHaveText('पानी १२३');
  await expect(english).toHaveValue('camera 123');
});
