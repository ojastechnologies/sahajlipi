import test from 'node:test';
import assert from 'node:assert/strict';
import { attachNepaliInput } from '../src/dom.js';
import { createEngine } from '../src/index.js';

class Field extends EventTarget {
  tagName = 'TEXTAREA';
  value = '';
  selectionStart = 0;
  selectionEnd = 0;
  ownerDocument = new EventTarget();
  setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
  setRangeText(text, start, end) {
    this.value = this.value.slice(0, start) + text + this.value.slice(end);
    this.setSelectionRange(start + text.length, start + text.length);
  }
  focus() { this.ownerDocument.activeElement = this; }
}
function setup(t, engine) {
  const field = new Field();
  field.focus();
  const controller = attachNepaliInput(field, engine);
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

test('default digit typing remains editable with caret, Backspace, undo and redo', t => {
  const { field, controller, type, insert } = setup(t);
  type('123');
  assert.equal(field.value, '१२३');
  assert.equal(field.selectionStart, 3);
  insert('deleteContentBackward');
  assert.equal(field.value, '१२');
  assert.equal(field.selectionStart, 2);
  controller.undo();
  assert.equal(field.value, '१२३');
  controller.redo();
  assert.equal(field.value, '१२');
  type('.5| 3/4 10:30');
  assert.equal(field.value, '१२.५। ३/४ १०:३०');
});

test('address cues restore numeric source and deleting the cue resumes Nepali digits', t => {
  const { field, controller, type, insert } = setup(t);
  type('123');
  assert.equal(field.value, '१२३');
  type('@');
  assert.equal(field.value, '123@');
  insert('deleteContentBackward');
  assert.equal(field.value, '१२३');
  controller.undo();
  assert.equal(field.value, '123@');
  type('example.com/');
  assert.equal(field.value, '123@example.com/');
  controller.setText('');
  type('123.');
  assert.equal(field.value, '१२३.');
  type('example.com:8080/456?q=7');
  assert.equal(field.value, '123.example.com:8080/456?q=7');
});

test('Latin digit engines still convert Nepali words while English mode leaves all subsequent input literal', t => {
  const { field, controller, type, paste } = setup(t, createEngine({ digits: 'latin' }));
  type('namaste 123 3.14|');
  assert.equal(field.value, 'नमस्ते 123 3.14।');
  controller.setEnabled(false);
  paste(' pani 456|');
  assert.equal(field.value, 'नमस्ते 123 3.14। pani 456|');
  const defaultInput = setup(t);
  defaultInput.type('123');
  defaultInput.controller.setEnabled(false);
  defaultInput.type(' 456');
  assert.equal(defaultInput.field.value, '१२३ 456');
});

test('paste and native input use the same digits and protected-address policy', t => {
  const { field, controller, paste, native } = setup(t);
  paste('namaste 123 user123@example.com https://example.com:8080/456');
  assert.equal(field.value, 'नमस्ते १२३ user123@example.com https://example.com:8080/456');
  controller.setText('');
  native('3.14|', 'insertFromPaste');
  assert.equal(field.value, '३.१४।');
  controller.undo();
  assert.equal(field.value, '');
  native('1');
  native('2');
  assert.equal(field.value, '१२');
});

test('completed composition converts digits and preserves literal setText values', async t => {
  const { field, controller, native } = setup(t);
  field.dispatchEvent(new Event('compositionstart'));
  native('123');
  assert.equal(field.value, '123');
  field.dispatchEvent(new Event('compositionend'));
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(field.value, '१२३');
  controller.undo();
  assert.equal(field.value, '');
  controller.setText('123');
  assert.equal(field.value, '123');
});
