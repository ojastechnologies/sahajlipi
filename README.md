# SahajLipi

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/brand/logo-dark.svg">
  <img src="assets/brand/logo.svg" alt="SahajLipi" width="380" height="82">
</picture>

**Roman keys. Native script.**

[![CI](https://github.com/ojastechnologies/sahajlipi/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ojastechnologies/sahajlipi/actions/workflows/ci.yml)
[![Browser tests](https://github.com/ojastechnologies/sahajlipi/actions/workflows/browser.yml/badge.svg?branch=main)](https://github.com/ojastechnologies/sahajlipi/actions/workflows/browser.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

SahajLipi is an open-source JavaScript library with TypeScript declarations for phonetic Roman Nepali → Unicode typing in web applications. The reusable package is an experimental prototype. Its code is MIT-licensed; the [CLDR month-name data](docs/package/month-names.md) uses [Unicode-3.0](LICENSES/Unicode-3.0.txt). This repository contains a **reusable package** and a **separate browser demo**. Only Nepali is implemented today; other Devanagari languages are a future goal.

[Package website](https://ojastechnologies.github.io/sahajlipi/) · [Getting started](docs/package/getting-started.md) · [Documentation](docs/README.md) · [Live demo](https://ojastechnologies.github.io/sahajlipi/demo/) · [Evaluation](#evaluation-status) · [Contributing](CONTRIBUTING.md)

## Use the package

Start with [Getting started](docs/package/getting-started.md) for local tarball installation and imports from `sahajlipi` / `sahajlipi/dom`. The package is not on npm yet. Runnable [integration examples](examples/README.md) cover vanilla JavaScript, TypeScript, and a React uncontrolled textarea; [integration recipes](docs/package/integration-recipes.md) explain candidates and lifecycle handling.

The core engine converts words and text without a browser. For live typing, mark the fields that should accept Roman Nepali, then initialize the browser adapter once:

```html
<textarea data-sahajlipi></textarea>
<input type="text" data-sahajlipi>
<input type="search" data-sahajlipi>

<script type="module">
  import { attachNepaliInputs } from './src/dom.js';

  const nepali = attachNepaliInputs();
  // Call nepali.destroy() when the page or app is torn down.
</script>
```

The manager also picks up marked fields added later. For one field, call `attachNepaliInput(field)`; pass a custom engine or state callback only when needed. See the [browser API](docs/package/api.md#browser-input-adapters) for options and cleanup details.

As an alternative to the marked-field setup above, enable Nepali typing across an app's document with `{ scope: 'all' }`. This covers supported textareas and text/search inputs; mark any English field with `data-sahajlipi-ignore`. Pass a page container as the first argument to limit the scope, or use `selector` to target particular fields. Each initializer has its own configuration and `setEnabled()` control.

```js
import { attachNepaliInputs } from './src/dom.js';

const appTyping = attachNepaliInputs(document, { scope: 'all' });
// appTyping.setEnabled(false) switches its fields to literal English typing.
```

```js
import { convertWord, convertText } from './src/index.js';

convertWord('paani');
// { text: 'पानी', candidates: ['पानी'], ambiguous: false }

convertText('pani. paani|');
// 'पनि. पानी।'

convertText('namaste camera.com name@example.com');
// 'नमस्ते camera.com name@example.com'

convertText('September 27, 2026 3.14|');
// 'सेप्टेम्बर २७, २०२६ ३.१४।'
```

The default engine also converts 20 exact English-spelling loanwords, such as `camera` → क्यामेरा and `bank` → बैंक. Browser fields use these defaults when Nepali mode is enabled. See the [loanword defaults and limits](docs/package/loanword-review.md). The twelve full Gregorian month names also work in lowercase and Title Case, such as `september` or `September` → सेप्टेम्बर; [month-name defaults](docs/package/month-names.md) spell names without calendar conversion. ASCII number keys use Devanagari digits by default (`123` → `१२३`, `3.14` → `३.१४`), except inside preserved addresses. Use `createEngine({ digits: 'latin' })` and pass both of its conversion functions to the adapter when an app or page should keep ASCII digits. English mode stays literal. See [digit configuration](docs/package/api.md#digits-and-shared-field-configuration).

Recognizable links, ASCII domain-shaped hosts and ordinary ASCII email addresses stay literal by default during text conversion, live typing, and paste. Preservation starts at early cues such as `https:`, `www.`, `name@`, and `camera.c`, before an address is complete. Plain `camera` still converts. The policy preserves spelling and case without checking whether a domain exists; it does not detect arbitrary English or code. For an English fragment, disable conversion while typing or pasting it, then enable it again. Custom engines can opt out with `preserveTechnicalText: false`. See [mixed-text behavior and controls](docs/package/api.md#links-domains-and-email-addresses).

Start with the [package documentation](docs/package/README.md) for the [API](docs/package/api.md), [typing rules](docs/package/typing-reference.md), [architecture](docs/package/architecture.md), and [benchmark protocol](docs/package/benchmarks.md). The package is still marked `private` and is **not published to npm**; the snippets above use checkout imports. A locally packed installation can use the public package imports; see [Getting started](docs/package/getting-started.md).

## Package website and demo

The package website presents the library and renders these Markdown guides as searchable documentation. Website updates publish after merge and a successful GitHub Pages deployment. See the [website and SEO guide](docs/website-and-seo.md) for local builds, canonical URLs, sitemap, publishing, and search-verification limits.

Use the [live typing demo](https://ojastechnologies.github.io/sahajlipi/demo/) to try the current interaction. Its editor, candidate dropdown, controls, local setup, and Pages hosting are described in the [demo guide](docs/demo/README.md). The demo consumes the package; it is not a separate conversion engine.

## Evaluation status

The badges show current `main` workflow status. Node CI runs automated tests and the seed contract benchmark on pull requests and pushes to `main`, across Node.js 18, 20, 22, and 24. The separate browser workflow runs Chromium, Firefox, and WebKit on Ubuntu with Node.js 22; its [compatibility guide](docs/package/browser-compatibility.md) records tested environments, commands, and limits. Check a pull request's own checks for its results. The table below contains **dated recorded results**, with methods and provenance linked from each row.

| Evaluation | Recorded result | Run date | Interpretation |
| --- | --- | --- | --- |
| [Developer consumer browser regressions](docs/package/browser-compatibility.md#installed-package-developer-examples) | 51/51 checks: 17 scenarios in each of Chromium, Firefox, and WebKit | 2026-09-27 | Adds installed-package vanilla and React uncontrolled-field lifecycle checks. Historical runs remain immutable; no general framework support claim. |
| [Latest digit browser regressions](docs/package/browser-compatibility.md#digit-follow-up--2026-09-27) | 42/42 checks: 14 scenarios in each of Chromium, Firefox, and WebKit | 2026-09-27 | macOS arm64 headless engines; digit/configuration checks added, synthetic event limits retained. The prior 36-check record stays immutable. |
| [Recorded desktop browser regressions](docs/package/browser-compatibility.md#recorded-run--2026-09-27) | 36/36 checks: 12 scenarios in each of Chromium, Firefox, and WebKit | 2026-09-27 | Automated headless desktop engines on macOS arm64; paste/composition/native-input cases use injected events. No mobile or installed-browser certification. |
| [Latest digit contracts](docs/package/digits-benchmarks.md#recorded-results) | 133/133 revised contracts; baseline 119/133 | 2026-09-27 | Eight additions and seven disclosed digit-expectation revisions. Explicit Latin option retains 125/125 historical contracts; no linguistic accuracy claim. |
| [Recorded early-address contracts](docs/package/mixed-text-benchmarks.md#early-address-follow-up--2026-09-27) | 125/125 contracts; baseline 120/125 on the same expanded fixture | 2026-09-27 | Six software contracts for incomplete address cues; prior 119 contracts preserved. No linguistic accuracy or timing result. |
| [Recorded first mixed-text contracts](docs/package/mixed-text-benchmarks.md#recorded-results) | 119/119 contracts; baseline 110/119 on the same expanded fixture | 2026-09-27 | Ten technical-text software contracts; original 109 contracts preserved. |
| [Recorded Gregorian month contracts](docs/package/month-benchmarks.md#recorded-results) | 109/109 recorded contracts; baseline 91/109 on the same expanded fixture | 2026-09-27 | Twelve CLDR-assisted month defaults and focused case/date guards; original 85 contracts preserved. |
| [Latest public word comparison](docs/package/month-benchmarks.md#external-comparisons-and-separation) | 281/4,101 top and candidate matches (6.85%); unchanged from the month baseline | 2026-09-27 | Descriptive unchanged-label comparison; no month-entry overlaps found, no held-out accuracy claim. |
| [Recorded loanword and cha contracts](docs/package/loanword-benchmarks.md#recorded-results) | 85/85 recorded contracts; baseline 60/85 on the same expanded fixture | 2026-09-27 | Source-assisted project defaults; original 50 contracts preserved and two exploratory cases excluded. |
| [Recorded loanword public comparison](docs/package/loanword-benchmarks.md#external-comparisons-and-separation) | 281/4,101 top and candidate matches (6.85%); baseline 279/4,101 | 2026-09-27 | Descriptive unchanged-label comparison; two pilot mappings overlap this public test. |
| [Initial seed behavior contracts](docs/package/benchmarks.md#initial-seed-baseline) | 28/28 full contract cases | 2026-09-24 | Regression coverage for selected project behaviors. Two unreviewed exploratory cases are excluded from the gate. |
| [Recorded ra-ya behavior update](docs/package/ry-review.md#recorded-results) | 50/50 recorded seed contracts; baseline 38/50 on the same final fixture | 2026-09-27 | Source-assisted project preferences and regression guards; independent human linguistic review pending. |
| [Initial external word baseline](docs/package/external-evaluation.md#initial-baseline) | 279/4,101 default matches; 279/4,101 references in candidates (6.80% each) | 2026-09-24 | Exact Unicode agreement with the pinned Aksharantar word test. |
| [Development review batch](docs/package/review-batch-baseline.md) | Default matches: 7/80 words, 0/20 sentences; 7/80 word proposals in candidates | 2026-09-26 | 100 unreviewed development source proposals; no accepted labels yet. |
| [Source-assisted online review](docs/package/assisted-online-review.md) | 100 draft recommendations: 67 accept, 12 correct/add alternatives, 21 hold/exclude | 2026-09-27 | Research notes with 107 distinct evidence URLs; no canonical labels admitted or accuracy score. |

These results do not establish population-wide Nepali typing accuracy. The external word set uses lowercase Roman inputs and does not exercise Shift shortcuts. The development batch still needs independent Nepali-language review before its proposals become accepted linguistic labels. Source-assisted project preferences are documented in the [month-name review](docs/package/month-names.md), [loanword review](docs/package/loanword-review.md) and [ra-ya report](docs/package/ry-review.md). The mixed-text, early-address, and digit reports measure software contracts only; they add no linguistic labels or external accuracy comparison. The digit record explicitly separates revised Devanagari-default expectations from the historical ASCII-digit fixture. The dated month comparison retains all 4,101 original labels and leaves its score unchanged; the dated loanword comparison discloses two pilot-entry overlaps. Full reports record source revisions, engine identities and file hashes, exclusions, and review status; the [review guide](docs/package/review-batch.md) explains how to contribute language review.

## Work on the project

Node.js 18 or later runs the Node tests and engine checks from the repository root:

```sh
npm test
npm run benchmark -- --check
```

For desktop browser tests, use Node.js 20 or later, npm, and Python 3:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run test:browser
```

On Linux, add `--with-deps` to the browser installation command. The suite starts its own local server. See the [browser compatibility guide](docs/package/browser-compatibility.md) for running one engine, opening reports, and distinguishing keyboard checks from injected event tests. Playwright is a development dependency; the package has no runtime dependencies.

The [release policy](docs/release.md) and [changelog](CHANGELOG.md) track alpha preparation; npm publishing is still blocked.

See the [documentation index](docs/README.md), [development guide](docs/development.md), [contribution guide](CONTRIBUTING.md), [project status](docs/status-and-roadmap.md), [security policy](SECURITY.md), and [MIT license](LICENSE). The seed benchmark is a regression set, not a population-wide accuracy measure. See the [external evaluation guide](docs/package/external-evaluation.md) for the pinned Nepali word baseline and sentence review process.

Project logos, browser icons, social preview artwork and usage rules are available in the [brand guide](docs/brand.md).
