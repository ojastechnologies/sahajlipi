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

const baselineCommit = 'cbcd77aae14e1845567e416c29f05658e0fe8e62';
const fixturePath = 'benchmark/cases.jsonl';
const reviewPath = 'benchmark/reports/nepali-source-review-2026-10-01.json';
const linguisticReviewPath = 'benchmark/reports/nepali-spelling-research-2026-10-01.json';
const linguisticReviewSha256 = 'b59d158212030c44a8ed8fa03bf3bd867eafba43d1867a9892b60d8748558099';
const priorFixtureSha256 = 'fde07b59211831c3b8a6c05ebc5a3f1dc6148d0d34b259141932239e9562d0b4';
const finalFixtureSha256 = '89fb755dcbdce6c44e310120445d52faf31b0cfb6f82d72a4f2f38027aa2bcec';
const addedEntries = { halyo: ['हाल्यो'], nabhani: ['नभनी'], gaunle: ['गाउँले'], dindaina: ['दिँदैन'] };
const frozenReviewSha256 = '5d9b36e39481d3f790fed503968f6bc504e71780ba083d8ed214f27ef674d34a';
const sourceCasesSha256 = '2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3';
const baselineSourceHashes = {
  'src/index.js': '315f43b424c19d1e2197d78414a618e59865cf4171255e72f1c6db90b5fb74f4',
  'src/lexicon.js': '27792c7626f6982750101f903030f2866b0338e3b37780dcc4df1b4486f4eb79',
  'src/loanwords.js': 'aa74e688d3b77980b5ee7e9fb89ce2c0a61fd27568d3230048bef91a8379e446',
  'src/phonetic.js': 'dec43061ce47d8456092b661a4b1ea7b5d366d2c7969a4f2b6f3b1b0c20ff1ff',
  'src/text-policy.js': '3df92e5288f8b0a3cd1fff87d6dad2132b5f97c35fd24cebdabb54c2101fc5aa',
};
const afterRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (root, path) => readFile(resolve(root, path));
const parseLines = source => source.toString('utf8').split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line));
const fail = message => { throw new Error(message); };

