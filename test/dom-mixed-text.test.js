import test from 'node:test';
import assert from 'node:assert/strict';
import { attachNepaliInput } from '../src/dom.js';
import { createEngine, convertText, convertWord } from '../src/index.js';

class Field extends EventTarget {
  tagName = 'TEXTAREA';
  value = '';
  selectionStart = 0;
  selectionEnd = 0;
  setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
  setRangeText(text, start, end) {
    this.value = this.value.slice(0, start) + text + this.value.slice(end);
    this.setSelectionRange(start + text.length, start + text.length);
  }
  focus() { this.ownerDocument.activeElement = this; }
}

function setup(t, engine) {
  const field = new Field();
  field.ownerDocument = new EventTarget();
  field.focus();
  const controller = attachNepaliInput(field, engine && {
    convertWord: engine.convertWord, convertText: engine.convertText,
  });
  t.after(() => controller.destroy());
  function insert(inputType, data = null) {
    const event = new Event('beforeinput', { cancelable: true });
    Object.defineProperties(event, { inputType: { value: inputType }, data: { value: data } });
    field.dispatchEvent(event);
    assert.equal(event.defaultPrevented, true);
  }
  function type(text) { for (const key of text) insert('insertText', key); }
  function native(text, inputType = 'insertText') {
    field.setRangeText(text, field.selectionStart, field.selectionEnd);
    const event = new Event('input');
    Object.defineProperty(event, 'inputType', { value: inputType });
    field.dispatchEvent(event);
  }
  function paste(text) {
    const event = new Event('paste', { cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    field.dispatchEvent(event);
    assert.equal(event.defaultPrevented, true);
  }
  return { field, controller, insert, type, native, paste };
}

test('typing a domain restores the earlier Roman spelling after recognition', (t) => {
  const { field, controller, type } = setup(t);
  type('camera.');
  assert.equal(field.value, 'क्यामेरा.');
  assert.equal(controller.getState().activeRoman, '');
  type('com| camera');
  assert.equal(field.value, 'camera.com। क्यामेरा');
  assert.equal(field.selectionStart, field.value.length);
  assert.equal(controller.getState().activeRoman, 'camera');
});

test('live email and URL typing preserve case, tags, paths and query punctuation', (t) => {
  const { field, controller, type } = setup(t);
  type('namaste User+tag@sub.example.com https://Example.com:8080/camera?q=a|b#Top ');
  assert.equal(field.value, 'नमस्ते User+tag@sub.example.com https://Example.com:8080/camera?q=a|b#Top ');
  assert.deepEqual(controller.getState().candidates, []);
});

test('sentence punctuation and words outside a domain remain convertible', (t) => {
  const { field, type } = setup(t);
  type('namaste(camera.com),pani| 3.14 par/=yo');
  assert.equal(field.value, 'नमस्ते(camera.com),पनि। 3.14 पर्‍यो');
});

test('a selected alternative survives punctuation and following technical text', (t) => {
  const { field, controller, type } = setup(t);
  type('kam');
  controller.chooseCandidate(1);
  type('. camera.com');
  assert.equal(field.value, 'काम. camera.com');
  assert.deepEqual(controller.getState().candidates, []);
  controller.undo();
  controller.redo();
  assert.equal(field.value, 'काम. camera.com');
});

test('recognition can supersede a selected candidate when it becomes a domain', (t) => {
  const { field, controller, type } = setup(t);
  type('kam');
  controller.chooseCandidate(1);
  type('.com');
  assert.equal(field.value, 'kam.com');
});

test('Backspace and undo restore the raw token across the first domain letter', (t) => {
  const { field, controller, type, insert } = setup(t);
  type('camera.');
  assert.equal(field.value, 'क्यामेरा.');
  type('c');
  assert.equal(field.value, 'camera.c');
  controller.undo();
  assert.equal(field.value, 'क्यामेरा.');
  controller.redo();
  assert.equal(field.value, 'camera.c');
  insert('deleteContentBackward');
  assert.equal(field.value, 'क्यामेरा.');
  type('com');
  assert.equal(field.value, 'camera.com');
});

test('pasting a suffix completes the buffered address and can be undone', (t) => {
  const { field, controller, type, paste } = setup(t);
  type('camera');
  paste('.com');
  assert.equal(field.value, 'camera.com');
  assert.equal(controller.getState().activeRoman, '');
  controller.undo();
  assert.equal(field.value, 'क्यामेरा');
  assert.equal(controller.getState().activeRoman, 'camera');
});

test('complete pasted addresses can be extended without converting their path', (t) => {
  const { field, controller, paste, type } = setup(t);
  paste('camera camera.com');
  assert.equal(field.value, 'क्यामेरा camera.com');
  assert.equal(controller.getState().activeRoman, '');
  type('/camera?q=a|b');
  assert.equal(field.value, 'क्यामेरा camera.com/camera?q=a|b');
});

test('editing inside an existing literal address preserves the address and caret', (t) => {
  const { field, controller, type, insert } = setup(t);
  controller.setText('user@exmple.com');
  field.setSelectionRange(7, 7);
  type('a');
  assert.equal(field.value, 'user@example.com');
  assert.equal(field.selectionStart, 8);
  insert('deleteContentBackward');
  assert.equal(field.value, 'user@exmple.com');
  assert.equal(field.selectionStart, 7);
});

test('selection replacement does not reuse a token from a different caret', (t) => {
  const { field, controller, type } = setup(t);
  type('camera.com pani');
  field.setSelectionRange(0, 10);
  type('nepal ');
  assert.equal(field.value, 'नेपाल  पनि');
  assert.equal(controller.getState().activeRoman, '');
});

test('native input fallback uses the same address recognition as intercepted typing', (t) => {
  const { field, controller, native } = setup(t);
  for (const key of 'camera.com user+tag@example.com|') native(key);
  assert.equal(field.value, 'camera.com user+tag@example.com।');
  assert.deepEqual(controller.getState().candidates, []);
});

test('native paste and multi-character insertion preserve mixed text', (t) => {
  const { field, controller, native } = setup(t);
  native('namaste camera.com user@example.com|', 'insertFromPaste');
  assert.equal(field.value, 'नमस्ते camera.com user@example.com।');
  assert.equal(controller.getState().activeRoman, '');
});

test('composition completes a partially typed address with one undo step', async (t) => {
  const { field, controller, type } = setup(t);
  type('camera.');
  field.dispatchEvent(new Event('compositionstart'));
  field.setRangeText('com', field.selectionStart, field.selectionEnd);
  field.dispatchEvent(new Event('compositionend'));
  field.dispatchEvent(new Event('input'));
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(field.value, 'camera.com');
  assert.deepEqual(controller.getState().candidates, []);
  controller.undo();
  assert.equal(field.value, 'क्यामेरा.');
});

test('mode changes keep an English fragment literal and forget prior recognition state', (t) => {
  const { field, controller, type, paste } = setup(t);
  type('namaste ');
  controller.setEnabled(false);
  paste('camera and GitHub|');
  controller.setEnabled(true);
  type(' camera');
  assert.equal(field.value, 'नमस्ते camera and GitHub| क्यामेरा');
});

test('a custom engine can opt out of address preservation in live typing', (t) => {
  const { field, type, paste } = setup(t, createEngine({ preserveTechnicalText: false }));
  type('camera.com ');
  paste('camera.com');
  assert.equal(field.value, 'क्यामेरा.चोम् क्यामेरा.चोम्');
});

test('unconverted Devanagari composition deletes a complete grapheme', async (t) => {
  const { field, native, insert } = setup(t);
  field.dispatchEvent(new Event('compositionstart'));
  native('कँ');
  field.dispatchEvent(new Event('compositionend'));
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(field.value, 'कँ');
  insert('deleteContentBackward');
  assert.equal(field.value, '');
});

test('paste uses the supplied whole-text converter rather than converting each word', (t) => {
  const engine = {
    convertWord: roman => ({ text: `WORD(${roman})`, candidates: [`WORD(${roman})`], ambiguous: false }),
    convertText: text => `TEXT(${text})`,
  };
  const { field, paste, native, controller } = setup(t, engine);
  paste('camera nepal');
  assert.equal(field.value, 'TEXT(camera nepal)');
  controller.setText('');
  native('camera nepal', 'insertFromPaste');
  assert.equal(field.value, 'TEXT(camera nepal)');
});

test('ordinary punctuation retains a custom word converter result', (t) => {
  const engine = {
    convertWord: roman => ({ text: `WORD(${roman})`, candidates: [`WORD(${roman})`], ambiguous: false }),
    convertText: text => `TEXT(${text})`,
  };
  const { field, type } = setup(t, engine);
  type('ab.');
  assert.equal(field.value, 'WORD(ab)TEXT(.)');
});

test('native repeated letters are recognized at the actual insertion caret', (t) => {
  const { field, controller, native } = setup(t);
  controller.setText('a');
  field.setSelectionRange(0, 0);
  native('a');
  assert.equal(field.value, 'अa');
  assert.equal(field.selectionStart, 1);
  assert.equal(controller.getState().activeRoman, 'a');
});

test('custom whole-text conversion is used for multi-word typing and composition', async (t) => {
  const engine = {
    convertWord: roman => ({ text: `WORD(${roman})`, candidates: [`WORD(${roman})`], ambiguous: false }),
    convertText: text => `TEXT(${text})`,
  };
  const { field, controller, insert, native } = setup(t, engine);
  insert('insertText', 'camera nepal');
  assert.equal(field.value, 'TEXT(camera nepal)');
  controller.setText('');
  field.dispatchEvent(new Event('compositionstart'));
  native('camera nepal');
  field.dispatchEvent(new Event('compositionend'));
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(field.value, 'TEXT(camera nepal)');
});

test('typed whitespace still passes through a supplied text converter', (t) => {
  const engine = { convertWord, convertText: text => convertText(text).replaceAll(' ', '_') };
  const { field, type } = setup(t, engine);
  type('pani nepal');
  assert.equal(field.value, 'पनि_नेपाल');
});

test('a complete pasted address does not absorb the previous chosen word', (t) => {
  const { field, controller, type, paste, native } = setup(t);
  type('kam');
  controller.chooseCandidate(1);
  paste('camera.com');
  assert.equal(field.value, 'कामcamera.com');
  controller.setText('');
  type('kam');
  controller.chooseCandidate(1);
  native('camera.com', 'insertFromPaste');
  assert.equal(field.value, 'कामcamera.com');
});

test('an email stays literal from the at-sign through each unfinished host character', (t) => {
  const { field, controller, type } = setup(t);
  type('camera');
  assert.equal(field.value, 'क्यामेरा');
  let roman = 'camera@';
  type('@');
  assert.equal(field.value, roman);
  for (const key of 'sub-domain.example.com') {
    type(key);
    roman += key;
    assert.equal(field.value, roman, 'unfinished email ' + roman);
    assert.equal(field.selectionStart, roman.length);
    assert.equal(controller.getState().activeRoman, '');
  }
});

test('explicit URL prefixes stay literal while the scheme and authority are unfinished', (t) => {
  const { field, controller, type } = setup(t);
  for (const scheme of ['http', 'https']) {
    controller.setText('');
    type(scheme + ':');
    let roman = scheme + ':';
    assert.equal(field.value, roman);
    for (const key of '//User:pass@example.com/a?q=ka^|b') {
      type(key);
      roman += key;
      assert.equal(field.value, roman, 'unfinished URL ' + roman);
      assert.deepEqual(controller.getState().candidates, []);
    }
  }
});

test('www prefix and the first domain letter restore text before a complete suffix', (t) => {
  const { field, controller, type } = setup(t);
  type('www.');
  assert.equal(field.value, 'www.');
  let roman = 'www.';
  for (const key of 'camera.com') {
    type(key);
    roman += key;
    assert.equal(field.value, roman);
  }
  controller.setText('');
  type('camera.c');
  assert.equal(field.value, 'camera.c');
  assert.equal(controller.getState().activeRoman, '');
});

test('Backspace across an email cue restores Nepali and undo restores the literal prefix', (t) => {
  const { field, controller, type, insert } = setup(t);
  type('camera@');
  assert.equal(field.value, 'camera@');
  insert('deleteContentBackward');
  assert.equal(field.value, 'क्यामेरा');
  assert.equal(controller.getState().activeRoman, 'camera');
  controller.undo();
  assert.equal(field.value, 'camera@');
  type('e');
  assert.equal(field.value, 'camera@e');
});

test('native input, paste, and composition preserve unfinished email prefixes', async (t) => {
  const { field, controller, native, paste, type } = setup(t);
  for (const key of 'camera@e') native(key);
  assert.equal(field.value, 'camera@e');
  controller.setText('');
  paste('camera@');
  assert.equal(field.value, 'camera@');
  type('e');
  assert.equal(field.value, 'camera@e');
  controller.setText('');
  type('camera');
  field.dispatchEvent(new Event('compositionstart'));
  native('@');
  field.dispatchEvent(new Event('compositionend'));
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(field.value, 'camera@');
});

test('earlier recognition keeps a sentence period and the engine opt-out intact', (t) => {
  const { field, controller, type } = setup(t);
  type('pani. camera. 3.14|');
  assert.equal(field.value, 'पनि. क्यामेरा. 3.14।');
  controller.setText('');
  const custom = setup(t, createEngine({ preserveTechnicalText: false }));
  custom.type('camera@ camera.c');
  assert.equal(custom.field.value, 'क्यामेरा@ क्यामेरा.च्');
});

test('an HTTP authority does not swallow adjacent sentence wrappers and Nepali words', (t) => {
  const { field, type } = setup(t);
  type('(https://camera.com),pani| https://camera.com!pani|');
  assert.equal(field.value, '(https://camera.com),पनि। https://camera.com!पनि।');
});
