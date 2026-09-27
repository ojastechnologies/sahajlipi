# Core package documentation

SahajLipi provides a dependency-free Nepali transliteration engine and optional browser input adapters. These pages describe the reusable package: its public contract, implementation, typing rules, and measurement method. The separate [demo documentation](../demo/README.md) covers the playground and its controls.

| Read | For |
| --- | --- |
| [Getting started](getting-started.md) | Install the unreleased prototype locally, import the public entry points, choose a typing scope, and use TypeScript. |
| [Integration recipes](integration-recipes.md) | Complete candidate dropdowns, shared engines, DOM types, dynamic fields, and an uncontrolled React example. |
| [API reference](api.md) | Core and browser input APIs, one-call setup, mixed-text preservation, literal English controls, and integration limits. |
| [Architecture](architecture.md) | Module boundaries, conversion flow, Unicode, and editor events. |
| [Browser adapter compatibility](browser-compatibility.md) | Desktop engine matrix, browser test setup, editing contracts, CI reports, and testing limits. |
| [Typing reference](typing-reference.md) | Current Nepali key mappings, half forms, marks, punctuation, and alternatives. |
| [Benchmarks](benchmarks.md) | Reproducible engine cases, metrics, provenance, results, and evaluation limits. |
| [Digit benchmark record](digits-benchmarks.md) | Revised numeric contracts, historical Latin compatibility, declared expectation changes, identities, and reproduction. |
| [Mixed-text benchmark record](mixed-text-benchmarks.md) | Separate dated mixed-text and early-address contracts, preserved prior rows, identities, reproduction commands, and scope limits. |
| [External evaluation](external-evaluation.md) | Pinned Nepali word data, source discrepancies, initial baseline, and sentence review process. |
| [Development review batch](review-batch.md) | Reproducible 100-case review batch, independent review sheets, and diagnostic limits. |
| [Source-assisted online review](assisted-online-review.md) | All 100 draft case recommendations, spelling evidence, source links and pending human confirmation. |
| [Ra-ya review and changes](ry-review.md) | Word-specific joiner preferences, Shift lookup, fixed-fixture results and source-quality triage. |
| [English loanword preferences and review](loanword-review.md) | The 20 built-in loanword defaults, the 34-key source catalogue, pending variants, and English-field limits. |
| [English month names](month-names.md) | The 12 full month-name preferences, title case, spelling evidence, and calendar and English-field limits. |

The built-in engine includes 20 exact English-spelling loanwords, such as `camera` → क्यामेरा and `school` → स्कुल. They convert automatically in Nepali mode and have one candidate each. These are authorized source-assisted project preferences; observed variants and independent human linguistic review remain pending. The [typing reference](typing-reference.md#english-spelling-loanwords) lists the mappings and the [review ledger](loanword-review.md) records their source scopes.

The engine also accepts all 12 full English month names, from `january` → जनवरी to `december` → डिसेम्बर, with their normal title-case forms such as `September` → सेप्टेम्बर. Each has one preferred spelling. The [month reference](month-names.md) records these source-assisted project preferences separately from the 20-word loanword pilot. This converts month names; it does not convert Gregorian dates to the Bikram Sambat calendar.

ASCII number keys produce Devanagari digits by default: `123` → `१२३` and `3.14` → `३.१४`. Recognized addresses retain their original digits; English mode keeps input literal. Set `createEngine({ digits: 'latin' })` for ASCII digits and pass both engine functions to a field adapter or manager. Existing Devanagari digits remain unchanged in either style. The [digit configuration guide](api.md#digits-and-shared-field-configuration) shows a shared app/page setup.

For live typing, choose an integration scope: mark selected fields with `data-sahajlipi` and call `attachNepaliInputs()`; pass a page element as the root; or use `attachNepaliInputs(document, { scope: 'all' })` for every supported text field in that document. Add `data-sahajlipi-ignore` to fields that must stay English in an all-fields scope. The [API reference](api.md#browser-input-adapters) explains configuration, field-level controls, candidates, and cleanup.

Recognizable HTTP(S) and `www.` links, ASCII domain-shaped hosts, and ordinary ASCII email addresses stay literal by default in text conversion and attached fields. Preservation begins at early cues such as `https:`, `www.`, `name@`, and `camera.c`, without waiting for a complete address. The policy preserves original case and punctuation within URL suffixes, without checking whether the addresses exist. Plain `camera` still converts; use English mode before the first key if a fragment must stay literal throughout. Ordinary English and code still require host-selected literal spans or the existing mode controls. The [API guide](api.md#links-domains-and-email-addresses) defines the recognized cues and scope, punctuation boundaries, and `preserveTechnicalText` opt-out.

The package is still private in [`package.json`](../../package.json) and is not published to npm. The [getting started guide](getting-started.md) shows local tarball and checkout-folder installations that resolve the public `sahajlipi` and `sahajlipi/dom` imports. The [project status](../status-and-roadmap.md) tracks what is and is not implemented.
