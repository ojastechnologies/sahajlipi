import assert from 'node:assert/strict';
import test from 'node:test';
import { buildReviewBatch, diagnoseReviewBatch } from '../benchmark/review-batch-core.js';

function word(id, roman, native, category = 'AK-Freq') {
  return { id, roman, native, category };
}

function sentence(sourceId, roman = 'namaste nepal pani', proposedOutput = 'नमस्ते नेपाल पनि') {
  return {
    sourceId,
    roman,
    proposedOutput,
    provenance: 'fixture:sentence-source',
    reviewStatus: 'unreviewed',
    reviews: [],
    acceptedOutputs: [],
  };
}

function options(overrides = {}) {
  return {
    words: [],
    sentences: [],
    testWords: [],
    wordQuotas: {},
    sentenceCount: 0,
    seed: 'review-fixture-v1',
    ...overrides,
  };
}

function freezeDeep(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeDeep(child);
  }
  return value;
}

test('review sampling keeps the same cases and ordering when input records are reordered', () => {
  const words = [
    word('nep1', 'pani', 'पनि'),
    word('nep2', 'kam', 'काम'),
    word('nep3', 'nepal', 'नेपाल'),
    word('nep4', 'k', 'क'),
    word('nep5', 'Tika', 'टीका', 'AK-Uni'),
    word('nep6', 'Dai', 'डाइ', 'AK-Uni'),
  ];
  const sentences = [sentence('ne_1'), sentence('ne_2', 'paani paryo aaja', 'पानी पर्‍यो आज')];
  const batch = buildReviewBatch(options({ words, sentences, wordQuotas: { 'AK-Freq': 2, 'AK-Uni': 1 }, sentenceCount: 1 }));
  const reversed = buildReviewBatch(options({
    words: [...words].reverse(),
    sentences: [...sentences].reverse(),
    wordQuotas: { 'AK-Uni': 1, 'AK-Freq': 2 },
    sentenceCount: 1,
  }));

  assert.deepEqual(reversed, batch);
  assert.equal(batch.cases.length, 4);
  assert.equal(batch.cases.filter(({ sourceCategory }) => sourceCategory === 'AK-Freq').length, 2);
  assert.equal(batch.cases.filter(({ sourceCategory }) => sourceCategory === 'AK-Uni').length, 1);
  assert.equal(batch.cases.filter(({ mode }) => mode === 'text').length, 1);
});

test('review sampling uses the seed and source identities without favoring particular engine outputs', () => {
  const words = [
    word('nep1', 'pani', 'पनि'),
    word('nep2', 'kam', 'काम'),
    word('nep3', 'paryo', 'पर्‍यो'),
    word('nep4', 'k', 'क'),
  ];
  const relabeled = words.map(({ id, category }, index) => ({ ...words[(index + 1) % words.length], id, category }));
  const selectedIds = (source, seed) => buildReviewBatch(options({
    words: source,
    wordQuotas: { 'AK-Freq': 1 },
    seed,
  })).cases.map(({ sourceId }) => sourceId);
  const cohorts = new Set();
  for (let index = 0; index < 16; index++) {
    const seed = `independent-selection-${index}`;
    const ids = selectedIds(words, seed);
    assert.deepEqual(selectedIds(relabeled, seed), ids);
    cohorts.add(ids.join(','));
  }
  assert.ok(cohorts.size > 1, 'Changing the seed must be able to change the selected cohort');
});

test('review sampling excludes a word when either its Roman spelling or normalized native label is in the held-out test split', () => {
  const batch = buildReviewBatch(options({
    words: [
      word('nep1', '  PANI  ', 'पानी'),
      word('nep2', 'rain', 'पर्‍यो'),
      word('nep3', 'nukta', 'क़'),
      word('nep4', 'separate', 'क‌ख'),
      word('nep5', 'safe', 'सुरक्षित'),
    ],
    testWords: [
      word('nep101', 'pani', 'पनि'),
      word('nep102', 'paryo', 'पर्यो'),
      word('nep103', 'qa', 'क़'),
      word('nep104', 'kakha', 'कख'),
    ],
    wordQuotas: { 'AK-Freq': 1 },
  }));

  assert.deepEqual(batch.cases.map(({ sourceId }) => sourceId), ['nep5']);
});

