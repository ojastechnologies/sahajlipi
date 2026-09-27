# Project status and roadmap

SahajLipi is an early, MIT-licensed Roman Nepali to Unicode typing project. The repository contains a **reusable package** and a **static browser demo** that consumes it. This page records what exists and what remains before a stable developer release.

## Package status

The [package](package/README.md) includes a deterministic word and text converter, a small starter lexicon with ordered alternatives for selected spellings, 20 English-spelling loanword preferences and 12 full English month names, and browser adapters for direct typing in configured text fields. It has TypeScript declarations and no runtime dependencies. The package is marked `private` and is **not published to npm**.

| Area | Current limit |
| --- | --- |
| Nepali accuracy | The lexicon is small and the fallback is deterministic. An output may look plausible while spelling the intended word incorrectly. There is no context-aware ranking or population-wide accuracy estimate. |
| Alternatives | Only explicit multi-reading entries return multiple candidates. The engine does not generate every valid spelling. |
| Mixed English | Recognizable links, ASCII domain-shaped hosts, and ordinary ASCII email addresses stay literal by default in text conversion and attached fields. No address-existence or language detection is performed. Arbitrary English, code, and internationalized addresses need explicit literal handling; the 20 listed loanwords and 12 month names still convert automatically, including मे for `may`. Field exclusions, mode switches, and custom entries remain available. |
| Input surface | The reusable adapter supports `<textarea>` and text/search inputs; one manager can cover marked fields, a page region, or all supported fields in a document, with English fields excluded. The [browser guide](package/browser-compatibility.md) records automated desktop-engine checks and their environment; injected paste/composition contracts are separate from keyboard flows. Real mobile keyboards, OS clipboard behavior, assistive technology, and framework-controlled fields remain unverified. `contenteditable` and other input types are unsupported. |
| Other languages | Mappings and lexicon entries are Nepali-specific. No other Devanagari language profile exists yet. |
| Evaluation | The [seed benchmark](package/benchmarks.md) tracks selected behavior contracts. A separate [external word baseline and sentence review queue](package/external-evaluation.md) and a [100-case development review batch](package/review-batch.md) exist. The batch starts unreviewed; there is no representative real-typing accuracy estimate. |

The [architecture](package/architecture.md), [API reference](package/api.md), and [typing reference](package/typing-reference.md) describe the package as implemented.

## Desktop browser regression checks

A separate Playwright suite checks the reusable adapters and selected demo flows in Chromium, Firefox, and WebKit. It uses pinned development dependencies, an isolated local server, and a dedicated GitHub Actions matrix with downloadable HTML/JSON reports and failure traces. The [browser compatibility guide](package/browser-compatibility.md) records the first dated macOS arm64 run: **36/36** checks across 12 scenarios in Chromium, Firefox, and WebKit, with no failures, skips, flaky outcomes, or retries. Its source hashes, tested versions, commands, and limits are preserved in the [desktop-001 record](../browser/reports/desktop-001.json). The core engine remains dependency-free and its Node suite still runs on Node 18; browser tooling needs Node 20 or later.

