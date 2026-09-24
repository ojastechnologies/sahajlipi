#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { buildSentenceReviewQueue } from './sentence-review-core.js';

const REVISION = 'c54a95d9b9d62c891a03bd5da60715df7176b097';
const DATA_SHA256 = '7f3290c418c00306b3ba9d5abf41bb6dfec827b4ccc4438651b70fab1787b787';

function usage() {
  console.log('Usage: node benchmark/sentence-review.js --data path/to/bhasha-abhijnaanam.json --output path/to/review.jsonl');
}

function parseArgs(args) {
  let data;
  let output;
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--data' && args[index + 1]) data = args[++index];
    else if (argument === '--output' && args[index + 1]) output = args[++index];
    else if (argument === '--help') {
      usage();
      return null;
    } else throw new Error(`Unknown or incomplete argument: ${argument}`);
  }
  if (!data || !output) throw new Error('--data and --output are required; see --help');
  return { data, output };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options) return;
  const bytes = await readFile(options.data);
  const actualHash = createHash('sha256').update(bytes).digest('hex');
  if (actualHash !== DATA_SHA256) {
    throw new Error(`Sentence data SHA-256 ${actualHash} differs from pinned official file ${DATA_SHA256}`);
  }
  const queue = buildSentenceReviewQueue(JSON.parse(bytes.toString('utf8')));
  if (queue.length !== 423) throw new Error(`Expected 423 paired Nepali sentences, found ${queue.length}`);
  await writeFile(options.output, queue.map((item) => JSON.stringify(item)).join('\n') + '\n', { flag: 'wx' });
  console.log(`Wrote ${queue.length} unreviewed Nepali sentence pairs to ${options.output}`);
  console.log(`Source: ai4bharat/Bhasha-Abhijnaanam at ${REVISION}; SHA-256 ${actualHash}`);
  console.log('These are review candidates, not an accuracy benchmark.');
}

main().catch((error) => {
  console.error(`Sentence review error: ${error.message}`);
  process.exitCode = 2;
});
