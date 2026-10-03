import test from 'node:test';
import assert from 'node:assert/strict';
import { convertWord, convertText, createEngine } from '../src/index.js';

// Frozen source-assisted project references; no inferred global vowel/nasal rule.
for (const [input, text] of [
  ['halyo', 'हाल्यो'], ['nabhani', 'नभनी'],
  ['gaunle', 'गाउँले'], ['dindaina', 'दिँदैन'],
]) test('reviewed native spelling: ' + input, () => {
  assert.deepEqual(convertWord(input), { text, candidates: [text], ambiguous: false });
});

test('reviewed native words convert beside addresses, digits and explicit sounds', () => {
  assert.equal(convertText('halyo nabhani gaunle dindaina pani paani. user123@example.com https://example.com/path T D S R|'),
    'हाल्यो नभनी गाउँले दिँदैन पनि पानी. user123@example.com https://example.com/path ट ड ष ऋ।');
});

test('native word preferences respect incidental capitals, reserved Shift and custom readings', () => {
  assert.equal(convertWord('Halyo').text, 'हाल्यो');
  assert.equal(convertWord('Dindaina').text, 'डिन्दैन');
  const custom = createEngine({ entries: { halyo: ['खसाल्यो', 'हाल्यो'] } });
  assert.deepEqual(custom.convertWord('halyo'), { text: 'खसाल्यो', candidates: ['खसाल्यो', 'हाल्यो'], ambiguous: true });
  assert.equal(convertWord('halyo').text, 'हाल्यो');
});

test('native aliases preserve explicit vowel lengths, nasal marks and half forms', () => {
  assert.equal(convertText('pani paani ha haa hi hii hu huu ka^ kaa~ ta Ta da Da k kr kra|'),
    'पनि पानी ह हा हि ही हु हू कं काँ त ट द ड क क्र क्र।');
});

test('new native entries do not infer suffixes or match longer Roman spellings', () => {
  for (const [input, expected] of [
    ['halyoko', 'हल्योको'], ['nabhaniko', 'नभनिको'],
    ['gaunleko', 'गौन्लेको'], ['dindainako', 'दिन्दैनको'],
  ]) assert.equal(convertWord(input).text, expected);
});
