import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { validateSourceReview, resolveReferences, evaluateSourceReview, publicResults } from '../benchmark/source-reviewed-core.js';

const hash = text => createHash('sha256').update(text).digest('hex');
const cases = [
  { id: 'w1', mode: 'word', roman: 'shanta', proposedOutput: 'शान्ता' },
  { id: 's1', mode: 'text', roman: 'ramro cha.', proposedOutput: 'राम्रो छ।' },
  { id: 'w2', mode: 'word', roman: 'badtoken', proposedOutput: 'गलत' },
];
const base = item => ({ id: item.id, mode: item.mode, romanSha256: hash(item.roman),
  sourceProposalSha256: hash(item.proposedOutput), reviewedAt: '2026-10-01', decision: 'accept',
  confidence: 'medium', reason: 'Published usage supports the reference.', question: null,
  evidence: [{ title: 'Primary usage', url: 'https://example.gov.np/page', support: 'Spelling attested.', accessScope: 'direct-html', verifiedAt: '2026-10-01' }],
  preferredReferenceIndex: null });
const rows = [
  { ...base(cases[0]), referenceOutputs: ['शान्त', 'शान्ता'] },
  { ...base(cases[1]), decision: 'correct', referencePatches: [{ edits: [{ start: 8, end: 9, replacement: '.' }], sha256: hash('राम्रो छ.') }], preferredReferenceIndex: 0 },
  { ...base(cases[2]), decision: 'exclude', referenceOutputs: [], evidence: [], reason: 'Malformed Roman token.' },
];
const review = () => ({ schemaVersion: 1, reviewKind: 'delegated-source-assisted', humanVerified: false,
  independentHumanReview: false, cases: structuredClone(rows) });

test('references retain alternatives and exact punctuation without normalizing Unicode', () => {
  const data = validateSourceReview(cases, review());
  assert.deepEqual(resolveReferences(cases[0], data.cases[0]), ['शान्त', 'शान्ता']);
  assert.deepEqual(resolveReferences(cases[1], data.cases[1]), ['राम्रो छ.']);
});

test('validation rejects missing, duplicate, unknown, or altered source records', () => {
  for (const change of [
    data => data.cases.pop(),
    data => data.cases.push(data.cases[0]),
    data => data.cases[0].id = 'unknown',
    data => data.cases[0].romanSha256 = hash('changed'),
    data => data.cases[0].sourceProposalSha256 = hash('changed'),
    data => data.cases[0].input = 'changed',
    data => data.cases[0].sourceProposal = 'changed',
  ]) {
    const data = review(); change(data);
    assert.throws(() => validateSourceReview(cases, data));
  }
});

test('admitted references require evidence while excluded and unresolved cases cannot be scored', () => {
  const noEvidence = review(); noEvidence.cases[0].evidence = [];
  assert.throws(() => validateSourceReview(cases, noEvidence), /evidence/i);
  const excluded = review(); excluded.cases[2].referenceOutputs = ['गलत'];
  assert.throws(() => validateSourceReview(cases, excluded), /reference/i);
  const unresolved = review(); unresolved.cases[2].decision = 'needs-user'; unresolved.cases[2].question = 'Which word?';
  assert.equal(validateSourceReview(cases, unresolved).cases[2].decision, 'needs-user');
});

test('source-assisted research cannot be labeled independent human verification', () => {
  const data = review(); data.humanVerified = true;
  assert.throws(() => validateSourceReview(cases, data), /human/i);
});

test('sentence patches reject invalid bounds, overlap, split surrogate pairs, and wrong output hashes', () => {
  for (const edits of [
    [{ start: -1, end: 0, replacement: '' }],
    [{ start: 0, end: 100, replacement: '' }],
    [{ start: 0, end: 3, replacement: '' }, { start: 2, end: 4, replacement: '' }],
  ]) assert.throws(() => resolveReferences(cases[1], { referencePatches: [{ edits, sha256: hash('x') }] }));
  assert.throws(() => resolveReferences({ proposedOutput: '😀क' }, { referencePatches: [{ edits: [{ start: 1, end: 2, replacement: '' }], sha256: hash('x') }] }));
  assert.throws(() => resolveReferences(cases[1], { referencePatches: [{ edits: [], sha256: hash('wrong') }] }), /hash/i);
});

