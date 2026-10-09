# Development and contribution workflow

This guide covers the repository workflow. For the reusable code, start with the [package documentation](package/README.md). For the hosted playground and local server commands, use the [demo guide](demo/README.md).

## Run the checks

Node.js 18 or later runs the Node tests and engine benchmark. The package has no runtime dependencies. Browser tests use a separate development toolchain with Node.js 20 or later, npm, Python 3, and Playwright browser installations.

```sh
npm test
npm run benchmark -- --check
```

The benchmark gates only named behavior contracts. Its exploratory proposals are reported separately and do not count as verified Nepali spellings or an accuracy score; see the [benchmark protocol](package/benchmarks.md).

For browser adapter changes, install the pinned development dependencies and desktop engines, then run the browser suite:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run test:browser
```

On Linux, use `npx playwright install --with-deps chromium firefox webkit`. The suite automatically starts an isolated Python server on port 4180. `npm run test:browser -- --project=chromium` runs one engine, and `npm run test:browser:report` opens the latest HTML report. The [browser compatibility guide](package/browser-compatibility.md) defines the coverage, report interpretation, and limits.

For the alpha.2 consonant change, `npm run test:browser -- browser/typing.spec.js` focuses on typing flows, including the demo's **Full (default)** / **Strict half** selector. Try both settings in the editor and marked form fields, explicit backtick and `/` halves, vowel attachment, paste, and English mode. The [candidate contract report](package/consonant-defaults-2026-10-03.md#reproduce) gives the separate full/half benchmark reproduction commands. Run the complete suite before proposing a release, and record candidate results separately from the dated alpha.1 checks.

## Verify the package and developer examples

With Node.js 20 or later and `npm ci` completed:

```sh
npm run verify:package
npm run examples:build
npm run examples:serve
```

The package check packs the actual file allowlist and installs the tarball offline into a temporary standalone ESM app. It checks public JavaScript imports, declaration resolution in strict TypeScript NodeNext/Bundler configurations, and the tutorial output. The example builder type-checks and bundles vanilla and React consumers against that installed package. The generated files are ignored by Git; they contain a development React build for StrictMode checks. Open `/browser/.generated/vanilla/` or `/browser/.generated/react/` on `http://127.0.0.1:4177`. Stop the example server before another process uses that port. [Example instructions](../examples/README.md) explain the source and packaged paths.

`npm run test:browser` builds these consumers before the desktop suite. Package verification also runs as separate CI jobs on Node 20, 22, and 24. Development tools are not runtime or peer dependencies of SahajLipi.

## Build the package website

The package website and documentation use VitePress with the existing Markdown as their source. After `npm ci`, run:

```sh
npm run site:dev
```

Open `http://127.0.0.1:4178/sahajlipi/`. To check and preview the deployment artifact, stop the development server, then run:

```sh
npm run site:build
npm run site:check
npm run site:preview
```

For the dedicated website browser suite, install Chromium and run:

```sh
npx playwright install chromium
npm run test:site
```

On Linux, use `npx playwright install --with-deps chromium`. `test:site` builds and checks the production artifact, then runs eleven website scenarios in headless Chromium. It starts a separate Python server on port 4181 and refuses an existing server there. The suite checks static readability without JavaScript, published alpha status text and the exact install command, the live conversion preview, documentation and local search, demo navigation and typing, desktop/mobile Home and logo links, documentation-body demo links, legacy local entry redirects, a mobile-sized viewport, and sitemap/report downloads. This is separate from the three-engine typing suite and does not establish physical mobile-device support. Website HTML reports are in `site-playwright-report/`; JSON results are `site-test-results/results.json`, with failure traces and screenshots under `site-test-results/artifacts/`. These generated reports are ignored by Git and the website workflow retains uploaded evidence for 14 days.

The preview server serves `.site-dist/` and retains the production `/sahajlipi/` base path; `/` and `/demo/` redirect to the package homepage and demo. `npm run demo` and `npm run demo:lan -- YOUR_LAN_IP` build this complete website and serve it on port 4173. The separate `npm run examples:serve` still serves repository examples on port 4177. Edit guides in `docs/`, the landing page in `website/index.md`, and page titles/descriptions in `website/page-meta.json`. Generated site files are ignored by Git. The [website and SEO guide](website-and-seo.md) covers content ownership, links, metadata, sitemap, deployment, and Search Console steps.

## Where changes belong

