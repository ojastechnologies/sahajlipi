import test from 'node:test';
import assert from 'node:assert/strict';
import { convertWord, convertText, createEngine } from '../src/index.js';

// Literal readings from fresh source evidence; candidate order for the two
// distinct meanings follows the maintainer's explicit choice.
const entries = [
  ['futera', ['फुटेर']],
  ['shanta', ['शान्त', 'शान्ता']],
  ['mahila', ['महिला', 'माहिला']],
  ['astitwalai', ['अस्तित्वलाई']],
  ['vidhansabha', ['विधानसभा']],
  ['yasaprakar', ['यसप्रकार']],
  ['lepchaharu', ['लेप्चाहरू']],
  ['angrejharuko', ['अङ्ग्रेजहरूको', 'अंग्रेजहरूको']],
  ['adhyayama', ['अध्यायमा']],
  ['karyaharuma', ['कार्यहरूमा']],
  ['vedko', ['वेदको']],
  ['pairaheka', ['पाइरहेका']],
  ['afumathi', ['आफूमाथि']],
  ['sammanko', ['सम्मानको']],
  ['fulbariharu', ['फूलबारीहरू']],
  ['goretaharuma', ['गोरेटाहरूमा']],
  ['kendraharudwara', ['केन्द्रहरूद्वारा']],
  ['hospitaltarfa', ['हस्पिटलतर्फ']],
  ['manovaigyanikharule', ['मनोवैज्ञानिकहरूले']],
  ['vigyanle', ['विज्ञानले']],
  ['gabhnuparchha', ['गाभ्नुपर्छ']],
  ['fyankidinchhan', ['फ्याँकिदिन्छन्']],
  ['lakhetiraheka', ['लखेटिरहेका']],
  ['samhalnubhaeko', ['सम्हाल्नुभएको']],
  ['bolaunuparne', ['बोलाउनुपर्ने']],
  ['bhagidarko', ['भागीदारको']],
  ['sambhawanaharulai', ['सम्भावनाहरूलाई']],
  ['dushprawrittiharuko', ['दुष्प्रवृत्तिहरूको']],
  ['suktiharu', ['सूक्तिहरू']],
  ['asuraharuko', ['असुरहरूको']],
  ['aspatalbichko', ['अस्पतालबीचको']],
  ['bhaktiganyukta', ['भक्तिगानयुक्त']],
  ['purnakalinlai', ['पूर्णकालीनलाई']],
  ['lagalagi', ['लगालगी']],
];

for (const [input, candidates] of entries) {
  test('reviewed native whole-form preference: ' + input, () => {
    assert.deepEqual(convertWord(input), { text: candidates[0], candidates, ambiguous: candidates.length > 1 });
  });
}

test('native forms preserve literal addresses, digits and punctuation', () => {
  assert.equal(convertText('mahila shanta futera 123| user123@example.com https://example.com/vedko'),
    'महिला शान्त फुटेर १२३। user123@example.com https://example.com/vedko');
});

test('native exact forms retain explicit final halves and candidates in both modes', () => {
  for (const consonantMode of ['full', 'half']) {
    const engine = createEngine({ consonantMode });
    assert.equal(engine.convertWord('fyankidinchhan').text, 'फ्याँकिदिन्छन्');
    assert.deepEqual(engine.convertWord('mahila').candidates, ['महिला', 'माहिला']);
    assert.deepEqual(engine.convertWord('angrejharuko').candidates, ['अङ्ग्रेजहरूको', 'अंग्रेजहरूको']);
  }
});

test('host readings replace native preferences without changing default engines', () => {
  const engine = createEngine({ entries: { mahila: ['माहिला', 'महिला'], shanta: ['शान्ता', 'शान्त'] } });
  assert.deepEqual(engine.convertWord('mahila').candidates, ['माहिला', 'महिला']);
  assert.equal(engine.convertWord('shanta').text, 'शान्ता');
  assert.equal(convertWord('mahila').text, 'महिला');
  assert.equal(convertWord('shanta').text, 'शान्त');
});

test('native aliases inherit incidental capitals and preserve reserved Shift sounds', () => {
  assert.equal(convertWord('Futera').text, 'फुटेर');
  assert.deepEqual(convertWord('Mahila').candidates, ['महिला', 'माहिला']);
  assert.equal(convertWord('Vedko').text, 'वेदको');
  assert.equal(convertWord('viGyanle').text, 'विज्ञानले');
  for (const [input, expected] of [
    ['Shanta', 'षन्त'], ['aStitwalai', 'अष्तित्वलै'],
    ['aspaTalbichko', 'अस्पटल्बिच्को'],
  ]) assert.equal(convertWord(input).text, expected);
});

test('native whole-key preferences do not infer unsupported attached forms', () => {
  assert.equal(convertWord('fuTerako').text, 'फुटेरको');
  assert.equal(convertWord('vedkoma').text, 'वेद्कोम');
});
