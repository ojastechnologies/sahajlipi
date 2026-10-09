#!/usr/bin/env node

// Dated comparison: immutable alpha.2 and this checkout use identical inputs.
import { createHash } from 'node:crypto';
import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import { arch, platform, release } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { evaluateSourceReview, publicResults } from './source-reviewed-core.js';

const baselineCommit = '48a0321bed417b1e995f66adbcbf9ade2c82f1cf';
const fixturePath = 'benchmark/cases.jsonl';
const reviewPath = 'benchmark/reports/nepali-source-review-2026-10-01.json';
const researchPath = 'benchmark/reports/nepali-spelling-research-2026-10-09.json';
const fixturePin = '1e20e12e1287243ab3958546b9c76a5fbd8a883b91a1f393a42a2320fbfb82ef';
const reviewPin = '5d9b36e39481d3f790fed503968f6bc504e71780ba083d8ed214f27ef674d34a';
const casesPin = '2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3';
const reportsPin = '156b33b02e75805f7ed62709b72f2cdf99595138ff3f034988c4ddb190757cde';
const sourcePins = {
  'src/dom.d.ts': 'e2a93a70c49c7057dc52d995719ec5b22ee72453685bc519815bc0c67d85b0d1',
  'src/dom.js': 'a264f11888f8a611d116a065fa10191aec029fcce75ee7e797c3dad4342fb9ac',
  'src/index.d.ts': '7b8c9969df0326e6b3fbfbd97713b60cb38931840c1da696b6fea6ac52d5d77a',
  'src/index.js': '01f3fb9fc0fb8f60617d5af81e96ef7c8752fdada3ef5153a89dbe22577b1152',
  'src/lexicon.js': 'e325edef9cd9e2ebef42700ef9aeb6033b130e9a7c459b407820c31297d9448d',
  'src/loanwords.js': 'aa74e688d3b77980b5ee7e9fb89ce2c0a61fd27568d3230048bef91a8379e446',
  'src/phonetic.js': 'ac571d6f4c94c5b48baa1558973d4d27ad6c7f2c5ff15fc7bed36ecdb2d29bf9',
  'src/text-policy.js': '3df92e5288f8b0a3cd1fff87d6dad2132b5f97c35fd24cebdabb54c2101fc5aa',
};
const addedEntries = {
  imandar: ['इमान्दार'], sarasar: ['सरासर'], sakos: ['सकोस्'], kathanak: ['कथानक'],
  arambha: ['आरम्भ'], ekadhik: ['एकाधिक'], jaghanya: ['जघन्य'], pukar: ['पुकार'],
  niskanda: ['निस्कँदा'], bora: ['बोरा'], utthan: ['उत्थान'], samanjasya: ['सामञ्जस्य'],
  bhagna: ['भग्न', 'भाग्न'],
};
const afterRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = value => createHash('sha256').update(value).digest('hex');
const fail = message => { throw new Error(message); };
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const read = (root, path) => readFile(resolve(root, path));
const hashFiles = async (root, paths) => Object.fromEntries(await Promise.all(paths.map(async path => [path, sha256(await read(root, path))])));
const parseLines = bytes => bytes.toString('utf8').split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line));
const engineOptions = { digits: 'devanagari', preserveTechnicalText: true, consonantMode: 'full' };

function parseArgs(args) {
  if (same(args, ['--help'])) {
    console.log('Usage: node benchmark/measure-reviewed-spelling.js <alpha2-baseline-directory> --cases <pinned-original-cases.jsonl> --output <new-report.json>');
    return null;
  }
  const baseline = args.shift();
  if (!baseline || baseline.startsWith('--')) fail('An archived alpha.2 baseline directory is required');
  const config = { baselineRoot: resolve(baseline) };
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    if (!['--cases', '--output'].includes(flag) || !args[index + 1] || args[index + 1].startsWith('--') || config[flag.slice(2)]) {
      fail('Unknown, incomplete or repeated argument: ' + flag);
    }
    config[flag.slice(2)] = resolve(args[index + 1]);
  }
  if (!config.cases || !config.output) fail('--cases and --output are required');
  return config;
}

