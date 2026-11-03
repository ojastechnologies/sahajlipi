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
import { convertText } from '../src/index.js';
import { TYPING_GUIDE } from '../extension/src/typing-guide.js';

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
// EXTENSION_DIR tests an unpacked release zip instead of the working tree.
const unpacked = await mkdtemp(path.join(tmpdir(), 'sahajlipi-extension-'));
await cp(process.env.EXTENSION_DIR ?? path.join(root, 'extension'), unpacked, { recursive: true });
const manifestPath = path.join(unpacked, 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.host_permissions = [`${origin}/*`];
await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

// Real editors, from their own small package so the published one gains no dependencies.
await build({
  absWorkingDir: path.join(root, 'tools/extension-editors'),
  entryPoints: ['editors.jsx'],
  outfile: path.join(root, 'extension/fixtures/.generated/editors.js'),
  bundle: true, format: 'iife', platform: 'browser', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"', global: 'globalThis' }, logLevel: 'warning',
});

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
  const notice = page.locator('sahajlipi-notice');
  check('excluded and supported fields show no notice', await notice.isVisible(), false);
  await page.locator('#editable').click();
  await page.keyboard.type('namaste');
  check('contenteditable converts', await page.locator('#editable').textContent(), 'नमस्ते');
  await page.locator('#editable-ignored').click();
  await page.keyboard.type('namaste');
  check('contenteditable marked data-sahajlipi-ignore stays literal', await page.locator('#editable-ignored').textContent(), 'namaste');
  check('a box handled as rich text shows no notice', await notice.isVisible(), false);
  check('input inside a shadow root is not converted (unsupported)', await typeInto('#shadow-input', 'namaste'), 'namaste');
  check('typing in an unsupported box shows the notice', await notice.isVisible(), true);
  const noticeBox = await notice.boundingBox();
  const unsupportedBox = await page.locator('#shadow-input').boundingBox();
  check('notice sits just below the box', Math.round(noticeBox.y - (unsupportedBox.y + unsupportedBox.height)), 6);
  await page.locator('#search').click();
  check('notice hides when focus leaves the box', await notice.isVisible(), false);
  await typeInto('#shadow-input', 'a');
  check('notice shows once per page', await notice.isVisible(), false);
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

  // A tall text area: the list follows the caret's line instead of the box's bottom edge.
  await page.locator('#textarea').evaluate((element) => { element.rows = 12; });
  await page.locator('#textarea').fill('');
  await typeInto('#textarea', 'ma');
  const tallMenu = await menu.boundingBox();
  const tallField = await page.locator('#textarea').boundingBox();
  check('text area list sits near the caret line', tallMenu.y - tallField.y < 50, true);
  check('text area list stays inside the field width', tallMenu.x >= tallField.x && tallMenu.x <= tallField.x + tallField.width, true);
  // macOS Option+digit: event.key is not a digit, so the menu matches the physical key.
  await page.locator('#textarea').evaluate((element) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key: '™', code: 'Digit2', altKey: true, bubbles: true, cancelable: true }));
  });
  check('Option+2 chooses the second spelling', await page.locator('#textarea').inputValue(), 'मा');
  await page.locator('#textarea').fill('');
  await page.locator('#textarea').evaluate((element) => { element.rows = 3; });

  // Toolbar badge and the shortcut's on-page confirmation.
  const activeTabId = await worker.evaluate(async (url) => (await chrome.tabs.query({ url }))[0].id, page.url());
  const badge = () => worker.evaluate((tabId) => chrome.action.getBadgeText({ tabId }), activeTabId);
  check('badge shows typing is on', await badge(), 'ने');
  await worker.evaluate((tabId) => chrome.tabs.sendMessage(tabId, { type: 'sahajlipi:announce', enabled: true }, { frameId: 0 }), activeTabId);
  const toast = page.locator('sahajlipi-toast');
  check('shortcut confirmation appears', await toast.isVisible(), true);
  await toast.waitFor({ state: 'hidden', timeout: 3000 });
  check('shortcut confirmation clears itself', await toast.isVisible(), false);

  // The notice for boxes the extension cannot type in.
  const noticeKey = `notice-off:${origin}`;
  const noticePage = await context.newPage();
  const noticeHost = noticePage.locator('sahajlipi-notice');
  await noticePage.goto(`${fixtures}/fields.html?shadow-notice`);
  await noticePage.waitForTimeout(500);
  await noticePage.locator('#shadow-input').click();
  await noticePage.locator('#shadow-input').evaluate((element) => {
    element.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: 'a', bubbles: true, composed: true, cancelable: true }));
  });
  check('a synthetic event does not trigger the notice', await noticeHost.isVisible(), false);
  await noticePage.keyboard.press('1');
  check('a digit does not trigger the notice', await noticeHost.isVisible(), false);
  await noticePage.keyboard.type('a');
  check('an input inside a shadow root shows the notice', await noticeHost.isVisible(), true);
  await noticePage.goto(`${fixtures}/fields.html?off-notice`);
  await noticePage.waitForTimeout(500);
  await worker.evaluate((key) => chrome.storage.local.set({ [key]: false }), `site:${origin}`);
  await noticePage.locator('#shadow-input').click();
  await noticePage.keyboard.type('a');
  check('no notice while typing is off', await noticeHost.isVisible(), false);
  await worker.evaluate((key) => chrome.storage.local.set({ [key]: true }), `site:${origin}`);
  await noticePage.goto(`${fixtures}/fields.html?dismiss-notice`);
  await noticePage.waitForTimeout(500);
  await noticePage.locator('#shadow-input').click();
  await noticePage.keyboard.type('a');
  const dismissBox = await noticeHost.boundingBox();
  await noticePage.mouse.click(dismissBox.x + dismissBox.width - 30, dismissBox.y + dismissBox.height / 2);
  check('dismissing hides the notice', await noticeHost.isVisible(), false);
  check('dismissing keeps focus in the box', await noticePage.evaluate(() => document.activeElement.id), 'shadow-host');
  check('dismissing is saved for the site', await worker.evaluate(async (key) => (await chrome.storage.local.get(key))[key], noticeKey), true);
  await noticePage.reload();
  await noticePage.waitForTimeout(500);
  await noticePage.locator('#shadow-input').click();
  await noticePage.keyboard.type('a');
  check('a dismissed site shows no notice', await noticeHost.isVisible(), false);
  await worker.evaluate((key) => chrome.storage.local.remove(key), noticeKey);
  await noticePage.close();

  // A second injection into the same isolated world must not attach twice.
  await worker.evaluate(async (url) => {
    const [tab] = await chrome.tabs.query({ url });
    await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, files: ['dist/content.js'] });
  }, `${fixtures}/fields.html`);
  await page.locator('#textarea').fill('');
  check('re-injection does not double-convert', await typeInto('#textarea', 'namaste'), 'नमस्ते');

  // Toggle through the same message the popup sends.
  // The popup's typing guide must match what the engine does.
  for (const [roman, nepali] of TYPING_GUIDE) check(`typing guide: ${roman}`, convertText(roman), nepali);
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${new URL(worker.url()).host}/src/popup.html`);
  check('typing guide starts collapsed', await popup.locator('#guide-list').isVisible(), false);
  await popup.locator('#guide summary').click();
  check('typing guide opens and lists every example', await popup.locator('#guide-list > div').count(), TYPING_GUIDE.length);
  check('typing guide shows Nepali output', await popup.locator('#guide-list > div').first().locator('dd').textContent(), TYPING_GUIDE[0][1]);
  const guideHeight = await popup.evaluate(() => document.querySelector('main').getBoundingClientRect().height);
  check(`open popup fits the browser's 600px limit (${Math.ceil(guideHeight)}px)`, guideHeight <= 600, true);
  check('reference link opens a new tab', await popup.locator('.links a').first().getAttribute('target'), '_blank');
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

  // Real rich text editors. What counts is the editor's own model: that is what a site
  // posts, and the DOM can show text the model never accepted.
  const siteKeyName = `site:${origin}`;
  const setStored = (enabled) => worker.evaluate(([key, value]) => chrome.storage.local.set({ [key]: value }), [siteKeyName, enabled]);
  const scenarios = [
    ['word and space', 'नमस्ते ', async () => page.keyboard.type('namaste ')],
    ['two words', 'मेरो नेपाल', async () => page.keyboard.type('mero nepal')],
    ['Backspace edits the Roman word', 'नमस', async () => {
      await page.keyboard.type('namast');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('s');
    }],
    ['Enter starts a new line', 'राम\nनेपाल', async () => {
      await page.keyboard.type('ram');
      await page.keyboard.press('Enter');
      await page.keyboard.type('nepal');
    }],
    ['Backspace at a line start merges lines', 'राम नेपाल', async () => {
      await page.keyboard.type('ram');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(' nepal');
    }],
    ['candidate click, then more typing', 'मा राम', async () => {
      await page.keyboard.type('ma');
      const box = await page.locator('sahajlipi-candidates').boundingBox();
      await page.mouse.click(box.x + 20, box.y + box.height * 0.72);
      await page.keyboard.type(' ram');
    }],
    ['typing over a selection in one line', 'नेपाल', async () => {
      await page.keyboard.type('ram');
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.type('nepal');
      await page.waitForTimeout(400);
    }],
    ['typing over a selection across lines', 'मेरो', async () => {
      await page.keyboard.type('ram');
      await page.keyboard.press('Enter');
      await page.keyboard.type('nepal');
      await page.keyboard.press('ControlOrMeta+a');
      await page.waitForTimeout(150);
      await page.keyboard.type('mero');
      await page.waitForTimeout(400);
    }],
    ['typing in the middle of a line', 'मराम नेपाल', async () => {
      await page.keyboard.type('ram nepal');
      for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowLeft');
      await page.keyboard.type('ma');
    }],
    ['a web address stays literal', 'हि https://a.co ', async () => page.keyboard.type('hi https://a.co ')],
  ];
  const editable = page.locator('[contenteditable="true"]').first();
  const openEditor = async (editor) => {
    await page.goto(`${fixtures}/rich.html?editor=${editor}`);
    await page.waitForTimeout(400);
    await editable.click();
  };
  const readEditor = async () => {
    await page.waitForTimeout(150);
    return page.evaluate(() => ({
      model: editorText().replace(/\n+/g, '\n'),
      shown: document.querySelector('[contenteditable="true"]').innerText.replace(/\uFEFF/g, '').replace(/\n+/g, '\n').replace(/\n$/, ''),
    }));
  };
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  for (const editor of ['plain', 'draft', 'lexical', 'prosemirror', 'slate', 'quill']) {
    for (const [name, expected, act] of scenarios) {
      await openEditor(editor);
      await act();
      const { model, shown } = await readEditor();
      check(`${editor}: ${name}`, model, expected);
      check(`${editor}: ${name} (shown matches model)`, shown.replace(/\u00A0/g, ' '), expected);
    }
    await openEditor(editor);
    await page.keyboard.type('ram nepal');
    await page.waitForTimeout(400);
    await page.keyboard.press('ControlOrMeta+z');
    await page.waitForTimeout(150);
    const undone = (await readEditor()).model;
    check(`${editor}: undo goes to the editor and leaves no Roman text`, /[a-z]/i.test(undone) || undone === 'राम नेपाल', false);
    await setStored(false);
    await openEditor(editor);
    await page.keyboard.type('namaste');
    check(`${editor}: typing is literal while the site is off`, (await readEditor()).model, 'namaste');
    await setStored(true);
    check(`${editor}: no page errors`, pageErrors.join('; '), '');
    pageErrors.length = 0;
  }
  await worker.evaluate((key) => chrome.storage.local.remove(key), siteKeyName);

  // First enable on an already open page: the switch needs no permission and no reload.
  // Stubs make the origin look unapproved. This run reaches the page through its test host
  // permission; a real popup click uses activeTab.
  await worker.evaluate(() => chrome.scripting.unregisterContentScripts());
  await worker.evaluate((key) => chrome.storage.local.remove(key), `site:${origin}`);
  const firstEnableUrl = `${fixtures}/fields.html?first-enable`;
  await page.goto(firstEnableUrl);
  await page.waitForTimeout(500);
  check('page starts without the script', await typeInto('#textarea', 'namaste'), 'namaste');
  await page.locator('#textarea').fill('');
  const popupUrl = `chrome-extension://${new URL(worker.url()).host}/src/popup.html`;
  const showActiveTab = (url) => {
    const query = chrome.tabs.query.bind(chrome.tabs);
    chrome.tabs.query = (filter) => query(filter.active ? { url } : filter);
  };
  const unapproved = await context.newPage();
  await unapproved.addInitScript(showActiveTab, firstEnableUrl);
  await unapproved.addInitScript(() => {
    globalThis.permissionRequests = [];
    chrome.permissions.contains = async () => false;
    chrome.permissions.request = async (request) => {
      globalThis.permissionRequests.push(request);
      return false;
    };
  });
  await unapproved.goto(popupUrl);
  const permissionRequests = () => unapproved.evaluate(() => JSON.stringify(globalThis.permissionRequests));
  check('Remember is hidden until typing is on', await unapproved.locator('#remember').isVisible(), false);
  await unapproved.locator('#toggle').click();
  await unapproved.locator('#remember').waitFor();
  check('the switch does not ask for permission', await permissionRequests(), '[]');
  check('popup says the tab is on until it navigates', await unapproved.locator('#note').textContent(), 'On until you leave or reload this page.');
  await page.bringToFront();
  check('first enable works without a reload', await typeInto('#textarea', 'namaste'), 'नमस्ते');
  await unapproved.bringToFront();
  await unapproved.locator('#remember').click();
  await unapproved.waitForFunction(() => globalThis.permissionRequests.length === 1);
  check('Remember asks for this origin only', await permissionRequests(), JSON.stringify([{ origins: [`${origin}/*`] }]));
  await unapproved.locator('#remember').waitFor();
  check('declining leaves the switch on', await unapproved.locator('#toggle').isChecked(), true);
  await unapproved.waitForFunction(() => document.querySelector('#note').textContent.startsWith('Not remembered'));
  check('declining says the site was not remembered', await unapproved.locator('#note').textContent(), 'Not remembered. Still on until you leave or reload this page.');
  await page.bringToFront();
  await page.locator('#textarea').fill('');
  check('declining leaves typing on in this tab', await typeInto('#textarea', 'namaste'), 'नमस्ते');
  const approved = await context.newPage();
  await approved.addInitScript(showActiveTab, firstEnableUrl);
  await approved.goto(popupUrl);
  await approved.locator('#forget').waitFor();
  check('an approved site offers Forget, not Remember', await approved.locator('#remember').isVisible(), false);
} finally {
  await context?.close();
  server.kill();
  await rm(unpacked, { recursive: true, force: true });
}
const failed = results.filter((result) => result.pass === false);
console.log(`\n${results.filter((result) => result.pass).length} passed, ${failed.length} failed`);
process.exitCode = failed.length ? 1 : 0;
