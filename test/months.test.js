import test from 'node:test';
import assert from 'node:assert/strict';
import { convertWord, convertText, createEngine } from '../src/index.js';

// Gregorian names in Unicode CLDR Nepali locale data; project typing preferences.
// Source/version and limitations: docs/package/month-names.md.
const months = [
  ['january', 'January', 'जनवरी'],
  ['february', 'February', 'फेब्रुअरी'],
  ['march', 'March', 'मार्च'],
  ['april', 'April', 'अप्रिल'],
  ['may', 'May', 'मे'],
  ['june', 'June', 'जुन'],
  ['july', 'July', 'जुलाई'],
  ['august', 'August', 'अगस्ट'],
  ['september', 'September', 'सेप्टेम्बर'],
  ['october', 'October', 'अक्टोबर'],
  ['november', 'November', 'नोभेम्बर'],
  ['december', 'December', 'डिसेम्बर'],
];

for (const [lowercase, titleCase, expected] of months) {
  test(`${titleCase} is written as its Gregorian Nepali name in either normal capitalization`, () => {
    const conversion = { text: expected, candidates: [expected], ambiguous: false };
    assert.deepEqual(convertWord(lowercase), conversion);
    assert.deepEqual(convertWord(titleCase), conversion);
    assert.equal(convertText(`${titleCase}, ${lowercase}`), `${expected}, ${expected}`);
  });
}

test('month names preserve Gregorian numbers and separators without converting calendars', () => {
  assert.equal(convertText('September 27, 2026; December 31. January 1|'),
    'सेप्टेम्बर 27, 2026; डिसेम्बर 31. जनवरी 1।');
  assert.equal(convertText('may maya march'), 'मे माया मार्च');
});

test('month title aliases inherit instance overrides without changing the default engine', () => {
  const custom = createEngine({ entries: { september: ['विशेष', 'विकल्प'], december: ['अर्को'] } });
  assert.deepEqual(custom.convertWord('September'), {
    text: 'विशेष', candidates: ['विशेष', 'विकल्प'], ambiguous: true,
  });
  assert.equal(custom.convertWord('December').text, 'अर्को');
  assert.equal(custom.convertText('September december'), 'विशेष अर्को');
  assert.equal(convertWord('September').text, 'सेप्टेम्बर');
  assert.equal(convertWord('December').text, 'डिसेम्बर');
});

test('explicit title-case month overrides win regardless of lowercase entry order', () => {
  const custom = createEngine({ entries: {
    September: ['चयन'], september: ['विशेष'], december: ['अर्को'], December: ['मिति'],
  } });
  assert.equal(custom.convertWord('September').text, 'चयन');
  assert.equal(custom.convertWord('september').text, 'विशेष');
  assert.equal(custom.convertWord('December').text, 'मिति');
  assert.equal(custom.convertWord('december').text, 'अर्को');
});

test('explicit month titles leave other shifted spellings and partial keys unchanged', () => {
  const unchanged = [
    ['Sa', 'ष'], ['Da', 'ड'], ['School', 'ष्चूल्'], ['Doctor', 'डोच्तोर्'],
    ['sepTember', 'सेप्टेम्बेर्'], ['decembeR', 'देचेम्बेऋ'],
    ['jan', 'जन्'], ['sept', 'सेप्त्'], ['septemberma', 'सेप्तेम्बेर्म'],
  ];
  for (const [roman, expected] of unchanged) {
    assert.deepEqual(convertWord(roman), { text: expected, candidates: [expected], ambiguous: false });
  }
});
