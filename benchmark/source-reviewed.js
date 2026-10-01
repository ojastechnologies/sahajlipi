#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { evaluateSourceReview, publicResults, sha256 } from './source-reviewed-core.js';

const defaults = { cases: 'benchmark/data/review-batch-001/cases.jsonl',
  review: 'benchmark/reports/nepali-source-review-2026-10-01.json' };
function parseArgs(args) {
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: npm run benchmark:source-reviewed -- [--cases cases.jsonl] [--review review.json] [--output new-report.json]');
    console.log('Defaults: ' + JSON.stringify(defaults));
    console.log('Scores frozen source-assisted development references; mismatches do not fail this research command.');
    return null;
  }
  const options = { ...defaults };
  const seen = new Set();
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (!['--cases', '--review', '--output'].includes(flag) || !args[index + 1] ||
        args[index + 1].startsWith('--') || seen.has(flag)) throw new Error('Unknown, incomplete, or repeated argument: ' + flag);
    seen.add(flag);
    options[flag.slice(2)] = args[++index];
  }
  return options;
}
function git(args) {
  try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
}
async function fileHashes(paths) {
  return Object.fromEntries(await Promise.all(paths.map(async path =>
    [path, sha256(await readFile(new URL('../' + path, import.meta.url)))])));
}
async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options) return;
  const [sourceBytes, reviewBytes] = await Promise.all([readFile(options.cases), readFile(options.review)]);
  const cases = sourceBytes.toString('utf8').split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line));
  const review = JSON.parse(reviewBytes);
  const sourceCasesSha256 = sha256(sourceBytes);
  if (review.provenance?.sourceCasesSha256 && review.provenance.sourceCasesSha256 !== sourceCasesSha256) {
    throw new Error('Complete source batch SHA-256 differs from frozen review');
  }
  const result = publicResults(evaluateSourceReview(cases, review));
  const report = { schemaVersion: 1, purpose: 'development', reviewKind: 'delegated-source-assisted',
    humanVerified: false, independentHumanReview: false,
    measurement: { recordedAt: new Date().toISOString(), engineCommit: git(['rev-parse', 'HEAD']),
      workingTreeChanged: Boolean(git(['status', '--porcelain'])), nodeVersion: process.version,
      options: { digits: 'devanagari', preserveTechnicalText: true, entries: 'starter defaults' },
      sourceCasesSha256, frozenReviewFileSha256: sha256(reviewBytes),
      engineFileHashes: await fileHashes(['src/index.js', 'src/phonetic.js', 'src/lexicon.js', 'src/text-policy.js']),
      toolFileHashes: await fileHashes(['benchmark/source-reviewed.js', 'benchmark/source-reviewed-core.js']) },
    ...result };
  if (options.output) await writeFile(options.output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  const { summary } = result;
  console.log('Source-assisted development review: ' + summary.total + ' original cases; ' + summary.admittedTotal + ' admitted');
  console.log('Decisions: ' + JSON.stringify(summary.decisions));
  console.log('Word top output matches any reference: ' + summary.word.topMatchesAny + '/' + summary.word.total);
  console.log('Word cases with any reference in candidates: ' + summary.word.candidateMatchesAny + '/' + summary.word.total);
  console.log('Listed word reference candidate coverage: ' + summary.word.referenceCandidatesMatched + '/' + summary.word.referenceCandidatesTotal);
  console.log('Exact complete sentence output: ' + summary.text.topMatchesAny + '/' + summary.text.total);
  console.log('No independent human verification or population accuracy claim. Excluded/unresolved cases are not scored.');
  if (options.output) console.log('Wrote new public measurement to ' + options.output);
}
main().catch(error => { console.error('Source review error: ' + error.message); process.exitCode = 2; });
