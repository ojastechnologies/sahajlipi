import { test as base, expect } from '@playwright/test';

// Fail each fresh-page test if application code throws in the browser.
const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await use(page);
    expect(errors, 'uncaught browser page errors').toEqual([]);
  },
});

test.beforeEach(async ({ browser }, testInfo) => {
  testInfo.annotations.push({ type: 'browser-version', description: browser.version() });
});

async function demo(page) {
  await page.goto('/demo/');
  await expect(page.locator('#mode-button')).toHaveText('Nepali mode');
  const field = page.locator('#typing-field');
  await field.focus();
  return field;
}

async function fixture(page) {
  await page.goto('/browser/fixtures/adapters.html');
  await page.waitForFunction(() => Boolean(window.browserFixture));
  const field = page.locator('#direct-field');
  await field.focus();
  return field;
}

async function clearDemo(page) {
  await page.locator('#clear-button').click();
}

async function pasteText(field, text) {
  // Synthetic ClipboardEvent coverage; this does not exercise OS permissions.
  await field.evaluate((element, source) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', source);
    const event = new ClipboardEvent('paste', {
      clipboardData, bubbles: true, cancelable: true,
    });
    // Firefox supplies an empty data store for constructed clipboard events.
    // Inject the test payload explicitly when constructor data was discarded.
    if (event.clipboardData?.getData('text/plain') !== source) {
      Object.defineProperty(event, 'clipboardData', { value: clipboardData });
    }
    if (event.clipboardData.getData('text/plain') !== source) {
      throw new Error('Synthetic clipboard test did not receive its text/plain payload');
    }
    element.dispatchEvent(event);
  }, text);
}

test('real keyboard forms full consonant clusters and backspaces through their Roman keys', async ({ page }) => {
  const field = await fixture(page);
  await page.keyboard.type('k');
  await expect(field).toHaveValue('क');
  await page.keyboard.type('r');
  await expect(field).toHaveValue('क्र');
  await page.keyboard.type('i');
  await expect(field).toHaveValue('क्रि');
  await page.keyboard.press('Backspace');
  await expect(field).toHaveValue('क्र');
  await page.keyboard.press('Backspace');
  await expect(field).toHaveValue('क');
  await expect.poll(() => page.evaluate(() => window.browserFixture.inputValues))
    .toEqual(['क', 'क्र', 'क्रि', 'क्र', 'क']);
});

test('real keyboard commits and edits explicit backtick halves with undo and redo', async ({ page }) => {
  const field = await fixture(page);
  await page.keyboard.type('ka`');
  await expect(field).toHaveValue('क्');
  await expect.poll(() => page.evaluate(() => window.browserFixture.controller.getState().activeRoman))
    .toBe('ka`');
  await page.keyboard.press('Backspace');
  await expect(field).toHaveValue('क');
  await page.keyboard.press('Control+z');
  await expect(field).toHaveValue('क्');
  await page.keyboard.press('Control+Shift+z');
  await expect(field).toHaveValue('क');
  await page.keyboard.type('`i kr` par`=yo ');
  await expect(field).toHaveValue('क्इ क्र् पर्\u200dयो ');
  await page.keyboard.press('Control+z');
  await expect(field).toHaveValue('क्इ क्र् पर्\u200dयो');
  await page.keyboard.press('Control+Shift+z');
  await expect(field).toHaveValue('क्इ क्र् पर्\u200dयो ');
});

test('demo consonant settings preserve existing text and configure typing and paste across marked fields', async ({ page }) => {
  const field = await demo(page);
  await page.keyboard.type('k');
  await page.locator('#consonant-select').selectOption('half');
  await expect(field).toHaveValue('क');
  await page.keyboard.type('r');
  // Switching finishes the previous source word rather than rerendering it.
  await expect(field).toHaveValue('कर्');
  await expect(page.locator('#roman-spelling')).toHaveText('r');
  await field.evaluate(element => element.setSelectionRange(0, element.value.length));
  await page.locator('#consonant-select').selectOption('full');
  await expect.poll(() => field.evaluate(element => [element.selectionStart, element.selectionEnd]))
    .toEqual([0, 3]);
  await page.keyboard.type('k ');
  await expect(field).toHaveValue('क ');
  await page.locator('#consonant-select').selectOption('half');
  await expect(field).toHaveValue('क ');
  await page.keyboard.type('kr');
  await expect(field).toHaveValue('क क्र्');
  await pasteText(field, ' k');
  await expect(field).toHaveValue('क क्र् क्');
  await page.locator('#sample-name').focus();
  await page.keyboard.type('k');
  await expect(page.locator('#sample-name')).toHaveValue('क्');
  await page.locator('#consonant-select').selectOption('full');
  await expect(page.locator('#sample-name')).toHaveValue('क्');
  await expect(field).toHaveValue('क क्र् क्');
  await page.keyboard.type(' k');
  await expect(field).toHaveValue('क क्र् क् क');
  await page.locator('#mode-button').click();
  await page.keyboard.type(' k` kr');
  await expect(field).toHaveValue('क क्र् क् क k` kr');
  await page.locator('#consonant-select').selectOption('half');
  await page.keyboard.type(' k`');
  await expect(field).toHaveValue('क क्र् क् क k` kr k`');
});

