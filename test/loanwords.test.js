import test from 'node:test';
import assert from 'node:assert/strict';
import { convertWord, convertText, createEngine } from '../src/index.js';

// Source-assisted project preferences authorized for implementation.
// These literals are documented in docs/package/loanword-review.md;
// they are not independently reviewed corpus labels.
const loanwords = [
  ['camera', 'क्यामेरा'],
  ['computer', 'कम्प्युटर'],
  ['mobile', 'मोबाइल'],
  ['phone', 'फोन'],
  ['charger', 'चार्जर'],
  ['printer', 'प्रिन्टर'],
  ['mouse', 'माउस'],
  ['internet', 'इन्टरनेट'],
  ['email', 'इमेल'],
  ['software', 'सफ्टवेयर'],
  ['scanner', 'स्क्यानर'],
  ['video', 'भिडियो'],
  ['taxi', 'ट्याक्सी'],
  ['bank', 'बैंक'],
  ['cheque', 'चेक'],
  ['file', 'फाइल'],
  ['school', 'स्कुल'],
  ['college', 'कलेज'],
  ['doctor', 'डाक्टर'],
  ['nurse', 'नर्स'],
];

for (const [roman, expected] of loanwords) {
  test(`${roman} converts directly to its listed Nepali loanword spelling`, () => {
    assert.deepEqual(convertWord(roman), {
      text: expected,
      candidates: [expected],
      ambiguous: false,
    });
    assert.equal(convertText(`${roman}.`), `${expected}.`);
  });
}

test('loanwords coexist with Nepali vowels, half sounds and explicit punctuation', () => {
  assert.equal(convertText('camera pani paani k ka ch chh cha chha| 3.14'),
    'क्यामेरा पनि पानी क् क च् छ् च छ। 3.14');
});

test('loanword lookup ignores incidental capitals while preserving reserved Shift sounds', () => {
  assert.equal(convertWord('Camera').text, 'क्यामेरा');
  assert.equal(convertWord('Computer').text, 'कम्प्युटर');
  const shifted = [
    ['CAMERA', 'चमेऋअ'],
    ['COMPUTER', 'चोम्पुटेऋ'],
    ['Doctor', 'डोच्तोर्'],
    ['School', 'ष्चूल्'],
  ];
  for (const [roman, expected] of shifted) {
    assert.deepEqual(convertWord(roman), { text: expected, candidates: [expected], ambiguous: false });
  }
});

test('loanword aliases do not match longer keys or invent short English readings', () => {
  const unchanged = [
    ['cameraa', 'चमेरा'],
    ['camerako', 'चमेरको'],
    ['schoolma', 'स्चूल्म'],
    ['phail', 'फैल्'],
    ['fail', 'फैल्'],
    ['pan', 'पन्'],
    ['can', 'चन्'],
    ['fan', 'फन्'],
  ];
  for (const [roman, expected] of unchanged) {
    assert.deepEqual(convertWord(roman), { text: expected, candidates: [expected], ambiguous: false });
  }
});

test('developers can replace loanword defaults with ordered alternatives or literal English', () => {
  const custom = createEngine({ entries: { camera: ['क्यामरा', 'क्यामेरा', 'क्यामरा'], file: ['file'] } });
  assert.deepEqual(custom.convertWord('Camera'), {
    text: 'क्यामरा', candidates: ['क्यामरा', 'क्यामेरा'], ambiguous: true,
  });
  assert.equal(custom.convertText('camera file'), 'क्यामरा file');
  assert.deepEqual(convertWord('camera'), { text: 'क्यामेरा', candidates: ['क्यामेरा'], ambiguous: false });
  assert.equal(convertWord('file').text, 'फाइल');
});

test('explicit marks compose with the preferred loanword spelling without changing Shift H', () => {
  assert.equal(convertWord('phone^').text, 'फोनं');
  assert.equal(convertWord('phone~').text, 'फोनँ');
  assert.equal(convertWord('phone/').text, 'फोन्');
  assert.equal(convertWord('phone/=').text, 'फोन्\u200d');
  assert.equal(convertWord('camera/').text, 'क्यामेरा/');
  assert.equal(convertWord('cameraH').text, 'चमेरः');
});
