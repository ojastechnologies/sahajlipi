# Core package documentation

SahajLipi provides a dependency-free Nepali transliteration engine and an optional textarea adapter. These pages describe the reusable package: its public contract, implementation, typing rules, and measurement method. The separate [demo documentation](../demo/README.md) covers the playground and its controls.

| Read | For |
| --- | --- |
| [API reference](api.md) | Core and textarea APIs, examples, and integration limits. |
| [Architecture](architecture.md) | Module boundaries, conversion flow, Unicode, and editor events. |
| [Typing reference](typing-reference.md) | Current Nepali key mappings, half forms, marks, punctuation, and alternatives. |
| [Benchmarks](benchmarks.md) | Reproducible engine cases, metrics, provenance, results, and evaluation limits. |
| [External evaluation](external-evaluation.md) | Pinned Nepali word data, source discrepancies, initial baseline, and sentence review process. |

The package is still private in [`package.json`](../../package.json), so these examples import from a repository checkout. The [project status](../status-and-roadmap.md) tracks what is and is not implemented.