| Area | Files | Typical change |
| --- | --- | --- |
| Word readings | [`src/lexicon.js`](../src/lexicon.js) | Add a reviewed Roman spelling or reorder valid candidates. |
| General phonetics | [`src/phonetic.js`](../src/phonetic.js) | Change a rule that should apply to many words. |
| Engine API | [`src/index.js`](../src/index.js), [`src/index.d.ts`](../src/index.d.ts) | Change lookup, explicit marks, or a public type. |
| Reusable browser adapters | [`src/dom.js`](../src/dom.js), [`src/dom.d.ts`](../src/dom.d.ts) | Change field discovery, caret, composition, paste, candidates, or undo behavior. |
| Browser demo | [`demo/`](../demo/) | Change the playground UI or its on-page guide. |
| Package website | [`website/`](../website/index.md), [`docs/`](README.md), [`website/page-meta.json`](../website/page-meta.json) | Change the landing page, canonical Markdown guides, or page metadata. |
| Website checks | [`website/tests/`](../website/tests/site.spec.js), [`playwright.site.config.js`](../playwright.site.config.js) | Check rendered pages, documentation search, responsive navigation, and demo routes. |
| Node tests | [`test/`](../test/) | Lock down engine output or simulated adapter events. |
| Desktop browser tests | [`browser/`](../browser/), [`playwright.config.js`](../playwright.config.js) | Check browser keyboard flows and separately labeled injected paste/composition contracts. |
| Seed benchmark | [`benchmark/`](../benchmark/) | Track named contracts and clearly labeled exploratory cases. |

## Report a typing problem

Include the exact Roman keys, intended Unicode Nepali text, actual text, and whether the problem appears in `convertWord`, `convertText`, or the demo editor. For editor problems, include the caret position, selection, mode, and the action that triggered it (typing, paste, Backspace, undo, or composition). If a hidden joiner matters, paste the Unicode text rather than relying only on a screenshot.

Do not submit a bulk dictionary copied from another tool without its license, provenance, and a way to review its accuracy. See [CONTRIBUTING.md](../CONTRIBUTING.md) for a focused contribution path.

## Make a change

1. Describe one reproducible behavior and the expected Unicode output or UI state.
2. Add a focused regression test. For editor behavior, capture the event sequence and caret or suggestion state.
3. Change the smallest appropriate layer. Use a lexicon entry for a specific spelling; change phonetic rules only when broadly valid.
4. Run `npm test` and `npm run benchmark -- --check`. Run `npm run test:browser` when browser input or integration behavior changes, and `npm run test:site` when website behavior changes. Try the [demo](demo/README.md) when a typing or UI interaction changes.
5. Update the [package docs](package/README.md) when an API or key behavior changes, or the [demo guide](demo/README.md) when the playground changes. Explain any changed benchmark case in the pull request.

Pull requests to `main` run the [Node CI workflow](../.github/workflows/ci.yml) on Node 18, 20, 22, and 24. Repository rules require those Node checks and resolved review threads before merge. A separate [browser workflow](../.github/workflows/browser.yml) runs three desktop engines on Ubuntu with Node 22 and uploads HTML/JSON reports and failure traces for 14 days. Check its results on the pull request head commit; workflow jobs do not become required merge checks automatically. The website workflow builds and checks pull requests and deploys the generated artifact only from `main` when GitHub Pages uses the Actions publishing source. GitHub Pages is configured to use the GitHub Actions publishing source; it serves the generated website artifact. Inspect the deployment result before assuming the public site has updated. See the [website publishing guide](website-and-seo.md#github-pages-publishing).

## Release status

The repository and demo are public. `sahajlipi@0.1.0-alpha.3` was published and verified on 2026-10-09; its official registry archive matches the reviewed merged source. The verified `alpha` and `latest` tags both point to `0.1.0-alpha.3`; unversioned `npm install sahajlipi` selects alpha.3. All published versions remain experimental Nepali developer alphas. Pin with `npm install --save-exact sahajlipi@0.1.0-alpha.3`. The [release record](release.md#alpha3-release) identifies integrity and fresh registry consumers.

The phonetic fallback introduced in alpha.2 and retained by alpha.3 defaults to full bare and final consonants and supports explicit backtick or `/` half forms. Preserve alpha.1 fallback endings with `createEngine({ consonantMode: 'half' })`, passing both converters to DOM fields as shown in the [migration recipe](package/integration-recipes.md#keep-alpha1-consonant-behavior). Published alpha.1 retains its earlier behavior and has no new option or backtick shortcut; its dated checks remain separate from alpha.2 candidate and registry verification.

The [release record](release.md) records artifact identity, registry tags, compatibility scope, versioning, migration notes, and the alpha checklist. See [CHANGELOG.md](../CHANGELOG.md) for release contents and [Getting started](package/getting-started.md) for npm, local tarball, and source installation.

## Privacy and trust boundaries

The package engine has no network or persistent-storage code. Each attached text field keeps up to 200 edit snapshots in memory for undo. The opt-in manager observes the supplied page region until it is destroyed. The [demo guide](demo/README.md) describes its Copy button and static hosting. These source-level observations do not cover browser extensions, hosting access logs, or applications embedding the package; see the [package architecture](package/architecture.md) for its data flow.
