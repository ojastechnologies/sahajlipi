import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'package.json', 'README.md', 'LICENSE', 'NOTICE', 'LICENSES/Unicode-3.0.txt',
  'src/index.js', 'src/index.d.ts', 'src/dom.js', 'src/dom.d.ts',
  'src/lexicon.js', 'src/loanwords.js', 'src/phonetic.js', 'src/text-policy.js',
];
const runtimeFiles = new Set(requiredFiles.filter((name) => name.startsWith('src/')));

async function run(file, args, cwd) {
  try {
    return await execFileAsync(file, args, {
      cwd,
      maxBuffer: 8 * 1024 * 1024,
      env: { ...process.env, npm_config_update_notifier: 'false' },
    });
  } catch (error) {
    const output = [error.stdout, error.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`${file} ${args.join(' ')} failed${output ? `:\n${output}` : ''}`, { cause: error });
  }
}

function verifyFiles(files) {
  const names = files.map(({ path }) => path);
  for (const name of requiredFiles) {
    assert(names.includes(name), `Required packaged file is missing: ${name}`);
  }
  for (const name of names) {
    const allowed = runtimeFiles.has(name)
      || ['package.json', 'README.md', 'LICENSE', 'NOTICE'].includes(name)
      || /^LICENSES\/[^/]+\.txt$/.test(name);
    assert(allowed, `Unexpected packaged development artifact: ${name}`);
    assert(!name.split('/').some((part) => part === '..' || part.startsWith('.')), `Invalid packaged path: ${name}`);
  }
  assert.equal(new Set(names).size, names.length, 'Pack manifest contains duplicate paths');
  return names;
}

/**
 * Build and install the real npm tarball in a standalone temporary consumer.
 * Call cleanup() in a finally block. Browser verification can bundle files
 * against directory/node_modules without importing repository source files.
 */
export async function createPackageConsumer({ root = repositoryRoot } = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'sahajlipi-consumer-'));
  const cleanup = () => rm(directory, { recursive: true, force: true });
  try {
    const packDirectory = join(directory, 'packed');
    await mkdir(packDirectory);
    const { stdout } = await run('npm', [
      'pack', '--json', '--offline', '--ignore-scripts', '--pack-destination', packDirectory,
      '--cache', join(directory, '.npm-cache'),
    ], root);
    const packs = JSON.parse(stdout);
    assert.equal(packs.length, 1, 'Expected exactly one npm tarball');
    const pack = packs[0];
    const packageFiles = verifyFiles(pack.files);
    const tarballPath = join(packDirectory, pack.filename);
    await writeFile(join(directory, 'package.json'), `${JSON.stringify({
      name: 'sahajlipi-standalone-verification', private: true, type: 'module',
    }, null, 2)}\n`);
    await run('npm', [
      'install', tarballPath, '--offline', '--ignore-scripts', '--no-audit', '--no-fund',
      '--package-lock=false', '--cache', join(directory, '.npm-cache'),
    ], directory);
    const installedRoot = join(directory, 'node_modules', 'sahajlipi');
    const manifest = JSON.parse(await readFile(join(installedRoot, 'package.json'), 'utf8'));
    assert.equal(manifest.name, 'sahajlipi');
    assert.equal(manifest.type, 'module');
    assert.equal(manifest.license, 'MIT');
    assert.equal(Object.keys(manifest.dependencies ?? {}).length, 0, 'Core package must have no runtime dependencies');
    assert.equal(Object.keys(manifest.peerDependencies ?? {}).length, 0, 'Core package must have no peer dependencies');
    assert.equal(Object.keys(manifest.optionalDependencies ?? {}).length, 0, 'Core package must have no optional dependencies');
    assert.deepEqual(Object.keys(manifest.exports).sort(), ['.', './dom']);
    assert((await readFile(join(installedRoot, 'LICENSE'), 'utf8')).includes('MIT License'));
    assert((await readFile(join(installedRoot, 'LICENSES', 'Unicode-3.0.txt'), 'utf8')).includes('SPDX-License-Identifier: Unicode-3.0'));
    assert((await readFile(join(installedRoot, 'NOTICE'), 'utf8')).includes('Unicode'));
    const tarballSha256 = createHash('sha256').update(await readFile(tarballPath)).digest('hex');
    return { directory, installedRoot, tarballPath, tarballSha256, packageFiles, pack, cleanup };
  } catch (error) {
    await cleanup();
    throw error;
  }
}

