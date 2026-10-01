#!/usr/bin/env node

// Compare one frozen development contract and one frozen source-assisted review
// against an immutable baseline and this checkout. No external labels are read.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { arch, platform, release } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const sha256 = value => createHash('sha256').update(value).digest('hex');

const baselineCommit = 'd3bb77f39f78b436d613424e78979b0357d8d7da';
const fixturePath = 'benchmark/cases.jsonl';
const reviewPath = 'benchmark/reports/nepali-source-review-2026-10-01.json';
const linguisticReviewPath = 'benchmark/reports/loanword-suffix-research-2026-10-01.json';
const linguisticReviewSha256 = '2a551d56b1b37ec2d333f715bfec348b709a753387f813bb558adcd44941fbf3';
const priorFixtureSha256 = 'c5d2b7bbca573368a7531b7d21a5b989f7ca67d937ff0ae49cc3b3d923449fe7';
const finalFixtureSha256 = 'fde07b59211831c3b8a6c05ebc5a3f1dc6148d0d34b259141932239e9562d0b4';
const frozenReviewSha256 = '5d9b36e39481d3f790fed503968f6bc504e71780ba083d8ed214f27ef674d34a';
const sourceCasesSha256 = '2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3';
const revisedHistoricalTargets = { 'loanword-bank-suffix-fallback': 'बैंकमा', 'loanword-file-suffix-fallback': 'फाइलहरू' };
const revisionNote = ' Loanword-suffix contract revised 2026-10-01 by user-authorized implementation: the 51 reviewed built-in loanword stems combine with 19 explicit endings; this joined form supersedes the earlier whole-word-only phonetic fallback expectation in this row. Source-assisted project behavior, not independent human or held-out linguistic accuracy.';
const baselineSourceHashes = {
  'src/index.js': 'efc2ed4719f209fd45e850d80d5ee8d3f6b8ef3862c70268aac8d46e8eab9627',
  'src/lexicon.js': 'ad094ca6e25566dc8647274ac24b70ea55e1ce2a7c66132f0b426d09df6f32f2',
  'src/phonetic.js': 'dec43061ce47d8456092b661a4b1ea7b5d366d2c7969a4f2b6f3b1b0c20ff1ff',
  'src/text-policy.js': '3df92e5288f8b0a3cd1fff87d6dad2132b5f97c35fd24cebdabb54c2101fc5aa',
};
const afterRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (root, path) => readFile(resolve(root, path));
const parseLines = source => source.toString('utf8').split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line));
const fail = message => { throw new Error(message); };

