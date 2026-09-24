# Project status and roadmap

SahajLipi is an early, MIT-licensed Roman Nepali to Unicode typing project. The repository contains a **reusable package** and a **static browser demo** that consumes it. This page records what exists and what remains before a stable developer release.

## Package status

The [package](package/README.md) includes a deterministic word and text converter, a small starter lexicon with ordered alternatives for selected spellings, and browser adapters for direct typing in configured text fields. It has TypeScript declarations and no runtime dependencies. The package is marked `private` and is **not published to npm**.

| Area | Current limit |
| --- | --- |
| Nepali accuracy | The lexicon is small and the fallback is deterministic. An output may look plausible while spelling the intended word incorrectly. There is no context-aware ranking or population-wide accuracy estimate. |
| Alternatives | Only explicit multi-reading entries return multiple candidates. The engine does not generate every valid spelling. |
| Mixed English | `convertText` treats Latin-letter runs as Roman Nepali; it does not detect English words automatically. |
| Input surface | The reusable adapter supports `<textarea>` and text/search inputs; one manager can cover marked fields, a page region, or all supported fields in a document, with English fields excluded. Tests simulate editor events, but there is no published real-browser or phone compatibility matrix. `contenteditable` and other input types are unsupported. |
| Other languages | Mappings and lexicon entries are Nepali-specific. No other Devanagari language profile exists yet. |
| Evaluation | The [seed benchmark](package/benchmarks.md) tracks selected behavior contracts. A separate [external word baseline and sentence review queue](package/external-evaluation.md) exist, but there is no representative real-typing accuracy estimate. |

The [architecture](package/architecture.md), [API reference](package/api.md), and [typing reference](package/typing-reference.md) describe the package as implemented.

## Demo status

The [live demo](https://ojastechnologies.github.io/sahajlipi/demo/) is a static playground for trying the current package behavior. It adds a candidate dropdown, Nepali on/off control, Copy and Clear buttons, a character count, and an on-page typing guide. Its [separate guide](demo/README.md) covers usage, local hosting, and GitHub Pages. The demo is useful for exploration; it is not a browser compatibility certification or a separate conversion engine.

## Priorities

1. **Reviewed Nepali evaluation corpus.** Collect consented real typing examples with intended Unicode, valid alternatives, provenance, and independent Nepali-language review. Keep these separate from tests written to fit the implementation.
2. **High-frequency correctness fixes.** Use that corpus to choose lexical entries and broadly valid phonetic changes. Report ambiguity and trade-offs rather than silently changing defaults.
3. **Browser input compatibility.** Test real browsers, mobile keyboards, composition, selection, paste, and assistive technology. Publish a tested support matrix.
4. **Developer alpha release.** Stabilize the package API, declarations, and package contents; define versioning and release steps; publish with an honest quality baseline.
5. **Other Devanagari languages.** Separate language-specific mappings and lexicons from shared conversion and editing mechanics. Add each language with its own reviewed corpus and guide.

These are priorities, not release dates. Any future comparison with other typing tools should use the same published evaluation criteria and distinguish observed results from opinion. No competitor review is included here.

## How to assess progress

A change is ready for review when it has a reproducible input, expected Unicode output or UI state, a focused regression test, and an explanation of its scope. The [benchmark](package/benchmarks.md) should disclose case counts, provenance, exclusions, and misses alongside any score.