test('evaluation counts any valid reading, preferred readings, and candidate coverage with explicit denominators', () => {
  const result = evaluateSourceReview(cases, review(), {
    convertWord: () => ({ text: 'शान्ता', candidates: ['शान्ता'] }),
    convertText: () => 'राम्रो छ.',
  });
  assert.deepEqual(result.summary.decisions, { accept: 1, correct: 1, exclude: 1, 'needs-user': 0 });
  assert.equal(result.summary.admittedTotal, 2);
  assert.equal(result.summary.word.topMatchesAny, 1);
  assert.equal(result.summary.word.referenceCandidatesMatched, 1);
  assert.equal(result.summary.word.referenceCandidatesTotal, 2);
  assert.equal(result.summary.word.preferredTotal, 0);
  assert.equal(result.summary.text.preferredMatches, 1);
  assert.equal(result.items.filter(item => item.evaluated).length, 2);
});

test('public projection omits complete sentence strings but keeps hashes, results, and word evidence', () => {
  const result = evaluateSourceReview(cases, review(), {
    convertWord: () => ({ text: 'शान्ता', candidates: ['शान्ता'] }), convertText: () => 'राम्रो छ.',
  });
  const projected = publicResults(result);
  assert.equal(projected.items[0].actualTop, 'शान्ता');
  assert.equal(projected.items[1].actualTopSha256, hash('राम्रो छ.'));
  for (const key of ['roman', 'proposedOutput', 'references', 'actualTop', 'candidates']) assert.equal(key in projected.items[1], false);
});

// CLI checks cover publication and preservation boundaries independent of spelling selection.
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cli = fileURLToPath(new URL('../benchmark/source-reviewed.js', import.meta.url));

test('CLI records current source identity, withholds sentence text, and refuses to overwrite measurements', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'sahajlipi-source-cli-'));
  try {
    const sourcePath = join(folder, 'cases.jsonl');
    const reviewPath = join(folder, 'review.json');
    const outputPath = join(folder, 'measurement.json');
    await writeFile(sourcePath, cases.map(item => JSON.stringify(item)).join('\n') + '\n');
    await writeFile(reviewPath, JSON.stringify(review()));
    const args = [cli, '--cases', sourcePath, '--review', reviewPath, '--output', outputPath];
    const first = spawnSync(process.execPath, args, { encoding: 'utf8' });
    assert.equal(first.status, 0, first.stderr);
    const bytes = await readFile(outputPath, 'utf8');
    const report = JSON.parse(bytes);
    assert.equal(report.measurement.options.digits, 'devanagari');
    assert.equal(report.measurement.frozenReviewFileSha256, hash(await readFile(reviewPath)));
    assert.ok(report.measurement.engineFileHashes['src/text-policy.js']);
    assert.equal(report.items[1].roman, undefined);
    assert.equal(report.items[1].actualTop, undefined);
    assert.equal(spawnSync(process.execPath, args, { encoding: 'utf8' }).status, 2);
    assert.equal(await readFile(outputPath, 'utf8'), bytes);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

test('CLI rejects a changed complete batch even if every individual string remains intact', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'sahajlipi-source-pin-'));
  try {
    const sourcePath = join(folder, 'cases.jsonl');
    const reviewPath = join(folder, 'review.json');
    await writeFile(sourcePath, cases.map(item => JSON.stringify(item)).join('\n') + '\n');
    const data = review();
    data.provenance = { sourceCasesSha256: hash('different formatting or provenance') };
    await writeFile(reviewPath, JSON.stringify(data));
    const result = spawnSync(process.execPath, [cli, '--cases', sourcePath, '--review', reviewPath], { encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /complete source batch/i);
  } finally { await rm(folder, { recursive: true, force: true }); }
});
