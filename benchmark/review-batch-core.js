import { createHash } from 'node:crypto';
import { convertWord, convertText } from '../src/index.js';

export const REVIEW_SEED = 'sahajlipi-nepali-review-001';
export const WORD_QUOTAS = Object.freeze({ 'AK-Freq': 40, 'AK-Uni': 25, IndicCorp: 10, Wikidata: 5 });
export const WORD_PROVENANCE = 'ai4bharat/Aksharantar@e418c1fc928d9f5393af33268472cf20c1891be8/nep_valid.json';
const PRIMARY_SIGNALS = ['exact-match', 'candidate-only', 'formatting-only', 'punctuation-only',
  'final-virama', 'vowel-marks-only', 'shift-convention', 'other-mismatch'];
const order = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const romanKey = (text) => text.normalize('NFC').trim().toLowerCase();
const nativeKey = (text) => text.normalize('NFC').replace(/[\u200c\u200d]/g, '');
const tokens = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const rank = (seed, kind, row) => createHash('sha256')
  .update(JSON.stringify([seed, kind, row.id ?? row.sourceId]))
  .digest('hex');

function requireRows(rows, kind) {
  if (!Array.isArray(rows)) throw new TypeError(kind + ' must be an array');
  const ids = new Set();
  for (const row of rows) {
    const id = row?.id ?? row?.sourceId;
    const target = row?.native ?? row?.proposedOutput;
    if (typeof id !== 'string' || !id || typeof row.roman !== 'string' || !row.roman.trim() ||
        typeof target !== 'string' || !target.trim()) throw new TypeError(kind + ' has an invalid source record');
    if (ids.has(id)) throw new Error(kind + ' has a repeated source identifier: ' + id);
    ids.add(id);
  }
}

export function buildReviewBatch({ words, sentences, testWords, wordQuotas = WORD_QUOTAS,
  sentenceCount = 20, seed = REVIEW_SEED }) {
  requireRows(words, 'Development words');
  requireRows(sentences, 'Sentence queue');
  requireRows(testWords, 'Test words');
  if (typeof seed !== 'string' || !seed) throw new TypeError('seed must be nonempty');
  if (!wordQuotas || typeof wordQuotas !== 'object' || Array.isArray(wordQuotas)) {
    throw new TypeError('wordQuotas must be an object');
  }
  if (!Number.isInteger(sentenceCount) || sentenceCount < 0) throw new TypeError('sentenceCount must be a nonnegative integer');
  const quotas = Object.fromEntries(Object.entries(wordQuotas).sort(([a], [b]) => order(a, b)));
  for (const [category, count] of Object.entries(quotas)) {
    if (!category || !Number.isInteger(count) || count < 0) throw new TypeError('Word quotas must be nonnegative integers');
  }
  const testRoman = new Set(testWords.map((row) => romanKey(row.roman)));
  const testNative = new Set(testWords.map((row) => nativeKey(row.native)));
  const exclusions = { romanOverlap: 0, nativeOverlap: 0, testOverlapTotal: 0, duplicatePairs: 0 };
  const seenPairs = new Set();
  // Rank before deduplication so duplicate selection is independent of file order.
  const rankedWords = words.map((row) => ({ row, rank: rank(seed, WORD_PROVENANCE, row) }))
    .sort((a, b) => order(a.rank, b.rank) || order(a.row.id, b.row.id));
  const eligibleWords = [];
  for (const { row } of rankedWords) {
    const romanOverlap = testRoman.has(romanKey(row.roman));
    const nativeOverlap = testNative.has(nativeKey(row.native));
    if (romanOverlap) exclusions.romanOverlap++;
    if (nativeOverlap) exclusions.nativeOverlap++;
    if (romanOverlap || nativeOverlap) { exclusions.testOverlapTotal++; continue; }
    const pair = JSON.stringify([row.roman, row.native]);
    if (seenPairs.has(pair)) { exclusions.duplicatePairs++; continue; }
    seenPairs.add(pair);
    eligibleWords.push(row);
  }
  const wordPools = {};
  const selectedWords = [];
  for (const [category, count] of Object.entries(quotas)) {
    const pool = eligibleWords.filter((row) => row.category === category);
    wordPools[category] = { input: words.filter((row) => row.category === category).length,
      eligible: pool.length, selected: count };
    if (pool.length < count) throw new Error(category + ' quota needs ' + count + ' eligible words; available ' + pool.length);
    selectedWords.push(...pool.slice(0, count));
  }
  const sentencePool = sentences.filter((row) => tokens(row.roman) >= 3 && tokens(row.roman) <= 20)
    .map((row) => ({ row, rank: rank(seed, row.provenance, row) }))
    .sort((a, b) => order(a.rank, b.rank) || order(a.row.sourceId, b.row.sourceId));
  if (sentencePool.length < sentenceCount) {
    throw new Error('Sentence quota needs ' + sentenceCount + ' eligible records; available ' + sentencePool.length);
  }
  const freshReview = () => ({ purpose: 'development', reviewStatus: 'unreviewed', reviews: [], acceptedOutputs: [] });
  const cases = [
    ...selectedWords.map((row) => ({ id: 'word-validation:' + row.id, mode: 'word', sourceId: row.id,
      sourceSplit: 'validation', sourceCategory: row.category, provenance: WORD_PROVENANCE,
      roman: row.roman, proposedOutput: row.native, ...freshReview() })),
    ...sentencePool.slice(0, sentenceCount).map(({ row }) => ({ id: 'sentence:' + row.sourceId,
      mode: 'text', sourceId: row.sourceId, sourceSplit: 'sentence-review-queue', provenance: row.provenance,
      roman: row.roman, proposedOutput: row.proposedOutput, ...freshReview() })),
  ];
  return { cases, selection: { seed, wordQuotas: quotas, wordInputCount: words.length,
    testInputCount: testWords.length, exclusions, wordPools,
    sentences: { input: sentences.length, eligible: sentencePool.length, selected: sentenceCount,
      minimumRomanTokens: 3, maximumRomanTokens: 20 } } };
}