These checks cover selected desktop keyboard flows and separately labeled injected paste/composition events. They do not establish real mobile keyboard, OS clipboard, installed Safari, assistive-technology, or framework-controlled input support. The historical linguistic benchmark records are unchanged. A separate [digit follow-up](package/browser-compatibility.md#digit-follow-up--2026-09-27) records **42/42** checks across 14 scenarios per engine, adding digit editing, numeric address cues, Latin configuration, and English exclusions. It preserves the original [desktop-001 record](../browser/reports/desktop-001.json) and documents its new source separately in [desktop-002](../browser/reports/desktop-002.json).

## Latest digit rendering

The core engine and Nepali-enabled fields now render ASCII digits as Devanagari by default: `123` → `१२३`, `3.14` → `३.१४`, and `September 27, 2026` → सेप्टेम्बर २७, २०२६. Recognized address spans retain their original digits; English mode bypasses conversion. Existing Devanagari digits remain unchanged in either configured style. Developers can use `createEngine({ digits: 'latin' })` and share both engine functions across an app, page, or selected fields. This option changes digit rendering only and does not parse numbers, convert calendars, or rewrite existing field text. The [API configuration](package/api.md#digits-and-shared-field-configuration), [typing reference](package/typing-reference.md#digits), and demo guide explain the behavior. The separate [digit record](package/digits-benchmarks.md) scores **119/133 → 133/133** on the revised contracts, discloses seven changed numeric expectations, and verifies **125/125** historical contracts with the explicit Latin option. Older dated results and their fixtures remain reproducible from archived sources.

## Earlier mixed-text improvement

A [shared mixed-text policy](package/api.md#links-domains-and-email-addresses) now preserves recognizable HTTP(S) and `www.` links, ASCII domain-shaped hosts, and ordinary ASCII email addresses in whole-text conversion, live typing, paste, and completed composition. It keeps their original spelling, case, and URL suffix punctuation while Nepali around them converts. Preservation begins at `http:`, `https:`, `www.`, an ordinary ASCII local part followed by `@`, or the first letter after a domain dot, without waiting for a complete address. The current raw token lets the adapter restore letters previously shown in Nepali when one of these cues appears during uninterrupted typing. Plain `camera` and a trailing period still convert; English mode keeps a fragment literal from its first key.

The policy accepts unfinished addresses using ASCII cues with no DNS or public-suffix validation; domain-shaped `pani.paani` also stays literal. It does not detect arbitrary English or code or fully parse internationalized addresses. Existing controller/manager mode switches support literal English fragments, and fixed-name custom entries provide configured spellings. `createEngine({ preserveTechnicalText: false })` disables address preservation while retaining the selected digit style; choose `digits: 'latin'` as well to restore the earlier ASCII-digit, unprotected-text behavior. `convertWord` stays a single-word converter. The [typing reference](package/typing-reference.md#mixed-text-and-literal-english), [architecture](package/architecture.md), and demo guide record the scope and punctuation rules. The [early-address follow-up](package/mixed-text-benchmarks.md#early-address-follow-up--2026-09-27) records **120/125 → 125/125** on the same expanded software-contract fixture, preserving all previous **119/119** contracts. The first mixed-text result remains a separate dated **110/119 → 119/119** record. This adds no independent linguistic labels or population-wide accuracy claim.

## Earlier month-name extension

The [2026-09-27 month-name extension](package/month-names.md) adds all 12 full English month names, including `january` → जनवरी, `february` → फेब्रुअरी and `december` → डिसेम्बर. Each has one source-assisted project spelling and supports normal title case. Explicit `September` and `December` aliases preserve those familiar forms while the other reserved Shift keys keep selecting sounds. Lowercase custom entries update these aliases unless a separate exact cased override is supplied.

These month entries have their own evidence and regression scope. They do not expand the original 20-loanword pilot or its 34-entry research catalogue, admit independent human-reviewed corpus labels, infer abbreviations or attached suffixes, protect English spans, or convert Gregorian dates to Bikram Sambat. `May` and `may` both use मे without context-sensitive English meaning detection. The [typing guide](package/typing-reference.md#english-month-names) and demo show the full list.

## Earlier English loanword pilot

The [2026-09-27 loanword pilot](package/loanword-review.md) adds exactly 20 normalized English-spelling keys, including `camera` → क्यामेरा, `computer` → कम्प्युटर and `school` → स्कुल. These defaults are authorized source-assisted project preferences, each with one candidate. The research catalogue has 34 entries; the remaining 14 proposals and all observed loanword variants remain pending or deferred. This update also makes `cha` prefer च with छ as an alternative, while `chha` remains the single छ reading. Reserved Shift keys, custom-entry replacement and the unknown-word fallback retain their existing behavior.

The pilot adds no independent human-reviewed corpus labels, attached forms such as `camerako`, automatic protection for English spans, or new engine/adapter configuration options. The [typing guide](package/typing-reference.md#english-spelling-loanwords), [source ledger](../benchmark/reports/loanword-research-2026-09-27.json) and [benchmark guide](package/benchmarks.md) separate spelling preferences, evidence and regression results. Historical recorded evidence and metrics remain intact.

## Earlier ra-ya improvement

The [2026-09-27 ra-ya update](package/ry-review.md) adds ten exact word spellings with explicit joiner forms and preserves reserved Shift keys during word lookup. The guide, demo and seed benchmark cover the new preferences and ordinary-conjunct controls. The external dataset result and original 100-case source-proposal agreement remain unchanged.

Following maintainer feedback, six of the original seven unresolved validation tokens are tracked as suspected source misspellings or malformed tokens; `dharyo` remains contextual because literary usage was found. These source-quality cases establish no converter defect and do not block the targeted change. They remain outside new spelling contracts, with the original records and reported benchmark denominators preserved. These source-assisted changes have no admitted independent human corpus labels. The [published 100-case online review](package/assisted-online-review.md) makes all draft recommendations and their evidence available separately from the dated benchmark scores; it admits no canonical answers.

## Developer onboarding and package validation

The [getting-started guide](package/getting-started.md) explains local tarball installation and public imports before an npm release. [Integration recipes](package/integration-recipes.md) link runnable JavaScript, TypeScript, and React uncontrolled-field examples. Package validation installs the actual tarball in a standalone app, checks its allowed contents and exports, compiles strict TypeScript consumers, and executes the core tutorial. The browser suite also tests the installed-package examples, including React effect cleanup in development StrictMode. These checks do not establish controlled-field, mobile, SSR/hydration, or all-framework support.

The [release policy](release.md) and [changelog](../CHANGELOG.md) define the remaining alpha review. Package preparation adds no runtime dependencies and changes no conversion rules. The package remains private and unpublished; corpus review remains independent work.

## Demo status

The [live demo](https://ojastechnologies.github.io/sahajlipi/demo/) is a static playground for trying the current package behavior. It adds a candidate dropdown, Nepali/English mode control, mixed-text and form examples, Copy and Clear buttons, a character count, and an on-page typing guide. Its [separate guide](demo/README.md) covers usage, local hosting, and GitHub Pages. The demo is useful for exploration; it is not a browser compatibility certification or a separate conversion engine.

## Priorities

1. **Reviewed Nepali evaluation corpus.** Independently review and reconcile the [first development batch](package/review-batch.md) before admitting it as a linguistic evaluation corpus. Source-assisted project preferences can be implemented with their evidence and limits recorded separately; they do not count as independent language reviews. Collect consented real typing examples with intended Unicode, valid alternatives, and provenance, and reserve a separate reviewed held-out set. Keep these separate from tests written to fit the implementation.
2. **Evidence-led spelling expansion.** Use the reviewed corpus and observed typing needs to choose lexical entries and broadly valid phonetic changes. Review the remaining loanwords, alternate spellings, and attached forms separately. Collect feedback on the shared technical-text policy before expanding its address scope; arbitrary code and English still require explicit literal handling. Report ambiguity and trade-offs when changing defaults.
3. **Browser input compatibility.** Maintain the [desktop engine regressions](package/browser-compatibility.md) and investigate reported failures. Extend evidence with real mobile keyboards and IMEs, operating system clipboard behavior, assistive technology, and framework-controlled fields before claiming those surfaces are supported.
4. **Developer alpha release.** Finish API and compatibility review using the verified package consumers and [release checklist](release.md); choose an alpha version and publish with an honest quality baseline.
5. **Other Devanagari languages.** Separate language-specific mappings and lexicons from shared conversion and editing mechanics. Add each language with its own reviewed corpus and guide.

These are priorities, not release dates. Any future comparison with other typing tools should use the same published evaluation criteria and distinguish observed results from opinion. No competitor review is included here.

## How to assess progress

A change is ready for review when it has a reproducible input, expected Unicode output or UI state, a focused regression test, and an explanation of its scope. The [benchmark](package/benchmarks.md) should disclose case counts, provenance, exclusions, and misses alongside any score.
