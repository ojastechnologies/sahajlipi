import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const hash = (text) => createHash('sha256').update(text).digest('hex');
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const escaped = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/\|/g, '&#124;');
const cell = (value) => '<code>' + escaped(JSON.stringify(value)) + '</code>';

function reviewSheet(cases, reviewer) {
  const lines = ['# Nepali development review — reviewer ' + reviewer,
    '', 'All source proposals are unreviewed. Work independently; do not consult the diagnostic report or the other reviewer.',
    'Record your reviewer ID, date, decision (accept, correct, exclude), suggested outputs, and reason in your JSONL copy.',
    'Keep acceptedOutputs empty until both reviews have been reconciled. This sheet has no engine suggestions.', ''];
  for (const [index, item] of cases.entries()) {
    lines.push('## ' + (index + 1) + '. ' + item.id, '',
      '- Mode: ' + item.mode,
      '- Source: ' + escaped(item.provenance),
      '- Roman input (exact JSON string): ' + cell(item.roman),
      '- Source proposal (unreviewed): ' + cell(item.proposedOutput),
      '', 'Independent review:', '',
      '- Reviewer ID:', '- Review date:', '- Decision:', '- Suggested outputs:', '- Reason:', '');
  }
  return lines.join('\n') + '\n';
}

function diagnosticSheet(report) {
  const summary = report.summary;
  const lines = ['# First Nepali development batch — diagnostics', '',
    'These comparisons use unreviewed source proposals. They are not a linguistic accuracy score or confirmed error causes.',
    'Selection was fixed before running the engine. Automated signals are observations for subsequent human review.', '',
    '## Summary', '',
    '- Cases: ' + summary.total + ' (' + summary.wordCount + ' words; ' + summary.textCount + ' sentences).',
    '- Exact default agreement with source proposals: ' + summary.exactTopMatches + '/' + summary.total + '.',
    '- Word proposals in returned candidates: ' + summary.wordCandidateMatches + '/' + summary.wordCount + '.',
    '- Review status: all unreviewed; no accepted outputs.', '',
    '| Primary diagnostic signal | Count |', '| --- | ---: |'];
  for (const [name, count] of Object.entries(summary.primarySignals)) lines.push('| ' + name + ' | ' + count + ' |');
  lines.push('', 'Primary signals use a fixed precedence and sum to the batch size. Additional signals can overlap.', '',
    '## Cases', '', '| Case | Roman input | Source proposal (unreviewed) | Engine default | Signals |', '| --- | --- | --- | --- | --- |');
  for (const item of report.items) {
    lines.push('| ' + item.id + ' | ' + cell(item.roman) + ' | ' + cell(item.proposedOutput) + ' | ' + cell(item.actualTop) + ' | ' + item.signals.join(', ') + ' |');
  }
  lines.push('', '## Review files', '',
    '[Reviewer A](reviewer-a.md) · [Reviewer B](reviewer-b.md) · [Source cases](cases.jsonl) · [Manifest](manifest.json)', '',
    'Send reviewers only their own files. Each review must be recorded independently and disagreements reconciled before engine changes use the labels.');
  return lines.join('\n') + '\n';
}

export function createReviewArtifacts(batch, diagnostics, metadata) {
  const cases = batch.cases.map((item) => JSON.stringify(item)).join('\n') + '\n';
  const files = {
    'cases.jsonl': cases,
    'reviewer-a.jsonl': cases,
    'reviewer-b.jsonl': cases,
    'reviewer-a.md': reviewSheet(batch.cases, 'A'),
    'reviewer-b.md': reviewSheet(batch.cases, 'B'),
    'diagnostics.json': json(diagnostics),
    'diagnostics.md': diagnosticSheet(diagnostics),
  };
  const manifest = { schemaVersion: 1, purpose: 'development', reviewStatus: 'unreviewed',
    ...metadata, selection: batch.selection, selectedCaseIds: batch.cases.map((item) => item.id),
    diagnosticSummary: diagnostics.summary,
    artifacts: Object.fromEntries(Object.entries(files).map(([name, text]) => [name, hash(text)])) };
  files['manifest.json'] = json(manifest);
  return files;
}

export async function writeReviewArtifacts(directory, files) {
  // Exclusive directory creation protects both complete and partially reviewed runs.
  await mkdir(directory);
  for (const [name, text] of Object.entries(files)) {
    await writeFile(join(directory, name), text, { flag: 'wx' });
  }
}
