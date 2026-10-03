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

test('company converts as a Nepali loanword while a domain stays literal', () => {
  assert.deepEqual(convertWord('company'), {
    text: 'कम्पनी', candidates: ['कम्पनी'], ambiguous: false,
  });
  assert.equal(convertWord('Company').text, 'कम्पनी');
  assert.equal(convertWord('COMPANY').text, 'कम्पनी');
  assert.equal(convertText('company company.com company@example.com'), 'कम्पनी company.com company@example.com');
});

// Source-assisted follow-up entries from the previously published research queue.
const sourceAssistedQueue = [
  ['bus', 'बस'],
  ['cricket', 'क्रिकेट'],
  ['football', 'फुटबल'],
  ['hotel', 'होटल'],
  ['keyboard', 'किबोर्ड'],
  ['laptop', 'ल्यापटप'],
  ['microphone', 'माइक्रोफोन'],
  ['office', 'अफिस'],
  ['password', 'पासवर्ड'],
  ['restaurant', 'रेस्टुरेन्ट'],
  ['ticket', 'टिकट'],
  ['wifi', 'वाइफाइ'],
];

for (const [roman, expected] of sourceAssistedQueue) {
  test(`${roman} uses its source-assisted loanword spelling as a complete key`, () => {
    assert.equal(convertWord(roman).text, expected);
    assert.equal(convertText(`${roman}.`), `${expected}.`);
  });
}

// Further exact-word preferences backed by dated institutional attestations.
const newAttestedWords = [
  ['ambulance', 'एम्बुलेन्स'],
  ['battery', 'ब्याट्री'],
  ['car', 'कार'],
  ['carpet', 'कार्पेट'],
  ['connector', 'कनेक्टर'],
  ['courier', 'कुरियर'],
  ['digital', 'डिजिटल'],
  ['drone', 'ड्रोन'],
  ['furniture', 'फर्निचर'],
  ['inverter', 'इन्भर्टर'],
  ['motorcycle', 'मोटरसाइकल'],
  ['radio', 'रेडियो'],
  ['router', 'राउटर'],
  ['sofa', 'सोफा'],
  ['telephone', 'टेलिफोन'],
  ['van', 'भ्यान'],
  ['website', 'वेबसाइट'],
];

for (const [roman, expected] of newAttestedWords) {
  test(`${roman} converts to its source-attested exact-word preference`, () => {
    assert.equal(convertWord(roman).text, expected);
    assert.equal(convertText(`${roman}.`), `${expected}.`);
  });
}

for (const [roman, expected] of loanwords) {
  test(`${roman} converts directly to its listed Nepali loanword spelling`, () => {
    assert.deepEqual(convertWord(roman), {
      text: expected,
      candidates: roman === 'school' ? ['स्कुल', 'स्कूल'] : [expected],
      ambiguous: roman === 'school',
    });
    assert.equal(convertText(`${roman}.`), `${expected}.`);
  });
}

test('loanwords coexist with Nepali vowels, half sounds and explicit punctuation', () => {
  assert.equal(convertText('camera pani paani k ka ch chh cha chha| 3.14'),
    'क्यामेरा पनि पानी क क च छ च छ। ३.१४');
});

test('loanword lookup ignores incidental capitals while preserving reserved Shift sounds', () => {
  assert.equal(convertWord('Camera').text, 'क्यामेरा');
  assert.equal(convertWord('Computer').text, 'कम्प्युटर');
  const shifted = [
    ['CAMERA', 'चमेऋअ'],
    ['COMPUTER', 'चोम्पुटेऋ'],
    ['Doctor', 'डोच्तोर'],
    ['School', 'ष्चूल'],
  ];
  for (const [roman, expected] of shifted) {
    assert.deepEqual(convertWord(roman), { text: expected, candidates: [expected], ambiguous: false });
  }
});

test('loanword aliases do not infer unsupported endings or short English readings', () => {
  const unchanged = [
    ['cameraa', 'चमेरा'],
    ['camerakoala', 'चमेरकोअल'],
    ['schoolmaharu', 'स्चूल्महरु'],
    ['phail', 'फैल'],
    ['fail', 'फैल'],
    ['pan', 'पन'],
    ['can', 'चन'],
    ['fan', 'फन'],
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
