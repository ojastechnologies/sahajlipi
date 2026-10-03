import { test, expect } from '@playwright/test';

const canonical = 'https://ojastechnologies.github.io/sahajlipi/';

async function assertNoOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test('homepage remains readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4181/sahajlipi/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nepali typing for your web app.');
  await expect(page.locator('#nepali-preview')).toHaveText('पानी');
  const release = page.locator('.sahaj-release-note');
  await expect(release).toContainText('0.1.0-alpha.2 is available on npm.');
  await expect(release).toContainText('Experimental Nepali developer alpha.');
  await expect(release.getByRole('link', { name: 'npm', exact: true })).toHaveAttribute('href', 'https://www.npmjs.com/package/sahajlipi/v/0.1.0-alpha.2');
  await expect(release.getByRole('link', { name: 'release record', exact: true })).toHaveAttribute('href', '/sahajlipi/docs/release.html');
  await expect(page.getByLabel('Install the verified Nepali developer alpha')).toHaveText('npm install --save-exact sahajlipi@0.1.0-alpha.2');
  await page.getByRole('link', { name: 'Get started', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/package\/getting-started\.html$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await context.close();
});

test('home preview runs the core converter and links into developer docs', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  await expect(page.locator('#nepali-preview')).toHaveText('पानी');
  await page.locator('#roman-preview').fill('camera');
  await expect(page.locator('#nepali-preview')).toHaveText('क्यामेरा');
  await page.locator('#roman-preview').fill('k');
  await expect(page.locator('#nepali-preview')).toHaveText('क');
  await page.locator('#roman-preview').fill('kr');
  await expect(page.locator('#nepali-preview')).toHaveText('क्र');
  await page.locator('#roman-preview').fill('k`');
  await expect(page.locator('#nepali-preview')).toHaveText('क्');
  await page.getByRole('button', { name: '123', exact: true }).click();
  await expect(page.locator('#nepali-preview')).toHaveText('१२३');
  await page.locator('#roman-preview').fill('');
  await expect(page.locator('#nepali-preview')).toHaveText('');
  await page.getByRole('link', { name: 'Get started', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/package\/getting-started\.html$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical + 'docs/package/getting-started.html');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical + 'docs/package/getting-started.html');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  await page.goBack();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  const structured = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  const source = structured['@graph'].find(node => node['@type'] === 'SoftwareSourceCode');
  expect(source.version).toBe('0.1.0-alpha.2');
  expect(source.datePublished).toBe('2026-10-03');
  expect(source.sameAs).toBe('https://www.npmjs.com/package/sahajlipi/v/0.1.0-alpha.2');
  expect(errors).toEqual([]);
});

test('local search finds the API and opens its static route', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Search', exact: false }).click();
  await page.locator('#localsearch-input').fill('createEngine');
  const result = page.getByRole('link').filter({ hasText: 'API reference' }).first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/docs\/package\/api\.html(?:#.*)?$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('homepage demo link loads the static app and supports typing', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  await page.getByRole('link', { name: 'Try the demo', exact: true }).click();
  await expect(page).toHaveURL(/\/sahajlipi\/demo\/$/);
  const editor = page.locator('#typing-field');
  await editor.pressSequentially('paani ');
  await expect(editor).toHaveValue('पानी ');
  await editor.press('ControlOrMeta+A');
  await editor.pressSequentially('company ');
  await expect(editor).toHaveValue('कम्पनी ');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical + 'demo/');
  await page.getByRole('link', { name: 'Docs', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/package\/getting-started\.html$/);
  expect(errors).toEqual([]);
});

test('header demo navigation also leaves the VitePress router', async ({ page }) => {
  await page.goto('docs/package/api.html');
  await page.locator('.VPNavBar').getByRole('link', { name: 'Demo', exact: true }).click();
  await expect(page.locator('#typing-field')).toBeVisible();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nepali typing for your web app.');
});

test('mobile homepage, navigation, documentation, and demo fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('./');
  await assertNoOverflow(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'mobile navigation' }).click();
  await page.locator('.VPNavScreen').getByRole('link', { name: 'Documentation', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/package\/getting-started\.html$/);
  await assertNoOverflow(page);
  await page.goto('demo/');
  await assertNoOverflow(page);
  await expect(page.locator('#typing-field')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Docs', exact: true })).toBeVisible();
});

test('published benchmark downloads and sitemap remain reachable', async ({ request }) => {
  const sitemap = await request.get('sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain(canonical + 'demo/');
  const report = await request.get('browser/reports/desktop-003.json');
  expect(report.ok()).toBe(true);
  const record = await report.json();
  expect(record).toHaveProperty('recordedAt');
  const image = await request.get('assets/brand/social-preview.png');
  expect(image.ok()).toBe(true);
  expect(image.headers()['content-type']).toContain('image/png');
});

test('site logos return home from the demo and nested docs at desktop and mobile widths', async ({ page }) => {
  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 812 });
    for (const route of ['demo/', 'docs/package/api.html', 'docs/package/architecture.html']) {
      await page.goto(route);
      const logo = route.startsWith('demo') ? page.locator('.identity') : page.locator('.VPNavBarTitle a');
      await logo.click();
      await expect(page).toHaveURL('http://127.0.0.1:4181/sahajlipi/');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nepali typing for your web app.');
    }
  }
});

test('Home navigation works from documentation and demo on desktop and mobile', async ({ page }) => {
  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto('docs/package/api.html');
    let navigation = page.locator('.VPNavBar');
    if (width === 375) {
      await page.getByRole('button', { name: 'mobile navigation' }).click();
      navigation = page.locator('.VPNavScreen');
    }
    await navigation.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nepali typing for your web app.');
    await page.goto('demo/');
    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nepali typing for your web app.');
  }
});

test('documentation body links load the standalone demo and return home', async ({ page }) => {
  for (const route of ['docs/demo/', 'docs/development.html', 'docs/website-and-seo.html']) {
    await page.goto(route);
    const link = page.locator('.vp-doc a[href="/sahajlipi/demo/index.html"], .vp-doc a[href="/sahajlipi/demo/"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page.locator('#typing-field')).toBeVisible();
    await page.locator('.identity').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nepali typing for your web app.');
  }
});

test('legacy local root and demo addresses redirect into the complete website', async ({ page }) => {
  await page.goto('http://127.0.0.1:4181/');
  await expect(page).toHaveURL('http://127.0.0.1:4181/sahajlipi/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nepali typing for your web app.');
  await page.goto('http://127.0.0.1:4181/demo/?from=bookmark');
  await expect(page).toHaveURL('http://127.0.0.1:4181/sahajlipi/demo/?from=bookmark');
  await expect(page.locator('#typing-field')).toBeVisible();
  await page.getByRole('link', { name: 'Docs', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Getting started');
  await page.locator('.VPNavBarTitle a').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nepali typing for your web app.');
});
