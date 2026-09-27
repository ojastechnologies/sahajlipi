import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, '.site-dist/sahajlipi');
const manifest = JSON.parse(await readFile(path.join(root, 'website/.generated/site-manifest.json'), 'utf8'));
const metadata = JSON.parse(await readFile(path.join(root, 'website/page-meta.json'), 'utf8'));
const base = manifest.base;
const siteUrl = manifest.hostname + base;

function decode(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#(?:x[\da-f]+|\d+));/gi, entity => {
    const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    if (named[entity]) return named[entity];
    const hex = entity.startsWith('&#x');
    return String.fromCodePoint(Number.parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10));
  });
}

function attributes(text) {
  const values = {};
  for (const match of text.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g)) {
    values[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return values;
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))].map(match => attributes(match[1]));
}

function oneMeta(head, key) {
  const matches = tags(head, 'meta').filter(tag => tag.name === key || tag.property === key);
  assert.equal(matches.length, 1, `Expected one ${key} metadata tag`);
  return matches[0].content;
}

function routeFile(route) {
  return route.endsWith('/') ? route.slice(1) + 'index.html' : route.slice(1);
}

async function allFiles(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), `Unexpected output symlink: ${entry.name}`);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await allFiles(absolute));
    else result.push(absolute);
  }
  return result;
}

const files = await allFiles(output);
const paths = new Set(files.map(file => path.relative(output, file).split(path.sep).join('/')));
const publicPaths = new Set(manifest.publicFiles.map(file => file.path));
const vitePressPages = new Set([...manifest.pages.map(page => routeFile(page.route)), '404.html']);
const expectedStaticRoutes = new Set();
for (const file of manifest.publicFiles) {
  if (!file.path.endsWith('.html')) continue;
  const route = '/' + file.path;
  expectedStaticRoutes.add(route);
  if (route.endsWith('/index.html')) expectedStaticRoutes.add(route.slice(0, -'index.html'.length));
}
assert.deepEqual(manifest.staticHtmlRoutes, [...expectedStaticRoutes].sort(), 'Static HTML route inventory must match the copied apps');

for (const filename of paths) {
  assert(!/(^|\/)(?:data|datasets|node_modules|\.git|\.generated|test-results|playwright-report)(\/|$)/.test(filename), `Private/development directory leaked: ${filename}`);
  assert(!/\.(?:csv|jsonl|xlsx|tgz|map)$/.test(filename), `Unapproved data/archive/source map leaked: ${filename}`);
  if (filename.startsWith('benchmark/') || filename.startsWith('browser/')) {
    assert(publicPaths.has(filename), `Unapproved research/browser file leaked: ${filename}`);
  }
}

const htmlCache = new Map();
async function htmlAt(filename) {
  if (!htmlCache.has(filename)) htmlCache.set(filename, await readFile(path.join(output, filename), 'utf8'));
  return htmlCache.get(filename);
}

let checkedLinks = 0;
async function verifyLink(reference, owner, checkFragment = true) {
  if (!reference || /^(?:mailto:|tel:|data:|javascript:|blob:)/i.test(reference)) return;
  const ownerUrl = new URL(owner, siteUrl);
  const url = new URL(reference, ownerUrl);
  if (url.origin !== manifest.hostname) return;
  assert(url.pathname.startsWith(base), `Link escaped the GitHub Pages project base: ${owner} → ${reference}`);
  let filename = decodeURIComponent(url.pathname.slice(base.length));
  if (filename.endsWith('/') || !filename) filename += 'index.html';
  assert(paths.has(filename), `Broken built link: ${owner} → ${reference} (${filename})`);
  assert((await stat(path.join(output, filename))).isFile());
  if (checkFragment && url.hash && filename.endsWith('.html')) {
    const fragment = decodeURIComponent(url.hash.slice(1));
    const targetHtml = await htmlAt(filename);
    const ids = [...targetHtml.matchAll(/\bid=(?:"([^"]*)"|'([^']*)')/g)].map(match => decode(match[1] ?? match[2]));
    assert(ids.includes(fragment), `Broken fragment: ${owner} → ${reference}`);
  }
  checkedLinks++;
  return filename;
}

const titles = new Set();
const descriptions = new Set();
const expectedCanonicals = new Set();
const pageRecords = [...manifest.pages, { generatedPath: 'demo/index.html', route: '/demo/', canonical: siteUrl + 'demo/' }];
assert.equal(Object.keys(metadata).length, pageRecords.length, 'Metadata inventory must exactly match published pages');
for (const page of pageRecords) {
  const filename = routeFile(page.route);
  assert(paths.has(filename), `Missing built page: ${filename}`);
  const html = await htmlAt(filename);
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  assert(head && body, `Missing head/body: ${filename}`);
  const pageMetadata = metadata[page.generatedPath];
  const titleTags = [...head.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
  assert.equal(titleTags.length, 1, `Duplicate/missing title: ${filename}`);
  const title = decode(titleTags[0][1]);
  assert.equal(title, pageMetadata.title, `Wrong title: ${filename}`);
  assert(!titles.has(title), `Duplicate title: ${title}`);
  titles.add(title);
  const description = oneMeta(head, 'description');
  assert.equal(description, pageMetadata.description, `Wrong description: ${filename}`);
  assert(description.length >= 70 && description.length <= 190, `Description length needs review: ${filename}`);
  assert(!descriptions.has(description), `Duplicate description: ${filename}`);
  descriptions.add(description);
  const canonicals = tags(head, 'link').filter(tag => tag.rel === 'canonical');
  assert.equal(canonicals.length, 1, `Duplicate/missing canonical: ${filename}`);
  assert.equal(canonicals[0].href, page.canonical, `Wrong canonical: ${filename}`);
  expectedCanonicals.add(page.canonical);
  assert.equal(oneMeta(head, 'robots'), 'index,follow', `Wrong robots directive: ${filename}`);
  assert.equal(oneMeta(head, 'og:title'), title);
  assert.equal(oneMeta(head, 'og:description'), description);
  assert.equal(oneMeta(head, 'og:url'), page.canonical);
  assert.equal(oneMeta(head, 'og:image'), siteUrl + 'assets/brand/social-preview.png');
  assert.equal(oneMeta(head, 'twitter:card'), 'summary_large_image');
  assert.equal(oneMeta(head, 'twitter:title'), title);
  assert.equal(oneMeta(head, 'twitter:description'), description);
  assert.equal(oneMeta(head, 'twitter:image'), siteUrl + 'assets/brand/social-preview.png');
  const visibleBody = body.replace(/<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>/gi, '');
  assert(/<h1\b[^>]*>[\s\S]+?<\/h1>/i.test(visibleBody), `No server-rendered H1: ${filename}`);
  assert(visibleBody.replace(/<[^>]*>/g, '').trim().length > 120, `No crawlable page body: ${filename}`);
}

assert(paths.has('404.html'), 'VitePress must emit a 404 page');
const notFound = await htmlAt('404.html');
const notFoundHead = notFound.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
assert.equal(oneMeta(notFoundHead, 'robots'), 'noindex,follow');
assert.equal(tags(notFoundHead, 'link').filter(tag => tag.rel === 'canonical').length, 0, '404 must not declare an indexable canonical page');

const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8');
const sitemapLocations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]));
assert.equal(new Set(sitemapLocations).size, sitemapLocations.length, 'Duplicate sitemap locations');
assert.deepEqual([...sitemapLocations].sort(), [...expectedCanonicals].sort(), 'Sitemap must contain exactly the canonical pages and static demo');
assert(!sitemap.includes('404') && !sitemap.includes('/docs/api.html'), '404 or obsolete aliases entered the sitemap');
for (const location of sitemapLocations) await verifyLink(location, 'sitemap.xml', false);

