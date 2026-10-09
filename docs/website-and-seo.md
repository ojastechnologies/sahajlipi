# Package website and discoverability

SahajLipi has three surfaces: the package website introduces the library, documentation explains the reusable package, and the demo lets people try it. The generated site brings them together under `https://ojastechnologies.github.io/sahajlipi/`. Website deployment is separate from npm publication. `sahajlipi@0.1.0-alpha.3` was published and verified on 2026-10-09. This website source offers `npm install --save-exact sahajlipi@0.1.0-alpha.3` and labels it as an experimental Nepali developer alpha; the hosted page changes after a successful Pages deployment. The [release record](release.md) records artifact identity, actual tags and distribution evidence.

## Pages and content ownership

| Surface | Production URL | Source |
| --- | --- | --- |
| Package home | `/sahajlipi/` | [`website/index.md`](../website/index.md), rendered by [`Home.vue`](../website/.vitepress/theme/Home.vue). |
| Documentation index | `/sahajlipi/docs/` | [`docs/README.md`](README.md). |
| Package guides | `/sahajlipi/docs/package/` and individual `.html` pages | [`docs/package/`](package/README.md). |
| Demo guide | `/sahajlipi/docs/demo/` | [`docs/demo/README.md`](demo/README.md). |
| Interactive demo | `/sahajlipi/demo/` | [`demo/`](../demo/index.html), with the existing engine modules. |

The navigation is Home, Documentation, Demo, and GitHub. Package documentation stays distinct from demo controls. The documentation sidebar groups developer onboarding, API and typing, evaluation evidence, and project guides. Dated benchmark reports retain their own methods, source identities, and limitations.

VitePress builds HTML from the existing Markdown. Edit a guide in `docs/`, then regenerate the site; do not maintain a second copy under `website/docs/`. The preparation tool maps each `README.md` to a directory index, rewrites Markdown links to published HTML paths, and points repository-only source links to GitHub. The four old moved-guide stubs are excluded in favor of their canonical `docs/package/` pages. Contribution, security, and changelog pages are generated from the root repository files.

Generated Markdown, copied public assets, and the output directory are build artifacts. They are ignored by Git and must not be edited as source. The production artifact uses the generated package homepage. The default local demo and preview commands serve that complete artifact, with redirects from `/` to `/sahajlipi/` and from `/demo/` to `/sahajlipi/demo/`. Serving only the repository source with a plain static server does not provide the generated homepage or documentation.

## Run and verify the website

Use Node.js 20 or later, npm, and Python 3. From the repository root:

```sh
npm ci
npm run site:dev
```

