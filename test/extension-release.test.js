import assert from 'node:assert/strict';
import test from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import {
  changelogSection,
  createZip,
  isStoreVersion,
  manifestProblems,
  releaseProblems,
  runtimeFiles,
} from '../tools/extension-release.js';

const extensionDir = fileURLToPath(new URL('../extension/', import.meta.url));
const manifest = JSON.parse(await readFile(new URL('../extension/manifest.json', import.meta.url), 'utf8'));

function readZip(zip) {
  const end = zip.length - 22;
  assert.equal(zip.readUInt32LE(end), 0x06054b50);
  const files = new Map();
  let position = zip.readUInt32LE(end + 16);
  for (let index = 0; index < zip.readUInt16LE(end + 10); index += 1) {
    assert.equal(zip.readUInt32LE(position), 0x02014b50);
    const compressedSize = zip.readUInt32LE(position + 20);
    const nameLength = zip.readUInt16LE(position + 28);
    const name = zip.toString('utf8', position + 46, position + 46 + nameLength);
    const local = zip.readUInt32LE(position + 42);
    assert.equal(zip.readUInt32LE(local), 0x04034b50);
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    files.set(name, inflateRawSync(zip.subarray(start, start + compressedSize)).toString());
    position += 46 + nameLength;
  }
  return files;
}

test('store versions are one to four small integers and not all zero', () => {
  for (const version of ['0.0.1', '0.1.0', '1', '1.2.3.4', '65535.0']) assert.equal(isStoreVersion(version), true, version);
  for (const version of ['0', '0.0', '0.1.0-alpha.4', '1.2.3.4.5', '01.2', '65536', '', undefined]) {
    assert.equal(isStoreVersion(version), false, String(version));
  }
});

test('the shipped manifest passes and keeps site access optional', () => {
  assert.deepEqual(manifestProblems(manifest), []);
  assert.match(manifestProblems({ version: '1.0', host_permissions: ['<all_urls>'] })[0], /optional/);
  assert.match(manifestProblems({ version: '1.0-beta' })[0], /store version/);
});

test('changelog sections end at the next heading and need content', () => {
  const changelog = '# Log\n\n## 0.2.0 - 2026-12-01\n\nSecond.\n\n## 0.1.0 - 2026-11-03\n\nFirst.\n\n## 0.1.00\n\nOther.\n';
  assert.equal(changelogSection(changelog, '0.2.0'), 'Second.');
  assert.equal(changelogSection(changelog, '0.1.0'), 'First.');
  assert.equal(changelogSection(changelog, '0.3.0'), null);
  assert.equal(changelogSection('## 0.1.0\n\n## 0.0.1\n\nOld.\n', '0.1.0'), null);
});

test('a tagged release needs a matching tag, a final name and a changelog entry', () => {
  const ready = { name: 'SahajLipi Nepali Typing', version: '0.1.0' };
  const changelog = '## 0.1.0\n\nFirst.\n';
  assert.deepEqual(releaseProblems('extension-v0.1.0', ready, changelog), []);
  assert.match(releaseProblems('v0.1.0', ready, changelog)[0], /does not match/);
  assert.match(releaseProblems('extension-v0.1.0', { ...ready, name: 'SahajLipi (prototype)' }, changelog)[0], /prototype/);
  assert.match(releaseProblems('extension-v0.1.0', ready, '## 0.0.1\n\nOld.\n')[0], /no entry/);
});

test('the package holds what the manifest reaches and no fixtures or bundled sources', async () => {
  const files = await runtimeFiles(extensionDir, manifest);
  for (const file of ['dist/content.js', 'icons/icon-128.png', 'src/background.js', 'src/popup.css', 'src/popup.html', 'src/popup.js', 'src/site.js', 'src/typing-guide.js']) {
    assert.ok(files.includes(file), file);
  }
  assert.deepEqual(files.filter(file => /fixtures|README|content\.js$/.test(file) && file !== 'dist/content.js'), []);
  assert.ok(!files.includes('src/candidates.js'));
});

test('the extension and engine have no network or page storage code, as the privacy policy states', async () => {
  const banned = /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|importScripts|localStorage|sessionStorage|indexedDB|storage\.sync/;
  for (const folder of ['../extension/src/', '../src/']) {
    for (const entry of await readdir(new URL(folder, import.meta.url))) {
      if (!/\.(js|html)$/.test(entry)) continue;
      assert.doesNotMatch(await readFile(new URL(folder + entry, import.meta.url), 'utf8'), banned, entry);
    }
  }
});

test('zips round-trip and do not depend on entry order', () => {
  const entries = [{ name: 'b/नेपाली.txt', data: Buffer.from('नेपाली'.repeat(50)) }, { name: 'a.txt', data: Buffer.from('plain') }];
  const zip = createZip(entries);
  assert.deepEqual([...readZip(zip)], [['a.txt', 'plain'], ['b/नेपाली.txt', 'नेपाली'.repeat(50)]]);
  assert.ok(zip.equals(createZip([...entries].reverse())));
});
