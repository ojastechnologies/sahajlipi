import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const cli = fileURLToPath(new URL('../benchmark/measure-reviewed-spelling.js', import.meta.url));
const root = dirname(dirname(cli));
const run = args => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

// Owned MIT source snapshot from alpha.2 commit 48a0321. The measurement pins all eight file hashes.
// Embedded compressed so boundary tests require no Git history, private corpus or network.
const baselineSources = JSON.parse(gunzipSync(Buffer.from('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', 'base64')).toString('utf8'));
const historicalReports = ['consonant-defaults-2026-10-03.json', 'digits-001.json', 'early-address-001.json',
  'loanword-research-2026-09-27.json', 'loanword-suffix-research-2026-10-01.json', 'loanword-suffixes-2026-10-01.json',
  'mixed-text-001.json', 'month-research-2026-09-27.json', 'nepali-assisted-online-001.json',
  'nepali-loanwords-001.json', 'nepali-months-001.json', 'nepali-review-001.json', 'nepali-ry-001.json',
  'nepali-source-review-2026-10-01.json', 'nepali-source-review-baseline-2026-10-01.json',
  'nepali-spelling-2026-10-01.json', 'nepali-spelling-research-2026-10-01.json'];

test('comparison CLI requires a baseline, pinned cases and a new output path', () => {
  for (const args of [[], ['--cases', 'cases'], ['baseline'], ['baseline', '--cases', 'cases'],
    ['baseline', '--output', 'output'], ['baseline', '--cases', 'cases', '--output'],
    ['baseline', '--cases', 'cases', '--cases', 'other', '--output', 'output'],
    ['baseline', '--cases', 'cases', '--output', 'output', '--unknown']]) {
    const result = run(args);
    assert.equal(result.status, 2, result.stderr);
    assert.equal(result.stdout, '');
  }
  const help = run(['--help']);
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /--cases.*--output/);
});

// Archive only public source and regression data. No original corpus is needed
// to test rejection boundaries, and no complete external sentences are copied.
async function context() {
  const folder = await mkdtemp(join(tmpdir(), 'sahajlipi-spelling-context-'));
  const baseline = join(folder, 'baseline'), current = join(folder, 'current');
  await mkdir(join(baseline, 'benchmark/reports'), { recursive: true });
  await mkdir(join(baseline, 'src'));
  await Promise.all(Object.entries(baselineSources).map(([path, bytes]) => writeFile(join(baseline, 'src', path), bytes)));
  await cp(join(root, 'package.json'), join(baseline, 'package.json'));
  const fixture = await readFile(join(root, 'benchmark/cases.jsonl'), 'utf8');
  await writeFile(join(baseline, 'benchmark/cases.jsonl'), fixture.split('\n').slice(0, 162).join('\n') + '\n');
  await Promise.all(historicalReports.map(path => cp(join(root, 'benchmark/reports', path), join(baseline, 'benchmark/reports', path))));
  await mkdir(current);
  await cp(join(baseline, 'src'), join(current, 'src'), { recursive: true });
  for (const path of ['package.json', 'benchmark/cases.jsonl', 'benchmark/reports',
    'benchmark/measure-reviewed-spelling.js', 'benchmark/source-reviewed-core.js']) {
    await mkdir(dirname(join(current, path)), { recursive: true });
    await cp(join(root, path), join(current, path), { recursive: true });
  }
  const cases = join(folder, 'nonpinned-cases.jsonl'), output = join(folder, 'measurement.json');
  await writeFile(cases, '{"id":"controlled-unpinned-input"}\n');
  return { folder, baseline, current, cases, output,
    run: () => spawnSync(process.execPath, [join(current, 'benchmark/measure-reviewed-spelling.js'),
      baseline, '--cases', cases, '--output', output], { encoding: 'utf8' }) };
}

async function rejectsMutation(mutate, pattern) {
  const data = await context();
  try {
    await mutate(data);
    const result = data.run();
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, pattern);
    assert.equal(result.stdout, '');
    await assert.rejects(access(data.output), { code: 'ENOENT' });
  } finally { await rm(data.folder, { recursive: true, force: true }); }
}

test('comparison CLI pins baseline declaration files as part of source identity', async () => {
  await rejectsMutation(async data => {
    const path = join(data.baseline, 'src/dom.d.ts');
    await writeFile(path, await readFile(path, 'utf8') + '\n');
  }, /baseline source.*src\/dom\.d\.ts/i);
});

test('comparison CLI rejects runtime changes outside the lexicon', async () => {
  await rejectsMutation(async data => {
    const path = join(data.current, 'src/phonetic.js');
    await writeFile(path, await readFile(path, 'utf8') + '\n');
  }, /outside the lexicon.*src\/phonetic\.js/i);
});

test('comparison CLI rejects additional source files', async () => {
  await rejectsMutation(data => writeFile(join(data.current, 'src/unmeasured.js'), 'export const value = 1;\n'), /source file inventory/i);
});

test('comparison CLI rejects edits to historical fixture bytes', async () => {
  await rejectsMutation(async data => {
    const path = join(data.current, 'benchmark/cases.jsonl');
    await writeFile(path, ' ' + await readFile(path, 'utf8'));
  }, /historical fixture bytes/i);
});

test('comparison CLI rejects altered historical reports', async () => {
  await rejectsMutation(data => writeFile(join(data.current, 'benchmark/reports/digits-001.json'), '{}\n'), /historical report bytes/i);
});

test('comparison CLI rejects jointly altered baseline and current historical reports', async () => {
  await rejectsMutation(async data => {
    for (const directory of [data.baseline, data.current]) {
      await writeFile(join(directory, 'benchmark/reports/digits-001.json'), '{}\n');
    }
  }, /baseline historical reports/i);
});

test('comparison CLI rejects research that claims human verification', async () => {
  await rejectsMutation(async data => {
    const path = join(data.current, 'benchmark/reports/nepali-spelling-research-2026-10-09.json');
    const research = JSON.parse(await readFile(path));
    research.humanVerified = true;
    await writeFile(path, JSON.stringify(research));
  }, /nonhuman provenance/i);
});

test('comparison CLI rejects a nonpinned complete review batch without publishing', async () => {
  await rejectsMutation(async () => {}, /complete original review batch.*frozen pin/i);
});

test('comparison CLI preserves an existing report before reading measurement inputs', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'sahajlipi-spelling-cli-'));
  try {
    const output = join(folder, 'measurement.json');
    const original = '{"preserve":"existing measurement"}\n';
    await writeFile(output, original);
    const result = run([join(folder, 'missing-baseline'), '--cases', join(folder, 'missing-cases'), '--output', output]);
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, /exists|overwrite/i);
    assert.equal(await readFile(output, 'utf8'), original);
  } finally { await rm(folder, { recursive: true, force: true }); }
});
