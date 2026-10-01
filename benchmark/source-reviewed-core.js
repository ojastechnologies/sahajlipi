import { createHash } from 'node:crypto';
import { convertWord, convertText } from '../src/index.js';

export const sha256 = text => createHash('sha256').update(text).digest('hex');
const decisions = ['accept', 'correct', 'exclude', 'needs-user'];
const admitted = decision => decision === 'accept' || decision === 'correct';
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const hashPattern = /^[a-f0-9]{64}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const fail = message => { throw new Error(message); };

function splitsSurrogate(text, index) {
  return index > 0 && index < text.length && /[\uD800-\uDBFF]/u.test(text[index - 1]) &&
    /[\uDC00-\uDFFF]/u.test(text[index]);
}

/** Reconstruct exact sentence references without publishing complete source sentences. */
export function resolveReferences(original, record) {
  if (record.referenceOutputs !== undefined) {
    if (!Array.isArray(record.referenceOutputs)) fail('referenceOutputs must be an array');
    return [...record.referenceOutputs];
  }
  if (!Array.isArray(record.referencePatches)) fail('referencePatches must be an array');
  return record.referencePatches.map(patch => {
    if (!Array.isArray(patch.edits) || !hashPattern.test(patch.sha256)) fail('Invalid reference patch');
    let previousEnd = -1;
    for (const edit of patch.edits) {
      if (!Number.isInteger(edit.start) || !Number.isInteger(edit.end) || edit.start < 0 ||
          edit.end < edit.start || edit.end > original.proposedOutput.length ||
          typeof edit.replacement !== 'string' || edit.start < previousEnd ||
          splitsSurrogate(original.proposedOutput, edit.start) || splitsSurrogate(original.proposedOutput, edit.end)) {
        fail('Invalid, overlapping, or split-surrogate reference patch bounds');
      }
      previousEnd = edit.end;
    }
    let text = original.proposedOutput;
    for (const edit of [...patch.edits].reverse()) text = text.slice(0, edit.start) + edit.replacement + text.slice(edit.end);
    if (sha256(text) !== patch.sha256) fail('Reference patch output hash does not match');
    return text;
  });
}

/** Require the complete original batch and honest review provenance before scoring. */
export function validateSourceReview(originalCases, review) {
  if (!Array.isArray(originalCases) || !Array.isArray(review?.cases) || review.schemaVersion !== 1 ||
      review.reviewKind !== 'delegated-source-assisted') fail('Invalid source review schema');
  if (review.humanVerified !== false || review.independentHumanReview !== false) {
    fail('Source-assisted research cannot claim independent human verification');
  }
  const originals = new Map();
  for (const item of originalCases) {
    if (!nonempty(item.id) || originals.has(item.id) || !['word', 'text'].includes(item.mode) ||
        !nonempty(item.roman) || !nonempty(item.proposedOutput)) fail('Invalid or duplicate original case');
    originals.set(item.id, item);
  }
  if (review.cases.length !== originals.size) fail('Review must cover every original case exactly once');
  const seen = new Set();
  for (const record of review.cases) {
    const item = originals.get(record.id);
    if (!item || seen.has(record.id)) fail('Unknown or duplicate review ID: ' + record.id);
    seen.add(record.id);
    if ((record.input !== undefined && record.input !== item.roman) ||
        (record.sourceProposal !== undefined && record.sourceProposal !== item.proposedOutput)) fail('Published source spelling changed: ' + record.id);
    if (record.mode !== item.mode || record.romanSha256 !== sha256(item.roman) ||
        record.sourceProposalSha256 !== sha256(item.proposedOutput)) fail('Original case hash or mode changed: ' + record.id);
    if (!decisions.includes(record.decision) || !['high', 'medium', 'low'].includes(record.confidence) ||
        !nonempty(record.reason) || !datePattern.test(record.reviewedAt)) fail('Invalid review decision metadata: ' + record.id);
    if (!Array.isArray(record.evidence)) fail('Evidence must be an array');
    for (const source of record.evidence) {
      let url;
      try { url = new URL(source.url); } catch { fail('Invalid evidence URL'); }
      if (!['https:', 'http:'].includes(url.protocol) || !nonempty(source.title) || !nonempty(source.support) ||
          !nonempty(source.accessScope) || !datePattern.test(source.verifiedAt)) fail('Invalid evidence metadata');
    }
    if (item.mode === 'text' && record.referenceOutputs !== undefined) fail('Public sentence references must use patches');
    if (item.mode === 'word' && record.referencePatches !== undefined) fail('Word references must use referenceOutputs');
    const references = resolveReferences(item, record);
    if (references.some(value => !nonempty(value)) || new Set(references).size !== references.length) fail('Invalid or duplicate references');
    if (admitted(record.decision)) {
      if (!references.length) fail('Admitted cases require references');
      if (!record.evidence.length) fail('Admitted cases require evidence');
      if (record.question !== null) fail('Admitted cases cannot have an unresolved question');
    } else {
      if (references.length) fail('Excluded or unresolved cases cannot have scored references');
      if (record.decision === 'needs-user' && !nonempty(record.question)) fail('Unresolved cases require a question');
    }
    if (record.preferredReferenceIndex !== null && (!Number.isInteger(record.preferredReferenceIndex) ||
        record.preferredReferenceIndex < 0 || record.preferredReferenceIndex >= references.length)) fail('Invalid preferred reference index');
  }
  return review;
}