test('review sampling deduplicates labeled pairs before filling quotas', () => {
  const batch = buildReviewBatch(options({
    words: [word('nep1', 'pani', 'पनि'), word('nep2', 'pani', 'पनि'), word('nep3', 'kam', 'काम')],
    wordQuotas: { 'AK-Freq': 2 },
  }));

  assert.equal(batch.cases.length, 2);
  assert.deepEqual(new Set(batch.cases.map(({ roman, proposedOutput }) => `${roman}:${proposedOutput}`)), new Set(['pani:पनि', 'kam:काम']));
  assert.throws(() => buildReviewBatch(options({
    words: [word('nep1', 'pani', 'पनि'), word('nep2', 'pani', 'पनि')],
    wordQuotas: { 'AK-Freq': 2 },
  })), /AK-Freq|quota|eligible|available/i);
});

test('review sampling fails when leakage exclusions leave too few words for a requested quota', () => {
  assert.throws(() => buildReviewBatch(options({
    words: [word('nep1', 'pani', 'पनि'), word('nep2', 'kam', 'काम')],
    testWords: [word('nep101', 'pani', 'पानी')],
    wordQuotas: { 'AK-Freq': 2 },
  })), /AK-Freq|quota|eligible|available/i);
});

test('sentence sampling admits the 3 and 20 token boundaries and rejects shorter and longer records', () => {
  const twenty = Array(20).fill('pani').join(' ');
  const batch = buildReviewBatch(options({
    sentences: [
      sentence('ne_1', 'pani nepal'),
      sentence('ne_2', '  namaste   nepal\n  pani  '),
      sentence('ne_3', twenty),
      sentence('ne_4', `${twenty} pani`),
    ],
    sentenceCount: 2,
  }));

  assert.deepEqual(new Set(batch.cases.map(({ sourceId }) => sourceId)), new Set(['ne_2', 'ne_3']));
  assert.throws(() => buildReviewBatch(options({ sentences: [sentence('ne_1', 'pani nepal')], sentenceCount: 1 })), /sentence|quota|eligible|available/i);
});

test('development cases preserve source text and reset reviews without mutating source records', () => {
  const input = options({
    words: [word('shared-id', 'Tika', 'क़')],
    sentences: [{
      ...sentence('shared-id', '  Namaste,   nepal!\nहामी  ', '  नमस्ते,   नेपाल!\nहामी  '),
      reviewStatus: 'approved',
      reviews: [{ reviewer: 'fixture', status: 'approved' }],
      acceptedOutputs: ['अर्को'],
    }],
    wordQuotas: { 'AK-Freq': 1 },
    sentenceCount: 1,
  });
  const original = structuredClone(input);
  freezeDeep(input);
  const { cases } = buildReviewBatch(input);
  const wordCase = cases.find(({ mode }) => mode === 'word');
  const textCase = cases.find(({ mode }) => mode === 'text');

  assert.deepEqual(input, original);
  assert.equal(wordCase.id, 'word-validation:shared-id');
  assert.equal(wordCase.sourceSplit, 'validation');
  assert.equal(wordCase.sourceId, 'shared-id');
  assert.equal(wordCase.sourceCategory, 'AK-Freq');
  assert.equal(typeof wordCase.provenance, 'string');
  assert.ok(wordCase.provenance.length > 0);
  assert.equal(wordCase.roman, 'Tika');
  assert.equal(wordCase.proposedOutput, 'क़');
  assert.equal(textCase.id, 'sentence:shared-id');
  assert.equal(textCase.provenance, 'fixture:sentence-source');
  assert.equal(textCase.roman, '  Namaste,   nepal!\nहामी  ');
  assert.equal(textCase.proposedOutput, '  नमस्ते,   नेपाल!\nहामी  ');
  assert.equal(new Set(cases.map(({ id }) => id)).size, cases.length);
  for (const item of cases) {
    assert.equal(item.purpose, 'development');
    assert.equal(item.reviewStatus, 'unreviewed');
    assert.deepEqual(item.reviews, []);
    assert.deepEqual(item.acceptedOutputs, []);
    for (const responseField of ['actualTop', 'candidates', 'exactTopMatch', 'referenceInCandidates', 'signals', 'primarySignal']) {
      assert.equal(Object.hasOwn(item, responseField), false, responseField);
    }
  }
  wordCase.reviews.push({ reviewer: 'new-review' });
  wordCase.acceptedOutputs.push('नयाँ');
  assert.deepEqual(textCase.reviews, []);
  assert.deepEqual(textCase.acceptedOutputs, []);
  assert.deepEqual(input, original);
});

function reviewCase(id, mode, roman, proposedOutput) {
  return {
    id,
    mode,
    roman,
    proposedOutput,
    purpose: 'development',
    reviewStatus: 'unreviewed',
    reviews: [],
    acceptedOutputs: [],
  };
}

