# Core package documentation

SahajLipi provides a dependency-free Nepali transliteration engine and optional browser input adapters. These pages describe the reusable package: its public contract, implementation, typing rules, and measurement method. The separate [demo documentation](../demo/README.md) covers the playground and its controls.

| Read | For |
| --- | --- |
| [API reference](api.md) | Core and browser input APIs, one-call setup, examples, and integration limits. |
| [Architecture](architecture.md) | Module boundaries, conversion flow, Unicode, and editor events. |
| [Typing reference](typing-reference.md) | Current Nepali key mappings, half forms, marks, punctuation, and alternatives. |
| [Benchmarks](benchmarks.md) | Reproducible engine cases, metrics, provenance, results, and evaluation limits. |
| [External evaluation](external-evaluation.md) | Pinned Nepali word data, source discrepancies, initial baseline, and sentence review process. |
| [Development review batch](review-batch.md) | Reproducible 100-case review batch, independent review sheets, and diagnostic limits. |

For live typing, choose an integration scope: mark selected fields with `data-sahajlipi` and call `attachNepaliInputs()`; pass a page element as the root; or use `attachNepaliInputs(document, { scope: 'all' })` for every supported text field in that document. Add `data-sahajlipi-ignore` to fields that must stay English in an all-fields scope. The [API reference](api.md#browser-input-adapters) explains configuration, field-level controls, candidates, and cleanup.

The package is still private in [`package.json`](../../package.json), so these examples import from a repository checkout. The [project status](../status-and-roadmap.md) tracks what is and is not implemented.
