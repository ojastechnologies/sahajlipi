import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createReviewArtifacts, writeReviewArtifacts } from '../benchmark/review-batch-output.js';

const sample = {
  id: 'word-validation:nep1', mode: 'word', sourceId: 'nep1', sourceSplit: 'validation',
  sourceCategory: 'AK-Freq', provenance: 'fixture', purpose: 'development',
  roman: 'kam', proposedOutput: 'काम', reviewStatus: 'unreviewed', reviews: [], acceptedOutputs: [],
};
const batch = { cases: [sample], selection: { seed: 'fixture', wordQuotas: { 'AK-Freq': 1 } } };
const diagnostics = {
  summary: { total: 1, wordCount: 1, textCount: 0, exactTopMatches: 0, wordCandidateMatches: 1,
    primarySignals: { 'candidate-only': 1 }, flags: { 'candidate-only': 1 } },
  items: [{ id: sample.id, mode: 'word', roman: 'kam', proposedOutput: 'काम', actualTop: 'कम',
    candidates: ['कम', 'काम'], exactTopMatch: false, referenceInCandidates: true,
    signals: ['candidate-only'], primarySignal: 'candidate-only' }],
};

test('reviewer copies preserve source proposals and leave engine suggestions in diagnostics only', () => {
  const files = createReviewArtifacts(batch, diagnostics, { engineCommit: 'fixture' });
  for (const reviewer of ['a', 'b']) {
    const reviewed = files['reviewer-' + reviewer + '.jsonl'].trim().split('\n').map(JSON.parse);
    assert.deepEqual(reviewed, [sample]);
    assert.doesNotMatch(files['reviewer-' + reviewer + '.md'], /actualTop|candidates|कम/);
    assert.match(files['reviewer-' + reviewer + '.md'], /kam/);
    assert.match(files['reviewer-' + reviewer + '.md'], /काम/);
  }
  assert.match(files['diagnostics.md'], /कम/);
  assert.match(files['diagnostics.md'], /unreviewed/i);
  assert.match(files['diagnostics.md'], /not.*accuracy|not.*linguistic/i);
});

test('manifest hashes every artifact except itself so review files can be verified later', () => {
  const files = createReviewArtifacts(batch, diagnostics, { engineCommit: 'fixture' });
  const manifest = JSON.parse(files['manifest.json']);
  assert.equal(manifest.engineCommit, 'fixture');
  assert.equal(manifest.purpose, 'development');
  assert.deepEqual(manifest.selectedCaseIds, [sample.id]);
  for (const [name, contents] of Object.entries(files)) {
    if (name === 'manifest.json') continue;
    assert.equal(manifest.artifacts[name], createHash('sha256').update(contents).digest('hex'));
  }
});

test('existing output directories and review decisions cannot be overwritten', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'sahajlipi-review-output-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const output = join(root, 'review');
  await mkdir(output);
  await writeFile(join(output, 'reviewer-a.jsonl'), 'human review\n');
  await assert.rejects(() => writeReviewArtifacts(output, { 'reviewer-a.jsonl': 'replacement' }), /EEXIST/);
  assert.equal(await readFile(join(output, 'reviewer-a.jsonl'), 'utf8'), 'human review\n');
});

test('new output directory contains exactly the generated artifacts', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'sahajlipi-review-output-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const output = join(root, 'review');
  const files = createReviewArtifacts(batch, diagnostics, { engineCommit: 'fixture' });
  await writeReviewArtifacts(output, files);
  for (const [name, contents] of Object.entries(files)) {
    assert.equal(await readFile(join(output, name), 'utf8'), contents);
  }
});
