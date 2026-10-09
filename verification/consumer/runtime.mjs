import assert from 'node:assert/strict';
import * as core from 'sahajlipi';
import * as dom from 'sahajlipi/dom';

assert.equal(typeof globalThis.document, 'undefined', 'Run this fixture in a plain Node process');
assert.deepEqual(Object.keys(core).sort(), ['convertText', 'convertWord', 'createEngine']);
assert.deepEqual(Object.keys(dom).sort(), ['attachNepaliInput', 'attachNepaliInputs']);
assert.equal(typeof dom.attachNepaliInput, 'function');
assert.equal(typeof dom.attachNepaliInputs, 'function');

assert.deepEqual(core.convertWord('cha'), { text: 'च', candidates: ['च', 'छ'], ambiguous: true });
assert.deepEqual(core.convertWord(''), { text: '', candidates: [], ambiguous: false });
assert.equal(core.convertWord('paryo').text, 'पर्\u200dयो');
assert.equal(core.convertWord('companyharumathi').text, 'कम्पनीहरूमाथि');
assert.equal(core.convertText('halyo nabhani gaunle dindaina|'), 'हाल्यो नभनी गाउँले दिँदैन।');
// Check the release's reviewed entries through the installed public export.
for (const [roman, expected] of [
  ['imandar', 'इमान्दार'], ['sarasar', 'सरासर'], ['sakos', 'सकोस्'],
  ['kathanak', 'कथानक'], ['arambha', 'आरम्भ'], ['ekadhik', 'एकाधिक'],
  ['jaghanya', 'जघन्य'], ['pukar', 'पुकार'], ['niskanda', 'निस्कँदा'],
  ['bora', 'बोरा'], ['utthan', 'उत्थान'], ['samanjasya', 'सामञ्जस्य'],
]) {
  assert.deepEqual(core.convertWord(roman), { text: expected, candidates: [expected], ambiguous: false });
}
assert.deepEqual(core.convertWord('bhagna'), { text: 'भग्न', candidates: ['भग्न', 'भाग्न'], ambiguous: true });
assert.equal(core.convertText('imandar company 123 sakos| mahesh@example.com https://example.com'),
  'इमान्दार कम्पनी १२३ सकोस्। mahesh@example.com https://example.com');
assert.equal(core.convertText('futera kendraharudwara manovaigyanikharule fyankidinchhan purnakalinlai|'),
  'फुटेर केन्द्रहरूद्वारा मनोवैज्ञानिकहरूले फ्याँकिदिन्छन् पूर्णकालीनलाई।');
assert.deepEqual(core.convertWord('mahila'), { text: 'महिला', candidates: ['महिला', 'माहिला'], ambiguous: true });
assert.deepEqual(core.convertWord('shanta'), { text: 'शान्त', candidates: ['शान्त', 'शान्ता'], ambiguous: true });
assert.deepEqual(core.convertWord('angrejharuko').candidates, ['अङ्ग्रेजहरूको', 'अंग्रेजहरूको']);
assert.equal(core.convertWord('Shanta').text, 'षन्त');
assert.equal(core.createEngine({ consonantMode: 'half' }).convertWord('fyankidinchhan').text, 'फ्याँकिदिन्छन्');
assert.equal(core.createEngine({ entries: { mahila: ['माहिला', 'महिला'] } }).convertWord('mahila').text, 'माहिला');
assert.equal(core.convertWord('mahila').text, 'महिला');
assert.deepEqual(core.convertWord('schoolma'), { text: 'स्कुलमा', candidates: ['स्कुलमा', 'स्कूलमा'], ambiguous: true });
assert.equal(core.convertText('mediasanga company@school.com https://media.com'), 'मिडियासँग company@school.com https://media.com');
assert.equal(core.convertText('paani 123 test99@example.com https://example.com/456 |'),
  'पानी १२३ test99@example.com https://example.com/456 ।');
assert.equal(core.createEngine({ digits: 'latin' }).convertText('paani 3.14'), 'पानी 3.14');
assert.equal(core.createEngine().convertText('paani 3.14'), 'पानी ३.१४');
assert.equal(core.convertText('k kr kri k`|'), 'क क्र क्रि क्।');
const strict = core.createEngine({ consonantMode: 'half' });
assert.equal(strict.convertText('k kr kri k`|'), 'क् क्र् क्रि क्।');
assert.equal(core.convertWord('k').text, 'क', 'Strict engines must not change module defaults');
const custom = core.createEngine({ entries: { ojas: ['ओजस', 'ओजस्'], serial: ['123', '१२३'] } });
assert.deepEqual(custom.convertWord('ojas'), { text: 'ओजस', candidates: ['ओजस', 'ओजस्'], ambiguous: true });
assert.deepEqual(custom.convertWord('serial'), { text: '१२३', candidates: ['१२३'], ambiguous: false });
assert.deepEqual(core.convertWord('ojas'), { text: 'ओजस', candidates: ['ओजस'], ambiguous: false }, 'Custom engines remain independent');
assert.throws(() => core.createEngine({ digits: 'arabic' }), TypeError);
assert.throws(() => core.createEngine({ consonantMode: 'strict' }), TypeError);
assert.throws(() => core.createEngine({ preserveTechnicalText: 'yes' }), TypeError);
assert.throws(() => core.createEngine({ entries: { empty: [] } }), TypeError);

for (const subpath of ['sahajlipi/src/index.js', 'sahajlipi/lexicon', 'sahajlipi/package.json']) {
  await assert.rejects(import(subpath), (error) => error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED');
}
console.log('JavaScript: public ESM imports, server-safe DOM import, conversions, options, isolation and blocked internal exports passed.');
