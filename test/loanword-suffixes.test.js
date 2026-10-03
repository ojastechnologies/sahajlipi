import test from 'node:test';
import assert from 'node:assert/strict';
import { convertWord, convertText, createEngine } from '../src/index.js';

// Literal project references from the frozen source-assisted development review.
for (const [input, text, candidates] of [
  ['companyharumathi', 'कम्पनीहरूमाथि', ['कम्पनीहरूमाथि']],
  ['schoolma', 'स्कुलमा', ['स्कुलमा', 'स्कूलमा']],
  ['mediasanga', 'मिडियासँग', ['मिडियासँग']],
]) {
  test('reviewed loanword suffix form: ' + input, () => {
    assert.deepEqual(convertWord(input), { text, candidates, ambiguous: candidates.length > 1 });
  });
}

// Independently declared product contracts for the bounded suffix table.
for (const [input, expected] of [
  ['companyma', 'कम्पनीमा'], ['companyko', 'कम्पनीको'], ['companyka', 'कम्पनीका'],
  ['companyki', 'कम्पनीकी'], ['companyle', 'कम्पनीले'], ['companylai', 'कम्पनीलाई'],
  ['companybata', 'कम्पनीबाट'], ['companysanga', 'कम्पनीसँग'], ['companymathi', 'कम्पनीमाथि'],
  ['companyharu', 'कम्पनीहरू'], ['companyharuma', 'कम्पनीहरूमा'], ['companyharuko', 'कम्पनीहरूको'],
  ['companyharuka', 'कम्पनीहरूका'], ['companyharuki', 'कम्पनीहरूकी'], ['companyharule', 'कम्पनीहरूले'],
  ['companyharulai', 'कम्पनीहरूलाई'], ['companyharubata', 'कम्पनीहरूबाट'], ['companyharusanga', 'कम्पनीहरूसँग'],
]) test('declared suffix spelling: ' + input, () => assert.equal(convertWord(input).text, expected));

test('recognized consonant and vowel-final loanword stems retain their full native spelling', () => {
  for (const [input, expected] of [
    ['camerako', 'क्यामेराको'], ['radioma', 'रेडियोमा'], ['videoko', 'भिडियोको'],
    ['mediaharule', 'मिडियाहरूले'], ['taxilai', 'ट्याक्सीलाई'], ['furniturebata', 'फर्निचरबाट'],
    ['carpetma', 'कार्पेटमा'], ['carma', 'कारमा'], ['telephonema', 'टेलिफोनमा'],
    ['microphoneharu', 'माइक्रोफोनहरू'], ['websiteko', 'वेबसाइटको'], ['schoolharuma', 'स्कुलहरूमा'],
  ]) assert.equal(convertWord(input).text, expected);
});

test('school base and suffixed candidates retain both reviewed spellings in default order', () => {
  assert.deepEqual(convertWord('school'), { text: 'स्कुल', candidates: ['स्कुल', 'स्कूल'], ambiguous: true });
  assert.deepEqual(convertWord('schoolharuko'), { text: 'स्कुलहरूको', candidates: ['स्कुलहरूको', 'स्कूलहरूको'], ambiguous: true });
});

test('custom recognized roots propagate ordered alternatives and deduplicate identical readings', () => {
  const engine = createEngine({ entries: { school: ['विद्यालय', 'स्कूल', 'विद्यालय'] } });
  assert.deepEqual(engine.convertWord('schoolma'), { text: 'विद्यालयमा', candidates: ['विद्यालयमा', 'स्कूलमा'], ambiguous: true });
  assert.deepEqual(convertWord('schoolma').candidates, ['स्कुलमा', 'स्कूलमा']);
});

test('exact compound overrides beat derived readings including reserved Shift keys', () => {
  const engine = createEngine({ entries: { school: ['विद्यालय'], schoolma: ['पाठशालामा'], Schoolma: ['School literal'] } });
  assert.equal(engine.convertWord('schoolma').text, 'पाठशालामा');
  assert.equal(engine.convertWord('Schoolma').text, 'School literal');
});

test('plain Latin custom root readings retain the Roman suffix without mixing scripts', () => {
  const engine = createEngine({ entries: { company: ['company'], school: ['School', 'विद्यालय'] } });
  assert.deepEqual(engine.convertWord('companyharumathi'), { text: 'companyharumathi', candidates: ['companyharumathi'], ambiguous: false });
  assert.deepEqual(engine.convertWord('schoolma'), { text: 'Schoolma', candidates: ['Schoolma', 'विद्यालयमा'], ambiguous: true });
});

test('incidental capitals match suffixes while reserved Shift sounds use the existing fallback', () => {
  assert.equal(convertWord('CompanyHaruma').text, 'कम्पनीहरूमा');
  assert.equal(convertWord('camerako').text, 'क्यामेराको');
  for (const [input, expected] of [
    ['Schoolma', 'ष्चूल्म'], ['companyMaThi', 'चोम्पञ्मठि'], ['mediaHaru', 'मेदिअःअरु'],
  ]) assert.equal(convertWord(input).text, expected);
});

test('unknown endings, repeated suffix chains, months and arbitrary custom stems do not derive', () => {
  const custom = createEngine({ entries: { newword: ['नयाँशब्द'] } });
  for (const [input, expected] of [
    ['companymaharu', 'चोम्पञ्महरु'], ['companyharuharu', 'चोम्पञ्हरुहरु'],
    ['companymaa', 'चोम्पञ्मा'], ['companysangai', 'चोम्पञ्सङै'],
    ['newwordma', 'नेव्वोर्द्म'], ['januaryma', 'जनुअर्य्म'], ['kamma', 'कम्म'],
  ]) assert.equal(custom.convertWord(input).text, expected);
});

test('explicit marks use the derived preferred reading without changing existing mark semantics', () => {
  assert.equal(convertWord('companyma~').text, 'कम्पनीमाँ');
  assert.equal(convertWord('companyma^').text, 'कम्पनीमां');
  assert.equal(convertWord('schoolma/').text, 'स्कुलमा/');
});

test('text conversion uses derived forms while addresses keep their literal spelling and digits', () => {
  assert.equal(convertText('companyharumathi schoolma mediasanga company@school.com https://media.com T D S R|'),
    'कम्पनीहरूमाथि स्कुलमा मिडियासँग company@school.com https://media.com ट ड ष ऋ।');
  assert.equal(convertText('companyma.com schoolma@example.com mediaharu 123.'),
    'companyma.com schoolma@example.com मिडियाहरू १२३.');
  assert.equal(createEngine({ digits: 'latin' }).convertText('mediasanga 123.'), 'मिडियासँग 123.');
});