test('real keyboard preserves the ra-ya joiner, Shift sounds, bindu and chandrabindu', async ({ page }) => {
  const field = await demo(page);
  await page.keyboard.type('paryo');
  await expect(field).toHaveValue('पर्\u200dयो');
  await clearDemo(page);
  await page.keyboard.type('ta ');
  await page.keyboard.press('Shift+KeyT');
  await page.keyboard.type('a');
  await expect(field).toHaveValue('त ट');
  await clearDemo(page);
  await page.keyboard.type('ka^ kaa~');
  await expect(field).toHaveValue('कं काँ');
});

test('addresses remain literal at every intermediate key after the first recognition cue', async ({ page }) => {
  const field = await demo(page);
  for (const [cue, suffix] of [
    ['camera@', 'sub-domain.example.com'],
    ['https:', '//User:pass@example.com/camera?q=ka^|b'],
    ['www.', 'camera.com'],
    ['camera.c', 'om'],
  ]) {
    await test.step(cue, async () => {
      await clearDemo(page);
      await page.keyboard.type(cue);
      await expect(field).toHaveValue(cue);
      let literal = cue;
      for (const key of suffix) {
        await page.keyboard.type(key);
        literal += key;
        await expect(field).toHaveValue(literal);
      }
    });
  }
});

test('periods stay ordinary until a domain cue, and cue deletion supports undo and redo', async ({ page }) => {
  const field = await demo(page);
  await page.keyboard.type('camera.');
  await expect(field).toHaveValue('क्यामेरा.');
  await page.keyboard.type('c');
  await expect(field).toHaveValue('camera.c');
  await page.keyboard.press('Backspace');
  await expect(field).toHaveValue('क्यामेरा.');
  await page.keyboard.press('Control+z');
  await expect(field).toHaveValue('camera.c');
  await page.keyboard.press('Control+Shift+z');
  await expect(field).toHaveValue('क्यामेरा.');
  await clearDemo(page);
  await page.keyboard.type('camera@');
  await page.keyboard.press('Backspace');
  await expect(field).toHaveValue('क्यामेरा');
  await page.keyboard.press('Control+z');
  await expect(field).toHaveValue('camera@');
});

test('the candidate dropdown and Alt shortcut preserve a selected reading through later edits', async ({ page }) => {
  const field = await demo(page);
  await page.keyboard.type('kam');
  await expect(field).toHaveValue('कम');
  await expect(page.locator('#candidate-panel')).toBeVisible();
  await expect(page.locator('#candidate-select option')).toHaveText(['कम', 'काम']);
  await page.locator('#candidate-select').selectOption('1');
  await expect(field).toHaveValue('काम');
  await page.keyboard.type('. camera.com');
  await expect(field).toHaveValue('काम. camera.com');
  await page.keyboard.press('Control+z');
  await expect(field).toHaveValue('काम. camera.co');
  await page.keyboard.press('Control+Shift+z');
  await expect(field).toHaveValue('काम. camera.com');
  await clearDemo(page);
  await page.keyboard.type('kam');
  await page.keyboard.press('Alt+2');
  await expect(field).toHaveValue('काम');
});

