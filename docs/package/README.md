# Core package documentation

SahajLipi provides a dependency-free Nepali transliteration engine and optional browser input adapters. These pages describe the reusable package: its public contract, implementation, typing rules, and measurement method. The separate [demo documentation](../demo/README.md) covers the playground and its controls.

| Read | For |
| --- | --- |
| [API reference](api.md) | Core and browser input APIs, one-call setup, examples, and integration limits. |
| [Architecture](architecture.md) | Module boundaries, conversion flow, Unicode, and editor events. |
| [Typing reference](typing-reference.md) | Current Nepali key mappings, half forms, marks, punctuation, and alternatives. |
| [Benchmarks](benchmarks.md) | Reproducible engine cases, metrics, provenance, results, and evaluation limits. |

To add live typing to a page, mark intended text fields with `data-sahajlipi` and call `attachNepaliInputs()` once. The [API reference](api.md#browser-input-adapters) explains how to use one field, manage candidates, and clean up a dynamic app.

The package is still private in [`package.json`](../../package.json), so these examples import from a repository checkout. The [project status](../status-and-roadmap.md) tracks what is and is not implemented.
