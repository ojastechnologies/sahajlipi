#!/usr/bin/env node

// A finite software-contract comparison. Expectations are literal fixture data,
// never generated from either engine. Prior reports and language labels stay frozen.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { arch, platform, release } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const baselineCommit = '987e31f7ec4e49680d7a001c078debce3d7fb326';
const fixturePath = 'benchmark/cases.jsonl';
const modePath = 'benchmark/consonant-modes-2026-10-03.json';
const priorFixtureSha256 = '89fb755dcbdce6c44e310120445d52faf31b0cfb6f82d72a4f2f38027aa2bcec';
const finalFixtureSha256 = '1e20e12e1287243ab3958546b9c76a5fbd8a883b91a1f393a42a2320fbfb82ef';
const modeFixtureSha256 = '7b56093a3c017d511885d6e7de405ad3ac6f2e0a2a559458c267491167a29fa0';
const revisedTargets = {
  'half-k': 'क', 'half-kr': 'क्र',
  'loanword-reserved-doctor': 'डोच्तोर', 'loanword-reserved-school': 'ष्चूल',
  'loanword-check-collision': 'चेच्क', 'loanword-fail-collision': 'फैल', 'loanword-phail-collision': 'फैल',
  'month-shift-s': 'ष', 'month-shift-d': 'ड', 'month-short-jan': 'जन', 'month-short-sep': 'षेप',
  'mixed-early-ordinary-text': 'क्यामेरा क्यामेरा. ३.१४ पर्‍यो ट ड।',
  'loanword-suffix-text-boundaries': 'कम्पनीहरूमाथि स्कुलमा मिडियासँग company@school.com https://media.com ट ड ष ऋ।',
  'native-spelling-text-boundaries': 'हाल्यो नभनी गाउँले दिँदैन पनि पानी. user123@example.com https://example.com/path ट ड ष ऋ।',
};
const revisionNote = " Full-consonant default contract revised 2026-10-03 by user authorization: unmarked fallback consonants render full at the end of a segment, while adjacent consonants still form automatic clusters. This row intentionally supersedes its prior implicit final-halant expectation; consonantMode: 'half' retains that legacy behavior. Exact project software contract, not an independently reviewed linguistic accuracy label.";
const baselineSourceHashes = {
  'src/dom.d.ts': 'e2a93a70c49c7057dc52d995719ec5b22ee72453685bc519815bc0c67d85b0d1',
  'src/dom.js': '6e84385a02ec7a79b8550de417b701b23ea3c3b36ab46e6408f1c7dfa7c233b2',
  'src/index.d.ts': '48be479797841978cabab3ba96fe9b77caa8c814238866908aa515619ab7cd17',
  'src/index.js': '315f43b424c19d1e2197d78414a618e59865cf4171255e72f1c6db90b5fb74f4',
  'src/lexicon.js': 'e325edef9cd9e2ebef42700ef9aeb6033b130e9a7c459b407820c31297d9448d',
  'src/loanwords.js': 'aa74e688d3b77980b5ee7e9fb89ce2c0a61fd27568d3230048bef91a8379e446',
  'src/phonetic.js': 'dec43061ce47d8456092b661a4b1ea7b5d366d2c7969a4f2b6f3b1b0c20ff1ff',
  'src/text-policy.js': '3df92e5288f8b0a3cd1fff87d6dad2132b5f97c35fd24cebdabb54c2101fc5aa',
};
const afterRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = value => createHash('sha256').update(value).digest('hex');
const read = (root, path) => readFile(resolve(root, path));
const fail = message => { throw new Error(message); };
const lines = bytes => bytes.toString('utf8').split('\n').filter(line => line.length);
const parse = bytes => lines(bytes).map(line => JSON.parse(line));
const hashFiles = async (root, paths) => Object.fromEntries(await Promise.all(paths.map(async path => [path, sha256(await read(root, path))])));

