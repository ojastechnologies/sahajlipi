// Loads the unpacked extension in Playwright's Chromium and checks it on local fixture pages.
// The permission prompt, activeTab and keyboard commands need real user gestures, so they
// are not exercised here; see docs/extension-design.md for the manual test log.
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = 4181;
const origin = `http://127.0.0.1:${port}`;
const fixtures = `${origin}/extension/fixtures`;

await import('./build-extension.js');
await build({
  absWorkingDir: root,
  entryPoints: [path.join(root, 'extension/fixtures/react-controlled.jsx')],
  outfile: path.join(root, 'extension/fixtures/.generated/react-controlled.js'),
  bundle: true, format: 'iife', platform: 'browser', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' }, logLevel: 'warning',
});

// Stand in for an approved permission prompt: grant the fixture origin up front.
const unpacked = await mkdtemp(path.join(tmpdir(), 'sahajlipi-extension-'));
await cp(path.join(root, 'extension'), unpacked, { recursive: true });
const manifestPath = path.join(unpacked, 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.host_permissions = [`${origin}/*`];
await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
const results = [];
function check(name, actual, expected) {
  const pass = actual === expected;
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${pass ? '' : `\n      expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
}

let context;
try {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`${fixtures}/fields.html`)).ok) break; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${unpacked}`, `--load-extension=${unpacked}`],
  });
  const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
  await worker.evaluate(async () => {
    for (let i = 0; i < 50; i++) {
      if ((await chrome.scripting.getRegisteredContentScripts()).length) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('content script was never registered');
  });

  const page = await context.newPage();
  await page.goto(`${fixtures}/fields.html`);
  await page.waitForTimeout(500);
  const typeInto = async (selector, text, target = page) => {
    await target.locator(selector).click();
    await page.keyboard.type(text);
    return target.locator(selector).inputValue();
  };
  check('textarea converts', await typeInto('#textarea', 'namaste '), 'नमस्ते ');
  check('search input converts', await typeInto('#search', 'nepal '), 'नेपाल ');
  check('data-sahajlipi-ignore field stays literal', await typeInto('#ignored', 'namaste'), 'namaste');
  check('email field stays literal', await typeInto('#email', 'ma@example.com'), 'ma@example.com');
  check('card number field stays literal', await typeInto('#card', '4111 1111'), '4111 1111');
  check('one-time-code field stays literal', await typeInto('#otp', '123456'), '123456');
  check('username field stays literal', await typeInto('#username', 'ram'), 'ram');
  check('textarea added after load converts', await typeInto('#late', 'namaste'), 'नमस्ते');
  await page.locator('#editable').click();
  await page.keyboard.type('namaste');
  check('contenteditable is not converted (unsupported)', await page.locator('#editable').textContent(), 'namaste');
  check('input inside a shadow root is not converted (unsupported)', await typeInto('#shadow-input', 'namaste'), 'namaste');
  check('same-origin iframe converts (allFrames)', await typeInto('#frame-input', 'namaste', page.frameLocator('#frame')), 'नमस्ते');

  // Candidate dropdown: "ma" is ambiguous between म and मा.
  check('ambiguous word converts to first candidate', await typeInto('#text', 'ma'), 'म');
  const menu = page.locator('sahajlipi-candidates');
  check('candidate dropdown is shown', await menu.isVisible(), true);
  await page.screenshot({ path: path.join(root, 'test-results/extension-candidates.png'), clip: { x: 0, y: 0, width: 900, height: 200 } });
  const menuBox = await menu.boundingBox();
  const fieldBox = await page.locator('#text').boundingBox();
  check('dropdown sits just below the field', Math.round(menuBox.y - (fieldBox.y + fieldBox.height)), 4);
  await page.mouse.click(menuBox.x + 20, menuBox.y + menuBox.height * 0.72);
  check('clicking the second candidate replaces the word', await page.locator('#text').inputValue(), 'मा');
  check('choosing keeps focus in the field', await page.evaluate(() => document.activeElement.id), 'text');
  check('dropdown hides after choosing', await menu.isVisible(), false);
  await page.keyboard.type(' ma');
  await page.keyboard.press('Escape');
  check('Escape dismisses the dropdown', await menu.isVisible(), false);

  // A second injection into the same isolated world must not attach twice.
  await worker.evaluate(async (url) => {
    const [tab] = await chrome.tabs.query({ url });
    await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, files: ['dist/content.js'] });
  }, `${fixtures}/fields.html`);
  await page.locator('#textarea').fill('');
  check('re-injection does not double-convert', await typeInto('#textarea', 'namaste'), 'नमस्ते');

  // Toggle through the same message the popup sends.
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${new URL(worker.url()).host}/src/popup.html`);
  const setSite = (enabled) => popup.evaluate(async ({ url, enabled }) => {
    const [tab] = await chrome.tabs.query({ url });
    return chrome.runtime.sendMessage({ type: 'sahajlipi:set-site', tabId: tab.id, enabled });
  }, { url: `${fixtures}/fields.html`, enabled });
  check('popup message turns the site off', (await setSite(false)).ok, true);
  await page.bringToFront();
  await page.locator('#textarea').fill('');
  check('typing is literal while off', await typeInto('#textarea', 'namaste'), 'namaste');
  check('iframe follows the top-level site choice', await typeInto('#frame-input', 'x', page.frameLocator('#frame')), 'नमस्तेx');
  await page.reload();
  await page.waitForTimeout(500);
  check('off choice is remembered after reload', await typeInto('#textarea', 'namaste'), 'namaste');
  check('popup message turns the site back on', (await setSite(true)).ok, true);
  await page.bringToFront();
  await page.locator('#textarea').fill('');
  check('typing converts again', await typeInto('#textarea', 'namaste'), 'नमस्ते');

  // An origin without host permission gets nothing injected.
  await page.goto(`http://localhost:${port}/extension/fixtures/fields.html`);
  await page.waitForTimeout(500);
  check('ungranted origin is left alone', await typeInto('#textarea', 'namaste'), 'namaste');

  // A page that already runs SahajLipi on a marked field.
  await page.goto(`${fixtures}/embedded.html`);
  await page.waitForSelector('body[data-ready="true"]');
  await page.waitForTimeout(500);
  // Without excluding [data-sahajlipi] both adapters convert: "ननअअममअअससततएए".
  check('field the page marks for its own SahajLipi converts once', await typeInto('#embedded', 'namaste'), 'नमस्ते');

  // A React controlled input: React must see each conversion as the field's new value.
  await page.goto(`${fixtures}/react.html`);
  await page.waitForSelector('#controlled');
  await page.waitForTimeout(500);
  check('React controlled input converts', await typeInto('#controlled', 'namaste '), 'नमस्ते ');
  check('React state matches the converted text', await page.locator('#mirror').textContent(), 'नमस्ते ');
  await page.locator('#rerender').click();
  check('converted text survives a React re-render', await page.locator('#controlled').inputValue(), 'नमस्ते ');
  await page.locator('#controlled').click();
  await page.keyboard.press('End');
  await page.keyboard.type('ma');
  await page.mouse.click(...await (async () => {
    const box = await page.locator('sahajlipi-candidates').boundingBox();
    return [box.x + 20, box.y + box.height * 0.72];
  })());
  check('candidate choice reaches React state', await page.locator('#mirror').textContent(), 'नमस्ते मा');
} finally {
  await context?.close();
  server.kill();
  await rm(unpacked, { recursive: true, force: true });
}
const failed = results.filter((result) => result.pass === false);
console.log(`\n${results.filter((result) => result.pass).length} passed, ${failed.length} failed`);
process.exitCode = failed.length ? 1 : 0;
