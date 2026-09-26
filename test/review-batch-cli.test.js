import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtemp, writeFile, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const runner = fileURLToPath(new URL('../benchmark/review-batch.js', import.meta.url));

test('review batch CLI explains required inputs without downloading data', () => {
  const result = spawnSync(process.execPath, [runner, '--help'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /--words.*--test.*--sentences.*--output/);
});

test('review batch CLI rejects incomplete options', () => {
  const result = spawnSync(process.execPath, [runner, '--words'], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /incomplete|required/i);
});

test('review batch CLI rejects changed source bytes before creating output files', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'sahajlipi-review-cli-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const input = join(root, 'changed-source.json');
  const output = join(root, 'output');
  await writeFile(input, '{}\n');
  const result = spawnSync(process.execPath, [runner, '--words', input, '--test', input,
    '--sentences', input, '--output', output], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /SHA-256.*pinned/);
  await assert.rejects(() => access(output), /ENOENT/);
});
