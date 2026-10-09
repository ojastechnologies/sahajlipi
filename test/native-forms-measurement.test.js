import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const cli = fileURLToPath(new URL('../benchmark/measure-native-forms.js', import.meta.url));
const root = dirname(dirname(cli));
const run = args => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
const sourceNames = ['dom.d.ts', 'dom.js', 'index.d.ts', 'index.js', 'lexicon.js', 'loanwords.js', 'phonetic.js', 'text-policy.js'];
// One owned MIT declaration from the pinned baseline is enough to reach the
// first scope check. These rejection tests need no Git archive or corpus files.
const pinnedDeclaration = gunzipSync(Buffer.from('H4sIAAAAAAAC/81VTU8bMRC951fMbRcUwj1RFSE+VKRSqoLEoerBsSdZU6+98kdIVDi0vwX+V39Kx94NcUJScewpsT2emTfv+a2sG2M9+GWD8BNOjZ6jddJoeIKpNTUUg2OpBS4G964Y9Xq4SOFSe7RTxhEudRP8jWeervcAPC78EJy3Us9GtEbNJgrFECbGKGQ67jHu5Ry/mprpPJQzLaSgRG61++37qPe0o+ZnbJiSqTI17K1RCm0qP8O2l/JgmHWWslfGODxd1SgTqCHoUE/QUvTcSBHjHPrztudyu/fNqFtCWuZws2OpHVr/JWjuA/M0zbJm9sd4CMWfl+cCHuPvS/HmwhUFpcgY+Py7DXz+lQcGLUyZrS1urgVSM2a53lrPL1Gcje5CohLwAT7eXn2KYE4ssnOFNWpPheNuCuu2Rv/m4bqJMF0i4fjwEO4q9BWRovEhFqbxgHTgLdNOSbpPFIgBnOGUBeXpwNBZwAEcHq9FM95QDU/S9HfGinFpc/EQ1rVus9AIarxN0VpvRidxnFZMz3BcurjIVbNjhDuhu23sRaQQRQHBoQNSGztyrGL3SjZyBAVTqiABKeQE3IUmZkYB00iHoxJAgwNrjO+m4bhpMGpnlfaxzTHqyl0TViuJ+HQxpenSGwuybpSk7JNlm2eVszsf5wOJyS7aLmrmeRVJ8xXR9pqNZrQkCXoTeLXN3ybOIznTxr4SuuAqCLzZV/VSSy+ZgtoIQkCFCB/wYG3UIj1ZmAYfLFJbms1eZ/Wf66fftjl88+beLawtc7M4teiq/LmT362Dyv31djvmI9mfUl2elesdbEztfXa4y3UiryecY0P0sPRdYGQw/fSP8FInfYiSQmZ51W4k+rqJTKN5xu8Q857xKgNQJr+kP2+R9iMt7WscD3fYU7+3bxajruFUDJOg2ueWvUsGwvCQ/JEax84XwUzIu+d05+z6ij4zUQ0OHiqkC3MmVRza+4C5iCw+fOr9bFXpEToD3ovN7QHncnR/AdomE1XnBwAA', 'base64'));

async function context() {
  const folder = await mkdtemp(join(tmpdir(), 'sahajlipi-native-measurement-'));
  const baseline = join(folder, 'baseline'), current = join(folder, 'current');
  await mkdir(join(baseline, 'src'), { recursive: true });
  // Invalid baseline bytes are intentional; tests stop at a specific rejection
  // boundary before fixtures, source imports or licensed input are needed.
  await Promise.all(sourceNames.map(name => writeFile(join(baseline, 'src', name), '')));
  for (const path of ['src', 'package.json', 'benchmark/measure-native-forms.js', 'benchmark/source-reviewed-core.js']) {
    await mkdir(dirname(join(current, path)), { recursive: true });
    await cp(join(root, path), join(current, path), { recursive: true });
  }
  const cases = join(folder, 'unpinned-input.jsonl'), output = join(folder, 'measurement.json');
  await writeFile(cases, '{"id":"controlled-unpinned-input"}\n');
  return { folder, baseline, current, cases, output, run: () => spawnSync(process.execPath,
    [join(current, 'benchmark/measure-native-forms.js'), baseline, '--cases', cases, '--output', output], { encoding: 'utf8' }) };
}

async function rejectsMutation(mutate, pattern) {
  const data = await context();
  try {
    await mutate(data);
    const result = data.run();
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, pattern);
    assert.equal(result.stdout, '');
    await assert.rejects(access(data.output), error => error.code === 'ENOENT');
  } finally {
    await rm(data.folder, { recursive: true, force: true });
  }
}

test('native comparison CLI requires complete nonrepeated arguments', () => {
  for (const args of [[], ['--cases', 'cases'], ['baseline'], ['baseline', '--cases', 'cases'],
    ['baseline', '--cases', 'cases', '--output'], ['baseline', '--cases', 'cases', '--cases', 'other', '--output', 'output'],
    ['baseline', '--cases', 'cases', '--output', 'output', '--unknown']]) {
    const result = run(args);
    assert.equal(result.status, 2, result.stderr);
    assert.equal(result.stdout, '');
  }
  const help = run(['--help']);
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /--cases.*--output/);
});

test('native comparison refuses existing output before reading inputs', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'sahajlipi-native-existing-'));
  const output = join(folder, 'existing.json');
  try {
    const original = '{"historical":"unchanged"}\n';
    await writeFile(output, original);
    const result = run([join(folder, 'missing-baseline'), '--cases', join(folder, 'missing-cases'), '--output', output]);
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, /Output already exists/);
    assert.equal(await readFile(output, 'utf8'), original);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});

test('native comparison rejects additional source files', async () => {
  await rejectsMutation(async data => {
    await writeFile(join(data.baseline, 'src', 'additional.js'), 'export const extra = true;\n');
  }, /Source file inventory differs from the eight pinned files/);
});

test('native comparison rejects forged baseline source identity', async () => {
  await rejectsMutation(async data => {
    await writeFile(join(data.baseline, 'src', 'dom.d.ts'), '// fabricated baseline\n');
  }, /Baseline source differs from immutable pre-batch snapshot: src\/dom\.d\.ts/);
});

test('native comparison rejects a change outside the lexicon', async () => {
  await rejectsMutation(async data => {
    await writeFile(join(data.baseline, 'src', 'dom.d.ts'), pinnedDeclaration);
    await writeFile(join(data.current, 'src', 'dom.d.ts'), '// unrelated declaration mutation\n');
  }, /Native-form scope changed source outside the lexicon: src\/dom\.d\.ts/);
});
