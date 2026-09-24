#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import {
  parseAksharantarRows,
  scoreAksharantar,
  verifyAksharantarTest,
} from './aksharantar-core.js';

const REVISION = 'e418c1fc928d9f5393af33268472cf20c1891be8';
const TEST_SHA256 = '172c759fcbb9faeda0a23765ccd12ad0520fb535a05dca42dd9c9923ee5f554e';

function usage() {
  console.log('Usage: node benchmark/aksharantar.js --data path/to/nep_test.json [--examples 10]');
}

function parseArgs(args) {
  let data;
  let examples = 10;
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--data' && args[index + 1]) {
      data = args[++index];
    } else if (argument === '--examples' && args[index + 1]) {
      examples = Number(args[++index]);
      if (!Number.isInteger(examples) || examples < 0 || examples > 100) {
        throw new Error('--examples must be an integer from 0 to 100');
      }
    } else if (argument === '--help') {
      usage();
      return null;
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }
  if (!data) throw new Error('--data is required; see --help');
  return { data, examples };
}

function revision() {
  try {
    const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
    const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
    return commit + (dirty ? ' (working tree changed)' : '');
  } catch {
    return 'unavailable';
  }
}

function printScore(label, score) {
  const percent = (count) => (100 * count / score.total).toFixed(2);
  console.log(`${label}: top ${score.top}/${score.total} (${percent(score.top)}%); reference in candidates ${score.candidate}/${score.total} (${percent(score.candidate)}%)`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options) return;
  const bytes = await readFile(options.data);
  const actualHash = createHash('sha256').update(bytes).digest('hex');
  if (actualHash !== TEST_SHA256) {
    throw new Error(`Test file SHA-256 ${actualHash} differs from the pinned official file ${TEST_SHA256}`);
  }
  const rows = parseAksharantarRows(bytes.toString('utf8'));
  verifyAksharantarTest(rows);
  const report = scoreAksharantar(rows);

  console.log('Aksharantar Nepali word test; strict Unicode pair agreement; default SahajLipi engine');
  console.log(`Dataset revision: ${REVISION}`);
  console.log(`Test file SHA-256: ${actualHash}`);
  console.log(`Engine revision: ${revision()}; Node.js ${process.version}`);
  printScore('Overall', report.overall);
  for (const [category, score] of Object.entries(report.categories)) printScore(category, score);
  if (options.examples) {
    console.log(`First ${Math.min(options.examples, report.misses.length)} top or candidate mismatches of ${report.misses.length}:`);
    for (const item of report.misses.slice(0, options.examples)) {
      console.log(`  ${item.id} [${item.category}] ${JSON.stringify(item.roman)} → reference ${JSON.stringify(item.native)}; top ${JSON.stringify(item.actualTop)}; reference in candidates ${item.candidates.includes(item.native)}`);
    }
  }
}

main().catch((error) => {
  console.error(`Aksharantar benchmark error: ${error.message}`);
  process.exitCode = 2;
});
