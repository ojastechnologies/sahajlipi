#!/usr/bin/env node

// Dated, descriptive comparison using identical fixtures and frozen references.
import { createHash } from 'node:crypto';
import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import { arch, platform, release } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { evaluateSourceReview, publicResults } from './source-reviewed-core.js';

const baselineCommit = '5baaad071a5a673c756eb48e2f7523a05c3295fd';
const fixturePath = 'benchmark/cases.jsonl';
const reviewPath = 'benchmark/reports/nepali-source-review-2026-10-01.json';
const researchPath = 'benchmark/reports/native-forms-research-2026-10-09.json';
const fixturePin = '75aaa25d90d1b0d6ed7193698b55621eae98fcab88a225be9f3f4af0527e50f1';
const reviewPin = '5d9b36e39481d3f790fed503968f6bc504e71780ba083d8ed214f27ef674d34a';
const researchPin = 'a1b0e2500b8d7a7883c767bc523932aa96d78290314cd88996e1102497ee928c';
const casesPin = '2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3';
const reportsPin = '77f6acba385826f1ff7bfb987d24a07fcdc90a51f2351f563c741fa4a8da1e4b';
const packagePin = 'ad512b50f43f2fc186511252a65a662b0720a7dca3b0dfecd7a35a29fbbcf324';
const finalLexiconPin = 'b51f5e7bebc3cea321361962a5b31ee84865e27d16c5b0e8e795d206c7d8082d';
const sourcePins = {
  'src/dom.d.ts': 'e2a93a70c49c7057dc52d995719ec5b22ee72453685bc519815bc0c67d85b0d1',
  'src/dom.js': 'a264f11888f8a611d116a065fa10191aec029fcce75ee7e797c3dad4342fb9ac',
  'src/index.d.ts': '7b8c9969df0326e6b3fbfbd97713b60cb38931840c1da696b6fea6ac52d5d77a',
  'src/index.js': '01f3fb9fc0fb8f60617d5af81e96ef7c8752fdada3ef5153a89dbe22577b1152',
  'src/lexicon.js': '909b157d2e5601a24c8a7c27386524c0572dd7c29488ed2f135d24ff60573c78',
  'src/loanwords.js': 'aa74e688d3b77980b5ee7e9fb89ce2c0a61fd27568d3230048bef91a8379e446',
  'src/phonetic.js': 'ac571d6f4c94c5b48baa1558973d4d27ad6c7f2c5ff15fc7bed36ecdb2d29bf9',
  'src/text-policy.js': '3df92e5288f8b0a3cd1fff87d6dad2132b5f97c35fd24cebdabb54c2101fc5aa',
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
    console.log('Usage: node benchmark/measure-native-forms.js <before-source-directory> --cases <pinned-original-cases.jsonl> --output <new-report.json>');
    return null;
  }
  const baseline = args.shift();
  if (!baseline || baseline.startsWith('--')) fail('An archived pre-batch baseline directory is required');
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
    if (typeof item.id !== 'string' || !/^[a-z0-9-]+$/.test(item.id) || ids.has(item.id) ||
        !['word', 'text'].includes(item.mode) || !['contract', 'exploratory'].includes(item.status) ||
        ['category', 'input', 'expectedTop', 'provenance'].some(key => typeof item[key] !== 'string' || !item[key].trim()) ||
        (item.mode === 'word' && (!Array.isArray(item.expectedCandidates) || !item.expectedCandidates.length ||
          item.expectedCandidates.some(value => typeof value !== 'string' || !value.trim()) ||
          new Set(item.expectedCandidates).size !== item.expectedCandidates.length || !item.expectedCandidates.includes(item.expectedTop))) ||
        (item.mode === 'text' && item.expectedCandidates !== undefined)) fail('Invalid or duplicate seed case');
    ids.add(item.id);
    const result = item.mode === 'word' ? engine.convertWord(item.input) : { text: engine.convertText(item.input), candidates: [] };
    const topMatch = result.text === item.expectedTop;
    const candidateHits = item.mode === 'word' ? item.expectedCandidates.filter(value => result.candidates.includes(value)).length : 0;
    return { ...item, actualTop: result.text, candidates: result.candidates, topMatch, candidateHits,
      pass: topMatch && (item.mode !== 'word' || candidateHits === item.expectedCandidates.length) };
  });
}

