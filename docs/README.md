# SahajLipi documentation

Browse the [package website](https://ojastechnologies.github.io/sahajlipi/) for the library overview and searchable documentation, or read the Markdown guides here on GitHub. Choose the guide for the part of SahajLipi you are using. The **package** provides conversion and optional browser input adapters. The **demo** is a static playground built with that package.

## Reusable package

| Read | For |
| --- | --- |
| [Getting started](package/getting-started.md) | Install locally, use public imports, and choose an integration scope. |
| [Integration recipes](package/integration-recipes.md) | Working candidates, TypeScript, React uncontrolled fields, and cleanup. |
| [Package overview](package/README.md) | Entry points, scope, and current distribution status. |
| [API reference](package/api.md) | Core engine and browser input APIs, one-call setup, and TypeScript declarations. |
| [Typing reference](package/typing-reference.md) | Exact Roman-key behavior, half forms, marks, punctuation, and candidates. |
| [Architecture](package/architecture.md) | Conversion flow, module boundaries, Unicode, and adapter event handling. |
| [Browser adapter compatibility](package/browser-compatibility.md) | Desktop browser checks, reproducible setup, engine matrix, CI artifacts, and coverage limits. |

## Evaluation and review

| Read | For |
| --- | --- |
| [Developer consumer browser record](../browser/reports/desktop-003.json) | Inspect the later 51-check run, installed-package identity, and uncontrolled React lifecycle scope. |
| [Digit desktop browser record](../browser/reports/desktop-002.json) | Inspect the later 42-check digit/configuration run, source identities, named flows, and limits. |
| [Desktop browser run record](../browser/reports/desktop-001.json) | Inspect the dated desktop-engine results, test names, source hashes, environment, and scope limits. |
| [Seed benchmark](package/benchmarks.md) | Run behavior checks; inspect the recorded baseline, scoring rules, and exclusions. |
| [Digit rendering record](package/digits-benchmarks.md) | Reproduce the revised default-digit contracts and separate historical Latin compatibility result. |
| [Mixed-text and early-address records](package/mixed-text-benchmarks.md) | Reproduce dated address-preservation comparisons with frozen fixtures, engine identities, and scope limits. |
| [External evaluation](package/external-evaluation.md) | Reproduce the pinned word baseline and prepare sentence proposals for review. |
| [Development review guide](package/review-batch.md) | Generate the 100-case development batch and record independent Nepali-language decisions. |
| [Development batch report](package/review-batch-baseline.md) | Inspect dated source-proposal agreement and diagnostic signals, with review limitations. |
| [Run manifest](../benchmark/reports/nepali-review-001.json) | Verify source pins, selected IDs, engine/tool hashes, and artifact hashes for the recorded development run. |
| [Completed source-assisted review](package/source-review-2026-10-01.md) | Frozen development references, exclusions, spelling evidence and current exact-output baseline. |
| [Source-assisted online review](package/assisted-online-review.md) | Inspect 100 draft recommendations, evidence scope, source links and pending human review. |
| [Source-assisted review records](../benchmark/reports/nepali-assisted-online-001.json) | Read the public per-case projection, attribution and research hashes; complete sentence texts are omitted. |
| [Ra-ya review and changes](package/ry-review.md) | Inspect exact word preferences, Shift lookup, before/after results and source-quality triage. |
| [Loanword coverage audit](package/loanword-coverage-audit.md) | Review the `company` gap, pending catalogue, source-backed candidates, and evidence needed for broader loanword support. |
| [Loanword expansion review](package/loanword-expansion-2026-09-28.md) | See the 30 later exact-word defaults, source scopes, held candidates, and current coverage limits. |
| [Ra-ya machine report](../benchmark/reports/nepali-ry-001.json) | Verify exact engine/fixture hashes, recorded checks and evidence limits. |

The repository [Evaluation status](../README.md#evaluation-status) summarizes dated baselines. The linked reports provide the evidence and limits behind each result. Unreviewed proposal agreement is not a language-accuracy score.

## Browser demo

| Read | For |
| --- | --- |
| [Demo guide](demo/README.md) | Live and local access, editor controls, candidate dropdown, and Pages hosting. |
| [Live demo](https://ojastechnologies.github.io/sahajlipi/demo/) | Try typing in the hosted playground; its on-page guide shows the keys. |

The demo is one consumer of the package. Its Copy and Clear buttons, character count, and dropdown rendering are demo UI; the conversion rules and reusable adapter API are documented under the package.

## Project and community

| Read | For |
| --- | --- |
| [Release policy](release.md) | Compatibility, versioning, migration, and the alpha release checklist. |
| [Changelog](../CHANGELOG.md) | Unreleased changes and future published-version notes. |
| [Development guide](development.md) | Repository workflow, tests, CI, and release readiness. |
| [Status and roadmap](status-and-roadmap.md) | Current capabilities, limits, and priorities. |
| [Website and SEO](website-and-seo.md) | Markdown site builds, metadata, sitemap, publishing, and discoverability limits. |
| [Brand guide](brand.md) | Name, message, logo assets, colors, typography and repository identity. |
| [Contributing](../CONTRIBUTING.md) | Reporting a typing issue or proposing a focused change. |
| [Security policy](../SECURITY.md) | Private vulnerability reporting and support status. |
| [MIT license](../LICENSE) | Terms for code and documentation. |

The current Node and desktop-browser tests protect specific software behavior. The browser guide distinguishes keyboard tests from injected paste/composition events and records the tested environments. The seed benchmark uses selected examples and reports unreviewed proposals separately; these checks do not establish population-wide Nepali typing accuracy. See the [benchmark protocol](package/benchmarks.md) before interpreting its results.