async function sourceFiles(root) {
  const entries = await readdir(resolve(root, 'src'), { withFileTypes: true });
  if (entries.some(entry => !entry.isFile())) fail('Unexpected directory or link in src');
  return entries.map(entry => 'src/' + entry.name).sort();
}

function seedResults(cases, engine) {
  const ids = new Set();
  return cases.map(item => {
    if (!item.id || ids.has(item.id) || !['word', 'text'].includes(item.mode) ||
        !['contract', 'exploratory'].includes(item.status) || typeof item.input !== 'string' ||
        typeof item.expectedTop !== 'string' || (item.mode === 'word' &&
        (!Array.isArray(item.expectedCandidates) || !item.expectedCandidates.length ||
        !item.expectedCandidates.includes(item.expectedTop)))) fail('Invalid or duplicate seed case');
    ids.add(item.id);
    const result = item.mode === 'word' ? engine.convertWord(item.input) : { text: engine.convertText(item.input), candidates: [] };
    const topMatch = result.text === item.expectedTop;
    const candidateHits = item.mode === 'word' ? item.expectedCandidates.filter(value => result.candidates.includes(value)).length : 0;
    return { ...item, actualTop: result.text, candidates: result.candidates, topMatch, candidateHits,
      pass: topMatch && (item.mode !== 'word' || candidateHits === item.expectedCandidates.length) };
  });
}

function seedSummary(items) {
  const words = items.filter(item => item.mode === 'word');
  const texts = items.filter(item => item.mode === 'text');
  return { passed: items.filter(item => item.pass).length, total: items.length,
    wordTop: words.filter(item => item.topMatch).length, wordTotal: words.length,
    candidateHits: words.reduce((sum, item) => sum + item.candidateHits, 0),
    candidateTotal: words.reduce((sum, item) => sum + item.expectedCandidates.length, 0),
    textTop: texts.filter(item => item.topMatch).length, textTotal: texts.length,
    mismatchCaseIds: items.filter(item => !item.pass).map(item => item.id) };
}