function options(args) {
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: node benchmark/measure-consonant-defaults.js <archived-baseline-directory> [--check] [--output <new-report.json>]');
    console.log('Checks pinned finite full/half contracts and strict parity against archived outputs. Existing files are never overwritten.');
    return null;
  }
  const baseline = args.shift();
  if (!baseline || baseline.startsWith('--')) fail('An archived baseline directory is required; use --help for usage');
  const result = { baselineRoot: resolve(baseline), check: false };
  const seen = new Set();
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (!['--check', '--output'].includes(flag) || seen.has(flag)) fail('Unknown or repeated argument: ' + flag);
    seen.add(flag);
    if (flag === '--check') result.check = true;
    else {
      if (!args[index + 1] || args[index + 1].startsWith('--')) fail('--output requires a new file path');
      result.output = resolve(args[++index]);
    }
  }
  return result;
}

function evaluate(cases, api) {
  return cases.map(item => {
    const result = item.mode === 'word' ? api.convertWord(item.input) : { text: api.convertText(item.input), candidates: null };
    const topMatch = result.text === item.expectedTop;
    const candidateHits = item.mode === 'word' ? item.expectedCandidates.filter(candidate => result.candidates.includes(candidate)).length : 0;
    return { ...item, actualTop: result.text, actualCandidates: result.candidates, topMatch, candidateHits,
      pass: topMatch && (item.mode !== 'word' || candidateHits === item.expectedCandidates.length) };
  });
}
function summarize(results) {
  const words = results.filter(item => item.mode === 'word'), texts = results.filter(item => item.mode === 'text');
  return { passed: results.filter(item => item.pass).length, total: results.length,
    wordTop: words.filter(item => item.topMatch).length, wordTotal: words.length,
    candidateHits: words.reduce((sum, item) => sum + item.candidateHits, 0),
    candidateTotal: words.reduce((sum, item) => sum + item.expectedCandidates.length, 0),
    textTop: texts.filter(item => item.topMatch).length, textTotal: texts.length,
    mismatchCaseIds: results.filter(item => !item.pass).map(item => item.id) };
}
const contracts = results => results.filter(item => item.status === 'contract');
const exploratory = results => results.filter(item => item.status === 'exploratory');
const view = item => ({ actualTop: item.actualTop, actualCandidates: item.actualCandidates, pass: item.pass });
async function sourcePaths(root, path = 'src') {
  const paths = [];
  for (const entry of await readdir(resolve(root, path), { withFileTypes: true })) {
    const child = path + '/' + entry.name;
    if (entry.isDirectory()) paths.push(...await sourcePaths(root, child));
    else if (entry.isFile()) paths.push(child);
    else fail('Unexpected source entry: ' + child);
  }
  return paths.sort();
}
function runner(root, fixture, expected) {
  const args = [resolve(root, 'benchmark/run.js'), '--fixtures', fixture, '--check'];
  let output, exitCode = 0;
  try { output = execFileSync(process.execPath, args, { encoding: 'utf8' }); }
  catch (error) {
    if (!Number.isInteger(error.status)) throw error;
    exitCode = error.status;
    output = error.stdout;
  }
  const match = output.match(/^Contract: (\d+)\/(\d+) full cases$/m);
  if (!match || Number(match[1]) !== expected.passed || Number(match[2]) !== expected.total ||
      exitCode !== (expected.passed === expected.total ? 0 : 1)) fail('Seed runner and API evaluation disagree');
  return { method: 'node benchmark/run.js --fixtures <same-final-fixture> --check', exitCode,
    contract: { passed: expected.passed, total: expected.total } };
}