export function diagnoseReviewBatch(cases) {
  const primarySignals = Object.fromEntries(PRIMARY_SIGNALS.map((name) => [name, 0]));
  const flags = { ...primarySignals, 'roman-collision': 0, 'token-count-difference': 0 };
  const summary = { total: cases.length, wordCount: 0, textCount: 0, exactTopMatches: 0,
    wordCandidateMatches: 0, primarySignals, flags };
  const labels = new Map();
  for (const item of cases.filter((item) => item.mode === 'word')) {
    const key = romanKey(item.roman);
    if (!labels.has(key)) labels.set(key, new Set());
    labels.get(key).add(item.proposedOutput);
  }
  const punctuationKey = (text) => nativeKey(text).replace(/[\p{P}\s]/gu, '');
  const vowelKey = (text) => text.replace(/[ािीुूृॄॅेैॉोौ]/g, '');
  const finalViramas = (text) => [...text.matchAll(/्(?=$|[\s\p{P}])/gu)].length;
  const items = cases.map((item) => {
    if (item.mode !== 'word' && item.mode !== 'text') throw new TypeError('Unknown review mode: ' + item.mode);
    const word = item.mode === 'word';
    const result = word ? convertWord(item.roman) : { text: convertText(item.roman), candidates: [] };
    const exactTopMatch = result.text === item.proposedOutput;
    const referenceInCandidates = word ? result.candidates.includes(item.proposedOutput) : null;
    const signals = [];
    if (exactTopMatch) signals.push('exact-match');
    else {
      if (referenceInCandidates) signals.push('candidate-only');
      if (nativeKey(result.text) === nativeKey(item.proposedOutput)) signals.push('formatting-only');
      if (punctuationKey(result.text) === punctuationKey(item.proposedOutput)) signals.push('punctuation-only');
      if (finalViramas(result.text) > finalViramas(item.proposedOutput)) signals.push('final-virama');
      if (vowelKey(result.text) === vowelKey(item.proposedOutput)) signals.push('vowel-marks-only');
      if (item.roman === item.roman.toLowerCase() && /[टठडढष]/u.test(item.proposedOutput)) signals.push('shift-convention');
    }
    if (word && labels.get(romanKey(item.roman)).size > 1) signals.push('roman-collision');
    if (!word && tokens(item.roman) !== tokens(item.proposedOutput)) signals.push('token-count-difference');
    const primarySignal = PRIMARY_SIGNALS.find((name) => signals.includes(name)) ?? 'other-mismatch';
    if (primarySignal === 'other-mismatch') signals.push(primarySignal);
    summary[word ? 'wordCount' : 'textCount']++;
    if (exactTopMatch) summary.exactTopMatches++;
    if (referenceInCandidates) summary.wordCandidateMatches++;
    primarySignals[primarySignal]++;
    for (const name of signals) flags[name]++;
    return { id: item.id, mode: item.mode, roman: item.roman, proposedOutput: item.proposedOutput,
      actualTop: result.text, candidates: [...result.candidates], exactTopMatch, referenceInCandidates, signals, primarySignal };
  });
  return { summary, items };
}