function validateResearch(research, review) {
  if (research.schemaVersion !== 1 || research.reviewKind !== 'source-assisted-project-spelling-preferences' ||
      research.humanVerified !== false || research.independentHumanReview !== false ||
      !Array.isArray(research.targets) || research.targets.length !== Object.keys(addedEntries).length ||
      !Array.isArray(research.implementationEntries) || research.implementationEntries.length !== Object.keys(addedEntries).length) {
    fail('Research ledger must retain honest source-assisted, nonhuman provenance');
  }
  const implementation = Object.fromEntries(research.implementationEntries.map(item => [item.input, item.outputs]));
  if (!same(Object.keys(implementation).sort(), Object.keys(addedEntries).sort()) ||
      Object.entries(addedEntries).some(([key, readings]) => !same(implementation[key], readings))) {
    fail('Research implementation entries differ from the thirteen project preferences');
  }
  const seen = new Set();
  for (const target of research.targets) {
    const record = review.cases.find(item => item.id === target.sourceReviewCaseId);
    if (seen.has(target.input) || !Object.hasOwn(addedEntries, target.input) || !record || record.mode !== 'word' ||
        !['accept', 'correct'].includes(record.decision) || record.input !== target.input ||
        !same(record.referenceOutputs, target.referenceOutputs) ||
        target.preferredReferenceIndex !== record.preferredReferenceIndex ||
        target.sourceReviewReviewedAt !== record.reviewedAt ||
        !Array.isArray(target.evidence) || !target.evidence.length) fail('Research target differs from frozen references: ' + target.input);
    seen.add(target.input);
    for (const evidence of target.evidence) {
      let url;
      try { url = new URL(evidence.url); } catch { fail('Invalid research evidence URL'); }
      if (!['https:', 'http:'].includes(url.protocol) || typeof evidence.title !== 'string' || !evidence.title.trim()) fail('Invalid research evidence');
    }
  }
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  if (!config) return;
  try { await access(config.output); fail('Output already exists; measurements cannot overwrite reports'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const { baselineRoot } = config;
  const paths = Object.keys(sourcePins);
  if (!same(await sourceFiles(baselineRoot), paths) || !same(await sourceFiles(afterRoot), paths)) fail('Source file inventory differs from the eight alpha.2 files');
  const [baselineHashes, afterHashes] = await Promise.all([hashFiles(baselineRoot, paths), hashFiles(afterRoot, paths)]);
  for (const path of paths) {
    if (baselineHashes[path] !== sourcePins[path]) fail('Baseline source differs from immutable alpha.2: ' + path);
    if (path !== 'src/lexicon.js' && afterHashes[path] !== baselineHashes[path]) fail('Spelling scope changed source outside the lexicon: ' + path);
  }
  const [priorBytes, finalBytes] = await Promise.all([read(baselineRoot, fixturePath), read(afterRoot, fixturePath)]);
  if (sha256(priorBytes) !== fixturePin) fail('Baseline seed fixture differs from immutable alpha.2');
  if (!finalBytes.subarray(0, priorBytes.length).equals(priorBytes)) fail('Historical fixture bytes changed; additions must preserve the original prefix');
  const historicalPaths = (await readdir(resolve(baselineRoot, 'benchmark/reports'))).filter(path => path.endsWith('.json')).sort().map(path => 'benchmark/reports/' + path);
  const historicalHashes = await hashFiles(baselineRoot, historicalPaths);
  if (sha256(JSON.stringify(historicalHashes)) !== reportsPin) fail('Baseline historical reports differ from immutable alpha.2');
  if (!same(historicalHashes, await hashFiles(afterRoot, historicalPaths))) fail('Historical report bytes changed');
  const [reviewBytes, researchBytes] = await Promise.all([read(afterRoot, reviewPath), read(afterRoot, researchPath)]);
  if (sha256(reviewBytes) !== reviewPin) fail('Frozen source review differs from its pin');
  const review = JSON.parse(reviewBytes), research = JSON.parse(researchBytes);
  validateResearch(research, review);
  const originalBytes = await readFile(config.cases);
  if (sha256(originalBytes) !== casesPin) fail('Complete original review batch differs from its frozen pin');
  const [beforeModule, afterModule, beforeLexicon, afterLexicon] = await Promise.all([
    import(pathToFileURL(resolve(baselineRoot, 'src/index.js'))), import(pathToFileURL(resolve(afterRoot, 'src/index.js'))),
    import(pathToFileURL(resolve(baselineRoot, 'src/lexicon.js'))), import(pathToFileURL(resolve(afterRoot, 'src/lexicon.js'))),
  ]);
  const beforeEntries = beforeLexicon.starterEntries, afterEntries = afterLexicon.starterEntries;
  const newKeys = Object.keys(afterEntries).filter(key => !Object.hasOwn(beforeEntries, key)).sort();
  if (!same(newKeys, Object.keys(addedEntries).sort())) fail('Lexicon must add exactly the thirteen reviewed aliases');
  for (const [key, readings] of Object.entries(beforeEntries)) {
    if (!same(readings, afterEntries[key])) fail('Previous lexicon readings changed: ' + key);
  }
  for (const [key, readings] of Object.entries(addedEntries)) {
    if (!same(readings, afterEntries[key])) fail('Reviewed alias differs from its literal contract: ' + key);
  }
  const priorCases = parseLines(priorBytes), finalCases = parseLines(finalBytes), originalCases = parseLines(originalBytes);
  const beforeEngine = beforeModule.createEngine(engineOptions), afterEngine = afterModule.createEngine(engineOptions);
  const beforeSeed = seedResults(finalCases, beforeEngine), afterSeed = seedResults(finalCases, afterEngine);
  const contracts = items => items.filter(item => item.status === 'contract');
  const exploratory = items => items.filter(item => item.status === 'exploratory');
  const newCases = finalCases.slice(priorCases.length);
  if (contracts(priorCases).length !== 160 || !newCases.length || newCases.some(item => item.status !== 'contract')) fail('Expected historical 160 contracts and appended spelling contracts');
  const newWords = newCases.filter(item => item.mode === 'word');
  if (!same(newWords.map(item => item.input).sort(), Object.keys(addedEntries).sort()) ||
      newWords.some(item => item.expectedTop !== addedEntries[item.input][0] || !same(item.expectedCandidates, addedEntries[item.input])) ||
      newCases.filter(item => item.mode === 'text').length !== 1) fail('Appended contracts must cover the thirteen literal aliases and one synthetic text');
  const beforeHistorical = seedSummary(contracts(beforeSeed.slice(0, priorCases.length)));
  const afterHistorical = seedSummary(contracts(afterSeed.slice(0, priorCases.length)));
  const beforeFinal = seedSummary(contracts(beforeSeed)), afterFinal = seedSummary(contracts(afterSeed));
  if (beforeHistorical.passed !== beforeHistorical.total || afterFinal.passed !== afterFinal.total) fail('Historical or final seed contracts failed; no measurement published');
  const beforeReviewed = publicResults(evaluateSourceReview(originalCases, review, beforeEngine));
  const afterReviewed = publicResults(evaluateSourceReview(originalCases, review, afterEngine));
  const changedCaseResults = beforeReviewed.items.flatMap((item, index) => {
    const updated = afterReviewed.items[index];
    return same(item, updated) ? [] : [{ id: item.id, mode: item.mode, before: item, after: updated }];
  });
  const report = {
    schemaVersion: 1, reportId: 'nepali-spelling-2026-10-09', recordedAt: new Date().toISOString(),
    purpose: 'Descriptive development comparison of thirteen project spelling aliases against frozen source-assisted references',
    baseline: { gitCommit: baselineCommit, sourceFileSha256: baselineHashes },
    after: { sourceFileSha256: afterHashes },
    environment: { nodeVersion: process.version, platform: platform(), architecture: arch(), osRelease: release() },
    options: { ...engineOptions, entries: 'starter defaults' },
    implementationScope: { changedRuntimeSourceFiles: paths.filter(path => baselineHashes[path] !== afterHashes[path]),
      addedEntries, priorEntryCount: Object.keys(beforeEntries).length, afterEntryCount: Object.keys(afterEntries).length,
      allPriorReadingArraysPreserved: true, allOtherSrcFilesByteIdentical: true },
    research: { path: researchPath, sha256: sha256(researchBytes), reviewKind: research.reviewKind,
      humanVerified: false, independentHumanReview: false, targetCount: research.targets.length },
    fixture: { path: fixturePath, sha256: sha256(finalBytes), total: finalCases.length,
      priorFixtureSha256: fixturePin, priorRowCount: priorCases.length, priorBytesPreserved: true,
      contractCount: contracts(finalCases).length, exploratoryCount: exploratory(finalCases).length,
      newCaseIds: newCases.map(item => item.id) },
    finalContract: { before: beforeFinal, after: afterFinal },
    historicalContract: { before: beforeHistorical, after: afterHistorical },
    addedSpellingContract: { before: seedSummary(beforeSeed.slice(priorCases.length)), after: seedSummary(afterSeed.slice(priorCases.length)) },
    exploratory: { before: seedSummary(exploratory(beforeSeed)), after: seedSummary(exploratory(afterSeed)), excludedFromGate: true },
    frozenSourceReview: { reviewPath, reviewFileSha256: reviewPin, sourceCasesSha256: casesPin,
      humanVerified: false, independentHumanReview: false, referencePurpose: 'development',
      before: beforeReviewed.summary, after: afterReviewed.summary, changedCaseResults,
      beforeResults: beforeReviewed.items, afterResults: afterReviewed.items,
      remainingTopMismatchCaseIds: afterReviewed.items.filter(item => item.evaluated && !item.topMatchesAny).map(item => item.id),
      remainingCandidateMismatchCaseIds: afterReviewed.items.filter(item => item.mode === 'word' && item.evaluated && item.referenceCandidatesMatched < item.references.length).map(item => item.id) },
    historicalReports: { allByteIdentical: true, fileSha256: historicalHashes, manifestSha256: reportsPin },
    toolFileSha256: await hashFiles(afterRoot, ['benchmark/measure-reviewed-spelling.js', 'benchmark/source-reviewed-core.js', 'benchmark/run.js']),
    reproduction: {
      baselineSnapshot: 'git archive ' + baselineCommit + ' src package.json benchmark/cases.jsonl benchmark/run.js benchmark/reports | tar -x -C <baseline-directory>',
      comparison: 'node benchmark/measure-reviewed-spelling.js <baseline-directory> --cases <pinned-original-review-cases.jsonl> --output <new-report.json>',
      measurement: 'Both engines use the same final seed fixtures and complete original review batch. Sources, inputs, research, tools and historical reports are identified by SHA-256.' },
    limits: [
      'These development references informed the aliases; improvements are not independent human review, held-out accuracy or population accuracy.',
      'Complete source sentence inputs, references and converter outputs are withheld; public results retain exact output hashes.',
      'Candidate coverage scores only the listed references. Additional valid readings and candidate usefulness are unscored.',
      'The preferred bhagna order is a project preference. The frozen review has two admitted readings and no preferred reference.',
      'Seed contracts validate configured typing behavior. Browser compatibility, collected natural typing and external test labels are outside this measurement.' ],
  };
  if (!same(await sourceFiles(afterRoot), paths) || !same(await sourceFiles(baselineRoot), paths) ||
      !same(await hashFiles(afterRoot, paths), afterHashes) || !same(await hashFiles(baselineRoot, paths), baselineHashes) ||
      !same(await hashFiles(afterRoot, historicalPaths), historicalHashes) || !same(await hashFiles(baselineRoot, historicalPaths), historicalHashes) ||
      !(await read(baselineRoot, fixturePath)).equals(priorBytes) || !(await read(afterRoot, fixturePath)).equals(finalBytes) ||
      !(await read(afterRoot, reviewPath)).equals(reviewBytes) || !(await read(afterRoot, researchPath)).equals(researchBytes) ||
      !(await readFile(config.cases)).equals(originalBytes)) fail('Measurement inputs changed during evaluation');
  await writeFile(config.output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  const before = beforeReviewed.summary, after = afterReviewed.summary;
  console.log('Reviewed word top: ' + before.word.topMatchesAny + '/' + before.word.total + ' -> ' + after.word.topMatchesAny + '/' + after.word.total);
  console.log('Listed reference candidate coverage: ' + before.word.referenceCandidatesMatched + '/' + before.word.referenceCandidatesTotal + ' -> ' + after.word.referenceCandidatesMatched + '/' + after.word.referenceCandidatesTotal);
  console.log('Reviewed complete sentence top: ' + before.text.topMatchesAny + '/' + before.text.total + ' -> ' + after.text.topMatchesAny + '/' + after.text.total);
  console.log('Final seed contracts: ' + beforeFinal.passed + '/' + beforeFinal.total + ' -> ' + afterFinal.passed + '/' + afterFinal.total);
  console.log('Wrote new development comparison to ' + config.output);
}

main().catch(error => { console.error('Reviewed spelling measurement error: ' + error.message); process.exitCode = 2; });
