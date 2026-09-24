import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseAksharantarRows,
  scoreAksharantar,
  verifyAksharantarTest,
} from '../benchmark/aksharantar-core.js';
import { buildSentenceReviewQueue } from '../benchmark/sentence-review-core.js';

function wordRow(id, roman, native, source) {
  return JSON.stringify({
    unique_identifier: id,
    'english word': roman,
    'native word': native,
    source,
  });
}

test('Aksharantar parser keeps case and repeated Roman spellings as separate labeled pairs', () => {
  const rows = parseAksharantarRows([
    wordRow('nep1', 'Tika', 'टीका', 'AK-Freq'),
    wordRow('nep2', 'Tika', 'टिका', 'AK-NEI'),
  ].join('\n'));

  assert.deepEqual(rows, [
    { id: 'nep1', roman: 'Tika', native: 'टीका', category: 'AK-Freq' },
    { id: 'nep2', roman: 'Tika', native: 'टिका', category: 'AK-NEI' },
  ]);
});

test('Aksharantar parser rejects a training row and a repeated identifier', () => {
  assert.throws(
    () => parseAksharantarRows(wordRow('nep1', 'pani', 'पनि', 'IndicCorp')),
    /AK-Freq|AK-NEF|AK-NEI/,
  );
  assert.throws(
    () => parseAksharantarRows([
      wordRow('nep1', 'pani', 'पनि', 'AK-Freq'),
      wordRow('nep1', 'paani', 'पानी', 'AK-Freq'),
    ].join('\n')),
    /repeated identifier/,
  );
});

test('pinned test validation requires the observed archive category counts', () => {
  const rows = parseAksharantarRows(wordRow('nep1', 'pani', 'पनि', 'AK-Freq'));
  assert.throws(() => verifyAksharantarTest(rows), /AK-Freq.*2108/);
});

test('word scoring distinguishes preferred output from candidate coverage for every pair', () => {
  const rows = parseAksharantarRows([
    wordRow('nep1', 'pani', 'पनि', 'AK-Freq'),
    wordRow('nep2', 'kam', 'काम', 'AK-NEI'),
    wordRow('nep3', 'kam', 'कम', 'AK-NEI'),
  ].join('\n'));
  const report = scoreAksharantar(rows);

  assert.deepEqual(report.overall, { total: 3, top: 2, candidate: 3 });
  assert.deepEqual(report.categories['AK-NEI'], { total: 2, top: 1, candidate: 2 });
  assert.deepEqual(report.misses.map(({ id, actualTop }) => ({ id, actualTop })), [
    { id: 'nep2', actualTop: 'कम' },
  ]);
});

test('sentence queue includes paired Nepali records and marks every item unreviewed', () => {
  const queue = buildSentenceReviewQueue({ data: [
    { unique_identifier: 'ne_2', language: 'Nepali', source: 'Manually-Collected', 'romanized sentence': 'Tebulmaa pani.', 'native sentence': 'टेबुलमा पानी।' },
    { unique_identifier: 'hi_1', language: 'Hindi', source: 'Dakshina', 'romanized sentence': 'pani', 'native sentence': 'पानी' },
    { unique_identifier: 'ne_3', language: 'Nepali', source: 'Manually-Collected', 'romanized sentence': '', 'native sentence': 'पानी' },
  ] });

  assert.deepEqual(queue, [{
    sourceId: 'ne_2',
    roman: 'Tebulmaa pani.',
    proposedOutput: 'टेबुलमा पानी।',
    provenance: 'ai4bharat/Bhasha-Abhijnaanam@c54a95d9b9d62c891a03bd5da60715df7176b097',
    reviewStatus: 'unreviewed',
    reviews: [],
    acceptedOutputs: [],
  }]);
});

test('sentence queue rejects duplicate Nepali identifiers', () => {
  const item = { unique_identifier: 'ne_2', language: 'Nepali', source: 'Manually-Collected', 'romanized sentence': 'pani', 'native sentence': 'पानी' };
  assert.throws(() => buildSentenceReviewQueue({ data: [item, item] }), /repeated identifier/);
});
