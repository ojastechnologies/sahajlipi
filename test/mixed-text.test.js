import test from 'node:test';
import assert from 'node:assert/strict';
import { convertText, convertWord, createEngine } from '../src/index.js';
import { findProtectedSpans } from '../src/text-policy.js';

function protectedText(text) {
  return findProtectedSpans(text).map(({ start, end }) => text.slice(start, end));
}

test('mixed text keeps recognizable URLs and email addresses literal by default', () => {
  assert.equal(
    convertText('namaste https://Example.COM:8080/Camera?x=ka^&y=kaa~|two#par/=yo user.name+tag@Example.COM| paani.'),
    'नमस्ते https://Example.COM:8080/Camera?x=ka^&y=kaa~|two#par/=yo user.name+tag@Example.COM। पानी.',
  );
  assert.equal(convertText('camera camera.com email'), 'क्यामेरा camera.com इमेल');
  assert.equal(convertText('www.camera.com/path mailto:User+tag@camera.com'), 'www.camera.com/path mailto:User+tag@camera.com');
});

test('protected spans leave sentence punctuation and enclosing quotes outside', () => {
  const input = '"camera.com", (https://camera.com/a(b)). [user@camera.com]; camera.com! camera.com? camera.com: camera.com|';
  assert.deepEqual(protectedText(input), [
    'camera.com', 'https://camera.com/a(b)', 'user@camera.com',
    'camera.com', 'camera.com', 'camera.com', 'camera.com',
  ]);
  assert.equal(convertText('namaste|camera.com|'), 'नमस्ते।camera.com।');
  assert.equal(convertText('camera.com/path(foo)). paani|'), 'camera.com/path(foo)). पानी।');
});

test('scanner uses UTF-16 offsets and handles adjacent Devanagari and emoji wrappers', () => {
  const input = '😀हामीcamera.comबाट «user@camera.com» paani';
  const spans = findProtectedSpans(input);
  assert.deepEqual(spans, [
    { start: input.indexOf('camera.com'), end: input.indexOf('camera.com') + 'camera.com'.length },
    { start: input.indexOf('user@camera.com'), end: input.indexOf('user@camera.com') + 'user@camera.com'.length },
  ]);
  assert.equal(convertText(input), '😀हामीcamera.comबाट «user@camera.com» पानी');
});

test('recognizes ASCII domain shapes, punycode labels, and HTTP localhost or IP URLs without a lookup', () => {
  assert.deepEqual(protectedText('pani.paani camera.co.np camera.xn--p1ai localhost http://localhost:4173/demo/ http://127.0.0.1:4173/demo/ https://[::1]:4173/demo/'), [
    'pani.paani', 'camera.co.np', 'camera.xn--p1ai',
    'http://localhost:4173/demo/', 'http://127.0.0.1:4173/demo/', 'https://[::1]:4173/demo/',
  ]);
  assert.equal(convertText('pani.paani paani'), 'pani.paani पानी');
});

test('does not classify decimals, explicit marks, or ordinary mixed identifiers as technical text', () => {
  assert.deepEqual(findProtectedSpans('3.14 par/=yo ka^ kaa~ camera_file camera123 camera.123 -camera.com camera-.com'), []);
  assert.equal(convertText('3.14 par/=yo ka^ kaa~ camera_file camera123|'), '३.१४ पर्‍यो कं काँ क्यामेरा_फाइल क्यामेरा१२३।');
  assert.equal(convertText('pani. paani|'), 'पनि. पानी।');
});

test('explicit opt-out applies the previous conversion rules across all text', () => {
  const legacy = createEngine({ preserveTechnicalText: false });
  assert.equal(legacy.convertText('camera.com user@camera.com|'), 'क्यामेरा.चोम् उसेर्@क्यामेरा.चोम्।');
  assert.deepEqual(convertWord('camera.com'), legacy.convertWord('camera.com'));
});

test('protected spans take precedence over custom entries in convertText while convertWord stays a word API', () => {
  const engine = createEngine({ entries: { camera: ['चित्रयन्त्र'], 'camera.com': ['ठेगाना'], 'user@camera.com': ['इमेल ठेगाना'] } });
  assert.equal(engine.convertText('camera camera.com user@camera.com'), 'चित्रयन्त्र camera.com user@camera.com');
  assert.equal(engine.convertWord('camera.com').text, 'ठेगाना');
  assert.equal(engine.convertWord('user@camera.com').text, 'इमेल ठेगाना');
});