Open [the local package website](http://127.0.0.1:4178/sahajlipi/). Development mode prepares the current Markdown and starts VitePress. Stop this server before previewing on the same port. After changing a Markdown source or adding a page, regenerate the prepared inputs by restarting the command.

Verify the production artifact before proposing a website change:

```sh
npm run site:build
npm run site:check
npm run site:preview
```

Preview again at [http://127.0.0.1:4178/sahajlipi/](http://127.0.0.1:4178/sahajlipi/), including its documentation and demo. The build writes the deployable project under `.site-dist/sahajlipi/`; the preview command uses the project preview server to serve `.site-dist/` and exercise the `/sahajlipi/` base path. It also accepts the older local `/` and `/demo/` entry paths through redirects.

The site check validates the built pages, local links and assets, canonical URLs, metadata, sitemap, and the copied demo. These are software checks. They do not prove that a search engine has crawled, indexed, or ranked the website. Engine and browser regressions remain separate checks in the [development guide](development.md).

### Local demo and source examples

`npm run demo` builds the complete website before serving it on port 4173. Open `/sahajlipi/demo/`; the older `/demo/` entry redirects there. To serve the same artifact on your local network, run `npm run demo:lan -- YOUR_LAN_IP` and open `http://YOUR_LAN_IP:4173/sahajlipi/demo/`. Home, logo, and documentation navigation use the same project paths as production. Stop an existing server on that port before starting either command.

For source-only vanilla examples, use `npm run examples:serve` and open `http://127.0.0.1:4177/examples/vanilla/`. That separate server exposes the checkout examples; it is not the complete package website. See the [demo guide](demo/README.md#run-it-locally) and [example instructions](../examples/README.md).

### Website browser checks

Install the Chromium engine once, then run the dedicated suite:

```sh
npx playwright install chromium
npm run test:site
```

On Linux, install with `npx playwright install --with-deps chromium`. The same Node.js 20-or-later, npm, and Python 3 toolchain is required. `test:site` runs the production build and static artifact check before Playwright; the separate [website configuration](../playwright.site.config.js) serves `.site-dist/` on `127.0.0.1:4181` and refuses to reuse that port.

The [eleven website scenarios](../website/tests/site.spec.js) cover:

- Homepage content without JavaScript, experimental alpha status text, the npm install command, and the interactive converter preview.
- Documentation links, canonical routes, and local search.
- Demo links from the homepage, header, and documentation body, plus demo typing.
- Desktop and mobile Home/logo navigation, with legacy local entry paths redirected to the complete site.
- Homepage, docs, and demo at a mobile-sized browser viewport.
- Reachable published benchmark downloads and the sitemap.

Results are written to `site-playwright-report/` (HTML) and `site-test-results/results.json` (JSON), with failure traces and screenshots under `site-test-results/artifacts/`. The workflow uploads website reports and failure evidence for 14 days. This suite is separate from the reusable adapter's Chromium/Firefox/WebKit regressions; its viewport check does not certify physical mobile keyboards or assistive technology. No test result establishes search-engine indexing or ranking.

## GitHub Pages publishing

The [website workflow](../.github/workflows/pages.yml) builds and checks the artifact for pull requests. Deployment is restricted to `main`; a pull request build does not publish a preview to the production URL. Website changes become public after merge, a successful workflow, and the Pages deployment finishing. GitHub Pages is configured to use the GitHub Actions publishing source and the generated artifact. The package homepage and developer documentation are public alongside the preserved demo.

The publishing source setting is under **Settings → Pages → Build and deployment → Source**. Keep it on **GitHub Actions** while using this artifact workflow. Verify the deployment result and public URLs; staging a future workflow change in a pull request does not change that setting.

Keep `/demo/` available in the deployed project so existing bookmarks work. The build copies the demo, engine modules, and brand assets into the artifact; it adds demo metadata without changing conversion rules. Deployment requires the repository's Pages settings and workflow permissions to be configured, as described in the [VitePress GitHub Pages guide](https://vitepress.dev/guide/deploy#github-pages).

After a deployment, check the production homepage, a direct documentation URL, the demo, and the sitemap. A green build on a feature branch does not establish that the public site has updated.

## Metadata and canonical URLs

[`website/page-meta.json`](../website/page-meta.json) owns the human-readable title and description for every generated page and the copied demo. Titles identify the page's purpose; descriptions summarize its actual contents. Add an entry whenever adding a page. Avoid repeated descriptions, keyword lists, or unsupported language and quality claims. Describe the implemented Nepali developer alpha and keep version and publication claims aligned with the [release record](release.md).

The site configuration adds:

- A page title and description to the static HTML.
- One absolute HTTPS canonical URL for the production route.
- Open Graph and Twitter card metadata with the shared brand preview.
- Page-level indexing directives for public pages; the generated 404 is excluded from indexing.
- A sitemap containing the canonical HTML pages and demo.
- Structured project metadata describing the public website and source repository.

A directory index uses a trailing slash, such as `/sahajlipi/docs/`; an ordinary guide uses `.html`, such as `/sahajlipi/docs/package/getting-started.html`. Keep internal navigation, canonical URLs, and sitemap entries consistent. Google treats canonical annotations as signals and can select another URL; they are not a ranking guarantee. See the [canonical URL reference](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

The sitemap is published at [the project sitemap](https://ojastechnologies.github.io/sahajlipi/sitemap.xml). It includes intended public pages, not every source file or test fixture. Do not invent modification dates for pages to make them appear newer. Sitemaps help discovery, but submitting one does not guarantee indexing. See [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

Structured metadata describes the implemented software and repository, the verified `0.1.0-alpha.3` version, its publication date, and its npm version page. It does not add invented reviews, ratings, download counts, or supported languages. It does not promise a rich search result.

### Robots on a GitHub Pages project

Crawler rules belong at the origin's `/robots.txt`, here `https://ojastechnologies.github.io/robots.txt`. A file under `/sahajlipi/robots.txt` is inside a project subdirectory and cannot control crawling of this project. This repository's project deployment does not own the origin-level file. A custom domain or the organization's root Pages site would need separate ownership and configuration. See [Google's robots.txt location rules](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt).

Public pages therefore use their HTML indexing directives and the project's sitemap. Robots directives are not access control: use authenticated hosting for private material. Blocking a URL in robots.txt also does not guarantee that the URL stays out of search results; see [Google's robots limitations](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

## GitHub repository discovery

GitHub controls the HTML metadata of the repository page. This project can improve its own visible description, topics, README, homepage link, and repository social preview; it cannot configure arbitrary meta tags on `github.com`.

Keep the About description specific: an open-source JavaScript library with TypeScript declarations for phonetic Nepali typing and Roman Nepali to Devanagari Unicode transliteration. Link About's website field to the package homepage, and use relevant topics such as `nepali`, `transliteration`, `unicode`, `javascript`, and `typescript`. Topics help developers find related repositories; see [GitHub's topic guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics).

The README begins with a searchable text project heading and description, then links the website, getting started, demo, and evidence. Preserve the logo's accessible name. The website uses the supplied brand social preview. GitHub currently uses its default generated repository preview; a custom image has not been uploaded. A maintainer can optionally upload the asset through the [brand guide instructions](brand.md#github-repository-identity). An organization avatar is a separate company identity. Do not present discoverability work as a guarantee of search position or GitHub popularity.

## npm package discovery

npm discovery uses the published package's metadata and README. Its [search documentation](https://docs.npmjs.com/searching-for-and-choosing-packages-to-download/) describes keyword matching against the package name, description, README, and keywords. The [package.json reference](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#description) identifies descriptions and keywords as discovery fields. Keep the package name `sahajlipi`; describe the implemented Nepali typing library in the description and opening README paragraph.

The package keywords cover the language and script (`nepali`, `devanagari`), input and output (`roman-nepali`, `nepali-unicode`, `nepali-transliteration`), typing (`nepali-typing`, `nepali-keyboard`, `nepali-input`, `phonetic-typing`, `keyboard`, `ime`, `input-method`), and developer use (`javascript`, `typescript`, `browser`, `textarea`). `transliteration` and `unicode` describe the conversion. The keyword `devnagari` intentionally includes a spelling variant people may search for; use canonical **Devanagari** in the prose. These terms describe current functionality. React integration is documented as an uncontrolled textarea example.

The README uses absolute documentation, support, and license links so they work from the npm package page. npm's [README guidance](https://docs.npmjs.com/about-package-readme-files/) says the package page receives README changes when a new package version is published. Editing the repository or deploying the website alone does not update the published package's README or metadata. npm also warns that newly published packages may take up to two weeks to appear in search. Relevant metadata improves matching opportunities; it provides no guaranteed position or indexing date, and says nothing about Google ranking.

The [dated npm search audit](../benchmark/reports/npm-search-2026-10-09.json) records queries against the official registry's `/-/v1/search` endpoint, including `nepali`, `devanagari`, `devnagari`, and related typing and transliteration terms. The [current registry API reference](https://api-docs.npmjs.com/#tag/Search) documents `text`, `size`, and `from`. The audit retains each query's parameters, time, total results, returned window, and SahajLipi's position or absence within that window. Failed requests remain unverified. Positions describe that API query at that time; they do not establish npm website placement, software quality, or Nepali accuracy. Website search and registry API results are distinct observations. Recheck the same queries after publication and indexing without turning the audit into a comparison of other packages.

### After alpha.3 publication — 2026-10-09

The [postpublication snapshot](../benchmark/reports/npm-search-after-alpha3-2026-10-09.json) repeated all twelve queries from `2026-10-09T12:51:20Z` to `12:52:02Z`. Eleven returned SahajLipi identified as alpha.3; no request failed. The table shows its one-based position in the returned API results, with `size=250` and `from=0`. The short `devnagari` query returned only six results before publication and seven afterward.

| Query | Preparation snapshot, alpha.2 | Postpublication snapshot, alpha.3 |
| --- | ---: | ---: |
| `nepali` | 88 | 67 |
| `devanagari` | 230 | 65 |
| `devnagari` | Not returned | 6 |
| `roman-nepali` | 1 | 1 |
| `nepali-typing` | 77 | 51 |
| `nepali-unicode` | 199 | 138 |
| `nepali-transliteration` | 176 | 127 |
| `phonetic-typing` | 129 | 1 |
| `nepali-keyboard` | Not in first 250 | Not in first 250 |
| `nepali input` | Not in first 250 | 210 |
| `roman nepali` | 1 | 1 |
| `devanagari typing` | 85 | 86 |

These are dated API observations. They do not establish npm website ordering, show that metadata caused a position change, or guarantee future ranking or indexing. The original baseline and the new snapshot remain separate records; neither includes competitor reviews.

## Search Console and post-deployment review

Search Console verification and sitemap submission require the site owner's Google account. They are a separate post-deployment task; this repository does not claim either has been completed.

After the site is public, the maintainer can:

1. Add a **URL-prefix property** for `https://ojastechnologies.github.io/sahajlipi/`. This matches the project path without requiring ownership of the `github.io` DNS zone.
2. Complete a supported ownership-verification method. If Google supplies an HTML file or meta tag, add that exact artifact in a reviewed website change and redeploy. Keep the verification artifact in later deployments.
3. Submit `https://ojastechnologies.github.io/sahajlipi/sitemap.xml` in the verified property's Sitemaps report.
4. Inspect the homepage, getting-started guide, API reference, and demo URLs. Check Google's selected canonical, indexing status, and any fetch errors.
5. Monitor indexing and search queries over time. Fix actual broken links, stale metadata, or misleading content before expanding search-oriented copy.

See [Search Console property setup](https://support.google.com/webmasters/answer/34592?hl=en) for property boundaries and verification. Do not add a verification token on another person's behalf or report a submission without its result.

## Website change checklist

- [ ] Update the existing Markdown source and its entry in `website/page-meta.json`.
- [ ] Preserve the package/demo separation, truthful release status, and evidence limitations.
- [ ] Run `npm run site:build` and `npm run site:check`; run `npm run test:site` for website interaction changes.
- [ ] Preview the homepage, changed guide, direct links, search, mobile-width navigation, and `/demo/`.
- [ ] Inspect the deployed URLs after the `main` Pages workflow completes.
- [ ] Record Search Console actions only when a maintainer actually completes them.
