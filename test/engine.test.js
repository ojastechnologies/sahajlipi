import test from 'node:test';
import assert from 'node:assert/strict';
import { convertWord, convertText, createEngine } from '../src/index.js';

test('converts common Roman Nepali words directly to Unicode', () => {
  const examples = {
    namaste: 'नमस्ते',
    nepal: 'नेपाल',
    nepali: 'नेपाली',
    hamro: 'हाम्रो',
    kathmandu: 'काठमाडौं',
  };

  for (const [roman, expected] of Object.entries(examples)) {
    assert.equal(convertWord(roman).text, expected, roman);
  }
});

test('uses phonetic rules for words outside the starter dictionary', () => {
  assert.equal(convertWord('ka').text, 'क');
  assert.equal(convertWord('kha').text, 'ख');
  assert.equal(convertWord('ki').text, 'कि');
  assert.equal(convertWord('kaa').text, 'का');
  assert.equal(convertWord('namaste').text, 'नमस्ते');
});

test('leaves fallback consonants half until an explicit vowel completes them', () => {
  assert.equal(convertWord('k').text, 'क्');
  assert.equal(convertWord('ka').text, 'क');
  assert.equal(convertWord('ki').text, 'कि');
  assert.equal(convertWord('kr').text, 'क्र्');
  assert.equal(convertWord('kra').text, 'क्र');
  assert.equal(convertWord('kt').text, 'क्त्');
  assert.equal(convertWord('kta').text, 'क्त');
  assert.equal(convertText('k ka kr kra'), 'क् क क्र् क्र');
});

test('types vocalic r with Shift R without changing the usual ri sound', () => {
  assert.equal(convertWord('ri').text, 'रि');
  assert.equal(convertWord('kri').text, 'क्रि');
  assert.equal(convertWord('R').text, 'ऋ');
  assert.equal(convertWord('kR').text, 'कृ');
  assert.equal(convertText('ri kri R kR'), 'रि क्रि ऋ कृ');
  assert.equal(convertWord('Ram').text, 'राम');
});

test('types retroflex sha with Shift S while lowercase sh stays unchanged', () => {
  assert.equal(convertWord('sha').text, 'श');
  assert.equal(convertWord('S').text, 'ष्');
  assert.equal(convertWord('Sa').text, 'ष');
  assert.equal(convertWord('Sha').text, 'ष');
  assert.equal(convertText('sha Sha'), 'श ष');
  assert.equal(convertWord('Sita').text, 'सीता');
});

test('types visarga with Shift H after a vowel and preserves ordinary colon punctuation', () => {
  assert.equal(convertWord('kaH').text, 'कः');
  assert.equal(convertWord('aH').text, 'अः');
  assert.equal(convertWord('AH').text, 'अः');
  assert.equal(convertWord('kAH').text, 'कः');
  assert.equal(convertWord('kAIH').text, 'कैः');
  assert.equal(convertWord('duHkha').text, 'दुःख');
  assert.equal(convertWord('ha').text, 'ह');
  assert.equal(convertWord('Hamro').text, 'हाम्रो');
  assert.equal(convertText('duHkha 3:14'), 'दुःख 3:14');
});

test('keeps short and long a distinct in pani and paani', () => {
  assert.deepEqual(convertWord('pani'), {
    text: 'पनि',
    candidates: ['पनि'],
    ambiguous: false,
  });
  assert.deepEqual(convertWord('paani'), {
    text: 'पानी',
    candidates: ['पानी'],
    ambiguous: false,
  });
  assert.equal(convertText('pani paani'), 'पनि पानी');
});

test('uses the explicit Nepali ra-ya shape for paryo', () => {
  assert.deepEqual(convertWord('paryo'), {
    text: 'पर्‍यो',
    candidates: ['पर्‍यो'],
    ambiguous: false,
  });
  assert.equal(convertText('paani paryo.'), 'पानी पर्‍यो.');
  assert.equal(convertText('paani paryo|'), 'पानी पर्‍यो।');
});

test('types bindu and chandrabindu with explicit phonetic shortcuts', () => {
  assert.equal(convertWord('ka^').text, 'कं');
  assert.equal(convertWord('kaa~').text, 'काँ');
  assert.equal(convertWord('a^').text, 'अं');
  assert.equal(convertWord('a~').text, 'अँ');
  assert.equal(convertText('ka^ kaa~ a^ a~'), 'कं काँ अं अँ');
  assert.equal(convertWord('n').text, 'न्');
  assert.equal(convertWord('m').text, 'म्');
  assert.deepEqual(convertWord('kam^').candidates, ['कमं']);
  const custom = createEngine({ entries: { 'kam^': ['कामं', 'कमं'] } });
  assert.deepEqual(custom.convertWord('kam^').candidates, ['कामं', 'कमं']);
});