test('diagnostics separate an exact default match from a word candidate hit using the real engine', () => {
  const { summary, items } = diagnoseReviewBatch([
    reviewCase('word-validation:kam', 'word', 'kam', 'काम'),
    reviewCase('word-validation:paryo', 'word', 'paryo', 'पर्‍यो'),
    reviewCase('sentence:exact', 'text', 'namaste nepal pani', 'नमस्ते नेपाल पनि'),
  ]);

  assert.equal(summary.total, 3);
  assert.equal(summary.wordCount, 2);
  assert.equal(summary.textCount, 1);
  assert.equal(summary.exactTopMatches, 2);
  assert.equal(summary.wordCandidateMatches, 2);
  const kam = items.find(({ id }) => id === 'word-validation:kam');
  assert.equal(kam.actualTop, 'कम');
  assert.deepEqual(kam.candidates, ['कम', 'काम']);
  assert.equal(kam.exactTopMatch, false);
  assert.equal(kam.referenceInCandidates, true);
  assert.equal(kam.primarySignal, 'candidate-only');
  const paryo = items.find(({ id }) => id === 'word-validation:paryo');
  assert.equal(paryo.actualTop, 'पर्‍यो');
  assert.equal(paryo.exactTopMatch, true);
  assert.equal(paryo.referenceInCandidates, true);
  assert.equal(paryo.primarySignal, 'exact-match');
  const textCase = items.find(({ mode }) => mode === 'text');
  assert.equal(textCase.actualTop, 'नमस्ते नेपाल पनि');
  assert.equal(textCase.exactTopMatch, true);
  assert.equal(textCase.referenceInCandidates, null);
});

test('diagnostics keep an original Unicode proposal mismatch even when joiner removal makes the strings agree', () => {
  const { summary, items: [item] } = diagnoseReviewBatch([
    reviewCase('word-validation:joiner', 'word', 'paryo', 'पर्यो'),
  ]);

  assert.equal(item.proposedOutput, 'पर्यो');
  assert.equal(item.actualTop, 'पर्‍यो');
  assert.equal(item.exactTopMatch, false);
  assert.equal(item.referenceInCandidates, false);
  assert.equal(item.primarySignal, 'formatting-only');
  assert.ok(item.signals.includes('formatting-only'));
  assert.equal(summary.exactTopMatches, 0);
  assert.equal(summary.wordCandidateMatches, 0);
});

test('diagnostics report final virama differences as observed string differences', () => {
  const { items: [item] } = diagnoseReviewBatch([
    reviewCase('word-validation:virama', 'word', 'k', 'क'),
  ]);

  assert.equal(item.actualTop, 'क्');
  assert.equal(item.exactTopMatch, false);
  assert.equal(item.referenceInCandidates, false);
  assert.equal(item.primarySignal, 'final-virama');
  assert.ok(item.signals.includes('final-virama'));
});

test('diagnostic aggregates count every case once and leave unsupported matches in other-mismatch', () => {
  const sourceCases = [
    reviewCase('word-validation:kam', 'word', 'kam', 'काम'),
    reviewCase('word-validation:paryo', 'word', 'paryo', 'पर्‍यो'),
    reviewCase('word-validation:joiner', 'word', 'paryo', 'पर्यो'),
    reviewCase('word-validation:virama', 'word', 'k', 'क'),
    reviewCase('sentence:unrelated', 'text', 'namaste nepal pani', 'असम्बन्धित वाक्य यहाँ'),
  ];
  const original = structuredClone(sourceCases);
  freezeDeep(sourceCases);
  const { summary, items } = diagnoseReviewBatch(sourceCases);

  assert.deepEqual(sourceCases, original);
  assert.equal(summary.total, 5);
  assert.equal(summary.wordCount, 4);
  assert.equal(summary.textCount, 1);
  assert.equal(summary.exactTopMatches, 1);
  assert.equal(summary.wordCandidateMatches, 2);
  assert.equal(items.length, 5);
  assert.deepEqual(summary.primarySignals, {
    'exact-match': 1,
    'candidate-only': 1,
    'formatting-only': 1,
    'punctuation-only': 0,
    'final-virama': 1,
    'vowel-marks-only': 0,
    'shift-convention': 0,
    'other-mismatch': 1,
  });
  assert.equal(Object.values(summary.primarySignals).reduce((sum, count) => sum + count, 0), summary.total);
  assert.equal(items.find(({ mode }) => mode === 'text').primarySignal, 'other-mismatch');
  assert.equal(summary.flags['formatting-only'], 1);
  assert.equal(summary.flags['final-virama'], 1);
  assert.equal(summary.flags['roman-collision'], 2);
});
