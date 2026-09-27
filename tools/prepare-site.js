import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const generated = path.join(root, 'website/.generated');
const publicDirectory = path.join(root, 'website/.generated-public');
const base = '/sahajlipi/';
const hostname = 'https://ojastechnologies.github.io';
const repository = 'https://github.com/ojastechnologies/sahajlipi/blob/main/';
const aliases = new Map(['api', 'architecture', 'typing-reference', 'benchmarks'].map(name => [`docs/${name}.md`, `docs/package/${name}.md`]));
const rootPages = new Map([['CONTRIBUTING.md', 'docs/contributing.md'], ['SECURITY.md', 'docs/security.md'], ['CHANGELOG.md', 'docs/changelog.md']]);

async function filesIn(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = path.join(directory, entry.name);
    assert(!entry.isSymbolicLink(), `Site inputs may not contain symlinks: ${name}`);
    if (entry.isDirectory()) result.push(...await filesIn(name));
    else if (entry.isFile()) result.push(name);
  }
  return result.sort();
}

function pageRoute(markdown) {
  return '/' + markdown.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html');
}

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

await rm(generated, { recursive: true, force: true });
await rm(publicDirectory, { recursive: true, force: true });
await mkdir(generated, { recursive: true });
await mkdir(publicDirectory, { recursive: true });

const pages = new Map([['website/index.md', 'index.md'], ...rootPages]);
for (const absolute of await filesIn(path.join(root, 'docs'))) {
  if (!absolute.endsWith('.md')) continue;
  const source = path.relative(root, absolute).split(path.sep).join('/');
  if (!aliases.has(source)) pages.set(source, source.replace(/(^|\/)README\.md$/, '$1index.md'));
}
const metadata = JSON.parse(await readFile(path.join(root, 'website/page-meta.json'), 'utf8'));
for (const target of [...pages.values(), 'demo/index.html']) {
  assert(metadata[target]?.title && metadata[target]?.description, `Missing site metadata for ${target}`);
}
assert.equal(new Set([...pages.values()]).size, pages.size, 'Two source documents resolve to one site page');

const publicRoots = ['demo', 'src', 'assets/brand', 'LICENSES', 'benchmark/reports', 'browser/reports'];
for (const directory of publicRoots) {
  await cp(path.join(root, directory), path.join(publicDirectory, directory), { recursive: true });
}
for (const filename of ['LICENSE', 'NOTICE']) await cp(path.join(root, filename), path.join(publicDirectory, filename));

