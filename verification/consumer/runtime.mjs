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
assert.equal(core.convertText('paani 123 test99@example.com https://example.com/456 |'),
  'पानी १२३ test99@example.com https://example.com/456 ।');
assert.equal(core.createEngine({ digits: 'latin' }).convertText('paani 3.14'), 'पानी 3.14');
assert.equal(core.createEngine().convertText('paani 3.14'), 'पानी ३.१४');
const custom = core.createEngine({ entries: { ojas: ['ओजस', 'ओजस्'], serial: ['123', '१२३'] } });
assert.deepEqual(custom.convertWord('ojas'), { text: 'ओजस', candidates: ['ओजस', 'ओजस्'], ambiguous: true });
assert.deepEqual(custom.convertWord('serial'), { text: '१२३', candidates: ['१२३'], ambiguous: false });
assert.notEqual(core.convertWord('ojas').text, custom.convertWord('ojas').text, 'Custom engines remain independent');
assert.throws(() => core.createEngine({ digits: 'arabic' }), TypeError);
assert.throws(() => core.createEngine({ preserveTechnicalText: 'yes' }), TypeError);
assert.throws(() => core.createEngine({ entries: { empty: [] } }), TypeError);

for (const subpath of ['sahajlipi/src/index.js', 'sahajlipi/lexicon', 'sahajlipi/package.json']) {
  await assert.rejects(import(subpath), (error) => error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED');
}
console.log('JavaScript: public ESM imports, server-safe DOM import, conversions, options, isolation and blocked internal exports passed.');