test('the technical preservation option is per engine and accepts only booleans', () => {
  for (const value of [null, 0, 1, '', 'false', [], {}]) {
    assert.throws(() => createEngine({ preserveTechnicalText: value }), TypeError);
  }
  assert.equal(createEngine({ preserveTechnicalText: true }).convertText('camera.com'), 'camera.com');
  assert.equal(createEngine({ preserveTechnicalText: undefined }).convertText('camera.com'), 'camera.com');
  assert.equal(convertText('camera.com'), 'camera.com');
});

test('HTTP URL credentials remain part of the literal authority and path', () => {
  const input = 'namaste https://user:pass@Example.com:8080/camera?q=ka^|two#kaa~ http://user%40tag:p%3Aword@localhost/path| paani|';
  assert.equal(convertText(input), 'नमस्ते https://user:pass@Example.com:8080/camera?q=ka^|two#kaa~ http://user%40tag:p%3Aword@localhost/path| पानी।');
  assert.deepEqual(protectedText('(https://user:pass@example.com/camera).'), ['https://user:pass@example.com/camera']);
});


test('explicit HTTP prefixes stay literal from the colon through unfinished authority typing', () => {
  const values = ['http:', 'HTTP:', 'https:', 'Https:', 'http:/', 'https:/', 'http://', 'https://',
    'https://c', 'https://camera.', 'https://user:', 'https://user:pass',
    'https://user:pass@', 'https://user:pass@camera.'];
  for (const value of values) {
    assert.equal(findProtectedSpans(value)[0]?.start, 0, value);
    assert.equal(convertText(value), value, value);
  }
  assert.equal(convertText('https:| paani|'), 'https:। पानी।');
  assert.equal(convertText('(https:/), paani|'), '(https:/), पानी।');
  assert.equal(convertText('https://user:pass@camera.c/?q=ka^|two paani|'),
    'https://user:pass@camera.c/?q=ka^|two पानी।');
});

test('www and email prefixes stay literal before a full address is available', () => {
  for (const value of ['www.', 'WWW.', 'www.c', 'www.camera.', 'user@', 'User.Name+tag@',
    'user@c', 'user@camera.', 'user@camera.c', 'mailto:user@', 'mailto:user@c']) {
    assert.equal(findProtectedSpans(value)[0]?.start, 0, value);
    assert.equal(convertText(value), value, value);
  }
  assert.equal(convertText('user@| paani|'), 'user@। पानी।');
  assert.equal(convertText('"www." (user@) paani|'), '"www." (user@) पानी।');
});

test('bare domains are recognizable at the first alphabetic label after a dot', () => {
  for (const value of ['camera.c', 'camera.co', 'camera.co-', 'camera.co-np', 'camera.c1', 'camera.com', 'camera.co.n', 'camera.co.np']) {
    assert.equal(findProtectedSpans(value)[0]?.start, 0, value);
    assert.equal(convertText(value), value, value);
  }
  assert.deepEqual(protectedText('camera camera. 3.14 camera.123'), []);
  assert.equal(convertText('camera camera. 3.14 par/=yo ka^ kaa~ T D'),
    'क्यामेरा क्यामेरा. ३.१४ पर्‍यो कं काँ ट् ड्');
});

test('early recognition respects sentence boundaries and the per-engine opt-out', () => {
  assert.deepEqual(protectedText('"https:" [www.] (user@) camera.c!'),
    ['https:', 'www.', 'user@', 'camera.c']);
  const legacy = createEngine({ preserveTechnicalText: false });
  const text = 'https: www. user@ camera.c';
  assert.equal(legacy.convertText(text), 'ह्त्त्प्स्: व्व्व्. उसेर्@ क्यामेरा.च्');
  assert.notEqual(convertText(text), legacy.convertText(text));
});


test('every suffix typed after an explicit address cue keeps the intended ASCII spelling', () => {
  const samples = [
    ['https://User:pass@example.com:8080/camera?q=ka^|two', 'https:'.length],
    ['www.camera-test.com/path', 'www.'.length],
    ['User.Name+tag@camera-test.com', 'User.Name+tag@'.length],
    ['camera.co-np/path', 'camera.c'.length],
  ];
  for (const [value, firstCue] of samples) {
    for (let length = firstCue; length <= value.length; length += 1) {
      const prefix = value.slice(0, length);
      assert.equal(convertText(prefix), prefix, prefix);
    }
  }
});


test('HTTP authority punctuation stops before neighboring Nepali words', () => {
  assert.equal(convertText('(https://camera.com),pani| https://camera.com!pani|'),
    '(https://camera.com),पनि। https://camera.com!पनि।');
  assert.equal(convertText('https://camera.com,pani| https://camera.com;pani|'),
    'https://camera.com,पनि। https://camera.com;पनि।');
  assert.equal(convertText('https://user:pa!ss@example.com/camera paani|'),
    'https://user:pa!ss@example.com/camera पानी।');
});