test('real keyboard edits an email at its caret and replaces a selected Nepali word', async ({ page }) => {
  const field = await demo(page);
  await page.keyboard.type('user@exmple.com');
  await field.evaluate(element => element.setSelectionRange(7, 7));
  await page.keyboard.type('a');
  await expect(field).toHaveValue('user@example.com');
  await expect.poll(() => field.evaluate(element => element.selectionStart)).toBe(8);
  await page.keyboard.press('Backspace');
  await expect(field).toHaveValue('user@exmple.com');
  await expect.poll(() => field.evaluate(element => element.selectionStart)).toBe(7);
  await clearDemo(page);
  await page.keyboard.type('namaste pani');
  await expect(field).toHaveValue('नमस्ते पनि');
  await field.evaluate(element => element.setSelectionRange(0, 'नमस्ते'.length));
  await page.keyboard.type('camera');
  await expect(field).toHaveValue('क्यामेरा पनि');
});

test('real keyboard separates URL punctuation neighbors and preserves decimals and query pipes', async ({ page }) => {
  const field = await demo(page);
  await page.keyboard.type('(https://camera.com),pani| https://camera.com!pani|');
  await expect(field).toHaveValue('(https://camera.com),पनि। https://camera.com!पनि।');
  await clearDemo(page);
  await page.keyboard.type('pani. camera. 3.14| https://camera.com?q=ka^|b');
  await expect(field).toHaveValue('पनि. क्यामेरा. ३.१४। https://camera.com?q=ka^|b');
});

test('demo manager covers textarea, text and search while retaining English and email exclusions', async ({ page }) => {
  const field = await demo(page);
  for (const [selector, source, expected] of [
    ['#typing-field', 'namaste', 'नमस्ते'],
    ['#sample-name', 'pani', 'पनि'],
    ['#sample-search', 'camera', 'क्यामेरा'],
    ['#sample-mixed', 'namaste camera.com', 'नमस्ते camera.com'],
    ['#sample-english', 'camera and GitHub|', 'camera and GitHub|'],
    ['#sample-email', 'User+tag@example.com', 'User+tag@example.com'],
  ]) {
    await page.locator(selector).focus();
    await page.keyboard.type(source);
    await expect(page.locator(selector)).toHaveValue(expected);
  }
  await page.locator('#mode-button').click();
  await expect(page.locator('#mode-button')).toHaveText('English mode');
  await page.keyboard.type(' camera and GitHub|');
  await expect(field).toHaveValue('नमस्ते camera and GitHub|');
  await page.locator('#sample-name').focus();
  await page.keyboard.type(' camera');
  await expect(page.locator('#sample-name')).toHaveValue('पनि camera');
  await page.locator('#mode-button').click();
  await expect(page.locator('#mode-button')).toHaveText('Nepali mode');
  await page.locator('#sample-search').focus();
  await page.keyboard.type(' pani');
  await expect(page.locator('#sample-search')).toHaveValue('क्यामेरा पनि');
});

test('real MutationObserver attaches dynamic fields, detaches exclusions and removals, and stops after destroy', async ({ page }) => {
  await fixture(page);
  await page.evaluate(() => window.browserFixture.addMarkedField('dynamic-field'));
  await expect.poll(() => page.evaluate(() => Boolean(window.browserFixture.manager.getController(
    document.querySelector('#dynamic-field'))))).toBe(true);
  const field = page.locator('#dynamic-field');
  await field.focus();
  await page.keyboard.type('pani');
  await expect(field).toHaveValue('पनि');
  await field.evaluate(element => element.setAttribute('data-sahajlipi-ignore', ''));
  await expect.poll(() => page.evaluate(() => window.browserFixture.manager.getController(
    document.querySelector('#dynamic-field')) === null)).toBe(true);
  await page.keyboard.type(' camera');
  await expect(field).toHaveValue('पनि camera');
  await field.evaluate(element => element.removeAttribute('data-sahajlipi-ignore'));
  await expect.poll(() => page.evaluate(() => Boolean(window.browserFixture.manager.getController(
    document.querySelector('#dynamic-field'))))).toBe(true);
  await page.evaluate(() => {
    window.browserFixture.detachedField = document.querySelector('#dynamic-field');
    window.browserFixture.detachedField.remove();
  });
  await expect.poll(() => page.evaluate(() => window.browserFixture.manager.getController(
    window.browserFixture.detachedField) === null)).toBe(true);
  await page.evaluate(() => {
    const detached = window.browserFixture.detachedField;
    document.querySelector('#managed-root').append(detached);
  });
  await expect.poll(() => page.evaluate(() => Boolean(window.browserFixture.manager.getController(
    document.querySelector('#dynamic-field'))))).toBe(true);
  await page.evaluate(() => window.browserFixture.manager.destroy());
  await field.focus();
  await page.keyboard.type(' pani');
  await expect(field).toHaveValue('पनि camera pani');
  await page.evaluate(() => window.browserFixture.addMarkedField('after-destroy'));
  await page.locator('#after-destroy').focus();
  await page.keyboard.type('pani');
  await expect(page.locator('#after-destroy')).toHaveValue('pani');
  await expect.poll(() => page.evaluate(() => window.browserFixture.manager.getController(
    document.querySelector('#after-destroy')) === null)).toBe(true);
});