const home = await htmlAt('index.html');
const structured = [...home.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(match => attributes(match[1]).type === 'application/ld+json')
  .map(match => JSON.parse(match[2]));
assert.equal(structured.length, 1, 'Home must have one structured-data graph');
assert.equal(structured[0]['@context'], 'https://schema.org');
const graph = structured[0]['@graph'];
assert.deepEqual(graph.map(node => node['@type']).sort(), ['SoftwareSourceCode', 'WebSite']);
for (const node of graph) {
  assert.equal(node.name, 'SahajLipi');
  assert.equal(node.url, siteUrl);
  assert(!Object.hasOwn(node, 'aggregateRating') && !Object.hasOwn(node, 'offers') && !Object.hasOwn(node, 'downloadUrl'), 'Unsupported release/rating claims in structured data');
}
assert.equal(graph.find(node => node['@type'] === 'SoftwareSourceCode').codeRepository, 'https://github.com/ojastechnologies/sahajlipi');

for (const filename of paths) {
  if (!filename.endsWith('.html')) continue;
  const html = await htmlAt(filename);
  // Remove executable bodies to avoid mistaking strings containing HTML for
  // real links. Opening script tags are checked separately for local assets.
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  for (const tag of ['a', 'link', 'img', 'source']) {
    for (const attrs of tags(markup, tag)) {
      if (attrs.href) {
        const destination = await verifyLink(attrs.href, filename);
        if (tag === 'a' && vitePressPages.has(filename) && destination?.endsWith('.html') && !vitePressPages.has(destination)) {
          assert(Object.hasOwn(attrs, 'target') || Object.hasOwn(attrs, 'download'),
            `Static HTML link must bypass the VitePress router: ${filename} → ${attrs.href}`);
        }
      }
      if (attrs.src) await verifyLink(attrs.src, filename, false);
    }
  }
  for (const attrs of tags(html, 'script')) if (attrs.src) await verifyLink(attrs.src, filename, false);
}

for (const publicFile of manifest.publicFiles) {
  assert(paths.has(publicFile.path), `Missing public file: ${publicFile.path}`);
  const bytes = await readFile(path.join(output, publicFile.path));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), publicFile.sha256, `Copied public artifact changed: ${publicFile.path}`);
  if (publicFile.path.startsWith('benchmark/reports/') || publicFile.path.startsWith('browser/reports/')) {
    assert(bytes.equals(await readFile(path.join(root, publicFile.path))), `Historical report changed during website preparation: ${publicFile.path}`);
  }
}
const assisted = JSON.parse(await readFile(path.join(output, 'benchmark/reports/nepali-assisted-online-001.json'), 'utf8'));
assert.equal(assisted.cases.length, 100, 'Full public 100-case projection must remain downloadable');
assert.equal(assisted.canonicalCasesAdmitted, 0, 'Website must preserve pending independent review status');
assert.equal(assisted.humanVerified, false);
console.log(`Website verified: ${pageRecords.length} indexable pages plus noindex 404; unique metadata, canonical sitemap, structured data, ${checkedLinks} local links/assets, ${manifest.publicFiles.length} byte-verified public files.`);
console.log('No raw datasets, review spreadsheets, repository tools, source maps or package archives are published.');