function options(args) {
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: node benchmark/measure-native-spelling.js <archived-baseline-directory> --cases <pinned-review-cases.jsonl> [--output <new-report.json>]');
    console.log('Run from the archived spelling implementation to reproduce the dated source hashes. Existing reports are never overwritten.');
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
  if (sha256(priorBytes) !== priorFixtureSha256) fail('Baseline fixture does not match immutable cbcd77a');
  if (sha256(finalBytes) !== finalFixtureSha256) fail('Final fixture differs from the dated native spelling snapshot; use the archived spelling implementation');
  if (sha256(reviewBytes) !== frozenReviewSha256 || sha256(originalBytes) !== sourceCasesSha256) fail('Frozen source review or original review batch differs from its pin');
  if (sha256(linguisticBytes) !== linguisticReviewSha256) fail('Native spelling research ledger differs from its frozen pin');
  const linguisticReview = JSON.parse(linguisticBytes);
  const validation = linguisticReview.constructedValidation;
  if (linguisticReview.humanVerified !== false || linguisticReview.independentHumanReview !== false ||
      validation.humanVerified !== false || validation.independentHumanReview !== false ||
      validation.independentHeldOutAccuracy !== false || validation.caseCount !== 11 ||
      !Array.isArray(validation.cases) || validation.cases.length !== 11) fail('Invalid constructed validation metadata');
  const controlIds = new Set();
  const controlCases = validation.cases.map(item => {
    const references = item.referenceOutputs;
    if (!item.id || controlIds.has(item.id) || item.mode !== 'word' || typeof item.input !== 'string' || !item.input ||
        !Array.isArray(references) || references.length !== 1 || typeof references[0] !== 'string' || !references[0] ||
        item.preferredReferenceIndex !== 0 || typeof item.control !== 'string') fail('Invalid constructed validation word');
    controlIds.add(item.id);
    return { id: item.id, status: 'contract', mode: 'word', category: 'constructed-native-control', input: item.input,
      expectedTop: references[0], expectedCandidates: references, provenance: item.romanOrigin };
  });
  if (linguisticReview.targetCount !== 4 || linguisticReview.targets.some(target =>
      JSON.stringify(target.referenceOutputs) !== JSON.stringify(addedEntries[target.input]))) fail('Native target research differs from frozen spelling preferences');
  for (const [path, hash] of Object.entries(baselineSourceHashes)) {
    if (sha256(await read(baselineRoot, path)) !== hash) fail('Baseline engine differs from immutable cbcd77a: ' + path);
  }
  const [priorCases, finalCases, originalCases] = [priorBytes, finalBytes, originalBytes].map(parseLines);
  if (priorCases.length !== 139 || finalCases.length !== 144 || new Set(finalCases.map(item => item.id)).size !== finalCases.length) fail('Unexpected fixture count or repeated ID');
  if (!finalBytes.subarray(0, priorBytes.length).equals(priorBytes)) fail('Historical fixture bytes changed');
  const newCases = finalCases.slice(priorCases.length);
  if (newCases.length !== 5 || newCases.some(item => item.status !== 'contract')) fail('All five native spelling additions must remain contracts');
  const review = JSON.parse(reviewBytes);
  const baselineFiles = await sourcePaths(baselineRoot), afterFiles = await sourcePaths(afterRoot);
  const baselineHashes = await hashFiles(baselineRoot, baselineFiles), afterHashes = await hashFiles(afterRoot, afterFiles);
  const { evaluateSourceReview, publicResults } = await import('./source-reviewed-core.js');
  const beforeApi = await import(pathToFileURL(resolve(baselineRoot, 'src/index.js')));
  const afterApi = await import(pathToFileURL(resolve(afterRoot, 'src/index.js')));
  if (JSON.stringify(baselineFiles) !== JSON.stringify(afterFiles)) fail('Native spelling scope cannot add or remove source files');
  for (const path of baselineFiles.filter(path => path !== 'src/lexicon.js')) {
    if (baselineHashes[path] !== afterHashes[path]) fail('Native spelling scope changed source outside the lexicon: ' + path);
  }
  const { starterEntries: beforeEntries } = await import(pathToFileURL(resolve(baselineRoot, 'src/lexicon.js')));
  const { starterEntries: afterEntries } = await import(pathToFileURL(resolve(afterRoot, 'src/lexicon.js')));
  const newKeys = Object.keys(afterEntries).filter(key => !Object.hasOwn(beforeEntries, key)).sort();
  if (JSON.stringify(newKeys) !== JSON.stringify(Object.keys(addedEntries).sort())) fail('Lexicon changes must add exactly the four reviewed native aliases');
  for (const [key, readings] of Object.entries(beforeEntries)) {
    if (JSON.stringify(afterEntries[key]) !== JSON.stringify(readings)) fail('Previous lexicon readings changed: ' + key);
  }
  for (const [key, readings] of Object.entries(addedEntries)) {
    if (JSON.stringify(afterEntries[key]) !== JSON.stringify(readings)) fail('Reviewed native alias differs from its literal contract: ' + key);
  }
  const before = evaluate(finalCases, beforeApi), after = evaluate(finalCases, afterApi);
  const beforeHistorical = evaluate(priorCases, beforeApi), afterHistorical = evaluate(priorCases, afterApi);
  const beforeControls = evaluate(controlCases, beforeApi), afterControls = evaluate(controlCases, afterApi);
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
  const report = { schemaVersion: 1, reportId: 'nepali-spelling-2026-10-01', recordedAt: new Date().toISOString(),
    purpose: 'Exact conformance to four reviewed native spelling aliases and one synthetic text integration contract, with descriptive comparison against frozen source-assisted development references',
    baseline: { gitCommit: baselineCommit, snapshotMethod: 'git archive of immutable src/, package.json and required benchmark files; test directories excluded', sourceFileSha256: baselineHashes },
    after: { identity: 'Native spelling implementation measured from this checkout; all src files pinned by hashes. Publishing metadata changes in package.json do not define or invalidate this core source identity.', sourceFileSha256: afterHashes },
    environment: { nodeVersion: process.version, platform: platform(), architecture: arch(), osRelease: release() },
    options: { digits: 'devanagari', preserveTechnicalText: true, entries: 'starter defaults' },
    implementationScope: { changedRuntimeSourceFiles: ['src/lexicon.js'],
      addedEntries, priorEntryCount: Object.keys(beforeEntries).length, afterEntryCount: Object.keys(afterEntries).length,
      allPriorReadingArraysPreserved: true, allOtherSrcFilesByteIdentical: true,
      publishingMetadataOutsideCoreIdentity: true },
    linguisticValidation: { path: linguisticReviewPath, sha256: linguisticReviewSha256,
      reviewedAt: linguisticReview.reviewedAt, recordedAtUTC: linguisticReview.recordedAtUTC,
      reviewKind: linguisticReview.reviewKind, humanVerified: linguisticReview.humanVerified,
      independentHumanReview: linguisticReview.independentHumanReview, targetCount: linguisticReview.targetCount,
      sourceCount: linguisticReview.sources.length, scope: linguisticReview.scope },
    constructedValidation: { purpose: validation.purpose, frozenAtUTC: validation.frozenAtUTC,
      frozenControlFileSha256: validation.sha256, controlsEmbeddedInPinnedResearchLedger: true,
      humanVerified: false, independentHumanReview: false, independentHeldOutAccuracy: false,
      constructedRomanKeys: true, populationRepresentative: false,
      scope: validation.scope, before: summarize(beforeControls), after: summarize(afterControls),
      caseResults: controlCases.map((item, index) => ({ id: item.id, input: item.input,
        referenceOutputs: item.expectedCandidates, control: validation.cases[index].control,
        sourceIds: validation.cases[index].sourceIds, sourceLocator: validation.cases[index].sourceLocator,
        before: view(beforeControls[index]), after: view(afterControls[index]) })) },
    fixture: { path: fixturePath, sha256: finalFixtureSha256, total: finalCases.length,
      contractCount: contracts(after).length, exploratoryCount: exploratory(after).length,
      priorFixtureSha256, priorRowCount: priorCases.length, priorByteIdenticalRowCount: priorCases.length,
      priorBytesPreserved: true,
      newCaseIds: newCases.map(item => item.id) },
    finalContract: { before: beforeSummary, after: afterSummary },
    historicalContract: { before: summarize(contracts(beforeHistorical)), after: summarize(contracts(afterHistorical)) },
    addedSpellingContract: { before: summarize(contracts(before.slice(priorCases.length))), after: summarize(contracts(after.slice(priorCases.length))) },
    exploratory: { before: summarize(exploratory(before)), after: summarize(exploratory(after)), excludedFromGate: true, labelsRemainUnreviewed: true },
    newCaseResults: newCases.map((item, index) => ({ ...item, before: view(before[priorCases.length + index]), after: view(after[priorCases.length + index]) })),
    frozenSourceReview: { reviewPath, reviewFileSha256: frozenReviewSha256, sourceCasesSha256,
      humanVerified: false, independentHumanReview: false, referencePurpose: 'development',
      before: beforeReviewed.summary, after: afterReviewed.summary, changedCaseResults: changedReviewedCases },
    commands: { beforeFinalFixture: runner(baselineRoot, resolve(afterRoot, fixturePath), beforeSummary),
      afterFinalFixture: runner(afterRoot, resolve(afterRoot, fixturePath), afterSummary) },
    toolFileSha256: { baselineRunner: sha256(await read(baselineRoot, 'benchmark/run.js')),
      ...await hashFiles(afterRoot, ['benchmark/run.js', 'benchmark/measure-native-spelling.js', 'benchmark/source-reviewed.js', 'benchmark/source-reviewed-core.js']) },
    historicalReportSha256: await hashFiles(afterRoot, historicalPaths),
    reproduction: { baselineSnapshot: 'git archive ' + baselineCommit + ' src package.json benchmark/cases.jsonl benchmark/run.js benchmark/reports | tar -x -C <baseline-directory>',
      comparison: 'node benchmark/measure-native-spelling.js <absolute-baseline-directory> --cases <pinned-original-review-cases.jsonl> [--output <new-report.json>]',
      reviewCases: 'Prepare the pinned review-batch-001 cases using docs/package/review-batch.md. No additional external corpus download is needed by this comparison.',
      verification: 'Replay from the archived spelling implementation and verify fixture, review, source and tool hashes. Timestamp, Node/OS details vary by host; the fixture and reference denominators stay fixed.' },
    limits: [
      'Four reviewed literal spelling aliases and one synthetic text contract were added from development failures; they are regression coverage, not independent human or held-out accuracy labels.',
      'The original 100-case review is a development set used to design this change; changes on it cannot establish population accuracy or clean held-out improvement.',
      'Source-assisted spelling references, exclusions and alternatives remain frozen. Full source sentence inputs, references and converter outputs are withheld from public observations; hashes retain exact comparison identity.',
      'Seed scoring uses the default engine only. Custom-entry precedence, unrelated vowel/nasal spellings, English mode and live editing require their separate functional and browser checks.',
      'Candidate coverage measures only the listed readings; it does not score extra suggestions, every valid spelling or candidate usefulness.',
      'The eleven source-attested control words have assistant-constructed Roman keys selected after design. They are conformance checks against explicit typing rules, not collected natural typing, representative vocabulary or independent held-out language accuracy.',
      'Only four complete native spelling aliases are added. No general phonetic, vowel/nasal rewrite or loanword morphology change is measured by this record.',
      'Package version, private/publishing metadata and later documentation changes are outside the pinned core source hash scope. Replaying uses module-type package.json to import the source, without using its version as engine identity.',
      'No external test labels, performance timings, competitor comparison or browser compatibility claim are added by this report.',
    ] };
  const serialized = JSON.stringify(report, null, 2) + '\n';
  if (config.output) {
    await writeFile(config.output, serialized, { flag: 'wx' });
    console.log('Native spelling contracts: ' + beforeSummary.passed + '/' + beforeSummary.total + ' → ' + afterSummary.passed + '/' + afterSummary.total);
    console.log('Frozen reviewed words: ' + beforeReviewed.summary.word.topMatchesAny + '/' + beforeReviewed.summary.word.total + ' → ' + afterReviewed.summary.word.topMatchesAny + '/' + afterReviewed.summary.word.total);
    console.log('Constructed after-design controls: ' + summarize(beforeControls).passed + '/' + controlCases.length + ' → ' + summarize(afterControls).passed + '/' + controlCases.length);
    console.log('Wrote new report to ' + config.output);
  } else process.stdout.write(serialized);
}
main().catch(error => { console.error('Native spelling measurement error: ' + error.message); process.exitCode = 2; });