test('synthetic clipboard paste restores an address prefix and emits converted input to host listeners', async ({ page }) => {
  const field = await fixture(page);
  await page.keyboard.type('camera');
  await expect(field).toHaveValue('क्यामेरा');
  await page.evaluate(() => { window.browserFixture.inputValues.length = 0; });
  await pasteText(field, '.com');
  await expect(field).toHaveValue('camera.com');
  await expect.poll(() => page.evaluate(() => window.browserFixture.inputValues)).toEqual(['camera.com']);
  await page.keyboard.type('/camera?q=a|b');
  await expect(field).toHaveValue('camera.com/camera?q=a|b');
  await page.evaluate(() => window.browserFixture.controller.setText(''));
  await pasteText(field, 'namaste user@example.com|');
  await expect(field).toHaveValue('नमस्ते user@example.com।');
  await expect.poll(() => page.evaluate(() => window.browserFixture.inputValues.at(-1)))
    .toBe('नमस्ते user@example.com।');
});

test('synthetic composition reconciles a final input after compositionend and undoes the composition together', async ({ page }) => {
  const field = await fixture(page);
  await page.keyboard.type('camera.');
  await expect(field).toHaveValue('क्यामेरा.');
  // Event-sequence coverage in desktop engines; this is not a real IME test.
  await field.evaluate(element => {
    element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    element.setRangeText('com', element.selectionStart, element.selectionEnd, 'end');
    element.dispatchEvent(new InputEvent('input', {
      inputType: 'insertCompositionText', data: 'com', isComposing: true, bubbles: true,
    }));
    element.dispatchEvent(new CompositionEvent('compositionend', { data: 'com', bubbles: true }));
    element.dispatchEvent(new InputEvent('input', {
      inputType: 'insertCompositionText', data: 'com', bubbles: true,
    }));
  });
  await expect(field).toHaveValue('camera.com');
  await expect.poll(() => page.evaluate(() => window.browserFixture.inputValues.at(-1))).toBe('camera.com');
  await page.keyboard.press('Control+z');
  await expect(field).toHaveValue('क्यामेरा.');
});

test('synthetic native input fallback handles an active vowel and a mixed-text paste without beforeinput', async ({ page }) => {
  const field = await fixture(page);
  await page.keyboard.type('k');
  await field.evaluate(element => {
    element.setRangeText('a', element.selectionStart, element.selectionEnd, 'end');
    element.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: 'a', bubbles: true }));
  });
  await expect(field).toHaveValue('क');
  await expect.poll(() => page.evaluate(() => window.browserFixture.inputValues.at(-1))).toBe('क');
  await page.keyboard.press('Control+z');
  await expect(field).toHaveValue('क');
  await page.evaluate(() => window.browserFixture.controller.setText(''));
  await field.evaluate(element => {
    const source = 'namaste camera.com user@example.com|';
    element.setRangeText(source, 0, 0, 'end');
    element.dispatchEvent(new InputEvent('input', {
      inputType: 'insertFromPaste', data: source, bubbles: true,
    }));
  });
  await expect(field).toHaveValue('नमस्ते camera.com user@example.com।');
  await expect.poll(() => page.evaluate(() => window.browserFixture.inputValues.at(-1)))
    .toBe('नमस्ते camera.com user@example.com।');
});

