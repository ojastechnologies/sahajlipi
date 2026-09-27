import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';
import { createPackageConsumer } from './verify-package.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'browser/.generated');
const consumer = await createPackageConsumer();
try {
  // The examples resolve SahajLipi from the tarball installed in this directory.
  await cp(path.join(root, 'examples'), path.join(consumer.directory, 'examples'), { recursive: true });
  for (const dependency of ['react', 'react-dom', 'scheduler', '@types', 'csstype']) {
    await cp(path.join(root, 'node_modules', dependency), path.join(consumer.directory, 'node_modules', dependency), { recursive: true });
  }
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'], jsx: 'react-jsx',
      strict: true, noEmit: true, skipLibCheck: false,
      types: ['react', 'react-dom'],
    },
    include: ['examples/react/*.tsx'],
  };
  const configPath = path.join(consumer.directory, 'tsconfig.react.json');
  await writeFile(configPath, JSON.stringify(tsconfig, null, 2) + '\n');
  execFileSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '-p', configPath], {
    cwd: consumer.directory, stdio: 'inherit',
  });
  await rm(output, { recursive: true, force: true });
  for (const [name, source] of [['vanilla', 'main.js'], ['react', 'main.tsx']]) {
    const destination = path.join(output, name);
    await mkdir(destination, { recursive: true });
    const html = await readFile(path.join(consumer.directory, 'examples', name, 'index.html'), 'utf8');
    // Bundled files contain no bare package specifiers; the checkout import map is unnecessary.
    await writeFile(path.join(destination, 'index.html'), html.replace(/\s*<script type="importmap">[\s\S]*?<\/script>/g, ''));
    const result = await build({
      absWorkingDir: consumer.directory,
      entryPoints: [path.join(consumer.directory, 'examples', name, source)],
      outfile: path.join(destination, 'main.js'),
      bundle: true, format: 'esm', platform: 'browser', target: 'es2022',
      jsx: 'automatic', define: { 'process.env.NODE_ENV': '"development"' },
      metafile: true,
    });
    const inputs = Object.keys(result.metafile.inputs).map(input => path.resolve(consumer.directory, input));
    if (!inputs.some(input => input.startsWith(consumer.installedRoot + path.sep))) {
      throw new Error(name + ' did not bundle the installed SahajLipi package');
    }
    if (inputs.some(input => input.startsWith(path.join(root, 'src') + path.sep))) {
      throw new Error(name + ' bypassed package imports with checkout sources');
    }
  }
  await writeFile(path.join(output, 'manifest.json'), JSON.stringify({
    tarballSha256: consumer.tarballSha256,
    packageFiles: consumer.packageFiles,
    examples: ['vanilla', 'react'],
    reactMode: 'development StrictMode; uncontrolled textarea',
  }, null, 2) + '\n');
  console.log('React TypeScript example: strict Bundler compilation passed.');
  console.log('Vanilla and React examples bundled from the installed local tarball.');
  console.log('Run npm run examples:serve; open /browser/.generated/vanilla/ or /browser/.generated/react/ on http://127.0.0.1:4177.');
} finally {
  await consumer.cleanup();
}
