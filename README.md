# SahajLipi

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://ojastechnologies.github.io/sahajlipi/assets/brand/logo-dark.svg">
  <img src="https://ojastechnologies.github.io/sahajlipi/assets/brand/logo.svg" alt="SahajLipi" width="380" height="82">
</picture>

**Roman keys. Native script.**

[![CI](https://github.com/ojastechnologies/sahajlipi/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ojastechnologies/sahajlipi/actions/workflows/ci.yml)
[![Browser tests](https://github.com/ojastechnologies/sahajlipi/actions/workflows/browser.yml/badge.svg?branch=main)](https://github.com/ojastechnologies/sahajlipi/actions/workflows/browser.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/ojastechnologies/sahajlipi/blob/main/LICENSE)

SahajLipi is an experimental JavaScript library for phonetic Nepali typing in web apps. It converts Roman Nepali to Devanagari Unicode and includes TypeScript declarations and browser input adapters, with no runtime dependencies.

Its code is MIT-licensed; the [CLDR month-name data](https://ojastechnologies.github.io/sahajlipi/docs/package/month-names.html) uses [Unicode-3.0](https://github.com/ojastechnologies/sahajlipi/blob/main/LICENSES/Unicode-3.0.txt). This repository contains a **reusable package** and a **separate browser demo**. Nepali is the implemented language.

[Package website](https://ojastechnologies.github.io/sahajlipi/) · [Getting started](https://ojastechnologies.github.io/sahajlipi/docs/package/getting-started.html) · [Documentation](https://ojastechnologies.github.io/sahajlipi/docs/) · [Live demo](https://ojastechnologies.github.io/sahajlipi/demo/) · [Evaluation](#evaluation-status) · [Contributing](https://ojastechnologies.github.io/sahajlipi/docs/contributing.html)

## Use the package

Use the experimental developer alpha from [npm](https://www.npmjs.com/package/sahajlipi). Start with [Getting started](https://ojastechnologies.github.io/sahajlipi/docs/package/getting-started.html) for installation and imports from `sahajlipi` / `sahajlipi/dom`. Runnable [integration examples](https://github.com/ojastechnologies/sahajlipi/blob/main/examples/README.md) cover vanilla JavaScript, TypeScript, and a React uncontrolled textarea; [integration recipes](https://ojastechnologies.github.io/sahajlipi/docs/package/integration-recipes.html) explain candidates and lifecycle handling.

Since alpha.2, full bare and final fallback consonants are the default, backtick is an explicit half marker, and `consonantMode: 'half'` offers alpha.1 fallback compatibility. See the [alpha.2 behavior](#alpha2-consonant-behavior) and [migration recipe](https://ojastechnologies.github.io/sahajlipi/docs/package/integration-recipes.html#keep-alpha1-consonant-behavior).

Install from the alpha channel and save the resolved version exactly:

```sh
npm install --save-exact sahajlipi@alpha
```

The `alpha` tag can move to a later prerelease. `--save-exact` records the version resolved by this installation; retain your lockfile for reproducible installs. The [release record](https://ojastechnologies.github.io/sahajlipi/docs/release.html) records published artifact identities, registry tags, consumer checks, and the experimental scope. The [local tarball instructions](https://ojastechnologies.github.io/sahajlipi/docs/package/getting-started.html#local-development-installation) cover source development.

The core engine converts words and text without a browser. The browser examples assume an ESM bundler or an import map that resolves the installed package. For live typing, mark the fields that should accept Roman Nepali, then initialize the browser adapter once:

```html
<textarea data-sahajlipi></textarea>
<input type="text" data-sahajlipi>
<input type="search" data-sahajlipi>

<script type="module">
  import { attachNepaliInputs } from 'sahajlipi/dom';

  const nepali = attachNepaliInputs();
  // Call nepali.destroy() when the page or app is torn down.
</script>
```

The manager also picks up marked fields added later. For one field, call `attachNepaliInput(field)`; pass a custom engine or state callback only when needed. See the [browser API](https://ojastechnologies.github.io/sahajlipi/docs/package/api.html#browser-input-adapters) for options and cleanup details.

As an alternative to the marked-field setup above, enable Nepali typing across an app's document with `{ scope: 'all' }`. This covers supported textareas and text/search inputs; mark any English field with `data-sahajlipi-ignore`. Pass a page container as the first argument to limit the scope, or use `selector` to target particular fields. Each initializer has its own configuration and `setEnabled()` control.

```js
import { attachNepaliInputs } from 'sahajlipi/dom';

const appTyping = attachNepaliInputs(document, { scope: 'all' });
// appTyping.setEnabled(false) switches its fields to literal English typing.
```

```js
import { convertWord, convertText } from 'sahajlipi';

convertWord('paani');
// { text: 'पानी', candidates: ['पानी'], ambiguous: false }

convertText('pani. paani|');
// 'पनि. पानी।'

convertText('namaste camera.com name@example.com');
// 'नमस्ते camera.com name@example.com'

convertText('September 27, 2026 3.14|');
// 'सेप्टेम्बर २७, २०२६ ३.१४।'
```

Four reviewed exact native-word aliases produce `halyo` → हाल्यो, `nabhani` → नभनी, `gaunle` → गाउँले and `dindaina` → दिँदैन. These exact readings retain their priority in either consonant mode; vowel lengths and Shift sound keys keep their explicit rules. See the [dated spelling review](https://ojastechnologies.github.io/sahajlipi/docs/package/nepali-spelling-2026-10-01.html).

Since alpha.3, twelve further reviewed exact native spellings include `imandar` → इमान्दार and `niskanda` → निस्कँदा. `bhagna` retains its भग्न default and offers भाग्न as an alternative. The [dated spelling review and comparison](https://ojastechnologies.github.io/sahajlipi/docs/package/nepali-spelling-2026-10-09.html) records the source-assisted development evidence and remaining mismatches; check the release record for publication status before upgrading.

The default engine converts 51 listed English-spelling loanword stems, including `camera` → क्यामेरा, `company` → कम्पनी and `media` → मिडिया. A finite list of 19 attached suffix forms also works: `companyharumathi` → कम्पनीहरूमाथि, `schoolma` → स्कुलमा with स्कूलमा as an alternative, and `mediasanga` → मिडियासँग. Browser fields use these defaults in Nepali mode. See the [current suffix rules and evidence](https://ojastechnologies.github.io/sahajlipi/docs/package/loanword-suffixes-2026-10-01.html); the [original pilot](https://ojastechnologies.github.io/sahajlipi/docs/package/loanword-review.html) and [earlier expansion](https://ojastechnologies.github.io/sahajlipi/docs/package/loanword-expansion-2026-09-28.html) keep their dated scopes.

The twelve full Gregorian month names also work in lowercase and Title Case, such as `september` or `September` → सेप्टेम्बर; [month-name defaults](https://ojastechnologies.github.io/sahajlipi/docs/package/month-names.html) spell names without calendar conversion.

ASCII number keys use Devanagari digits by default (`123` → `१२३`, `3.14` → `३.१४`), except inside preserved addresses. Use `createEngine({ digits: 'latin' })` and pass both of its conversion functions to the adapter when an app or page should keep ASCII digits. English mode stays literal. See [digit configuration](https://ojastechnologies.github.io/sahajlipi/docs/package/api.html#digits-and-shared-field-configuration).

Recognizable links, ASCII domain-shaped hosts and ordinary ASCII email addresses stay literal by default during text conversion, live typing, and paste. Preservation starts at early cues such as `https:`, `www.`, `name@`, and `camera.c`, before an address is complete. Plain `camera` still converts. The policy preserves spelling and case without checking whether a domain exists; it does not detect arbitrary English or code. For an English fragment, disable conversion while typing or pasting it, then enable it again. Custom engines can opt out with `preserveTechnicalText: false`. See [mixed-text behavior and controls](https://ojastechnologies.github.io/sahajlipi/docs/package/api.html#links-domains-and-email-addresses).

Start with the [package documentation](https://ojastechnologies.github.io/sahajlipi/docs/package/) for the [API](https://ojastechnologies.github.io/sahajlipi/docs/package/api.html), [typing rules](https://ojastechnologies.github.io/sahajlipi/docs/package/typing-reference.html), [architecture](https://ojastechnologies.github.io/sahajlipi/docs/package/architecture.html), and [benchmark protocol](https://ojastechnologies.github.io/sahajlipi/docs/package/benchmarks.html). The snippets above use public package imports; see [Getting started](https://ojastechnologies.github.io/sahajlipi/docs/package/getting-started.html).

<span id="source-candidate-consonant-behavior"></span>

### Alpha.2 consonant behavior

The behavior introduced in alpha.2 displays full bare and final consonants immediately, while forming internal conjuncts automatically:

| Roman input | Default output |
| --- | --- |
| `k` or `ka` | क |
| `kr` or `kra` | क्र |
| `kri` | क्रि |
| `kar` | कर |
| `shakti` | शक्ति |
| `` k` `` or `k/` | क् |
| `` k`i `` or `k/i` | क्इ |

Explicit half forms persist across spaces and punctuation. Use `ki` → कि for an attached vowel sign; a vowel after either half marker is independent. Both `` `= `` and `/=` support the existing explicit joiner behavior. Exact built-in and custom lexicon readings are not rewritten by the new fallback default.

`createEngine({ consonantMode: 'half' })` restores alpha.1 phonetic fallback endings such as `k` → क् and `kr` → क्र्. Pass both engine converters to browser adapters as shown in the [migration recipe](https://ojastechnologies.github.io/sahajlipi/docs/package/integration-recipes.html#keep-alpha1-consonant-behavior). Alpha.1 predates the consonant mode option and backtick shortcut.

Candidate verification on 2026-10-03 passed **317 Node tests**, **160 seed contracts**, **66 desktop browser scenarios**, and **11 website scenarios**, plus installed JavaScript and strict TypeScript consumers. The [dated consonant comparison](https://ojastechnologies.github.io/sahajlipi/docs/package/consonant-defaults-2026-10-03.html) records 31 literal cases for each mode and **144/144** exact archived results preserved by strict mode. These counts describe software contracts and the listed integration flows; they are not a general Nepali accuracy score. The earlier evaluation tables below remain dated records.

## Package website and demo

The package website presents the library and renders these Markdown guides as searchable documentation. Website updates publish after merge and a successful GitHub Pages deployment. See the [website and SEO guide](https://ojastechnologies.github.io/sahajlipi/docs/website-and-seo.html) for local builds, canonical URLs, sitemap, publishing, and search-verification limits.

Use the [live typing demo](https://ojastechnologies.github.io/sahajlipi/demo/) to try the current interaction. Its editor, candidate dropdown, controls, local setup, and Pages hosting are described in the [demo guide](https://ojastechnologies.github.io/sahajlipi/docs/demo/). The demo consumes the package; it is not a separate conversion engine.

To run the full website and demo locally, use Node.js 20 or later, npm, and Python 3:

```sh
npm ci
npm run demo
```

Open [the local demo](http://127.0.0.1:4173/sahajlipi/demo/) or [the package homepage](http://127.0.0.1:4173/sahajlipi/). This builds the generated website so Home and documentation links work. The previous local `/demo/` URL redirects to the complete demo route. Source-only examples use the separate `npm run examples:serve` command on port 4177.

## Evaluation status

The badges show current `main` workflow status. Node CI runs automated tests and the seed contract benchmark on pull requests and pushes to `main`, across Node.js 18, 20, 22, and 24. The separate browser workflow runs Chromium, Firefox, and WebKit on Ubuntu with Node.js 22; its [compatibility guide](https://ojastechnologies.github.io/sahajlipi/docs/package/browser-compatibility.html) records tested environments, commands, and limits. Check a pull request's own checks for its results. The table below contains **dated recorded results**, with methods and provenance linked from each row.

| Evaluation | Recorded result | Run date | Interpretation |
| --- | --- | --- | --- |
| [Reviewed native spelling batch](https://ojastechnologies.github.io/sahajlipi/docs/package/nepali-spelling-2026-10-09.html#recorded-comparison) | Contracts 160/174 → 174/174; reviewed word defaults 16/74 → 28/74, reference candidates 17/79 → 30/79 | 2026-10-09 | All 162 historical rows unchanged; both engines retain 160/160 historical contracts; full reviewed sentences remain 0/12. Source-assisted development gains, with no general accuracy claim. |
| [Reviewed native spelling contracts and comparison](https://ojastechnologies.github.io/sahajlipi/docs/package/nepali-spelling-2026-10-01.html#recorded-comparison) | Contracts 137/142 → 142/142; reviewed word defaults 11/74 → 15/74, reference candidates 12/79 → 16/79 | 2026-10-01 | All 139 prior rows unchanged; constructed controls 11/11 before and after; complete reviewed sentences remain 0/12. No representative accuracy claim. |
| [Native spelling browser regressions](https://ojastechnologies.github.io/sahajlipi/docs/package/browser-compatibility.html#native-spelling-follow-up--2026-10-01) | 60/60 checks: 20 scenarios in each of Chromium, Firefox and WebKit | 2026-10-01 | Adds reviewed native word editing, undo/redo and English mode; alpha tarball tested locally, registry availability requires separate verification. |
| [Loanword suffix contracts and reviewed comparison](https://ojastechnologies.github.io/sahajlipi/docs/package/loanword-suffixes-2026-10-01.html#recorded-comparison) | Revised contracts 131/137 → 137/137; reviewed word defaults 8/74 → 11/74, reference candidates 8/79 → 12/79 | 2026-10-01 | Two historical fallback expectations intentionally revised; frozen development references unchanged, full sentences remain 0/12. No held-out accuracy claim. |
| [Loanword suffix browser regressions](https://ojastechnologies.github.io/sahajlipi/docs/package/browser-compatibility.html#loanword-suffix-follow-up--2026-10-01) | 57/57 checks: 19 scenarios in each of Chromium, Firefox and WebKit | 2026-10-01 | Adds attached suffix editing, candidate choices and address/mode transitions; existing desktop and synthetic-event limits remain. |
| [Developer consumer browser regressions](https://ojastechnologies.github.io/sahajlipi/docs/package/browser-compatibility.html#installed-package-developer-examples) | 51/51 checks: 17 scenarios in each of Chromium, Firefox, and WebKit | 2026-09-27 | Adds installed-package vanilla and React uncontrolled-field lifecycle checks. Historical runs remain immutable; no general framework support claim. |
| [Latest digit browser regressions](https://ojastechnologies.github.io/sahajlipi/docs/package/browser-compatibility.html#digit-follow-up--2026-09-27) | 42/42 checks: 14 scenarios in each of Chromium, Firefox, and WebKit | 2026-09-27 | macOS arm64 headless engines; digit/configuration checks added, synthetic event limits retained. The prior 36-check record stays immutable. |
| [Recorded desktop browser regressions](https://ojastechnologies.github.io/sahajlipi/docs/package/browser-compatibility.html#recorded-run--2026-09-27) | 36/36 checks: 12 scenarios in each of Chromium, Firefox, and WebKit | 2026-09-27 | Automated headless desktop engines on macOS arm64; paste/composition/native-input cases use injected events. No mobile or installed-browser certification. |
| [Latest digit contracts](https://ojastechnologies.github.io/sahajlipi/docs/package/digits-benchmarks.html#recorded-results) | 133/133 revised contracts; baseline 119/133 | 2026-09-27 | Eight additions and seven disclosed digit-expectation revisions. Explicit Latin option retains 125/125 historical contracts; no linguistic accuracy claim. |
| [Recorded early-address contracts](https://ojastechnologies.github.io/sahajlipi/docs/package/mixed-text-benchmarks.html#early-address-follow-up--2026-09-27) | 125/125 contracts; baseline 120/125 on the same expanded fixture | 2026-09-27 | Six software contracts for incomplete address cues; prior 119 contracts preserved. No linguistic accuracy or timing result. |
| [Recorded first mixed-text contracts](https://ojastechnologies.github.io/sahajlipi/docs/package/mixed-text-benchmarks.html#recorded-results) | 119/119 contracts; baseline 110/119 on the same expanded fixture | 2026-09-27 | Ten technical-text software contracts; original 109 contracts preserved. |
| [Recorded Gregorian month contracts](https://ojastechnologies.github.io/sahajlipi/docs/package/month-benchmarks.html#recorded-results) | 109/109 recorded contracts; baseline 91/109 on the same expanded fixture | 2026-09-27 | Twelve CLDR-assisted month defaults and focused case/date guards; original 85 contracts preserved. |
| [Latest public word comparison](https://ojastechnologies.github.io/sahajlipi/docs/package/month-benchmarks.html#external-comparisons-and-separation) | 281/4,101 top and candidate matches (6.85%); unchanged from the month baseline | 2026-09-27 | Descriptive unchanged-label comparison; no month-entry overlaps found, no held-out accuracy claim. |
| [Recorded loanword and cha contracts](https://ojastechnologies.github.io/sahajlipi/docs/package/loanword-benchmarks.html#recorded-results) | 85/85 recorded contracts; baseline 60/85 on the same expanded fixture | 2026-09-27 | Source-assisted project defaults; original 50 contracts preserved and two exploratory cases excluded. |
| [Recorded loanword public comparison](https://ojastechnologies.github.io/sahajlipi/docs/package/loanword-benchmarks.html#external-comparisons-and-separation) | 281/4,101 top and candidate matches (6.85%); baseline 279/4,101 | 2026-09-27 | Descriptive unchanged-label comparison; two pilot mappings overlap this public test. |
| [Initial seed behavior contracts](https://ojastechnologies.github.io/sahajlipi/docs/package/benchmarks.html#initial-seed-baseline) | 28/28 full contract cases | 2026-09-24 | Regression coverage for selected project behaviors. Two unreviewed exploratory cases are excluded from the gate. |
| [Recorded ra-ya behavior update](https://ojastechnologies.github.io/sahajlipi/docs/package/ry-review.html#recorded-results) | 50/50 recorded seed contracts; baseline 38/50 on the same final fixture | 2026-09-27 | Source-assisted project preferences and regression guards; independent human linguistic review pending. |
| [Initial external word baseline](https://ojastechnologies.github.io/sahajlipi/docs/package/external-evaluation.html#initial-baseline) | 279/4,101 default matches; 279/4,101 references in candidates (6.80% each) | 2026-09-24 | Exact Unicode agreement with the pinned Aksharantar word test. |
| [Completed source-assisted development review](https://ojastechnologies.github.io/sahajlipi/docs/package/source-review-2026-10-01.html) | 86 admitted cases; word defaults 8/74, candidate references 8/79, sentences 0/12 | 2026-10-01 | Frozen source-assisted development references; 14 exclusions, no independent human or population accuracy claim. |
| [Development review batch](https://ojastechnologies.github.io/sahajlipi/docs/package/review-batch-baseline.html) | Default matches: 7/80 words, 0/20 sentences; 7/80 word proposals in candidates | 2026-09-26 | 100 unreviewed development source proposals; no accepted labels yet. |
| [Source-assisted online review](https://ojastechnologies.github.io/sahajlipi/docs/package/assisted-online-review.html) | 100 draft recommendations: 67 accept, 12 correct/add alternatives, 21 hold/exclude | 2026-09-27 | Research notes with 107 distinct evidence URLs; no canonical labels admitted or accuracy score. |

These results do not establish population-wide Nepali typing accuracy. The external word set uses lowercase Roman inputs and does not exercise Shift shortcuts. The completed source-assisted review supplies project development references for the next corrections. A separate independently reviewed real-typing corpus remains necessary for representative accuracy claims. Source-assisted project preferences are documented in the [month-name review](https://ojastechnologies.github.io/sahajlipi/docs/package/month-names.html), [loanword review](https://ojastechnologies.github.io/sahajlipi/docs/package/loanword-review.html) and [ra-ya report](https://ojastechnologies.github.io/sahajlipi/docs/package/ry-review.html). The mixed-text, early-address, and digit reports measure software contracts only; they add no linguistic labels or external accuracy comparison. The digit record explicitly separates revised Devanagari-default expectations from the historical ASCII-digit fixture. The dated month comparison retains all 4,101 original labels and leaves its score unchanged; the dated loanword comparison discloses two pilot-entry overlaps. Full reports record source revisions, engine identities and file hashes, exclusions, and review status; the [review guide](https://ojastechnologies.github.io/sahajlipi/docs/package/review-batch.html) explains how to contribute language review.

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

On Linux, add `--with-deps` to the browser installation command. The suite starts its own local server. See the [browser compatibility guide](https://ojastechnologies.github.io/sahajlipi/docs/package/browser-compatibility.html) for running one engine, opening reports, and distinguishing keyboard checks from injected event tests. Playwright is a development dependency; the package has no runtime dependencies.

The [release record and policy](https://ojastechnologies.github.io/sahajlipi/docs/release.html) and [changelog](https://ojastechnologies.github.io/sahajlipi/docs/changelog.html) identify release contents, dated publication records and registry-consumer evidence.

See the [documentation index](https://ojastechnologies.github.io/sahajlipi/docs/), [development guide](https://ojastechnologies.github.io/sahajlipi/docs/development.html), [contribution guide](https://ojastechnologies.github.io/sahajlipi/docs/contributing.html), [project status](https://ojastechnologies.github.io/sahajlipi/docs/status-and-roadmap.html), [security policy](https://ojastechnologies.github.io/sahajlipi/docs/security.html), and [MIT license](https://github.com/ojastechnologies/sahajlipi/blob/main/LICENSE). The seed benchmark is a regression set, not a population-wide accuracy measure. See the [external evaluation guide](https://ojastechnologies.github.io/sahajlipi/docs/package/external-evaluation.html) for the pinned Nepali word baseline and sentence review process.

Project logos, browser icons, social preview artwork and usage rules are available in the [brand guide](https://ojastechnologies.github.io/sahajlipi/docs/brand.html).
