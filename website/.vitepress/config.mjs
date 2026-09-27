import { defineConfig } from 'vitepress';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = '/sahajlipi/';
const siteUrl = 'https://ojastechnologies.github.io' + base;
const repository = 'https://github.com/ojastechnologies/sahajlipi';
const metadata = JSON.parse(readFileSync(new URL('../page-meta.json', import.meta.url), 'utf8'));

// Keep the existing GitHub documentation fragments when punctuation such as
// an em dash appears in headings. Both anchors and outline use the same IDs.
function slugify(value) {
  return value.trim().toLowerCase().replace(/[^\p{Letter}\p{Mark}\p{Number}\s_\u200c\u200d-]/gu, '').replace(/\s/g, '-');
}

function canonicalFor(relativePath) {
  return siteUrl + relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html');
}

function pageHead(pageData) {
    if (pageData.relativePath === '404.md') return [['meta', { name: 'robots', content: 'noindex,follow' }]];
    const canonical = canonicalFor(pageData.relativePath);
    const image = siteUrl + 'assets/brand/social-preview.png';
    const head = [
      ['link', { rel: 'canonical', href: canonical }],
      ['meta', { name: 'robots', content: 'index,follow' }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: 'SahajLipi' }],
      ['meta', { property: 'og:title', content: pageData.title }],
      ['meta', { property: 'og:description', content: pageData.description }],
      ['meta', { property: 'og:url', content: canonical }],
      ['meta', { property: 'og:image', content: image }],
      ['meta', { property: 'og:image:alt', content: 'SahajLipi Roman Nepali typing library' }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: pageData.title }],
      ['meta', { name: 'twitter:description', content: pageData.description }],
      ['meta', { name: 'twitter:image', content: image }],
      ['meta', { name: 'twitter:image:alt', content: 'SahajLipi Roman Nepali typing library' }],
    ];
    if (pageData.relativePath === 'index.md') {
      const graph = {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'WebSite', '@id': siteUrl + '#website', name: 'SahajLipi', url: siteUrl, description: pageData.description, inLanguage: 'en' },
          { '@type': 'SoftwareSourceCode', '@id': siteUrl + '#source', name: 'SahajLipi', url: siteUrl, description: 'Open-source Roman Nepali transliteration engine and browser input adapters. Experimental; not published to npm.', codeRepository: repository, programmingLanguage: ['JavaScript', 'TypeScript'], license: repository + '/blob/main/LICENSE' },
        ],
      };
      head.push(['script', { type: 'application/ld+json' }, JSON.stringify(graph).replaceAll('<', '\\u003c')]);
    }
    return head;
}

export default defineConfig({
  srcDir: '.generated',
  outDir: '../.site-dist/sahajlipi',
  base,
  cleanUrls: false,
  lang: 'en',
  title: 'SahajLipi',
  titleTemplate: false,
  description: 'An open-source Roman Nepali typing engine and browser input adapters for JavaScript applications.',
  lastUpdated: false,
  ignoreDeadLinks: false,
  markdown: { anchor: { slugify }, headers: { slugify } },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: base + 'assets/brand/favicon.svg' }],
    ['link', { rel: 'apple-touch-icon', href: base + 'assets/brand/apple-touch-icon.png' }],
    ['meta', { name: 'theme-color', content: '#116b75' }],
  ],
  vite: { publicDir: fileURLToPath(new URL('../.generated-public', import.meta.url)) },
  themeConfig: {
    logo: { light: '/assets/brand/logo.svg', dark: '/assets/brand/logo-dark.svg', alt: 'SahajLipi' },
    siteTitle: false,
    nav: [
      { text: 'Documentation', link: '/docs/package/getting-started.html', activeMatch: '^/docs/' },
      { text: 'Demo', link: '/demo/', target: '_self' },
      { text: 'GitHub', link: repository },
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3] },
    sidebar: {
      '/docs/': [
        { text: 'Start here', items: [
          { text: 'Documentation overview', link: '/docs/' },
          { text: 'Getting started', link: '/docs/package/getting-started.html' },
          { text: 'Integration recipes', link: '/docs/package/integration-recipes.html' },
          { text: 'API reference', link: '/docs/package/api.html' },
          { text: 'Typing reference', link: '/docs/package/typing-reference.html' },
        ] },
        { text: 'Package internals', items: [
          { text: 'Package overview', link: '/docs/package/' },
          { text: 'Architecture', link: '/docs/package/architecture.html' },
          { text: 'Browser compatibility', link: '/docs/package/browser-compatibility.html' },
          { text: 'Month-name provenance', link: '/docs/package/month-names.html' },
          { text: 'Loanword review', link: '/docs/package/loanword-review.html' },
        ] },
        { text: 'Evaluation and review', items: [
          { text: 'Benchmark protocol', link: '/docs/package/benchmarks.html' },
          { text: 'Digit rendering', link: '/docs/package/digits-benchmarks.html' },
          { text: 'Mixed-text records', link: '/docs/package/mixed-text-benchmarks.html' },
          { text: 'Loanword benchmarks', link: '/docs/package/loanword-benchmarks.html' },
          { text: 'Month benchmarks', link: '/docs/package/month-benchmarks.html' },
          { text: 'External evaluation', link: '/docs/package/external-evaluation.html' },
          { text: 'Review batch', link: '/docs/package/review-batch.html' },
          { text: 'Batch baseline', link: '/docs/package/review-batch-baseline.html' },
          { text: 'Assisted online review', link: '/docs/package/assisted-online-review.html' },
          { text: 'Ra-ya review', link: '/docs/package/ry-review.html' },
        ] },
        { text: 'Project', items: [
          { text: 'Demo guide', link: '/docs/demo/' },
          { text: 'Development', link: '/docs/development.html' },
          { text: 'Release policy', link: '/docs/release.html' },
          { text: 'Status and roadmap', link: '/docs/status-and-roadmap.html' },
          { text: 'Contributing', link: '/docs/contributing.html' },
          { text: 'Security', link: '/docs/security.html' },
          { text: 'Changelog', link: '/docs/changelog.html' },
          { text: 'Brand', link: '/docs/brand.html' },
          { text: 'Website and SEO', link: '/docs/website-and-seo.html' },
        ] },
      ],
    },
    socialLinks: [{ icon: 'github', link: repository }],
    footer: { message: 'Open source. Nepali first. Experimental and unpublished on npm.', copyright: 'MIT code · Unicode-3.0 month data' },
    docFooter: { prev: 'Previous page', next: 'Next page' },
  },
  transformPageData(pageData) {
    if (pageData.relativePath === '404.md') return;
    const page = metadata[pageData.relativePath];
    if (!page) throw new Error(`Missing explicit SEO metadata: ${pageData.relativePath}`);
    pageData.title = page.title;
    pageData.description = page.description;
    pageData.frontmatter.title = page.title;
    pageData.frontmatter.description = page.description;
    pageData.frontmatter.titleTemplate = false;
    pageData.frontmatter.head = [...(pageData.frontmatter.head ?? []), ...pageHead(pageData)];
  },
  transformHead({ pageData }) {
    // The autogenerated error page has no Markdown transform. Normal page heads
    // are serialized in frontmatter so client navigation updates them too.
    if (pageData.relativePath === '404.md') return pageHead(pageData);
  },
  sitemap: {
    hostname: siteUrl,
    transformItems(items) {
      return [...items.filter(item => item.url !== '404.html'), { url: 'demo/' }];
    },
  },
});