test('makes conjuncts automatically and types an explicit halant with slash', () => {
  assert.equal(convertWord('shakti').text, 'शक्ति');
  assert.equal(convertWord('kr').text, 'क्र्');
  assert.equal(convertWord('k/').text, 'क्');
  assert.equal(convertWord('ka/').text, 'क्');
  assert.equal(convertWord('th/').text, 'थ्');
  assert.equal(convertWord('k/ta').text, 'क्त');
  assert.equal(convertText('k/ ka/ 3/4 a/'), 'क् क् 3/4 अ/');
});

test('forces a visible half form with slash-equals after the halant', () => {
  assert.equal(convertWord('par/=yo').text, 'पर्‍यो');
  assert.equal(convertText('par/=yo'), 'पर्‍यो');
  assert.equal(convertWord('k=').text, 'क्=');
});

test('types explicit danda with pipe, including after a decimal', () => {
  assert.equal(convertText('3.14|'), '3.14।');
  assert.equal(convertText('12| pani.'), '12। पनि.');
});

test('only marks a word ambiguous when it has distinct useful alternatives', () => {
  assert.deepEqual(convertWord('kam'), {
    text: 'कम',
    candidates: ['कम', 'काम'],
    ambiguous: true,
  });
  assert.equal(convertWord('kaam').text, 'काम');
  assert.deepEqual(convertWord('nepal'), {
    text: 'नेपाल',
    candidates: ['नेपाल'],
    ambiguous: false,
  });
});

test('preserves English periods and converts only pipe to Nepali full stop', () => {
  assert.equal(convertText('namaste, nepal!\nहामी'), 'नमस्ते, नेपाल!\nहामी');
  assert.equal(convertText('pani. 3.14 paani.'), 'पनि. 3.14 पानी.');
  assert.equal(convertText('pani| 3.14|'), 'पनि। 3.14।');
  assert.equal(convertText('३.१४।'), '३.१४।');
});

test('ignores incidental capitalization outside the explicit Shift keys', () => {
  assert.equal(convertWord('PANI').text, 'पनि');
  assert.deepEqual(convertWord(''), { text: '', candidates: [], ambiguous: false });
});

test('uses Shift T and D for retroflex sounds while lowercase stays dental', () => {
  assert.equal(convertWord('ta').text, 'त');
  assert.equal(convertWord('Ta').text, 'ट');
  assert.equal(convertWord('da').text, 'द');
  assert.equal(convertWord('Da').text, 'ड');
  assert.equal(convertWord('tha').text, 'थ');
  assert.equal(convertWord('Tha').text, 'ठ');
  assert.equal(convertWord('dha').text, 'ध');
  assert.equal(convertWord('Dha').text, 'ढ');
  assert.equal(convertText('ta da Ta Da'), 'त द ट ड');
  assert.equal(convertWord('Timi').text, 'टिमि');
  assert.equal(convertWord('Dai').text, 'डै');
});

test('custom entries can distinguish shifted T and D spellings', () => {
  const engine = createEngine({ entries: { dai: ['दाइ'], Dai: ['डाइ'] } });
  assert.equal(engine.convertWord('dai').text, 'दाइ');
  assert.equal(engine.convertWord('Dai').text, 'डाइ');
});

test('explicit shifted entries win over case-insensitive known-word lookup', () => {
  const engine = createEngine({ entries: { Ram: ['ऋअम्'], Sita: ['षीता'] } });
  assert.equal(engine.convertWord('Ram').text, 'ऋअम्');
  assert.equal(engine.convertWord('Sita').text, 'षीता');
  assert.equal(engine.convertWord('ram').text, 'राम');
  assert.equal(engine.convertWord('sita').text, 'सीता');
});

test('lets developers add or replace spellings without modifying the engine', () => {
  const engine = createEngine({ entries: { ojastech: ['ओजसटेक'], pani: ['पनि', 'पानी'] } });
  assert.equal(engine.convertWord('ojastech').text, 'ओजसटेक');
  assert.deepEqual(engine.convertWord('pani').candidates, ['पनि', 'पानी']);
  assert.equal(engine.convertText('ojastech pani'), 'ओजसटेक पनि');
  assert.equal(convertWord('pani').text, 'पनि');
});

test('rejects empty or malformed custom entries rather than returning undefined text', () => {
  assert.throws(() => createEngine({ entries: { name: [] } }), TypeError);
  assert.throws(() => createEngine({ entries: { name: [''] } }), TypeError);
  assert.throws(() => createEngine({ entries: { name: 'नाम' } }), TypeError);
});