export async function verifyPackage({ root = repositoryRoot } = {}) {
  const consumer = await createPackageConsumer({ root });
  try {
    const fixtureDirectory = join(root, 'verification', 'consumer');
    for (const name of ['runtime.mjs', 'core.ts', 'browser.ts']) {
      await copyFile(join(fixtureDirectory, name), join(consumer.directory, name));
    }
    const runtime = await run(process.execPath, ['runtime.mjs'], consumer.directory);
    process.stdout.write(runtime.stdout);
    const tutorialDirectory = join(consumer.directory, 'examples', 'typescript');
    await mkdir(tutorialDirectory, { recursive: true });
    for (const name of ['core.mts', 'browser.ts']) {
      await copyFile(join(root, 'examples', 'typescript', name), join(tutorialDirectory, name));
    }
    const compiler = join(root, 'node_modules', 'typescript', 'bin', 'tsc');
    const shared = { noEmit: true, strict: true, skipLibCheck: false, target: 'ES2022', types: [] };
    const tutorials = ['examples/typescript/core.mts', 'examples/typescript/browser.ts'];
    const configurations = {
      // Core declarations must not require browser globals or ambient @types.
      'core-nodenext.json': {
        compilerOptions: { ...shared, module: 'NodeNext', moduleResolution: 'NodeNext', lib: ['ES2022'] },
        files: ['core.ts'],
      },
      'browser-nodenext.json': {
        compilerOptions: { ...shared, module: 'NodeNext', moduleResolution: 'NodeNext', lib: ['ES2022', 'DOM'] },
        files: ['browser.ts', ...tutorials],
      },
      'bundler.json': {
        compilerOptions: { ...shared, module: 'ESNext', moduleResolution: 'Bundler', lib: ['ES2022', 'DOM'] },
        files: ['core.ts', 'browser.ts', ...tutorials],
      },
      // DOM supplies console's declaration in this example; execute the emitted
      // module in plain Node to check its actual server runtime behavior.
      'tutorial-runtime.json': {
        compilerOptions: { ...shared, noEmit: false, module: 'NodeNext', moduleResolution: 'NodeNext', lib: ['ES2022', 'DOM'], outDir: 'compiled-tutorial' },
        files: ['examples/typescript/core.mts'],
      },
    };
    for (const [name, configuration] of Object.entries(configurations)) {
      await writeFile(join(consumer.directory, name), `${JSON.stringify(configuration, null, 2)}\n`);
      await run(process.execPath, [compiler, '--project', name], consumer.directory);
    }
    const tutorial = await run(process.execPath, ['compiled-tutorial/core.mjs'], consumer.directory);
    assert.equal(tutorial.stdout.replace(/\r\n/g, '\n'), 'पानी\nपनि १२३।\nमेरोनाम 123।\n', 'Compiled TypeScript tutorial output changed');
    console.log(`Package consumer: ${consumer.pack.name}@${consumer.pack.version}; ${consumer.packageFiles.length} files; ${consumer.pack.size} bytes compressed.`);
    console.log('TypeScript: strict NodeNext core without DOM, DOM fixtures and tutorials, Bundler fixtures and tutorials passed.');
    console.log('TypeScript core tutorial: emitted module ran in Node with the documented output.');
    console.log(`Tarball SHA-256: ${consumer.tarballSha256}`);
    return {
      name: consumer.pack.name, version: consumer.pack.version,
      files: consumer.packageFiles, size: consumer.pack.size,
      tarballSha256: consumer.tarballSha256,
    };
  } finally {
    await consumer.cleanup();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    await verifyPackage();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
