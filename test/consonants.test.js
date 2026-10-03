import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngine, convertWord, convertText } from '../src/index.js';

test('bare and final fallback consonants are full while internal clusters remain automatic', () => {
  const cases = [
    ['k', 'क'], ['kh', 'ख'], ['ch', 'च'], ['chh', 'छ'],
    ['T', 'ट'], ['Dh', 'ढ'], ['S', 'ष'], ['kr', 'क्र'],
    ['kt', 'क्त'], ['ksh', 'क्ष'], ['gy', 'ज्ञ'], ['kir', 'किर'],
    ['ka', 'क'], ['ki', 'कि'], ['kra', 'क्र'], ['kri', 'क्रि'],
    ['kar', 'कर'], ['shakti', 'शक्ति'], ['k^', 'कं'], ['k~', 'कँ'],
  ];
  for (const [input, expected] of cases) {
    assert.equal(convertWord(input).text, expected, input);
  }
  assert.equal(convertText('k kr, kt!\nkh|k/'), 'क क्र, क्त!\nख।क्');
});

test('half mode preserves the previous phonetic fallback without changing dictionary preferences', () => {
  const strict = createEngine({ consonantMode: 'half' });
  const cases = [
    ['k', 'क्'], ['kh', 'ख्'], ['kr', 'क्र्'], ['kt', 'क्त्'],
    ['ksh', 'क्ष्'], ['kir', 'किर्'], ['ka', 'क'], ['kri', 'क्रि'],
    ['k^', 'क्ं'], ['k~', 'क्ँ'], ['kam', 'कम'], ['company', 'कम्पनी'],
    ['paryo', 'पर्\u200dयो'],
  ];
  for (const [input, expected] of cases) assert.equal(strict.convertWord(input).text, expected, input);
  assert.equal(strict.convertText('k kr. kt!\nkh|'), 'क् क्र्. क्त्!\nख्।');
  assert.deepEqual(strict.convertWord('kam').candidates, ['कम', 'काम']);
  assert.equal(convertWord('k').text, 'क');
});

test('the consonant mode is per engine and rejects unsupported values', () => {
  for (const value of [null, '', 'strict', true, 0, [], {}]) {
    assert.throws(() => createEngine({ consonantMode: value }), /consonantMode/);
  }
  assert.equal(createEngine({ consonantMode: undefined }).convertWord('k').text, 'क');
  assert.equal(createEngine({ consonantMode: 'full' }).convertWord('k').text, 'क');
  assert.equal(createEngine({ consonantMode: 'half' }).convertWord('k').text, 'क्');
});

test('backtick is an explicit halant alias in both modes and survives text boundaries', () => {
  const cases = [
    ['k`', 'क्'], ['ka`', 'क्'], ['kr`', 'क्र्'], ['th`', 'थ्'],
    ['k`ta', 'क्त'], ['k`i', 'क्इ'], ['k`^', 'क्ं'],
    ['phone`', 'फोन्'], ['k``', 'क्'], ['a`', 'अ`'], ['camera`', 'क्यामेरा`'],
  ];
  for (const consonantMode of ['full', 'half']) {
    const engine = createEngine({ consonantMode });
    for (const [input, expected] of cases) {
      assert.equal(engine.convertWord(input).text, expected, `${consonantMode}: ${input}`);
      assert.equal(engine.convertWord(input).text, engine.convertWord(input.replaceAll('`', '/')).text.replaceAll('/', '`'), input);
    }
    assert.equal(engine.convertText('k` kr`!\nphone`|3`4 a`'), 'क् क्र्!\nफोन्।३`४ अ`');
  }
});

test('backtick-equals retains the explicit joiner rule and a bare equals stays literal', () => {
  assert.equal(convertWord('par`=yo').text, 'पर्\u200dयो');
  assert.equal(convertText('par`=yo k`='), 'पर्\u200dयो क्\u200d');
  assert.equal(convertWord('k=').text, 'क=');
  assert.equal(createEngine({ consonantMode: 'half' }).convertWord('k=').text, 'क्=');
});

test('explicit marks honor segment preferences and exact custom marked entries', () => {
  const engine = createEngine({ entries: { kir: ['किर', 'कीर'], 'kir`': ['किर्', 'कीर्'] } });
  assert.deepEqual(engine.convertWord('kir`').candidates, ['किर्', 'कीर्']);
  assert.equal(convertWord('kam`').text, 'कम्');
  assert.equal(convertText('k` https://example.com/k` user@example.com'), 'क् https://example.com/k` user@example.com');
});
