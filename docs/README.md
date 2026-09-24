# SahajLipi documentation

Choose the guide for the part of SahajLipi you are using. The **package** provides conversion and an optional textarea adapter. The **demo** is a static playground built with that package.

## Reusable package

| Read | For |
| --- | --- |
| [Package overview](package/README.md) | Entry points, scope, and current distribution status. |
| [API reference](package/api.md) | Core engine and textarea adapter APIs, examples, and TypeScript declarations. |
| [Typing reference](package/typing-reference.md) | Exact Roman-key behavior, half forms, marks, punctuation, and candidates. |
| [Architecture](package/architecture.md) | Conversion flow, module boundaries, Unicode, and adapter event handling. |
| [Benchmarks](package/benchmarks.md) | Reproducible engine cases, metrics, provenance, baseline, and limitations. |

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
| [Contributing](../CONTRIBUTING.md) | Reporting a typing issue or proposing a focused change. |
| [Security policy](../SECURITY.md) | Private vulnerability reporting and support status. |
| [MIT license](../LICENSE) | Terms for code and documentation. |

The current automated tests protect specific behavior. The seed benchmark uses selected examples and reports unreviewed proposals separately; neither establishes population-wide Nepali typing accuracy. See the [benchmark protocol](package/benchmarks.md) before interpreting its results.
