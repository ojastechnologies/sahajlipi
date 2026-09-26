#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { parseAksharantarRows, verifyAksharantarTest } from './aksharantar-core.js';
import { buildReviewBatch, diagnoseReviewBatch } from './review-batch-core.js';
import { createReviewArtifacts, writeReviewArtifacts } from './review-batch-output.js';

const WORD_REVISION = 'e418c1fc928d9f5393af33268472cf20c1891be8';
const SENTENCE_REVISION = 'c54a95d9b9d62c891a03bd5da60715df7176b097';
const PINS = {
  words: '9bc1c65df08c5f41eb61ffeaf631bf1bc3820c64ef71ae54b4868c5ac3ea9be7',
  test: '172c759fcbb9faeda0a23765ccd12ad0520fb535a05dca42dd9c9923ee5f554e',
  sentences: '362e56b6e24f4614731da2d30b2d62d47c0b71d42c46815c67368386425f4d37',
};
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

function parseArgs(args) {
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: node benchmark/review-batch.js --words path/to/nep_valid.json --test path/to/nep_test.json --sentences path/to/nepali-sentence-review.jsonl --output path/to/new-directory');
    return null;
  }
  const result = {};
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (!['--words', '--test', '--sentences', '--output'].includes(flag) ||
        !args[index + 1] || args[index + 1].startsWith('--')) {
      throw new Error('Unknown or incomplete argument: ' + flag);
    }
    const key = flag.slice(2);
    if (Object.hasOwn(result, key)) throw new Error('Repeated option: ' + flag);
    result[key] = args[++index];
  }
  if (!['words', 'test', 'sentences', 'output'].every((key) => result[key])) {
    throw new Error('--words, --test, --sentences, and --output are required; see --help');
  }
  return result;
}

function lines(text) {
  return text.split(/\r?\n/).filter((line) => line.trim()).map((line, index) => {
    try { return JSON.parse(line); }
    catch (error) { throw new Error('Invalid JSON at record ' + (index + 1) + ': ' + error.message); }
  });
}

function developmentWords(text) {
  const rows = lines(text).map((row) => ({ id: row.unique_identifier,
    roman: row['english word'], native: row['native word'], category: row.source }));
  const expected = { IndicCorp: 1989, 'AK-Freq': 525, 'AK-Uni': 279, Wikidata: 11 };
  if (rows.length !== 2804 || rows.some((row) => !/^nep\d+$/.test(row.id) || !Object.hasOwn(expected, row.category))) {
    throw new Error('Unexpected development word records');
  }
  for (const [category, count] of Object.entries(expected)) {
    if (rows.filter((row) => row.category === category).length !== count) {
      throw new Error('Unexpected development category count: ' + category);
    }
  }
  return rows;
}

function gitValue(args) {
  try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
}

async function fileHashes(names) {
  const result = {};
  for (const name of names) result[name] = hash(await readFile(new URL('../' + name, import.meta.url)));
  return result;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options) return;
  const inputs = {};
  for (const [key, expectedHash] of Object.entries(PINS)) {
    const bytes = await readFile(options[key]);
    const actualHash = hash(bytes);
    if (actualHash !== expectedHash) throw new Error(key + ' SHA-256 ' + actualHash + ' differs from pinned input ' + expectedHash);
    inputs[key] = bytes.toString('utf8');
  }
  const testWords = parseAksharantarRows(inputs.test);
  verifyAksharantarTest(testWords);
  const words = developmentWords(inputs.words);
  const sentences = lines(inputs.sentences);
  if (sentences.length !== 423 || sentences.some((row) => row.reviewStatus !== 'unreviewed' ||
      row.provenance !== 'ai4bharat/Bhasha-Abhijnaanam@' + SENTENCE_REVISION ||
      !Array.isArray(row.reviews) || row.reviews.length || !Array.isArray(row.acceptedOutputs) || row.acceptedOutputs.length)) {
    throw new Error('Expected the original 423-item unreviewed sentence queue');
  }
  const batch = buildReviewBatch({ words, sentences, testWords });
  const diagnostics = diagnoseReviewBatch(batch.cases);
  const metadata = {
    createdAt: new Date().toISOString(), engineCommit: gitValue(['rev-parse', 'HEAD']),
    workingTreeChanged: Boolean(gitValue(['status', '--porcelain'])), nodeVersion: process.version,
    engineFileHashes: await fileHashes(['src/index.js', 'src/phonetic.js', 'src/lexicon.js']),
    toolFileHashes: await fileHashes(['benchmark/review-batch.js', 'benchmark/review-batch-core.js', 'benchmark/review-batch-output.js']),
    sources: {
      words: { dataset: 'ai4bharat/Aksharantar', revision: WORD_REVISION, file: 'nep_valid.json', split: 'validation', sha256: PINS.words },
      test: { dataset: 'ai4bharat/Aksharantar', revision: WORD_REVISION, file: 'nep_test.json', split: 'test', sha256: PINS.test, use: 'overlap exclusion only' },
      sentences: { dataset: 'ai4bharat/Bhasha-Abhijnaanam', revision: SENTENCE_REVISION,
        file: 'nepali-sentence-review.jsonl', split: 'unreviewed paired queue', sha256: PINS.sentences },
    },
  };
  await writeReviewArtifacts(options.output, createReviewArtifacts(batch, diagnostics, metadata));
  console.log('Wrote ' + batch.cases.length + ' unreviewed development cases to ' + options.output);
  console.log('Words: ' + diagnostics.summary.wordCount + '; sentences: ' + diagnostics.summary.textCount);
  console.log('Development words excluded for test overlap: ' + batch.selection.exclusions.testOverlapTotal);
  console.log('Exact default agreement with unreviewed proposals: ' + diagnostics.summary.exactTopMatches + '/' + diagnostics.summary.total);
  console.log('Word proposals in candidates: ' + diagnostics.summary.wordCandidateMatches + '/' + diagnostics.summary.wordCount);
  console.log('No labels are accepted and no linguistic accuracy is claimed. See diagnostics.md and manifest.json.');
}

main().catch((error) => {
  console.error('Review batch error: ' + error.message);
  process.exitCode = 2;
});
