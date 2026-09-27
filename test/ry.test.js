import test from 'node:test';
import assert from 'node:assert/strict';
import { convertWord, convertText, createEngine } from '../src/index.js';

// Source-assisted project preferences, not independently reviewed corpus labels.
// Sources and the spelling/key-convention limits are in docs/package/ry-review.md.
const joinerWords = [
  ['garyo', 'गर्\u200dयो'],
  ['maryo', 'मर्\u200dयो'],
  ['maaryo', 'मार्\u200dयो'],
  ['bharyo', 'भर्\u200dयो'],
  ['taryo', 'तर्\u200dयो'],
  ['saryo', 'सर्\u200dयो'],
  ['puryaunu', 'पुर्\u200dयाउनु'],
  ['puryaaunu', 'पुर्\u200dयाउनु'],
  ['bharyang', 'भर्\u200dयाङ'],
  ['bharyaanga', 'भर्\u200dयाङ'],
];

for (const [roman, expected] of joinerWords) {
  test(`${roman} returns its listed Nepali joiner form directly`, () => {
    assert.deepEqual(convertWord(roman), {
      text: expected,
      candidates: [expected],
      ambiguous: false,
    });
  });
}

test('ordinary ra-ya words keep their conjunct instead of receiving a joiner', () => {
  const ordinaryWords = [
    ['kaarya', 'कार्य'],
    ['suurya', 'सूर्य'],
    ['saundarya', 'सौन्दर्य'],
    ['aachaarya', 'आचार्य'],
    ['dhairya', 'धैर्य'],
    ['maurya', 'मौर्य'],
  ];
  for (const [roman, expected] of ordinaryWords) {
    assert.equal(convertWord(roman).text, expected, roman);
  }
});

test('text conversion preserves short and long vowels with joiners and punctuation', () => {
  assert.equal(convertText('maryo maaryo pani paani. 3.14| kaarya suurya'),
    'मर्\u200dयो मार्\u200dयो पनि पानी. ३.१४। कार्य सूर्य');
});

test('explicit joiners still work for a listed word and a long-vowel spelling', () => {
  assert.equal(convertWord('gar/=yo').text, 'गर्\u200dयो');
  assert.equal(convertWord('pur/=yaaunu').text, 'पुर्\u200dयाउनु');
});

test('word lookup respects incidental capitalization and Shift T', () => {
  assert.equal(convertWord('Garyo').text, 'गर्\u200dयो');
  assert.equal(convertWord('Taryo').text, 'टर्यो');
});

test('a custom entry can replace a built-in joiner preference in one engine', () => {
  const custom = createEngine({ entries: { garyo: ['गर्यो', 'गर्\u200dयो'] } });
  assert.deepEqual(custom.convertWord('garyo').candidates, ['गर्यो', 'गर्\u200dयो']);
  assert.equal(convertWord('garyo').text, 'गर्\u200dयो');
});

test('reserved Shift R and S are not lowered to a listed ry word', () => {
  assert.equal(convertWord('gaRyo').text, 'गऋयो');
  assert.equal(convertWord('Saryo').text, 'षर्यो');
});

test('reserved Shift H is not lowered to a listed word', () => {
  assert.equal(convertWord('baHini').text, 'बःइनि');
});

test('explicit custom Shift readings take precedence over phonetic conversion', () => {
  const custom = createEngine({ entries: { gaRyo: ['विशेष'], Saryo: ['अर्को'] } });
  assert.equal(custom.convertWord('gaRyo').text, 'विशेष');
  assert.equal(custom.convertWord('Saryo').text, 'अर्को');
});

test('legacy title-case aliases inherit customized lowercase readings', () => {
  const custom = createEngine({ entries: { ram: ['कस्टम', 'विकल्प'], sita: ['सीताजी'] } });
  assert.deepEqual(custom.convertWord('Ram').candidates, ['कस्टम', 'विकल्प']);
  assert.equal(custom.convertWord('Sita').text, 'सीताजी');
});

test('explicit normalized title-case overrides win independently of custom entry order', () => {
  const custom = createEngine({ entries: { RAM: ['व्यक्ति'], SIta: ['नाम'], ram: ['कस्टम'], sita: ['सीताजी'] } });
  assert.equal(custom.convertWord('Ram').text, 'व्यक्ति');
  assert.equal(custom.convertWord('Sita').text, 'नाम');
  assert.equal(custom.convertWord('ram').text, 'कस्टम');
  assert.equal(custom.convertWord('sita').text, 'सीताजी');
});
