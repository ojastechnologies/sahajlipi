# SahajLipi documentation

Choose the guide for the part of SahajLipi you are using. The **package** provides conversion and optional browser input adapters. The **demo** is a static playground built with that package.

## Reusable package

| Read | For |
| --- | --- |
| [Package overview](package/README.md) | Entry points, scope, and current distribution status. |
| [API reference](package/api.md) | Core engine and browser input APIs, one-call setup, and TypeScript declarations. |
| [Typing reference](package/typing-reference.md) | Exact Roman-key behavior, half forms, marks, punctuation, and candidates. |
| [Architecture](package/architecture.md) | Conversion flow, module boundaries, Unicode, and adapter event handling. |

## Evaluation and review

| Read | For |
| --- | --- |
| [Seed benchmark](package/benchmarks.md) | Run behavior checks; inspect the recorded baseline, scoring rules, and exclusions. |
| [Mixed-text and early-address records](package/mixed-text-benchmarks.md) | Reproduce dated address-preservation comparisons with frozen fixtures, engine identities, and scope limits. |
| [External evaluation](package/external-evaluation.md) | Reproduce the pinned word baseline and prepare sentence proposals for review. |
| [Development review guide](package/review-batch.md) | Generate the 100-case development batch and record independent Nepali-language decisions. |
| [Development batch report](package/review-batch-baseline.md) | Inspect dated source-proposal agreement and diagnostic signals, with review limitations. |
| [Run manifest](../benchmark/reports/nepali-review-001.json) | Verify source pins, selected IDs, engine/tool hashes, and artifact hashes for the recorded development run. |
| [Source-assisted online review](package/assisted-online-review.md) | Inspect 100 draft recommendations, evidence scope, source links and pending human review. |
| [Source-assisted review records](../benchmark/reports/nepali-assisted-online-001.json) | Read the public per-case projection, attribution and research hashes; complete sentence texts are omitted. |
| [Ra-ya review and changes](package/ry-review.md) | Inspect exact word preferences, Shift lookup, before/after results and source-quality triage. |
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
| [Development guide](development.md) | Repository workflow, tests, CI, and release readiness. |
| [Status and roadmap](status-and-roadmap.md) | Current capabilities, limits, and priorities. |
| [Brand guide](brand.md) | Name, message, logo assets, colors, typography and repository identity. |
| [Contributing](../CONTRIBUTING.md) | Reporting a typing issue or proposing a focused change. |
| [Security policy](../SECURITY.md) | Private vulnerability reporting and support status. |
| [MIT license](../LICENSE) | Terms for code and documentation. |

The current automated tests protect specific behavior. The seed benchmark uses selected examples and reports unreviewed proposals separately; neither establishes population-wide Nepali typing accuracy. See the [benchmark protocol](package/benchmarks.md) before interpreting its results.
