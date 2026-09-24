import { starterEntries } from './lexicon.js';
import { normalizeRoman, phoneticWord } from './phonetic.js';

/**
 * Create an independent engine. Custom entries replace starter entries for
 * the same Roman spelling; each value is ordered from preferred to alternate.
 * @param {{entries?: Record<string, string[]>}} [options]
 */
export function createEngine({ entries = {} } = {}) {
  const dictionary = new Map(
    Object.entries(starterEntries).map(([key, values]) => [key, [...values]]),
  );
  for (const [key, values] of Object.entries(entries)) {
    if (!Array.isArray(values) || values.length === 0 || values.some((value) => typeof value !== 'string' || value.length === 0)) {
      throw new TypeError(`Entry for "${key}" must be a non-empty array of non-empty strings`);
    }
    dictionary.set(normalizeRoman(key), [...values]);
  }

  function lookup(roman) {
    const normalized = normalizeRoman(roman);
    const exact = dictionary.get(normalized);
    if (exact || /[TD]/.test(normalized)) return exact;
    return dictionary.get(normalized.toLowerCase());
  }

  function convertWord(roman) {
    if (!roman) return { text: '', candidates: [], ambiguous: false };
    let readings = lookup(roman);
    if (!readings && /[\^~\/=]/.test(roman)) {
      // Process explicit marks after each segment's preferred reading. A
      // full-spelling dictionary entry can still define valid alternatives.
      let output = '';
      let explicitHalant = false;
      for (const part of roman.split(/([\^~\/=])/)) {
        if (!part) continue;
        if (part === '/') {
          if (output.endsWith('्')) explicitHalant = true;
          else if (/[क-हक़-य़]$/u.test(output)) {
            output += '्';
            explicitHalant = true;
          } else {
            output += '/';
            explicitHalant = false;
          }
        } else if (part === '=') {
          output += explicitHalant && output.endsWith('्') ? '\u200d' : '=';
          explicitHalant = false;
        } else {
          output += part === '^' ? 'ं' : part === '~' ? 'ँ'
            : (lookup(part) ?? [phoneticWord(part)])[0];
          explicitHalant = false;
        }
      }
      readings = [output];
    }
    const candidates = [...new Set(readings ?? [phoneticWord(roman)])];
    return { text: candidates[0], candidates, ambiguous: candidates.length > 1 };
  }

  function convertText(text) {
    const converted = text.replace(/[A-Za-z\^~\/=]+/g, (word) => convertWord(word).text);
    return converted.replace(/\|/g, '।');
  }

  return { convertWord, convertText };
}

const defaultEngine = createEngine();
export const convertWord = defaultEngine.convertWord;
export const convertText = defaultEngine.convertText;
