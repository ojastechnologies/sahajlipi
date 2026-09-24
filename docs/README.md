# SahajLipi documentation

SahajLipi is an early, MIT-licensed Nepali typing engine and textarea adapter. The [live demo](https://ojastechnologies.github.io/sahajlipi/demo/) shows the current interaction. The [repository README](../README.md) has a quick start and examples.

| Read | For |
| --- | --- |
| [Typing reference](typing-reference.md) | Exact key behavior, half forms, marks, punctuation, and alternatives. |
| [API reference](api.md) | Core and textarea APIs, examples, types, and integration limits. |
| [Architecture](architecture.md) | Data flow, module boundaries, Unicode handling, and editor event paths. |
| [Benchmarks](benchmarks.md) | Reproducible seed cases, metrics, provenance, results, and limits. |
| [Development](development.md) | Local setup, testing, contributing, CI, and release readiness. |
| [Status and roadmap](status-and-roadmap.md) | Shipped capabilities, known gaps, and priorities. |
| [Contributing](../CONTRIBUTING.md) | A short path for proposing a word or behavior fix. |
| [Security policy](../SECURITY.md) | Supported state and private vulnerability reporting. |
| [MIT license](../LICENSE) | Terms for code and documentation. |

## Reading results responsibly

The current automated tests protect specific behavior. The seed benchmark is a named set of examples and exploratory failures. Neither establishes population-wide Nepali typing accuracy. Any future accuracy or comparison claim should identify the corpus, who reviewed expected spellings, how examples were collected, the exact version tested, and the misses. See the [benchmark protocol](benchmarks.md).

Documentation describes the current source and is updated in the same pull request as a changed API or key behavior. The demo's on-page guide remains the quick reference for people trying the editor.