export function evaluateSourceReview(originalCases, review, converters = { convertWord, convertText }) {
  validateSourceReview(originalCases, review);
  const records = new Map(review.cases.map(record => [record.id, record]));
  const metrics = () => ({ total: 0, topMatchesAny: 0, preferredTotal: 0, preferredMatches: 0 });
  const summary = { total: originalCases.length, decisions: Object.fromEntries(decisions.map(name => [name, 0])),
    admittedTotal: 0, word: { ...metrics(), candidateMatchesAny: 0, candidateMatchesAll: 0,
      referenceCandidatesMatched: 0, referenceCandidatesTotal: 0 }, text: metrics() };
  const items = originalCases.map(original => {
    const record = records.get(original.id);
    summary.decisions[record.decision]++;
    const item = { id: original.id, mode: original.mode, decision: record.decision, evaluated: admitted(record.decision) };
    if (!item.evaluated) return item;
    const word = original.mode === 'word';
    const result = word ? converters.convertWord(original.roman) : { text: converters.convertText(original.roman), candidates: [] };
    if (typeof result?.text !== 'string' || !Array.isArray(result.candidates) || result.candidates.some(value => typeof value !== 'string')) {
      fail('Invalid converter result for ' + original.id);
    }
    const references = resolveReferences(original, record);
    const preferred = record.preferredReferenceIndex === null ? null : references[record.preferredReferenceIndex];
    const topMatchesAny = references.includes(result.text);
    const preferredMatch = preferred === null ? null : result.text === preferred;
    const metrics = summary[word ? 'word' : 'text'];
    metrics.total++;
    summary.admittedTotal++;
    if (topMatchesAny) metrics.topMatchesAny++;
    if (preferred !== null) {
      metrics.preferredTotal++;
      if (preferredMatch) metrics.preferredMatches++;
    }
    const candidates = [...new Set(result.candidates)];
    const referenceCandidatesMatched = word ? references.filter(reference => candidates.includes(reference)).length : null;
    if (word) {
      metrics.referenceCandidatesTotal += references.length;
      metrics.referenceCandidatesMatched += referenceCandidatesMatched;
      if (referenceCandidatesMatched > 0) metrics.candidateMatchesAny++;
      if (referenceCandidatesMatched === references.length) metrics.candidateMatchesAll++;
    }
    return { ...item, roman: original.roman, proposedOutput: original.proposedOutput, references,
      preferredReferenceIndex: record.preferredReferenceIndex, actualTop: result.text, actualTopSha256: sha256(result.text),
      candidates, topMatchesAny, preferredMatch, referenceCandidatesMatched };
  });
  return { summary, items };
}

/** Preserve review evidence and word observations while withholding full sentence text. */
export function publicResults(result) {
  return { summary: structuredClone(result.summary), items: result.items.map(item => {
    if (item.mode !== 'text') return structuredClone(item);
    const { roman, proposedOutput, references, actualTop, candidates, ...publicItem } = item;
    return publicItem;
  }) };
}