async function main() {
  const config = options(process.argv.slice(2));
  if (!config) return;
  const { baselineRoot } = config;
  const [priorBytes, finalBytes, modeBytes] = await Promise.all([
    read(baselineRoot, fixturePath), read(afterRoot, fixturePath), read(afterRoot, modePath)]);
  if (sha256(priorBytes) !== priorFixtureSha256) fail('Baseline fixture differs from immutable 987e31f');
  if (sha256(finalBytes) !== finalFixtureSha256 || sha256(modeBytes) !== modeFixtureSha256) fail('Contract fixture differs from the dated consonant snapshot; use the archived implementation');
  const priorCases = parse(priorBytes), finalCases = parse(finalBytes), modeFixture = JSON.parse(modeBytes);
  if (priorCases.length !== 144 || finalCases.length !== 162 || new Set(finalCases.map(item => item.id)).size !== finalCases.length) fail('Unexpected seed count or duplicate ID');
  let priorByteIdenticalRowCount = 0;
  const revisedExpectedCaseIds = [];
  for (const [index, prior] of priorCases.entries()) {
    const current = finalCases[index];
    if (!current || current.id !== prior.id) fail('Historical row order or ID changed');
    const target = revisedTargets[prior.id];
    if (!target) {
      if (lines(priorBytes)[index] !== lines(finalBytes)[index]) fail('Undeclared historical row revision: ' + prior.id);
      priorByteIdenticalRowCount++;
    } else {
      const expected = { ...prior, expectedTop: target, provenance: prior.provenance + revisionNote };
      if (prior.mode === 'word') expected.expectedCandidates = [target];
      if (JSON.stringify(expected) !== JSON.stringify(current)) fail('Historical row differs beyond declared consonant expectation/provenance: ' + prior.id);
      revisedExpectedCaseIds.push(prior.id);
    }
  }
  if (revisedExpectedCaseIds.length !== Object.keys(revisedTargets).length) fail('Missing declared revision');
  const modeIds = new Set();
  if (modeFixture.schemaVersion !== 1 || modeFixture.cases?.length !== 31) fail('Invalid finite mode fixture');
  for (const item of modeFixture.cases) {
    if (!item.id || modeIds.has(item.id) || !['word', 'text'].includes(item.mode) ||
        ['input', 'fullExpected', 'halfExpected'].some(key => typeof item[key] !== 'string' || !item[key])) fail('Invalid finite mode case');
    modeIds.add(item.id);
  }
  const baselineFiles = await sourcePaths(baselineRoot), afterFiles = await sourcePaths(afterRoot);
  const baselineHashes = await hashFiles(baselineRoot, baselineFiles), afterHashes = await hashFiles(afterRoot, afterFiles);
  if (JSON.stringify(baselineHashes) !== JSON.stringify(baselineSourceHashes)) fail('Baseline src differs from immutable 987e31f');
  const beforeApi = await import(pathToFileURL(resolve(baselineRoot, 'src/index.js')));
  const afterApi = await import(pathToFileURL(resolve(afterRoot, 'src/index.js')));
  const fullApi = afterApi.createEngine({ consonantMode: 'full' });
  const halfApi = afterApi.createEngine({ consonantMode: 'half' });
  const before = evaluate(finalCases, beforeApi), after = evaluate(finalCases, afterApi), explicitFull = evaluate(finalCases, fullApi);
  const historicalBefore = evaluate(priorCases, beforeApi), historicalDefault = evaluate(priorCases, afterApi), historicalHalf = evaluate(priorCases, halfApi);
  const modeCases = mode => modeFixture.cases.map(item => ({ ...item, expectedTop: item[mode + 'Expected'],
    ...(item.mode === 'word' ? { expectedCandidates: [item[mode + 'Expected']] } : {}) }));
  const fullModes = modeCases('full'), halfModes = modeCases('half');
  const modesBefore = evaluate(fullModes, beforeApi), modesDefault = evaluate(fullModes, afterApi), modesFull = evaluate(fullModes, fullApi), modesHalf = evaluate(halfModes, halfApi);
  const rawResult = (item, api) => item.mode === 'word' ? api.convertWord(item.input) : api.convertText(item.input);
  const parity = priorCases.map(item => ({ id: item.id, mode: item.mode,
    pass: JSON.stringify(rawResult(item, beforeApi)) === JSON.stringify(rawResult(item, halfApi)) }));
  const historicalPaths = (await readdir(resolve(baselineRoot, 'benchmark/reports'))).filter(path => path.endsWith('.json')).sort().map(path => 'benchmark/reports/' + path);
  for (const path of historicalPaths) {
    if (Buffer.compare(await read(baselineRoot, path), await read(afterRoot, path)) !== 0) fail('Historical report changed: ' + path);
  }
  const beforeSummary = summarize(contracts(before)), afterSummary = summarize(contracts(after));
  const paritySummary = { passed: parity.filter(item => item.pass).length, total: parity.length,
    scope: 'Exact convertWord object (text, full candidate array, ambiguous) or convertText string for all archived contract and exploratory inputs',
    mismatchCaseIds: parity.filter(item => !item.pass).map(item => item.id) };
  const gateResults = [afterSummary, summarize(contracts(explicitFull)), summarize(contracts(historicalHalf)),
    summarize(modesDefault), summarize(modesFull), summarize(modesHalf), paritySummary];
  const gatePass = gateResults.every(result => result.passed === result.total);
  const report = {
    schemaVersion: 1, reportId: 'consonant-defaults-2026-10-03', recordedAt: new Date().toISOString(),
    purpose: 'Exact conformance to an explicitly revised full-consonant default software contract and strict half compatibility; not general Nepali accuracy, external linguistic evaluation or timing',
    baseline: { gitCommit: baselineCommit, snapshotMethod: 'git archive of immutable src, package.json, seed fixture, runner and historical reports', sourceFileSha256: baselineHashes },
    after: { identity: 'Unpublished alpha.2 source checkout; src hashes identify the measured implementation without assigning an uncreated commit', sourceFileSha256: afterHashes },
    environment: { nodeVersion: process.version, platform: platform(), architecture: arch(), osRelease: release() },
    options: { defaultConsonantMode: 'full', strictCompatibilityMode: 'half', digits: 'devanagari', preserveTechnicalText: true, entries: 'starter defaults' },
    fixture: { path: fixturePath, sha256: finalFixtureSha256, total: finalCases.length,
      contractCount: contracts(after).length, exploratoryCount: exploratory(after).length,
      priorFixtureSha256, priorRowCount: priorCases.length, priorByteIdenticalRowCount,
      revisedExpectedCaseIds, newCaseIds: finalCases.slice(priorCases.length).map(item => item.id),
      revisionScope: 'Fourteen hand-specified preferred outputs, required singleton candidate arrays where applicable and appended dated provenance change. All prior IDs, inputs, categories, statuses, row order and prior provenance are preserved; the other 130 rows stay byte-identical.' },
    finalContract: { beforeDefault: beforeSummary, afterDefault: afterSummary, afterExplicitFull: summarize(contracts(explicitFull)) },
    historicalContract: { beforeDefault: summarize(contracts(historicalBefore)), afterDefault: summarize(contracts(historicalDefault)), afterHalf: summarize(contracts(historicalHalf)), intentionalDefaultMismatchCaseIds: revisedExpectedCaseIds },
    strictRawParity: paritySummary,
    addedContract: { beforeDefault: summarize(contracts(before.slice(priorCases.length))), afterDefault: summarize(contracts(after.slice(priorCases.length))) },
    finiteModeContract: { path: modePath, sha256: modeFixtureSha256, caseCount: modeFixture.cases.length,
      expectationProvenance: modeFixture.expectationProvenance, beforeDefaultAgainstFull: summarize(modesBefore),
      afterDefault: summarize(modesDefault), afterExplicitFull: summarize(modesFull), afterHalf: summarize(modesHalf),
      caseResults: modeFixture.cases.map((item, index) => ({ ...item, beforeDefaultAgainstFull: view(modesBefore[index]),
        afterDefault: view(modesDefault[index]), afterExplicitFull: view(modesFull[index]), afterHalf: view(modesHalf[index]) })) },
    exploratory: { beforeDefault: summarize(exploratory(before)), afterDefault: summarize(exploratory(after)), afterHalf: summarize(exploratory(historicalHalf)), excludedFromGate: true, labelsRemainUnreviewed: true },
    revisedHistoricalCaseResults: revisedExpectedCaseIds.map(id => {
      const priorIndex = priorCases.findIndex(item => item.id === id);
      return { id, input: priorCases[priorIndex].input, historicalExpectedTop: priorCases[priorIndex].expectedTop,
        revisedExpectedTop: finalCases[priorIndex].expectedTop, beforeDefaultAgainstRevised: view(before[priorIndex]),
        afterDefault: view(after[priorIndex]), afterHalfAgainstHistorical: view(historicalHalf[priorIndex]) };
    }),
    newCaseResults: finalCases.slice(priorCases.length).map((item, index) => ({ ...item,
      beforeDefault: view(before[priorCases.length + index]), afterDefault: view(after[priorCases.length + index]) })),
    commands: { beforeFinalFixture: runner(baselineRoot, resolve(afterRoot, fixturePath), beforeSummary),
      afterFinalFixture: runner(afterRoot, resolve(afterRoot, fixturePath), afterSummary),
      strictMode: "Programmatic createEngine({ consonantMode: 'half' }); the seed CLI continues to measure only its default engine" },
    toolFileSha256: { baselineRunner: sha256(await read(baselineRoot, 'benchmark/run.js')),
      ...await hashFiles(afterRoot, ['benchmark/run.js', 'benchmark/measure-consonant-defaults.js']) },
    historicalReportSha256: await hashFiles(afterRoot, historicalPaths),
    gate: { pass: gatePass, covers: ['revised default contracts', 'explicit full contracts', 'archived half-mode contracts', '31 finite default/full/half cases', 'all 144 archived raw outputs'] },
    reproduction: { baselineSnapshot: 'git archive ' + baselineCommit + ' src package.json benchmark/cases.jsonl benchmark/run.js benchmark/reports | tar -x -C <baseline-directory>',
      comparison: 'node benchmark/measure-consonant-defaults.js <absolute-baseline-directory> --check [--output <new-report.json>]',
      verification: 'Use the source, fixture and tool hashes in this record. The script pins baseline source and both finite fixtures, refuses output overwrite and verifies historical reports. Recorded time and Node/OS fields vary by host.' },
    limits: [
      'These selected cases check an approved software policy. Their expectations are hand-authored from that policy, not independently collected or reviewed Nepali spellings.',
      'The before/after totals use intentional revised defaults. The historical half-mode result and exact raw-output parity separately measure compatibility; a changed policy score is not linguistic improvement.',
      'All prior reports, source-assisted references and exploratory labels remain unchanged. No external corpus is evaluated by this comparison.',
      'Strict parity covers the 144 archived inputs and 31 selected mode cases; it is finite regression evidence, not a proof for every possible Roman input.',
      'Candidate coverage counts only fixture-required readings; it does not judge extra suggestions, every possible spelling or usefulness.',
      'No browser/mobile, live editing, performance, population accuracy or npm publication result is established. The published alpha.1 package remains distinct from this unpublished alpha.2 source.',
    ],
  };
  if (JSON.stringify(await sourcePaths(afterRoot)) !== JSON.stringify(afterFiles) ||
      JSON.stringify(await hashFiles(afterRoot, afterFiles)) !== JSON.stringify(afterHashes) ||
      JSON.stringify(await hashFiles(baselineRoot, baselineFiles)) !== JSON.stringify(baselineHashes)) fail('Engine source changed during measurement');
  const serialized = JSON.stringify(report, null, 2) + '\n';
  if (config.output) {
    await writeFile(config.output, serialized, { flag: 'wx' });
    console.log(`Revised default contracts: ${beforeSummary.passed}/${beforeSummary.total} → ${afterSummary.passed}/${afterSummary.total}`);
    console.log(`Finite modes: default ${summarize(modesDefault).passed}/31; full ${summarize(modesFull).passed}/31; half ${summarize(modesHalf).passed}/31`);
    console.log(`Strict archived raw parity: ${paritySummary.passed}/${paritySummary.total}`);
    console.log(`Gate: ${gatePass ? 'pass' : 'fail'}; wrote ${config.output}`);
  } else process.stdout.write(serialized);
  if (config.check && !gatePass) process.exitCode = 1;
}

main().catch(error => { console.error('Consonant measurement error: ' + error.message); process.exitCode = 2; });
