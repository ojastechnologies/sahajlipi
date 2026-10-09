import test from 'node:test';
import assert from 'node:assert/strict';
import { convertWord, convertText, createEngine } from '../src/index.js';

// Literal outputs frozen in the October 1 source-assisted development review.
// These exact preferences do not infer a general vowel or nasal rewrite.
const entries = [
  ['imandar', ['इमान्दार']],
  ['sarasar', ['सरासर']],
  ['sakos', ['सकोस्']],
  ['kathanak', ['कथानक']],
  ['arambha', ['आरम्भ']],
  ['ekadhik', ['एकाधिक']],
  ['jaghanya', ['जघन्य']],
  ['pukar', ['पुकार']],
  ['niskanda', ['निस्कँदा']],
  ['bora', ['बोरा']],
  ['utthan', ['उत्थान']],
  ['samanjasya', ['सामञ्जस्य']],
  ['bhagna', ['भग्न', 'भाग्न']],
];

for (const [input, candidates] of entries) {
  test('reviewed spelling and listed readings: ' + input, () => {
    assert.deepEqual(convertWord(input), {
      text: candidates[0], candidates, ambiguous: candidates.length > 1,
    });
  });
}

test('reviewed spellings work beside literal addresses, digits and punctuation', () => {
  assert.equal(convertText('imandar niskanda sakos bhagna. user123@example.com https://example.com/pukar 123|'),
    'इमान्दार निस्कँदा सकोस् भग्न. user123@example.com https://example.com/pukar १२३।');
});

test('exact spelling preferences retain final virama and alternatives in both consonant modes', () => {
  for (const consonantMode of ['full', 'half']) {
    const engine = createEngine({ consonantMode });
    assert.equal(engine.convertWord('sakos').text, 'सकोस्');
    assert.deepEqual(engine.convertWord('bhagna').candidates, ['भग्न', 'भाग्न']);
    assert.equal(engine.convertText('niskanda sakos '), 'निस्कँदा सकोस् ');
  }
});

test('custom exact readings replace the new preferences without changing other engines', () => {
  const custom = createEngine({ entries: { niskanda: ['निष्कन्द'], bhagna: ['भाग्न', 'भग्न'] } });
  assert.equal(custom.convertWord('niskanda').text, 'निष्कन्द');
  assert.deepEqual(custom.convertWord('bhagna').candidates, ['भाग्न', 'भग्न']);
  assert.equal(convertWord('niskanda').text, 'निस्कँदा');
  assert.deepEqual(convertWord('bhagna').candidates, ['भग्न', 'भाग्न']);
});

test('incidental capitals inherit preferences while reserved Shift sounds remain explicit', () => {
  assert.equal(convertWord('Imandar').text, 'इमान्दार');
  assert.equal(convertWord('Kathanak').text, 'कथानक');
  assert.deepEqual(convertWord('Bhagna').candidates, ['भग्न', 'भाग्न']);
  for (const [input, expected] of [
    ['Sarasar', 'षरसर'], ['Sakos', 'षकोस'], ['Samanjasya', 'षमन्जस्य'],
    ['niSkanda', 'निष्कन्द'], ['kaThanak', 'कठनक'], ['imanDar', 'इमन्डर'],
  ]) assert.equal(convertWord(input).text, expected);
});

test('native preferences match whole keys without inferring attached suffixes', () => {
  for (const [input, expected] of [
    ['niskandako', 'निस्कन्दको'], ['borako', 'बोरको'], ['bhagnako', 'भग्नको'],
  ]) assert.deepEqual(convertWord(input), { text: expected, candidates: [expected], ambiguous: false });
});
