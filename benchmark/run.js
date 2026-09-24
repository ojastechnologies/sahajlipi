#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { convertText, convertWord } from '../src/index.js';

function usage() {
  console.log('Usage: node benchmark/run.js [--check] [--fixtures path/to/cases.jsonl]');
}

function parseArgs(args) {
  let check = false;
  let fixtures = new URL('./cases.jsonl', import.meta.url);

  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--check') {
      check = true;
    } else if (argument === '--fixtures' && args[index + 1]) {
      fixtures = args[++index];
    } else if (argument === '--help') {
      usage();
      return null;
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }

  return { check, fixtures };
}

function validateCase(item, line, ids) {
  const context = `Fixture line ${line}`;
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw new Error(`${context} must contain an object`);
  }
  if (typeof item.id !== 'string' || !/^[a-z0-9-]+$/.test(item.id)) {
    throw new Error(`${context} needs a stable lowercase id`);
  }
  if (ids.has(item.id)) throw new Error(`${context} repeats id ${item.id}`);
  ids.add(item.id);
  if (!['contract', 'exploratory'].includes(item.status)) {
    throw new Error(`${context} (${item.id}) needs contract or exploratory status`);
  }
  if (!['word', 'text'].includes(item.mode)) {
    throw new Error(`${context} (${item.id}) needs word or text mode`);
  }
  for (const field of ['category', 'input', 'expectedTop', 'provenance']) {
    if (typeof item[field] !== 'string' || item[field].length === 0) {
      throw new Error(`${context} (${item.id}) needs a non-empty ${field}`);
    }
  }
  if (item.mode === 'word') {
    const expected = item.expectedCandidates;
    if (!Array.isArray(expected) || expected.length === 0 ||
      expected.some((candidate) => typeof candidate !== 'string' || !candidate.length) ||
      new Set(expected).size !== expected.length || !expected.includes(item.expectedTop)) {
      throw new Error(`${context} (${item.id}) needs distinct expectedCandidates including expectedTop`);
    }
  } else if ('expectedCandidates' in item) {
    throw new Error(`${context} (${item.id}) cannot list candidates in text mode`);
  }
  return item;
}

async function loadCases(path) {
  const source = await readFile(path, 'utf8');
  const ids = new Set();
  const cases = source.split(/\r?\n/).flatMap((line, index) => {
    if (!line.trim()) return [];
    let item;
    try {
      item = JSON.parse(line);
    } catch (error) {
      throw new Error(`Fixture line ${index + 1} is not valid JSON: ${error.message}`);
    }
    return [validateCase(item, index + 1, ids)];
  });
  if (!cases.length) throw new Error('Fixture file contains no cases');
  return cases;
}

function evaluate(item) {
  if (item.mode === 'text') {
    const actualTop = convertText(item.input);
    const topMatch = actualTop === item.expectedTop;
    return { ...item, actualTop, actualCandidates: null, topMatch, candidateHits: 0, pass: topMatch };
  }

  const result = convertWord(item.input);
  const actualTop = result.text;
  const actualCandidates = Array.isArray(result.candidates) ? result.candidates : [];
  const candidateHits = item.expectedCandidates.filter((candidate) => actualCandidates.includes(candidate)).length;
  const topMatch = actualTop === item.expectedTop;
  return {
    ...item,
    actualTop,
    actualCandidates,
    topMatch,
    candidateHits,
    pass: topMatch && candidateHits === item.expectedCandidates.length,
  };
}

function summarize(results) {
  const words = results.filter((item) => item.mode === 'word');
  const texts = results.filter((item) => item.mode === 'text');
  const categories = new Map();
  for (const item of results) {
    const category = categories.get(item.category) ?? { passed: 0, total: 0 };
    category.total++;
    if (item.pass) category.passed++;
    categories.set(item.category, category);
  }
  return {
    passed: results.filter((item) => item.pass).length,
    total: results.length,
    wordTop: words.filter((item) => item.topMatch).length,
    wordTotal: words.length,
    candidateHits: words.reduce((sum, item) => sum + item.candidateHits, 0),
    candidateTotal: words.reduce((sum, item) => sum + item.expectedCandidates.length, 0),
    textTop: texts.filter((item) => item.topMatch).length,
    textTotal: texts.length,
    categories,
  };
}

function printSummary(label, summary) {
  console.log(`${label}: ${summary.passed}/${summary.total} full cases`);
  console.log(`  Word top output: ${summary.wordTop}/${summary.wordTotal}`);
  console.log(`  Expected candidate coverage: ${summary.candidateHits}/${summary.candidateTotal}`);
  console.log(`  Text exact output: ${summary.textTop}/${summary.textTotal}`);
  if (summary.categories.size) {
    const categories = [...summary.categories].sort(([left], [right]) => left.localeCompare(right));
    console.log(`  Categories: ${categories.map(([name, score]) => `${name} ${score.passed}/${score.total}`).join(', ')}`);
  }
}

function codePoints(value) {
  return [...value].map((character) => `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`).join(' ');
}

function printMismatches(label, results) {
  const mismatches = results.filter((item) => !item.pass);
  if (!mismatches.length) return;
  console.log(`${label} mismatches:`);
  for (const item of mismatches) {
    console.log(`  ${item.id} [${item.category}] ${JSON.stringify(item.input)}`);
    console.log(`    expected top: ${JSON.stringify(item.expectedTop)} (${codePoints(item.expectedTop)})`);
    console.log(`    actual top:   ${JSON.stringify(item.actualTop)} (${codePoints(item.actualTop)})`);
    if (item.mode === 'word') {
      const missing = item.expectedCandidates.filter((candidate) => !item.actualCandidates.includes(candidate));
      console.log(`    expected candidates: ${JSON.stringify(item.expectedCandidates)}`);
      console.log(`    actual candidates:   ${JSON.stringify(item.actualCandidates)}`);
      if (missing.length) console.log(`    missing candidates:  ${JSON.stringify(missing)}`);
    }
    console.log(`    provenance: ${item.provenance}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options) return;
  const results = (await loadCases(options.fixtures)).map(evaluate);
  const contract = results.filter((item) => item.status === 'contract');
  const exploratory = results.filter((item) => item.status === 'exploratory');
  console.log(`SahajLipi seed benchmark: ${results.length} cases; default engine; exact Unicode code points`);
  printSummary('Contract', summarize(contract));
  printSummary('Exploratory (excluded from --check)', summarize(exploratory));
  printMismatches('Contract', contract);
  printMismatches('Exploratory', exploratory);
  if (options.check && contract.some((item) => !item.pass)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Benchmark error: ${error.message}`);
  process.exitCode = 2;
});