function seedSummary(items) {
  const words = items.filter(item => item.mode === 'word'), texts = items.filter(item => item.mode === 'text');
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
      research.baselineRuntimeCommit !== baselineCommit || research.frozenReviewPath !== reviewPath ||
      research.frozenReviewSha256 !== reviewPin || research.originalCasesSha256 !== casesPin ||
      !same(research.summary, { reviewedWordCases: 46, implementationKeys: 34, deferredKeys: 12 }) ||
      !Array.isArray(research.implementationEntries) || research.implementationEntries.length !== 34 ||
      !Array.isArray(research.cases) || research.cases.length !== 46) fail('Research ledger scope or nonhuman provenance differs from the frozen batch');
  const entries = Object.fromEntries(research.implementationEntries.map(item => [item.input, item.outputs]));
  if (Object.keys(entries).length !== 34 || Object.entries(entries).some(([key, values]) =>
    !/^[a-z]+$/.test(key) || !Array.isArray(values) || !values.length || values.some(value => typeof value !== 'string' || !value) ||
    new Set(values).size !== values.length)) fail('Invalid research implementation entries');
  const seen = new Set();
  for (const target of research.cases) {
    const record = review.cases.find(item => item.id === target.sourceReviewCaseId);
    if (seen.has(target.input) || !record || record.mode !== 'word' || !['accept', 'correct'].includes(record.decision) ||
        record.input !== target.input || !same(record.referenceOutputs, target.referenceOutputs) ||
        record.preferredReferenceIndex !== target.preferredReferenceIndex || record.reviewedAt !== target.sourceReviewReviewedAt ||
        !['implement', 'defer'].includes(target.decision) || !Array.isArray(target.evidence)) fail('Research target differs from frozen references: ' + target.input);
    seen.add(target.input);
    if (target.decision === 'implement' && (!Object.hasOwn(entries, target.input) ||
        !same(entries[target.input], target.implementationOutputs) || !target.evidence.length ||
        entries[target.input].some(value => !target.referenceOutputs.includes(value)))) fail('Implementation lacks its admitted reference: ' + target.input);
    if (target.decision === 'defer' && (Object.hasOwn(entries, target.input) || target.implementationOutputs.length)) fail('Deferred input cannot be added: ' + target.input);
    for (const evidence of target.evidence) {
      let url;
      try { url = new URL(evidence.url); } catch { fail('Invalid research evidence URL'); }
      if (!['https:', 'http:'].includes(url.protocol) || typeof evidence.title !== 'string' || !evidence.title.trim()) fail('Invalid research evidence');
    }
  }
  if (research.cases.filter(item => item.decision === 'implement').length !== 34 ||
      research.cases.filter(item => item.decision === 'defer').length !== 12) fail('Research decision counts differ from the frozen scope');
  return entries;
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  if (!config) return;
  try { await access(config.output); fail('Output already exists; measurements cannot overwrite reports'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const { baselineRoot } = config, paths = Object.keys(sourcePins);
  if (!same(await sourceFiles(baselineRoot), paths) || !same(await sourceFiles(afterRoot), paths)) fail('Source file inventory differs from the eight pinned files');
  const [baselineHashes, afterHashes] = await Promise.all([hashFiles(baselineRoot, paths), hashFiles(afterRoot, paths)]);
  for (const path of paths) {
    if (baselineHashes[path] !== sourcePins[path]) fail('Baseline source differs from immutable pre-batch snapshot: ' + path);
    if (path !== 'src/lexicon.js' && afterHashes[path] !== baselineHashes[path]) fail('Native-form scope changed source outside the lexicon: ' + path);
  }
  if (afterHashes['src/lexicon.js'] !== finalLexiconPin) fail('Final lexicon differs from the measured native-form batch');
  const [priorBytes, finalBytes, baselinePackage, afterPackage] = await Promise.all([
    read(baselineRoot, fixturePath), read(afterRoot, fixturePath), read(baselineRoot, 'package.json'), read(afterRoot, 'package.json'),
  ]);
  if (sha256(baselinePackage) !== packagePin) fail('Baseline package differs from immutable pre-batch snapshot');
  if (sha256(priorBytes) !== fixturePin) fail('Baseline seed fixture differs from immutable pre-batch snapshot');
  if (!finalBytes.subarray(0, priorBytes.length).equals(priorBytes)) fail('Historical fixture bytes changed; additions must preserve the original prefix');
  const historicalPaths = (await readdir(resolve(baselineRoot, 'benchmark/reports'))).filter(path => path.endsWith('.json')).sort().map(path => 'benchmark/reports/' + path);
  const historicalHashes = await hashFiles(baselineRoot, historicalPaths);
  if (historicalPaths.length !== 19 || sha256(JSON.stringify(historicalHashes)) !== reportsPin) fail('Baseline historical reports differ from immutable pre-batch snapshot');
  if (!same(historicalHashes, await hashFiles(afterRoot, historicalPaths))) fail('Historical report bytes changed');
  const [reviewBytes, researchBytes, originalBytes] = await Promise.all([read(afterRoot, reviewPath), read(afterRoot, researchPath), readFile(config.cases)]);
  if (sha256(reviewBytes) !== reviewPin) fail('Frozen source review differs from its pin');
  if (sha256(researchBytes) !== researchPin) fail('Frozen native-form research differs from its pin');
  const review = JSON.parse(reviewBytes), research = JSON.parse(researchBytes), addedEntries = validateResearch(research, review);
  if (sha256(originalBytes) !== casesPin) fail('Complete original review batch differs from its frozen pin');
  const [beforeModule, afterModule, beforeLexicon, afterLexicon] = await Promise.all([
    import(pathToFileURL(resolve(baselineRoot, 'src/index.js'))), import(pathToFileURL(resolve(afterRoot, 'src/index.js'))),
    import(pathToFileURL(resolve(baselineRoot, 'src/lexicon.js'))), import(pathToFileURL(resolve(afterRoot, 'src/lexicon.js'))),
  ]);
  const beforeEntries = beforeLexicon.starterEntries, afterEntries = afterLexicon.starterEntries;
  if (Object.keys(beforeEntries).length !== 177 || Object.keys(afterEntries).length !== 211) fail('Unexpected prior or final lexicon entry count');
  const newKeys = Object.keys(afterEntries).filter(key => !Object.hasOwn(beforeEntries, key)).sort();
  if (!same(newKeys, Object.keys(addedEntries).sort())) fail('Lexicon must add exactly the thirty-four frozen aliases');
  for (const [key, readings] of Object.entries(beforeEntries)) {
    if (!same(readings, afterEntries[key])) fail('Previous lexicon readings changed: ' + key);
  }
  for (const [key, readings] of Object.entries(addedEntries)) {
    if (!same(readings, afterEntries[key])) fail('Reviewed alias differs from its literal contract: ' + key);
  }
  const priorCases = parseLines(priorBytes), finalCases = parseLines(finalBytes), originalCases = parseLines(originalBytes);
  const beforeEngine = beforeModule.createEngine(engineOptions), afterEngine = afterModule.createEngine(engineOptions);
  const beforeSeed = seedResults(finalCases, beforeEngine), afterSeed = seedResults(finalCases, afterEngine);
  const contracts = items => items.filter(item => item.status === 'contract'), exploratory = items => items.filter(item => item.status === 'exploratory');
  const newCases = finalCases.slice(priorCases.length), newWords = newCases.filter(item => item.mode === 'word');
  if (priorCases.length !== 176 || contracts(priorCases).length !== 174 || finalCases.length !== 211 ||
      contracts(finalCases).length !== 209 || newCases.length !== 35 || newCases.some(item => item.status !== 'contract')) fail('Expected 176 historical rows and thirty-five appended contracts');
  if (!same(newWords.map(item => item.input).sort(), Object.keys(addedEntries).sort()) ||
      newWords.some(item => item.expectedTop !== addedEntries[item.input][0] || !same(item.expectedCandidates, addedEntries[item.input])) ||
      newCases.filter(item => item.mode === 'text').length !== 1) fail('Appended contracts must cover thirty-four literal aliases and one synthetic text');
  const beforeHistorical = seedSummary(contracts(beforeSeed.slice(0, priorCases.length))), afterHistorical = seedSummary(contracts(afterSeed.slice(0, priorCases.length)));
  const beforeFinal = seedSummary(contracts(beforeSeed)), afterFinal = seedSummary(contracts(afterSeed));
  if (beforeHistorical.passed !== beforeHistorical.total || afterFinal.passed !== afterFinal.total) fail('Historical or final seed contracts failed; no measurement published');
  const beforeReviewed = publicResults(evaluateSourceReview(originalCases, review, beforeEngine));
  const afterReviewed = publicResults(evaluateSourceReview(originalCases, review, afterEngine));
  const byId = items => new Map(items.map(item => [item.id, item]));
  const beforeById = byId(beforeReviewed.items), afterById = byId(afterReviewed.items);
  const researchResults = research.cases.map(item => ({ input: item.input, decision: item.decision, reason: item.reason,
    sourceReviewCaseId: item.sourceReviewCaseId, before: beforeById.get(item.sourceReviewCaseId), after: afterById.get(item.sourceReviewCaseId) }));
  if (researchResults.some(item => !item.before?.evaluated || item.before.actualTop !== research.cases.find(row => row.input === item.input).beforeText)) fail('Research baseline outputs differ from frozen reviewed cases');
  const baselineRemaining = beforeReviewed.items.filter(item => item.mode === 'word' && item.evaluated && !item.topMatchesAny).map(item => item.id).sort();
  if (!same(baselineRemaining, research.cases.map(item => item.sourceReviewCaseId).sort())) fail('Research must account for every remaining admitted baseline word mismatch');
  const changedCaseResults = beforeReviewed.items.flatMap(item => {
    const updated = afterById.get(item.id);
    return same(item, updated) ? [] : [{ id: item.id, mode: item.mode, before: item, after: updated }];
  });
  const remainingTopMismatchCaseIds = afterReviewed.items.filter(item => item.evaluated && !item.topMatchesAny).map(item => item.id);
  const remainingWords = researchResults.filter(item => item.decision === 'defer');
  if (remainingWords.length !== 12 || !same(afterReviewed.items.filter(item => item.mode === 'word' && item.evaluated && !item.topMatchesAny).map(item => item.id).sort(),
      remainingWords.map(item => item.sourceReviewCaseId).sort())) fail('Expected exactly twelve documented remaining word deferrals');
  const toolPaths = ['benchmark/measure-native-forms.js', 'benchmark/source-reviewed-core.js', 'benchmark/run.js'];
  const toolHashes = await hashFiles(afterRoot, toolPaths);
  const report = {
    schemaVersion: 1, reportId: 'native-forms-2026-10-09', recordedAt: new Date().toISOString(),
    purpose: 'Descriptive development comparison of thirty-four complete-form aliases against frozen source-assisted references',
    baseline: { gitCommit: baselineCommit, sourceFileSha256: baselineHashes, packageSha256: sha256(baselinePackage) },
    after: { sourceFileSha256: afterHashes, packageSha256: sha256(afterPackage) },
    environment: { nodeVersion: process.version, platform: platform(), architecture: arch(), osRelease: release() },
    options: { ...engineOptions, entries: 'starter defaults' },
    implementationScope: { changedRuntimeSourceFiles: paths.filter(path => baselineHashes[path] !== afterHashes[path]),
      addedEntries, priorEntryCount: 177, afterEntryCount: 211, allPriorReadingArraysPreserved: true, allOtherSrcFilesByteIdentical: true,
      genericNativeSuffixRulesAdded: false },
    research: { path: researchPath, sha256: researchPin, reviewKind: research.reviewKind, humanVerified: false,
      independentHumanReview: false, reviewedWordCases: 46, implementationKeys: 34, deferredKeys: 12, maintainerDefaultChoice: research.maintainerDefaultChoice },
    fixture: { path: fixturePath, sha256: sha256(finalBytes), total: finalCases.length, priorFixtureSha256: fixturePin,
      priorRowCount: 176, priorBytesPreserved: true, contractCount: 209, exploratoryCount: 2, newCaseIds: newCases.map(item => item.id) },
    finalContract: { before: beforeFinal, after: afterFinal },
    historicalContract: { before: beforeHistorical, after: afterHistorical },
    addedFormContract: { before: seedSummary(beforeSeed.slice(priorCases.length)), after: seedSummary(afterSeed.slice(priorCases.length)),
      results: newCases.map((item, index) => ({ id: item.id, before: beforeSeed[priorCases.length + index], after: afterSeed[priorCases.length + index] })) },
    exploratory: { before: seedSummary(exploratory(beforeSeed)), after: seedSummary(exploratory(afterSeed)), excludedFromGate: true },
    frozenSourceReview: { reviewPath, reviewFileSha256: reviewPin, sourceCasesSha256: casesPin, humanVerified: false,
      independentHumanReview: false, referencePurpose: 'development', before: beforeReviewed.summary, after: afterReviewed.summary,
      changedCaseResults, beforeResults: beforeReviewed.items, afterResults: afterReviewed.items, researchResults, remainingWords,
      remainingTopMismatchCaseIds, remainingCandidateMismatchCaseIds: afterReviewed.items.filter(item => item.mode === 'word' && item.evaluated && item.referenceCandidatesMatched < item.references.length).map(item => item.id) },
    historicalReports: { allByteIdentical: true, fileSha256: historicalHashes, manifestSha256: reportsPin },
    toolFileSha256: toolHashes,
    reproduction: {
      baselineSnapshot: 'git archive ' + baselineCommit + ' src package.json benchmark/cases.jsonl benchmark/run.js benchmark/reports | tar -x -C <baseline-directory>',
      comparison: 'node benchmark/measure-native-forms.js <baseline-directory> --cases <pinned-original-review-cases.jsonl> --output <new-report.json>',
      measurement: 'Both engines use the same final seed fixtures and complete original review batch. Sources, inputs, research, tools and historical reports are identified by SHA-256.' },
    limits: [
      'These selected development references guided the aliases; improvements are not independent human review, held-out accuracy or population accuracy.',
      'Published Nepali usage corroborates script spellings; it does not establish canonical Roman inputs, universal default ordering or usage frequency.',
      'Complete source sentence inputs, references and converter outputs are withheld; public results retain exact output hashes. Appended seed sentences are project-authored synthetic fixtures.',
      'Candidate coverage scores only the listed references. Additional valid readings and candidate usefulness are unscored.',
      'Mahila and shanta candidate order is the maintainer choice. Angrejharuko order follows an explicit project phonetic preference; both listed nasal forms remain candidates.',
      'The fixed corpus and seed fixtures are not representative of natural typing or all Nepali text. Browser compatibility, independent language review and real-world user evaluation are outside this measurement.',
      'Twelve word defaults remain deferred: ten proper names, header and the indexed/printed plural discrepancy. No universal native suffix transformation was added.',
    ],
  };
  if (!same(await sourceFiles(afterRoot), paths) || !same(await sourceFiles(baselineRoot), paths) ||
      !same(await hashFiles(afterRoot, paths), afterHashes) || !same(await hashFiles(baselineRoot, paths), baselineHashes) ||
      !same(await hashFiles(afterRoot, historicalPaths), historicalHashes) || !same(await hashFiles(baselineRoot, historicalPaths), historicalHashes) ||
      !same(await hashFiles(afterRoot, toolPaths), toolHashes) ||
      !(await read(baselineRoot, fixturePath)).equals(priorBytes) || !(await read(afterRoot, fixturePath)).equals(finalBytes) ||
      !(await read(baselineRoot, 'package.json')).equals(baselinePackage) || !(await read(afterRoot, 'package.json')).equals(afterPackage) ||
      !(await read(afterRoot, reviewPath)).equals(reviewBytes) || !(await read(afterRoot, researchPath)).equals(researchBytes) ||
      !(await readFile(config.cases)).equals(originalBytes)) fail('Measurement inputs changed during evaluation');
  await writeFile(config.output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  const before = beforeReviewed.summary, after = afterReviewed.summary;
  console.log('Reviewed word top: ' + before.word.topMatchesAny + '/' + before.word.total + ' -> ' + after.word.topMatchesAny + '/' + after.word.total);
  console.log('Listed reference candidate coverage: ' + before.word.referenceCandidatesMatched + '/' + before.word.referenceCandidatesTotal + ' -> ' + after.word.referenceCandidatesMatched + '/' + after.word.referenceCandidatesTotal);
  console.log('Reviewed complete sentence top: ' + before.text.topMatchesAny + '/' + before.text.total + ' -> ' + after.text.topMatchesAny + '/' + after.text.total);
  console.log('Final seed contracts: ' + beforeFinal.passed + '/' + beforeFinal.total + ' -> ' + afterFinal.passed + '/' + afterFinal.total);
  console.log('Remaining deferred word defaults: ' + remainingWords.length);
  console.log('Wrote new development comparison to ' + config.output);
}

main().catch(error => { console.error('Native forms measurement error: ' + error.message); process.exitCode = 2; });
