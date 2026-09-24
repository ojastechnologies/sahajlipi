# Project status and roadmap

SahajLipi is an early, MIT-licensed Roman Nepali to Unicode typing prototype for web developers. The [live demo](https://ojastechnologies.github.io/sahajlipi/demo/) lets people try direct typing; the [core API](api.md) and textarea adapter are available from source. This page records what is implemented, what has been tested, and the work still needed before a stable developer package.

## Current capabilities

- A deterministic core converts a Roman word or a text string to Unicode Nepali without a server or runtime dependencies.
- The first reading appears inline. A short starter lexicon can supply ordered alternatives for specific ambiguous spellings.
- Phonetic consonants remain half until a vowel completes them; shortcuts cover dental and retroflex keys, nasal marks, visarga, an explicit halant and joiner, and Devanagari full stop.
- A separate textarea adapter handles active-word editing, candidate selection, paste, composition events, deletion, undo/redo, and a literal English mode.
- TypeScript declarations describe the current API. Automated tests run across Node 18, 20, 22, and 24; the static demo deploys with GitHub Pages.

The [architecture](architecture.md), [typing reference](typing-reference.md), and [development guide](development.md) show the implementation and its boundaries.

## Current limits

| Area | Current state |
| --- | --- |
| Nepali accuracy | The lexicon is small and the fallback is deterministic. An output can look plausible while spelling the intended word incorrectly. There is no context-aware ranking or population-wide accuracy estimate. |
| Alternatives | Only explicit multi-reading entries return multiple candidates. The engine does not generate all linguistically possible spellings. |
| Mixed English | `convertText` treats Latin-letter runs as Roman Nepali; it does not identify English words automatically. The editor offers a manual English mode. |
| Input surface | The adapter targets `<textarea>`. Automated editor tests use a simulated textarea, not a published cross-browser or real-phone compatibility matrix. |
| Other languages | The mappings and starter lexicon are Nepali-specific. There is no Hindi, Marathi, or other Devanagari language profile yet. |
| Distribution | The repository and demo are public, but the npm package is intentionally `private` and unpublished. The API may change before an alpha release. |
| Benchmark | A seed behavior benchmark tracks named contracts and exploratory examples. It is not a representative accuracy study; see [benchmarks](benchmarks.md). |

## Priorities

1. **Reviewed Nepali evaluation corpus.** Collect short, consented real typing examples with intended Unicode, valid alternatives, provenance, and independent Nepali-language review. Keep this separate from tests written to fit the implementation. Use the same cases over time to report top-result and candidate coverage.
2. **Highest-frequency correctness fixes.** Use the reviewed corpus to choose lexical entries and general phonetic changes. Keep direct typing predictable and report any trade-offs for ambiguous spellings.
3. **Browser input compatibility.** Exercise real browsers, mobile keyboards, composition, selection, paste, and assistive technology. Record a tested support matrix rather than implying universal support from simulated tests.
4. **Developer alpha release.** Stabilize the core and textarea API, confirm package contents and declarations, define versioning and release steps, and publish only when the package has an honest quality baseline.
5. **Other Devanagari languages.** Separate language-specific mappings, lexicons, and rules from the shared conversion and editor mechanics. Add each language with its own reviewed corpus and guide; do not assume Nepali spellings transfer unchanged.

These are priorities, not release dates. Further reference material and any future comparison with other typing tools should use the same published evaluation criteria and distinguish observed results from opinion. No competitor review is included in the current docs.

## How to assess progress

A change is ready for review when it has a reproducible input, expected Unicode output, a focused regression test, and an explanation of whether it changes a general rule or one spelling. The [benchmark](benchmarks.md) should disclose its case count, provenance, exclusions, and misses alongside any score. This keeps improvements inspectable by contributors and users.
