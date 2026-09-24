import { convertWord } from '../src/index.js';

export const PINNED_CATEGORY_COUNTS = Object.freeze({
  'AK-Freq': 2108,
  'AK-NEF': 817,
  'AK-NEI': 1176,
});

export function parseAksharantarRows(jsonl) {
  const rows = [];
  const ids = new Set();

  for (const [index, line] of jsonl.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    let item;
    try {
      item = JSON.parse(line);
    } catch (error) {
      throw new Error(`Line ${index + 1} is invalid JSON: ${error.message}`);
    }
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`Line ${index + 1} must be an object`);
    }

    const id = item.unique_identifier;
    const roman = item['english word'];
    const native = item['native word'];
    const category = item.source;
    if (typeof id !== 'string' || !/^nep\d+$/.test(id)) {
      throw new Error(`Line ${index + 1} needs a Nepali unique_identifier`);
    }
    if (ids.has(id)) throw new Error(`Line ${index + 1} has repeated identifier ${id}`);
    if (typeof roman !== 'string' || !roman.trim() ||
        typeof native !== 'string' || !native.trim()) {
      throw new Error(`Line ${index + 1} (${id}) needs Roman and native words`);
    }
    if (!Object.hasOwn(PINNED_CATEGORY_COUNTS, category)) {
      throw new Error(`Line ${index + 1} (${id}) needs an AK-Freq, AK-NEF, or AK-NEI source`);
    }
    ids.add(id);
    rows.push({ id, roman, native, category });
  }
  if (!rows.length) throw new Error('No Nepali test rows found');
  return rows;
}

export function verifyAksharantarTest(rows) {
  for (const [category, expected] of Object.entries(PINNED_CATEGORY_COUNTS)) {
    const actual = rows.filter((row) => row.category === category).length;
    if (actual !== expected) {
      throw new Error(`${category} has ${actual} rows; expected ${expected} in the official Nepali test set`);
    }
  }
}

export function scoreAksharantar(rows) {
  const empty = () => ({ total: 0, top: 0, candidate: 0 });
  const overall = empty();
  const categories = Object.fromEntries(
    Object.keys(PINNED_CATEGORY_COUNTS).map((category) => [category, empty()]),
  );
  const misses = [];

  for (const row of rows) {
    const result = convertWord(row.roman);
    const topMatch = result.text === row.native;
    const candidateHit = result.candidates.includes(row.native);
    for (const score of [overall, categories[row.category]]) {
      score.total++;
      if (topMatch) score.top++;
      if (candidateHit) score.candidate++;
    }
    if (!topMatch || !candidateHit) {
      misses.push({ ...row, actualTop: result.text, candidates: result.candidates });
    }
  }
  return { overall, categories, misses };
}
