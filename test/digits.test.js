import test from 'node:test';
import assert from 'node:assert/strict';
import { convertText, convertWord, createEngine } from '../src/index.js';

test('default text and word conversion use all ten Devanagari digits', () => {
  assert.equal(convertText('0123456789'), '०१२३४५६७८९');
  assert.deepEqual(convertWord('0123456789'), {
    text: '०१२३४५६७८९', candidates: ['०१२३४५६७८९'], ambiguous: false,
  });
  assert.equal(createEngine({ digits: 'devanagari' }).convertText('0123456789'), '०१२३४५६७८९');
});

test('ordinary numbers retain decimals, signs, separators and sentence punctuation', () => {
  assert.equal(convertText('123 3.14 -12 +20 1,000 10:30 25% 2026-09-27|'),
    '१२३ ३.१४ -१२ +२० १,००० १०:३० २५% २०२६-०९-२७।');
  assert.equal(convertText('camera123 paani 2| pani.'), 'क्यामेरा१२३ पानी २। पनि.');
});

test('word fallback and explicit marks apply the configured digit style', () => {
  assert.equal(convertWord('ka123').text, 'क१२३');
  assert.equal(convertWord('ka^123').text, 'कं१२३');
  assert.equal(createEngine({ digits: 'latin' }).convertWord('ka123').text, 'क123');
  assert.equal(createEngine({ digits: 'latin' }).convertWord('ka^123').text, 'कं123');
});

test('Latin digit configuration preserves ASCII digits without reversing existing Devanagari digits', () => {
  const engine = createEngine({ digits: 'latin' });
  assert.equal(engine.convertText('0123456789 ०१२३४५६७८९ 3.१४|'), '0123456789 ०१२३४५६७८९ 3.१४।');
  assert.equal(engine.convertWord('१२३').text, '१२३');
  assert.equal(engine.convertText('camera123 paani 2|'), 'क्यामेरा123 पानी 2।');
});

test('already Devanagari digits remain unchanged in default conversion', () => {
  assert.equal(convertText('०१२३४५६७८९ 3.१४|'), '०१२३४५६७८९ ३.१४।');
  assert.equal(convertWord('१२३').text, '१२३');
});

test('digit settings stay independent for each engine and omitted settings use the default', () => {
  const devanagari = createEngine();
  const latin = createEngine({ digits: 'latin' });
  assert.equal(latin.convertText('123'), '123');
  assert.equal(devanagari.convertText('123'), '१२३');
  assert.equal(createEngine({ digits: undefined }).convertText('123'), '१२३');
  assert.equal(convertText('123'), '१२३');
  assert.equal(latin.convertText('123'), '123');
});

test('digit settings accept only the two documented values', () => {
  for (const digits of [null, true, false, 0, 1, '', 'nepali', 'Devanagari', [], {}]) {
    assert.throws(() => createEngine({ digits }), {
      name: 'TypeError', message: 'digits must be "devanagari" or "latin"',
    });
  }
});

test('candidate digit conversion happens before deduplication, including custom outputs', () => {
  const entries = { model: ['Model 2', 'Model २', 'Model 3'] };
  const devanagari = createEngine({ entries });
  assert.deepEqual(devanagari.convertWord('model'), {
    text: 'Model २', candidates: ['Model २', 'Model ३'], ambiguous: true,
  });
  assert.equal(devanagari.convertText('model 4'), 'Model २ ४');
  assert.deepEqual(createEngine({ entries, digits: 'latin' }).convertWord('model'), {
    text: 'Model 2', candidates: ['Model 2', 'Model २', 'Model 3'], ambiguous: true,
  });
  assert.deepEqual(entries.model, ['Model 2', 'Model २', 'Model 3']);
});

test('protected technical spans retain digits in hosts, credentials, ports, paths and email addresses', () => {
  const addresses = [
    'https://user2:pass3@camera4.com:8080/path5?q=6#7',
    'http://127.0.0.1:4173/demo/2', 'https://[::1]:4173/path2',
    'www.camera2.com/path3', 'camera2.com/path3',
    'User123+tag4@camera5.com', '123@', 'https://127.',
  ];
  for (const address of addresses) {
    assert.equal(convertText(address), address, address);
    assert.equal(convertText(`1 ${address} 2`), `१ ${address} २`, address);
  }
});

test('technical text opt-out and digit style remain independent options', () => {
  const devanagari = createEngine({ preserveTechnicalText: false });
  const latin = createEngine({ preserveTechnicalText: false, digits: 'latin' });
  assert.equal(devanagari.convertText('http://127.0.0.1:4173/2'), 'ह्त्त्प्://१२७.०.०.१:४१७३/२');
  assert.equal(latin.convertText('http://127.0.0.1:4173/2'), 'ह्त्त्प्://127.0.0.1:4173/2');
  assert.equal(devanagari.convertText('user2@camera3.com'), 'उसेर्२@क्यामेरा३.चोम्');
  assert.equal(latin.convertText('user2@camera3.com'), 'उसेर्2@क्यामेरा3.चोम्');
  assert.equal(createEngine({ digits: 'latin' }).convertText('http://127.0.0.1:4173/2'), 'http://127.0.0.1:4173/2');
});
