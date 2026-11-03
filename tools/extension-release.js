// Release rules for the browser extension. Dependency-free, so `npm test` runs them without an install.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';

const CONTENT_BUNDLE = 'dist/content.js';

// The stores accept one to four dot-separated integers from 0 to 65535, not all zero.
export function isStoreVersion(version) {
  if (typeof version !== 'string' || !/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){0,3}$/.test(version)) return false;
  const parts = version.split('.').map(Number);
  return parts.every(part => part <= 65535) && parts.some(part => part > 0);
}

// Problems that would make any package of this manifest wrong. check-extension.js adds
// host_permissions to its own copy; the shipped manifest must keep site access optional.
export function manifestProblems(manifest) {
  const problems = [];
  if (!isStoreVersion(manifest.version)) problems.push(`manifest version "${manifest.version}" is not a store version`);
  if (manifest.host_permissions) problems.push('manifest must not declare host_permissions; site access stays optional');
  return problems;
}

export function changelogSection(changelog, version) {
  const lines = changelog.split('\n');
  const heading = new RegExp(`^## ${version.replaceAll('.', '\\.')}(\\s|$)`);
  const start = lines.findIndex(line => heading.test(line));
  if (start < 0) return null;
  const end = lines.findIndex((line, index) => index > start && line.startsWith('## '));
  return lines.slice(start + 1, end < 0 ? undefined : end).join('\n').trim() || null;
}

// Extra rules for a tagged release, on top of manifestProblems.
export function releaseProblems(tag, manifest, changelog) {
  const problems = [];
  if (tag !== `extension-v${manifest.version}`) problems.push(`tag "${tag}" does not match manifest version ${manifest.version}`);
  if (/prototype/i.test(manifest.name)) problems.push(`manifest name "${manifest.name}" still says prototype`);
  if (!changelogSection(changelog, manifest.version)) problems.push(`extension/CHANGELOG.md has no entry for ${manifest.version}`);
  return problems;
}

// Everything the extension loads at runtime, found by following references from the manifest,
// so a test fixture or a module that only reaches the page through the bundle is never shipped.
export async function runtimeFiles(extensionDir, manifest) {
  const seen = new Set();
  const queue = [
    ...Object.values(manifest.icons),
    ...Object.values(manifest.action.default_icon),
    manifest.action.default_popup,
    manifest.background.service_worker,
    CONTENT_BUNDLE,
  ];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    if (file.startsWith('..')) throw new Error(`reference leaves the extension folder: ${file}`);
    seen.add(file);
    const pattern = file.endsWith('.html') ? /\b(?:src|href)="(?![a-z]+:)([^"]+)"/g
      : file.endsWith('.js') && file !== CONTENT_BUNDLE ? /\bfrom\s+["'](\.{1,2}\/[^"']+)["']/g
        : null;
    if (!pattern) continue;
    const text = await readFile(path.join(extensionDir, file), 'utf8');
    for (const match of text.matchAll(pattern)) queue.push(path.posix.join(path.posix.dirname(file), match[1]));
  }
  return [...seen].sort();
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// A zip with sorted names and a fixed timestamp, so the same bytes in give the same archive out.
export function createZip(entries) {
  const DOS_DATE = 0x0021; // 1980-01-01, the earliest a zip can record.
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, data } of [...entries].sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const nameBytes = Buffer.from(name);
    const compressed = deflateRawSync(data, { level: 9 });
    const shared = Buffer.alloc(26);
    shared.writeUInt16LE(20, 0); // version needed
    shared.writeUInt16LE(8, 4); // deflate
    shared.writeUInt16LE(DOS_DATE, 8);
    shared.writeUInt32LE(crc32(data), 10);
    shared.writeUInt32LE(compressed.length, 14);
    shared.writeUInt32LE(data.length, 18);
    shared.writeUInt16LE(nameBytes.length, 22);
    const localHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    locals.push(localHeader, shared, nameBytes, compressed);

    const central = Buffer.alloc(46);
    central.write('PK\x01\x02', 0, 'latin1');
    central.writeUInt16LE(20, 4); // version made by
    shared.copy(central, 6, 0, 26);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBytes);
    offset += localHeader.length + shared.length + nameBytes.length + compressed.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.write('PK\x05\x06', 0, 'latin1');
  end.writeUInt16LE(centrals.length / 2, 8);
  end.writeUInt16LE(centrals.length / 2, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}