function options(args) {
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: node benchmark/measure-loanword-suffixes.js <archived-baseline-directory> --cases <pinned-review-cases.jsonl> [--output <new-report.json>]');
    console.log('Run from the archived suffix implementation to reproduce the dated source hashes. Existing reports are never overwritten.');
    return null;
  }
  const baselineArgument = args.shift();
  if (!baselineArgument || baselineArgument.startsWith('--')) fail('An archived baseline directory is required; use --help for usage');
  const result = { baselineRoot: resolve(baselineArgument) };
  const seen = new Set();
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (!['--cases', '--output'].includes(flag) || !args[index + 1] || args[index + 1].startsWith('--') || seen.has(flag)) fail('Unknown, incomplete or repeated argument: ' + flag);
    seen.add(flag);
    result[flag.slice(2)] = resolve(args[++index]);
  }
  if (!result.cases) fail('--cases must identify the pinned original review batch');
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
  const words = results.filter(item => item.mode === 'word');
  const texts = results.filter(item => item.mode === 'text');
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
const hashFiles = async (root, paths) => Object.fromEntries(await Promise.all(paths.map(async path => [path, sha256(await read(root, path))])));
async function sourcePaths(root, path = 'src') {
  const entries = await readdir(resolve(root, path), { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const child = path + '/' + entry.name;
    if (entry.isDirectory()) paths.push(...await sourcePaths(root, child));
    else if (entry.isFile()) paths.push(child);
    else fail('Unexpected non-file source entry: ' + child);
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
  const [priorBytes, finalBytes, reviewBytes, originalBytes, linguisticBytes] = await Promise.all([
    read(baselineRoot, fixturePath), read(afterRoot, fixturePath), read(afterRoot, reviewPath), readFile(config.cases), read(afterRoot, linguisticReviewPath)]);
  if (sha256(priorBytes) !== priorFixtureSha256) fail('Baseline fixture does not match immutable d3bb77f');
  if (sha256(finalBytes) !== finalFixtureSha256) fail('Final fixture differs from the dated suffix snapshot; use the archived suffix implementation');
  if (sha256(reviewBytes) !== frozenReviewSha256 || sha256(originalBytes) !== sourceCasesSha256) fail('Frozen source review or original review batch differs from its pin');
  if (sha256(linguisticBytes) !== linguisticReviewSha256) fail('Linguistic source ledger differs from its frozen pin');
  const linguisticReview = JSON.parse(linguisticBytes);
  for (const [path, hash] of Object.entries(baselineSourceHashes)) {
    if (sha256(await read(baselineRoot, path)) !== hash) fail('Baseline engine differs from immutable d3bb77f: ' + path);
  }
  const [priorCases, finalCases, originalCases] = [priorBytes, finalBytes, originalBytes].map(parseLines);
  if (priorCases.length !== 135 || finalCases.length !== 139 || new Set(finalCases.map(item => item.id)).size !== finalCases.length) fail('Unexpected fixture count or repeated ID');
  const rawLines = source => source.toString('utf8').split('\n').filter(line => line.length);
  const priorLines = rawLines(priorBytes), finalLines = rawLines(finalBytes);
  let priorByteIdenticalRowCount = 0;
  const revisedHistoricalCaseIds = [];
  for (const [index, previous] of priorCases.entries()) {
    const current = finalCases[index];
    if (current.id !== previous.id) fail('Historical fixture order or ID changed');
    if (priorLines[index] === finalLines[index]) { priorByteIdenticalRowCount++; continue; }
    const target = revisedHistoricalTargets[previous.id];
    const { expectedTop: oldTop, expectedCandidates: oldCandidates, provenance: oldProvenance, ...oldRest } = previous;
    const { expectedTop: newTop, expectedCandidates: newCandidates, provenance: newProvenance, ...newRest } = current;
    if (!target || JSON.stringify(oldRest) !== JSON.stringify(newRest) || newTop !== target ||
        JSON.stringify(newCandidates) !== JSON.stringify([target]) || newProvenance !== oldProvenance + revisionNote) {
      fail('Historical fixture changed beyond the two explicitly revised expectations: ' + previous.id);
    }
    revisedHistoricalCaseIds.push(previous.id);
  }
  if (priorByteIdenticalRowCount !== 133 || revisedHistoricalCaseIds.length !== 2) fail('Expected exactly two explicit historical revisions');
  const newCases = finalCases.slice(priorCases.length);
  if (newCases.some(item => item.status !== 'contract')) fail('All four suffix additions must remain contracts');
  const review = JSON.parse(reviewBytes);
  const baselineFiles = await sourcePaths(baselineRoot), afterFiles = await sourcePaths(afterRoot);
  const baselineHashes = await hashFiles(baselineRoot, baselineFiles), afterHashes = await hashFiles(afterRoot, afterFiles);
  const { evaluateSourceReview, publicResults } = await import('./source-reviewed-core.js');
  const beforeApi = await import(pathToFileURL(resolve(baselineRoot, 'src/index.js')));
  const afterApi = await import(pathToFileURL(resolve(afterRoot, 'src/index.js')));
  const before = evaluate(finalCases, beforeApi), after = evaluate(finalCases, afterApi);
  const beforeHistorical = evaluate(priorCases, beforeApi), afterHistorical = evaluate(priorCases, afterApi);
  const beforeReviewed = publicResults(evaluateSourceReview(originalCases, review, beforeApi));
  const afterReviewed = publicResults(evaluateSourceReview(originalCases, review, afterApi));
  const historicalPaths = (await readdir(resolve(baselineRoot, 'benchmark/reports'))).filter(path => path.endsWith('.json')).sort().map(path => 'benchmark/reports/' + path);
  for (const path of historicalPaths) {
    if (Buffer.compare(await read(baselineRoot, path), await read(afterRoot, path)) !== 0) fail('Historical report changed: ' + path);
  }
  if (JSON.stringify(await sourcePaths(afterRoot)) !== JSON.stringify(afterFiles) ||
      JSON.stringify(await hashFiles(afterRoot, afterFiles)) !== JSON.stringify(afterHashes) ||
      JSON.stringify(await hashFiles(baselineRoot, baselineFiles)) !== JSON.stringify(baselineHashes)) fail('Engine source changed during measurement');
  const beforeSummary = summarize(contracts(before)), afterSummary = summarize(contracts(after));
  const changedReviewedCases = beforeReviewed.items.flatMap((item, index) => {
    const updated = afterReviewed.items[index];
    if (!item.evaluated || (item.actualTopSha256 === updated.actualTopSha256 &&
        JSON.stringify(item.candidates) === JSON.stringify(updated.candidates))) return [];
    return [{ id: item.id, mode: item.mode, before: item, after: updated }];
  });
  const report = { schemaVersion: 1, reportId: 'loanword-suffixes-001', recordedAt: new Date().toISOString(),
    purpose: 'Exact conformance to four authorized loanword-suffix software contracts and descriptive comparison with frozen source-assisted development references',
    baseline: { gitCommit: baselineCommit, snapshotMethod: 'git archive of immutable src/, package.json and required benchmark files; test directories excluded', sourceFileSha256: baselineHashes },
    after: { identity: 'Suffix implementation measured from this checkout; all source files pinned by hashes without assigning an uncreated commit', sourceFileSha256: afterHashes },
    environment: { nodeVersion: process.version, platform: platform(), architecture: arch(), osRelease: release() },
    options: { digits: 'devanagari', preserveTechnicalText: true, entries: 'starter defaults' },
    linguisticValidation: { path: linguisticReviewPath, sha256: linguisticReviewSha256,
      reviewedAt: linguisticReview.reviewedAt, reviewKind: linguisticReview.reviewKind,
      humanVerified: linguisticReview.humanVerified, independentHumanReview: linguisticReview.independentHumanReview,
      suffixKeyCount: linguisticReview.recommendedSuffixKeyCount, sourceCount: linguisticReview.sources.length,
      scope: linguisticReview.scope,
      derivationBasis: 'Finite productive combinations of reviewed stems and attested grammatical endings; not every generated root+ending combination is separately attested.' },
    fixture: { path: fixturePath, sha256: finalFixtureSha256, total: finalCases.length,
      contractCount: contracts(after).length, exploratoryCount: exploratory(after).length,
      priorFixtureSha256, priorRowCount: priorCases.length, priorByteIdenticalRowCount,
      priorBytesPreserved: false, revisedHistoricalCaseIds,
      revisionScope: 'Only bankma and fileharu expectedTop/expectedCandidates change to the authorized joined loanword forms, with this dated provenance appended. All IDs, inputs, statuses, categories and original provenance prefixes are retained; the other 133 historical rows are byte-identical.',
      newCaseIds: newCases.map(item => item.id) },
    finalContract: { before: beforeSummary, after: afterSummary },
    historicalContract: { before: summarize(contracts(beforeHistorical)), after: summarize(contracts(afterHistorical)), intentionalMismatchCaseIds: revisedHistoricalCaseIds },
    addedSuffixContract: { before: summarize(contracts(before.slice(priorCases.length))), after: summarize(contracts(after.slice(priorCases.length))) },
    exploratory: { before: summarize(exploratory(before)), after: summarize(exploratory(after)), excludedFromGate: true, labelsRemainUnreviewed: true },
    revisedHistoricalCaseResults: revisedHistoricalCaseIds.map(id => {
      const index = priorCases.findIndex(item => item.id === id);
      return { id, input: priorCases[index].input, historicalExpectedTop: priorCases[index].expectedTop,
        historicalExpectedCandidates: priorCases[index].expectedCandidates, revisedExpectedTop: finalCases[index].expectedTop,
        revisedExpectedCandidates: finalCases[index].expectedCandidates,
        beforeAgainstHistorical: view(beforeHistorical[index]), afterAgainstHistorical: view(afterHistorical[index]),
        beforeAgainstRevised: view(before[index]), afterAgainstRevised: view(after[index]) };
    }),
    newCaseResults: newCases.map((item, index) => ({ ...item, before: view(before[priorCases.length + index]), after: view(after[priorCases.length + index]) })),
    frozenSourceReview: { reviewPath, reviewFileSha256: frozenReviewSha256, sourceCasesSha256,
      humanVerified: false, independentHumanReview: false, referencePurpose: 'development',
      before: beforeReviewed.summary, after: afterReviewed.summary, changedCaseResults: changedReviewedCases },
    commands: { beforeFinalFixture: runner(baselineRoot, resolve(afterRoot, fixturePath), beforeSummary),
      afterFinalFixture: runner(afterRoot, resolve(afterRoot, fixturePath), afterSummary) },
    toolFileSha256: { baselineRunner: sha256(await read(baselineRoot, 'benchmark/run.js')),
      ...await hashFiles(afterRoot, ['benchmark/run.js', 'benchmark/measure-loanword-suffixes.js', 'benchmark/source-reviewed.js', 'benchmark/source-reviewed-core.js']) },
    historicalReportSha256: await hashFiles(afterRoot, historicalPaths),
    reproduction: { baselineSnapshot: 'git archive ' + baselineCommit + ' src package.json benchmark/cases.jsonl benchmark/run.js benchmark/reports | tar -x -C <baseline-directory>',
      comparison: 'node benchmark/measure-loanword-suffixes.js <absolute-baseline-directory> --cases <pinned-original-review-cases.jsonl> [--output <new-report.json>]',
      reviewCases: 'Prepare the pinned review-batch-001 cases using docs/package/review-batch.md. No additional external corpus download is needed by this comparison.',
      verification: 'Replay from the archived suffix implementation and verify fixture, review, source and tool hashes. Timestamp, Node/OS details vary by host; the fixture and reference denominators stay fixed.' },
    limits: [
      'Two earlier whole-word-only fallback contracts (bankma/fileharu) intentionally change under the authorized finite suffix policy. Historical and revised contract summaries use different expectations; their difference is not an improvement on unchanged labels.',
      'Four selected software contracts were added from reviewed development failures; they are regression coverage, not independent human or held-out accuracy labels.',
      'The original 100-case review is a development set used to design this change; changes on it cannot establish population accuracy or clean held-out improvement.',
      'Source-assisted spelling references, exclusions and alternatives remain frozen. Full source sentence inputs, references and converter outputs are withheld from public observations; hashes retain exact comparison identity.',
      'Seed scoring uses the default engine only. Custom-entry precedence, finite suffix boundaries, English mode and live editing require their separate functional and browser checks.',
      'Candidate coverage measures only the listed readings; it does not score extra suggestions, every valid spelling or candidate usefulness.',
      'No external test labels, performance timings, competitor comparison or browser compatibility claim are added by this report.',
    ] };
  const serialized = JSON.stringify(report, null, 2) + '\n';
  if (config.output) {
    await writeFile(config.output, serialized, { flag: 'wx' });
    console.log('Loanword suffix contracts: ' + beforeSummary.passed + '/' + beforeSummary.total + ' → ' + afterSummary.passed + '/' + afterSummary.total);
    console.log('Frozen reviewed words: ' + beforeReviewed.summary.word.topMatchesAny + '/' + beforeReviewed.summary.word.total + ' → ' + afterReviewed.summary.word.topMatchesAny + '/' + afterReviewed.summary.word.total);
    console.log('Wrote new report to ' + config.output);
  } else process.stdout.write(serialized);
}
main().catch(error => { console.error('Suffix measurement error: ' + error.message); process.exitCode = 2; });