function rewriteTarget(target, source, rawHtml = false) {
  if (!target || target.startsWith('#') || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) return target;
  const split = target.match(/^([^?#]*)([?#].*)?$/);
  let pathname = decodeURIComponent(split[1]);
  const suffix = split[2] ?? '';
  if (pathname.startsWith(base)) pathname = pathname.slice(base.length - 1);
  const resolved = pathname.startsWith('/')
    ? pathname.slice(1)
    : path.posix.normalize(path.posix.join(path.posix.dirname(source), pathname));
  assert(!resolved.startsWith('../'), `Link escapes the repository: ${source} → ${target}`);
  const canonicalSource = aliases.get(resolved) ?? resolved;
  const page = pages.get(canonicalSource);
  if (page) {
    const route = pageRoute(page);
    return (rawHtml ? base.slice(0, -1) + route : route) + suffix;
  }
  // The homepage is a separate introduction. README evidence anchors remain
  // links to their source, rather than invented anchors in the homepage.
  if (resolved === 'README.md') return repository + resolved + suffix;
  const isPublic = publicRoots.some(directory => resolved === directory || resolved.startsWith(directory + '/'))
    || resolved === 'LICENSE' || resolved === 'NOTICE';
  if (isPublic && !resolved.endsWith('.md')) {
    // Extensionless license files need an absolute URL so the Markdown router
    // does not invent a LICENSE.html or NOTICE.html page.
    if (!rawHtml && (resolved === 'LICENSE' || resolved === 'NOTICE')) return hostname + base + resolved + suffix;
    return (rawHtml ? base : '/') + resolved + suffix;
  }
  // Existing site routes in homepage components can already use .html or /
  // URLs. Markdown still gets VitePress's automatic project base prefix.
  if (pathname.startsWith('/') && (pathname.endsWith('.html') || pathname.endsWith('/'))) {
    return (rawHtml ? base.slice(0, -1) : '') + pathname + suffix;
  }
  // Source code, scripts, example instructions and unbundled development data
  // stay readable on GitHub without publishing a repository checkout.
  return repository + resolved.split('/').map(encodeURIComponent).join('/') + suffix;
}

function rewriteMarkdown(markdown, source) {
  let fence = null;
  return markdown.split('\n').map(line => {
    const match = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (match) {
      if (!fence) fence = match[1];
      else if (match[1][0] === fence[0] && match[1].length >= fence.length) fence = null;
      return line;
    }
    if (fence) return line;
    line = line.replace(/(!?\[[^\]\n]*\]\()([^\n)]+)(\))/g, (_match, prefix, destination, end) => {
      const parts = destination.match(/^<?([^>\s]+)>?(.*)$/);
      if (!parts) return _match;
      return prefix + rewriteTarget(parts[1], source) + parts[2] + end;
    });
    return line.replace(/\b(href|src|srcset)=(['"])(.*?)\2/g, (_match, attribute, quote, value) => {
      const rewritten = rewriteTarget(value, source, true);
      // A bound constant avoids Vue interpreting a copied public image URL as
      // a source import, while preserving the Pages base in the rendered HTML.
      if (attribute !== 'href') return `:${attribute}=${quote}${escapeAttribute(JSON.stringify(rewritten))}${quote}`;
      return `${attribute}=${quote}${rewritten}${quote}`;
    });
  }).join('\n');
}

for (const [source, target] of pages) {
  const destination = path.join(generated, target);
  await mkdir(path.dirname(destination), { recursive: true });
  const original = await readFile(path.join(root, source), 'utf8');
  await writeFile(destination, rewriteMarkdown(original, source));
}

// The demo remains its existing static app, with metadata applied to the copy.
const demoPath = path.join(publicDirectory, 'demo/index.html');
const demoMetadata = metadata['demo/index.html'];
const demoCanonical = hostname + base + 'demo/';
let demo = await readFile(demoPath, 'utf8');
demo = demo.replace(/<meta\b[^>]*>/gi, tag => {
  const key = tag.match(/\b(?:name|property)=["']([^"']+)["']/i)?.[1];
  return key && (['description', 'robots'].includes(key) || key.startsWith('og:') || key.startsWith('twitter:')) ? '' : tag;
}).replace(/<link\b[^>]*>/gi, tag => /\brel=["']canonical["']/i.test(tag) ? '' : tag);
demo = demo.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttribute(demoMetadata.title)}</title>`);
const socialImage = hostname + base + 'assets/brand/social-preview.png';
const demoHead = [
  ['name', 'description', demoMetadata.description],
  ['name', 'robots', 'index,follow'],
  ['property', 'og:type', 'website'],
  ['property', 'og:site_name', 'SahajLipi'],
  ['property', 'og:title', demoMetadata.title],
  ['property', 'og:description', demoMetadata.description],
  ['property', 'og:url', demoCanonical],
  ['property', 'og:image', socialImage],
  ['property', 'og:image:alt', 'SahajLipi Roman Nepali typing library'],
  ['name', 'twitter:card', 'summary_large_image'],
  ['name', 'twitter:title', demoMetadata.title],
  ['name', 'twitter:description', demoMetadata.description],
  ['name', 'twitter:image', socialImage],
  ['name', 'twitter:image:alt', 'SahajLipi Roman Nepali typing library'],
].map(([attribute, key, value]) => `<meta ${attribute}="${key}" content="${escapeAttribute(value)}">`).join('\n');
demo = demo.replace('</head>', `<link rel="canonical" href="${demoCanonical}">\n${demoHead}\n</head>`);
await writeFile(demoPath, demo);

const publicFiles = [];
for (const file of await filesIn(publicDirectory)) {
  const relative = path.relative(publicDirectory, file).split(path.sep).join('/');
  publicFiles.push({ path: relative, sha256: createHash('sha256').update(await readFile(file)).digest('hex') });
}
const manifest = {
  base, hostname,
  pages: [...pages].map(([source, generatedPath]) => ({ source, generatedPath, route: pageRoute(generatedPath), canonical: hostname + base.slice(0, -1) + pageRoute(generatedPath) })),
  publicFiles,
};
await writeFile(path.join(generated, 'site-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Site prepared: ${pages.size} Markdown pages, static demo, ${publicFiles.length} allowlisted public files; repository sources unchanged.`);
