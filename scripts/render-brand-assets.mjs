#!/usr/bin/env node
// Optional artwork export tool. It is not part of either package entry point.
// Install sharp@0.35.4 in a separate tools directory; see assets/brand/README.md.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const directory = path.join(root, 'assets/brand');
const manifestPath = path.join(directory, 'manifest.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const exports = [
  ['mark.svg', 'avatar.png', 512, 512, 'Square project icon'],
  ['mark.svg', 'icon-192.png', 192, 192, 'Browser icon'],
  ['mark.svg', 'icon-512.png', 512, 512, 'Browser icon'],
  ['mark.svg', 'apple-touch-icon.png', 180, 180, 'Apple touch icon'],
  ['favicon.svg', 'favicon-32.png', 32, 32, 'Browser favicon'],
  ['logo.svg', 'logo.png', 520, 112, 'Primary horizontal logo'],
  ['social-preview.svg', 'social-preview.png', 1280, 640, 'Repository and website social preview'],
  ['brand-sheet.svg', 'brand-sheet.png', 1600, 1020, 'Brand identity contact sheet'],
];
const records = [];
for (const [source, output, width, height, role] of exports) {
  let image = sharp(path.join(directory, source)).resize(width, height);
  // iOS supplies the icon mask; an opaque tile avoids dark transparent corners.
  if (output === 'apple-touch-icon.png') image = image.flatten({ background: manifest.palette.teal });
  await image.png({ compressionLevel: 9 }).toFile(path.join(directory, output));
  records.push({ file: output, width, height, format: 'PNG', source, role });
}
// ICO with embedded PNG frames, avoiding an extra export dependency.
const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map(size => sharp(path.join(directory, 'favicon.svg'))
  .resize(size, size).png({ compressionLevel: 9 }).toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
frames.forEach((frame, index) => {
  const base = 6 + index * 16;
  header[base] = sizes[index]; header[base + 1] = sizes[index];
  header.writeUInt16LE(1, base + 4); header.writeUInt16LE(32, base + 6);
  header.writeUInt32LE(frame.length, base + 8); header.writeUInt32LE(offset, base + 12);
  offset += frame.length;
});
await fs.writeFile(path.join(directory, 'favicon.ico'), Buffer.concat([header, ...frames]));
records.push({ file: 'favicon.ico', sizes, format: 'ICO', source: 'favicon.svg', role: 'Fallback browser favicon' });
manifest.assets = [...manifest.assets.filter(item => item.format === 'SVG'), ...records];
manifest.generation.sharpVersion = sharp.versions.sharp;
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
const preview = await fs.stat(path.join(directory, 'social-preview.png'));
if (preview.size >= 1_000_000) throw new Error('GitHub social preview must be below 1 MB');
console.log(`Exported ${records.length} raster assets; social preview ${preview.size} bytes.`);
