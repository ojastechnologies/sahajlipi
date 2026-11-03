// Builds the store zip in .extension-dist/. With --tag, also applies the release rules and
// writes the release notes. It never uploads anything; see docs/extension-release.md.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { changelogSection, createZip, manifestProblems, releaseProblems, runtimeFiles } from './extension-release.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const extension = path.join(root, 'extension');
const output = path.join(root, '.extension-dist');
const LICENSE_FILES = ['LICENSE', 'NOTICE', 'LICENSES/Unicode-3.0.txt'];

const tagIndex = process.argv.indexOf('--tag');
const tag = tagIndex < 0 ? null : process.argv[tagIndex + 1];
if (tagIndex >= 0 && !tag) throw new Error('--tag needs a value, such as extension-v0.1.0');

const manifest = JSON.parse(await readFile(path.join(extension, 'manifest.json'), 'utf8'));
const changelog = await readFile(path.join(extension, 'CHANGELOG.md'), 'utf8');
const problems = [...manifestProblems(manifest), ...(tag ? releaseProblems(tag, manifest, changelog) : [])];
if (problems.length) {
  console.error(`Extension package refused:\n${problems.map(problem => `- ${problem}`).join('\n')}`);
  process.exit(1);
}

await import('./build-extension.js');

const files = ['manifest.json', ...await runtimeFiles(extension, manifest)];
const entries = await Promise.all(files.map(async name => ({ name, data: await readFile(path.join(extension, name)) })));
entries.push(...await Promise.all(LICENSE_FILES.map(async name => ({ name, data: await readFile(path.join(root, name)) }))));

const zip = createZip(entries);
const sha256 = createHash('sha256').update(zip).digest('hex');
const zipName = `sahajlipi-extension-${manifest.version}.zip`;

await rm(output, { recursive: true, force: true });
await mkdir(output);
await writeFile(path.join(output, zipName), zip);
await writeFile(path.join(output, `${zipName}.sha256`), `${sha256}  ${zipName}\n`);

if (tag) {
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  await writeFile(path.join(output, 'release-notes.md'), `${changelogSection(changelog, manifest.version)}

Built from \`${commit}\`, which is also the engine version this release bundles.

SHA-256 of \`${zipName}\`: \`${sha256}\`

This records the build. It is not a store listing; check the store for what users have.
`);
}

console.log(`Extension package: ${entries.length} files, ${zip.length} bytes -> .extension-dist/${zipName}`);
console.log(`SHA-256: ${sha256}`);