test('real keyboard uses Nepali digits, keeps decimal separators and restores numeric address prefixes', async ({ page }) => {
  const field = await demo(page);
  await page.keyboard.type('0123456789 3.14| September 27, 2026');
  await expect(field).toHaveValue('०१२३४५६७८९ ३.१४। सेप्टेम्बर २७, २०२६');
  await clearDemo(page);
  await page.keyboard.type('123');
  await expect(field).toHaveValue('१२३');
  await expect.poll(() => field.evaluate(element => element.selectionStart)).toBe(3);
  await page.keyboard.press('Backspace');
  await expect(field).toHaveValue('१२');
  await page.keyboard.press('Control+z');
  await expect(field).toHaveValue('१२३');
  await page.keyboard.type('@');
  await expect(field).toHaveValue('123@');
  await page.keyboard.press('Backspace');
  await expect(field).toHaveValue('१२३');
  await page.keyboard.press('Control+z');
  await expect(field).toHaveValue('123@');
  await page.keyboard.type('example.com https://127.0.0.1:8080/456?q=7');
  await expect(field).toHaveValue('123@example.com https://127.0.0.1:8080/456?q=7');
});

test('digit configuration and English exclusions apply consistently to typing and synthetic paste', async ({ page }) => {
  const field = await fixture(page);
  await pasteText(field, 'pani 123 3.14| user123@example.com');
  await expect(field).toHaveValue('पनि १२३ ३.१४। user123@example.com');
  await page.locator('#latin-digits-field').focus();
  await page.keyboard.type('pani 123 3.14|');
  await expect(page.locator('#latin-digits-field')).toHaveValue('पनि 123 3.14।');
  await pasteText(page.locator('#latin-digits-field'), ' 456');
  await expect(page.locator('#latin-digits-field')).toHaveValue('पनि 123 3.14। 456');
  await page.locator('#ignored-field').focus();
  await page.keyboard.type('pani 123 3.14|');
  await expect(page.locator('#ignored-field')).toHaveValue('pani 123 3.14|');
  const demoField = await demo(page);
  await page.keyboard.type('123');
  await expect(demoField).toHaveValue('१२३');
  await page.locator('#mode-button').click();
  await page.keyboard.type(' 456');
  await expect(demoField).toHaveValue('१२३ 456');
});

test('real keyboard converts reviewed loanword suffixes and selects a spelling before an address cue', async ({ page }) => {
  const field = await demo(page);
  await page.keyboard.type('companyharumathi mediasanga.');
  await expect(field).toHaveValue('कम्पनीहरूमाथि मिडियासँग.');
  await clearDemo(page);
  await page.keyboard.type('schoolma');
  await expect(field).toHaveValue('स्कुलमा');
  await expect(page.locator('#candidate-select option')).toHaveText(['स्कुलमा', 'स्कूलमा']);
  await page.locator('#candidate-select').selectOption('1');
  await expect(field).toHaveValue('स्कूलमा');
  await page.keyboard.type('.c');
  await expect(field).toHaveValue('schoolma.c');
  await page.keyboard.press('Backspace');
  // Removing a technical cue resumes the preferred reading, as for existing words.
  await expect(field).toHaveValue('स्कुलमा.');
  await page.keyboard.press('Control+z');
  await expect(field).toHaveValue('schoolma.c');
});

test('loanword suffix editing preserves its Roman source and English mode keeps later input literal', async ({ page }) => {
  const field = await demo(page);
  await page.keyboard.type('companyharumathi');
  await expect(field).toHaveValue('कम्पनीहरूमाथि');
  for (let index = 0; index < 5; index++) await page.keyboard.press('Backspace');
  await expect(field).toHaveValue('कम्पनीहरू');
  await page.keyboard.type('mathi');
  await expect(field).toHaveValue('कम्पनीहरूमाथि');
  await page.locator('#mode-button').click();
  await page.keyboard.type(' schoolma mediasanga');
  await expect(field).toHaveValue('कम्पनीहरूमाथि schoolma mediasanga');
});


test('reviewed native word preferences retain Roman editing, undo and English mode', async ({ page }) => {
  const field = await demo(page);
  await page.keyboard.type('halyo nabhani gaunle dindaina|');
  await expect(field).toHaveValue('हाल्यो नभनी गाउँले दिँदैन।');
  await clearDemo(page);
  await page.keyboard.type('gaunle');
  await expect(field).toHaveValue('गाउँले');
  await page.keyboard.press('Backspace');
  await expect(field).toHaveValue('गौन्ल');
  await page.keyboard.type('e');
  await expect(field).toHaveValue('गाउँले');
  await page.keyboard.press('Control+z');
  await expect(field).toHaveValue('गौन्ल');
  await page.keyboard.press('Control+Shift+z');
  await expect(field).toHaveValue('गाउँले');
  await page.locator('#mode-button').click();
  await page.keyboard.type(' dindaina');
  await expect(field).toHaveValue('गाउँले dindaina');
});
