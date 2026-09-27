#!/usr/bin/env node

// This comparison keeps the historical fixture separate from the revised
// default-digit contracts. It also checks compatibility using an explicit
// Latin engine, because benchmark/run.js measures only the default engine.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { arch, platform, release } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const baselineCommit = '660d088ed60410feb0c6ad4c43d33214c24296f9';
const baselineArgument = process.argv[2];
if (!baselineArgument || baselineArgument.startsWith('--')) {
  console.error('Usage: node benchmark/measure-digits.js <archived-baseline-directory> [--output report.json]');
  process.exit(2);
}
const extra = process.argv.slice(3);
if (extra.length && (extra.length !== 2 || extra[0] !== '--output' || !extra[1])) {
  throw new Error('Expected only an optional --output report.json argument');
}
const baselineRoot = resolve(baselineArgument);
const afterRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixturePath = 'benchmark/cases.jsonl';
const coreFiles = ['src/index.js', 'src/index.d.ts', 'src/text-policy.js', 'src/lexicon.js', 'src/phonetic.js'];
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const read = (root, path) => readFile(resolve(root, path));
const beforeSource = await read(baselineRoot, fixturePath);
const afterSource = await read(afterRoot, fixturePath);
// Pin the two fixture revisions so later additions cannot silently change this
// dated comparison's denominator. Archive the digit implementation to replay it.
if (sha256(beforeSource) !== '2b3d794b761dc8e9d459becb85bbed1be39a7f6bfbdae48b2cfe6d14dc876cc6') {
  throw new Error('Baseline fixture does not match immutable commit 660d088');
}
if (sha256(afterSource) !== 'c5d2b7bbca573368a7531b7d21a5b989f7ca67d937ff0ae49cc3b3d923449fe7') {
  throw new Error('Revised fixture does not match the digits-001 snapshot; run this tool from the archived digit implementation');
}
const baselineExpectedCoreHashes = {
  'src/index.js': 'd7b2fc67ebc08c93534e09b16f64a998ecafb761c16bda096bcdf071ea84411d',
  'src/index.d.ts': '97fd8f3a1dbd76c591facf353fe59fc2edbf52270aa743b5f484bdeaaae4f7c5',
  'src/text-policy.js': '3df92e5288f8b0a3cd1fff87d6dad2132b5f97c35fd24cebdabb54c2101fc5aa',
  'src/lexicon.js': '0e5c26111dcebac1fe43bc4ae2d14a236653b42e6f676f43dbc549983f6806c0',
  'src/phonetic.js': 'dec43061ce47d8456092b661a4b1ea7b5d366d2c7969a4f2b6f3b1b0c20ff1ff',
};
for (const [path, expectedHash] of Object.entries(baselineExpectedCoreHashes)) {
  if (sha256(await read(baselineRoot, path)) !== expectedHash) {
    throw new Error(`Baseline source does not match immutable commit 660d088: ${path}`);
  }
}
const parse = (source) => source.toString('utf8').trim().split(/\r?\n/).map((line) => JSON.parse(line));
const beforeCases = parse(beforeSource);
const afterCases = parse(afterSource);
const beforeLines = beforeSource.toString('utf8').trim().split(/\r?\n/);
const afterLines = afterSource.toString('utf8').trim().split(/\r?\n/);
const afterById = new Map(afterCases.map((item) => [item.id, item]));
if (afterById.size !== afterCases.length) throw new Error('Repeated revised fixture id');
const changedExpectedCaseIds = [];
let priorByteIdenticalRowCount = 0;
const translateDigits = (value) => value.replace(/[0-9]/g, (digit) => String.fromCodePoint(0x0966 + Number(digit)));
for (const [index, before] of beforeCases.entries()) {
  const after = afterById.get(before.id);
  if (!after || afterCases[index].id !== before.id) throw new Error(`Historical fixture order/id changed: ${before.id}`);
  if (beforeLines[index] === afterLines[index]) {
    priorByteIdenticalRowCount++;
    continue;
  }
  const { expectedTop: oldTop, provenance: oldProvenance, ...oldRest } = before;
  const { expectedTop: newTop, provenance: newProvenance, ...newRest } = after;
  if (JSON.stringify(oldRest) !== JSON.stringify(newRest) || newTop !== translateDigits(oldTop) ||
      newTop === oldTop || !newProvenance.startsWith(oldProvenance) ||
      !newProvenance.includes('Default-digit contract revised 2026-09-27 by user authorization')) {
    throw new Error(`Historical case changed beyond declared digits/provenance: ${before.id}`);
  }
  changedExpectedCaseIds.push(before.id);
}
const newCases = afterCases.slice(beforeCases.length);
if (newCases.some((item) => beforeCases.some((before) => before.id === item.id))) {
  throw new Error('A new case reused a historical id');
}
const beforeApi = await import(pathToFileURL(resolve(baselineRoot, 'src/index.js')));
const afterApi = await import(pathToFileURL(resolve(afterRoot, 'src/index.js')));
const latinApi = afterApi.createEngine({ digits: 'latin' });
function evaluate(cases, api) {
  return cases.map((item) => {
    if (item.mode === 'text') {
      const actualTop = api.convertText(item.input);
      const topMatch = actualTop === item.expectedTop;
      return { ...item, actualTop, actualCandidates: null, topMatch, candidateHits: 0, pass: topMatch };
    }
    const { text: actualTop, candidates: actualCandidates } = api.convertWord(item.input);
    const topMatch = actualTop === item.expectedTop;
    const candidateHits = item.expectedCandidates.filter((candidate) => actualCandidates.includes(candidate)).length;
    return { ...item, actualTop, actualCandidates, topMatch, candidateHits, pass: topMatch && candidateHits === item.expectedCandidates.length };
  });
}
function summarize(results) {
  const words = results.filter((item) => item.mode === 'word');
  const texts = results.filter((item) => item.mode === 'text');
  return {
    passed: results.filter((item) => item.pass).length,
    total: results.length,
    wordTop: words.filter((item) => item.topMatch).length,
    wordTotal: words.length,
    candidateHits: words.reduce((sum, item) => sum + item.candidateHits, 0),
    candidateTotal: words.reduce((sum, item) => sum + item.expectedCandidates.length, 0),
    textTop: texts.filter((item) => item.topMatch).length,
    textTotal: texts.length,
    mismatchCaseIds: results.filter((item) => !item.pass).map((item) => item.id),
  };
}
const contract = (results) => results.filter((item) => item.status === 'contract');
const exploratory = (results) => results.filter((item) => item.status === 'exploratory');
const originalBefore = evaluate(beforeCases, beforeApi);
const originalAfter = evaluate(beforeCases, afterApi);
const originalAfterLatin = evaluate(beforeCases, latinApi);
const revisedBefore = evaluate(afterCases, beforeApi);
const revisedAfter = evaluate(afterCases, afterApi);
const newBefore = evaluate(newCases, beforeApi);
const newAfter = evaluate(newCases, afterApi);
function runner(root, fixture, expected) {
  const args = [resolve(root, 'benchmark/run.js'), '--fixtures', fixture, '--check'];
  let stdout;
  let exitCode = 0;
  try { stdout = execFileSync(process.execPath, args, { encoding: 'utf8' }); }
  catch (error) {
    if (typeof error.status !== 'number') throw error;
    exitCode = error.status;
    stdout = error.stdout;
  }
  const match = stdout.match(/^Contract: (\d+)\/(\d+) full cases$/m);
  if (!match || Number(match[1]) !== expected.passed || Number(match[2]) !== expected.total ||
      exitCode !== (expected.passed === expected.total ? 0 : 1)) {
    throw new Error(`CLI runner and API evaluation disagree: ${root} / ${fixture}`);
  }
  return { command: `node ${args.join(' ')}`, exitCode, contract: { passed: expected.passed, total: expected.total } };
}
const hashFiles = async (root, files) => Object.fromEntries(await Promise.all(files.map(async (path) => [path, sha256(await read(root, path))])));
const oldReports = ['benchmark/reports/mixed-text-001.json', 'benchmark/reports/early-address-001.json'];
for (const path of oldReports) {
  if (Buffer.compare(await read(baselineRoot, path), await read(afterRoot, path)) !== 0) {
    throw new Error(`Historical report changed: ${path}`);
  }
}
const resultView = (item) => ({ actualTop: item.actualTop, actualCandidates: item.actualCandidates, pass: item.pass });
const beforeOriginalSummary = summarize(contract(originalBefore));
const afterOriginalSummary = summarize(contract(originalAfter));
const beforeRevisedSummary = summarize(contract(revisedBefore));
const afterRevisedSummary = summarize(contract(revisedAfter));
const report = {
  schemaVersion: 1,
  reportId: 'digits-001',
  recordedAt: new Date().toISOString(),
  purpose: 'Conformance to an explicitly revised default-digit software contract, with historical Latin compatibility measured separately; not linguistic accuracy, calendar conversion or timing',
  baseline: { gitCommit: baselineCommit, snapshotMethod: 'git archive of immutable pre-digit implementation and fixture', coreFileSha256: await hashFiles(baselineRoot, coreFiles) },
  after: { identity: `Working tree based on ${baselineCommit}; source identity pinned by hashes without assigning an uncreated commit`, defaultDigits: 'devanagari', coreFileSha256: await hashFiles(afterRoot, coreFiles) },
  environment: { nodeVersion: process.version, platform: platform(), architecture: arch(), osRelease: release() },
  fixture: {
    path: fixturePath, sha256: sha256(afterSource), total: afterCases.length,
    contractCount: afterCases.filter((item) => item.status === 'contract').length,
    exploratoryCount: afterCases.filter((item) => item.status === 'exploratory').length,
    priorFixtureSha256: sha256(beforeSource), priorRowCount: beforeCases.length,
    priorByteIdenticalRowCount, priorBytesPreserved: false,
    revisedExpectedCaseIds: changedExpectedCaseIds,
    revisionScope: 'Seven historical expectedTop strings change only ASCII digit code points, and their provenance appends an explicit dated policy revision; all IDs, inputs, categories, statuses and prior provenance text are retained. All other historical rows remain byte-identical.',
    newCaseIds: newCases.map((item) => item.id),
  },
  historicalContract: { beforeDefault: beforeOriginalSummary, afterDefault: afterOriginalSummary, afterLatin: summarize(contract(originalAfterLatin)), intentionalDefaultMismatchCaseIds: changedExpectedCaseIds },
  revisedContract: { beforeDefault: beforeRevisedSummary, afterDefault: afterRevisedSummary },
  addedDigitContract: { beforeDefault: summarize(contract(newBefore)), afterDefault: summarize(contract(newAfter)) },
  exploratory: { beforeDefault: summarize(exploratory(revisedBefore)), afterDefault: summarize(exploratory(revisedAfter)), afterLatin: summarize(exploratory(originalAfterLatin)), excludedFromGate: true, labelsRemainUnreviewed: true },
  revisedHistoricalCaseResults: changedExpectedCaseIds.map((id) => {
    const old = originalBefore.find((item) => item.id === id);
    const before = revisedBefore.find((item) => item.id === id);
    const after = revisedAfter.find((item) => item.id === id);
    const latin = originalAfterLatin.find((item) => item.id === id);
    return { id, input: before.input, historicalExpectedTop: old.expectedTop, revisedExpectedTop: before.expectedTop, beforeDefault: resultView(before), afterDefault: resultView(after), afterLatinAgainstHistorical: resultView(latin) };
  }),
  newCaseResults: newBefore.map((before, index) => ({ id: before.id, input: before.input, expectedTop: before.expectedTop, beforeDefault: resultView(before), afterDefault: resultView(newAfter[index]) })),
  commands: {
    beforeHistorical: runner(baselineRoot, resolve(baselineRoot, fixturePath), beforeOriginalSummary),
    afterHistorical: runner(afterRoot, resolve(baselineRoot, fixturePath), afterOriginalSummary),
    beforeRevised: runner(baselineRoot, resolve(afterRoot, fixturePath), beforeRevisedSummary),
    afterRevised: runner(afterRoot, resolve(afterRoot, fixturePath), afterRevisedSummary),
    latinHistorical: { method: "Programmatic createEngine({ digits: 'latin' }) with the archived historical fixture, using the same exact-output and expected-candidate checks; the default-engine CLI does not accept engine injection" },
  },
  benchmarkToolSha256: { before: sha256(await read(baselineRoot, 'benchmark/run.js')), after: sha256(await read(afterRoot, 'benchmark/run.js')) },
  measurementTool: { path: 'benchmark/measure-digits.js', sha256: sha256(await read(afterRoot, 'benchmark/measure-digits.js')) },
  historicalReportSha256: await hashFiles(afterRoot, oldReports),
  reproduction: {
    baselineSnapshot: `git archive ${baselineCommit} | tar -x -C <baseline-directory>`,
    command: 'node benchmark/measure-digits.js <absolute-baseline-directory>',
    optionalOutput: 'Append --output <report-path> to write a new measurement; do not overwrite immutable historical reports.',
    verification: 'Verify the fixture, core, runner and measurement hashes before comparing summaries. The timestamp and host command paths change when reproduced; expected outputs and denominators remain the same.',
    coreHashScope: 'src/index.js, src/index.d.ts, src/text-policy.js, src/lexicon.js, src/phonetic.js; no DOM/browser result is measured.',
  },
  limits: [
    'Default conversion intentionally changes seven prior ASCII-number contracts; historical 125/125 and revised 133/133 are different expectations, not a performance improvement on unchanged labels.',
    'Eight additions are project-authored software behavior contracts with zero independently reviewed linguistic labels; no population accuracy or held-out improvement claim.',
    "The explicit digits: 'latin' engine restores the historical 125-contract exact outputs and candidate requirements; existing Devanagari digits are not converted back to ASCII.",
    'Digits within scanner-recognized ASCII URL/email spans remain literal; text before a distinguishing address cue still follows ordinary conversion.',
    'Decimal points, dates, times and separators retain their meaning and punctuation; this maps ASCII digit code points without number parsing, locale formatting or Gregorian/Bikram Sambat calendar conversion.',
    'The historical fixture is frozen in the baseline commit; seven live expectedTop fields and dated provenance suffixes are revised explicitly, while all other prior rows and historical reports remain unchanged.',
    'Two exploratory proposals remain unreviewed and excluded from --check. Live typing, English mode, numeric input exclusions, composition, paste, cursor edits and undo require separate DOM/browser checks.',
  ],
};
const serialized = `${JSON.stringify(report, null, 2)}\n`;
if (extra.length) await writeFile(resolve(extra[1]), serialized);
else process.stdout.write(serialized);
