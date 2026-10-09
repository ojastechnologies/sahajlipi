# Core package documentation

SahajLipi provides a dependency-free Nepali transliteration engine and optional browser input adapters. These pages describe the reusable package: its public contract, implementation, typing rules, and measurement method. The separate [demo documentation](../demo/README.md) covers the playground and its controls.

The guides describe the **published `0.1.0-alpha.3` developer alpha**, including the [13-key native spelling update](nepali-spelling-2026-10-09.md). The full-consonant fallback introduced in alpha.2 uses full bare and final consonants (`k` → क, `kr` → क्र), with internal conjuncts formed automatically. Backtick or `/` explicitly keeps a consonant half; a following vowel is independent. Exact lexicon readings retain priority. Use `createEngine({ consonantMode: 'half' })` for alpha.1 fallback compatibility and pass both converters to browser fields as shown in the [migration recipe](integration-recipes.md#keep-alpha1-consonant-behavior).

| Read | For |
| --- | --- |
| [Getting started](getting-started.md) | Install the published alpha or a local checkout, import the public entry points, choose a typing scope, and use TypeScript. |
| [Integration recipes](integration-recipes.md) | Complete candidate dropdowns, shared engines, DOM types, dynamic fields, and an uncontrolled React example. |
| [API reference](api.md) | Core and browser input APIs, one-call setup, mixed-text preservation, literal English controls, and integration limits. |
| [Architecture](architecture.md) | Module boundaries, conversion flow, Unicode, and editor events. |
| [Browser adapter compatibility](browser-compatibility.md) | Desktop engine matrix, browser test setup, editing contracts, CI reports, and testing limits. |
| [Typing reference](typing-reference.md) | Full final consonants, internal conjuncts, explicit half forms, key mappings, marks, and alternatives. |
| [Benchmarks](benchmarks.md) | Reproducible engine cases, metrics, provenance, results, and evaluation limits. |
| [Full-consonant contract record](consonant-defaults-2026-10-03.md) | Full endings, strict half compatibility, declared fixture revisions, and dated software checks from candidate preparation. |
| [Digit benchmark record](digits-benchmarks.md) | Revised numeric contracts, historical Latin compatibility, declared expectation changes, identities, and reproduction. |
| [Mixed-text benchmark record](mixed-text-benchmarks.md) | Separate dated mixed-text and early-address contracts, preserved prior rows, identities, reproduction commands, and scope limits. |
| [External evaluation](external-evaluation.md) | Pinned Nepali word data, source discrepancies, initial baseline, and sentence review process. |
| [Development review batch](review-batch.md) | Reproducible 100-case review batch, independent review sheets, and diagnostic limits. |
| [Completed source-assisted development review](source-review-2026-10-01.md) | 86 admitted references, 14 exclusions, per-case evidence and exact-output baseline. |
| [Earlier source-assisted online review](assisted-online-review.md) | Historical 100-case draft recommendations and research evidence. |
| [Ra-ya review and changes](ry-review.md) | Word-specific joiner preferences, Shift lookup, fixed-fixture results and source-quality triage. |
| [Original English loanword pilot](loanword-review.md) | The dated 20-word pilot, its 34-key source catalogue, and original limits. |
| [Alpha.3 native spelling follow-up](nepali-spelling-2026-10-09.md) | Twelve exact preferences, the additional `bhagna` reading, source access and unchanged-reference development measurements. |
| [Native spelling review](nepali-spelling-2026-10-01.md) | Four exact vowel/nasal aliases, source evidence, frozen validation and unchanged-rule limits. |
| [Loanword suffixes and review](loanword-suffixes-2026-10-01.md) | Current 51-stem scope, 19 suffix keys, school alternatives, source evidence, customization and recorded comparisons. |
| [Earlier loanword expansion](loanword-expansion-2026-09-28.md) | The dated 30-key expansion, its candidate inventory and held decisions. |
| [Loanword coverage audit](loanword-coverage-audit.md) | Dated `company` gap, the earlier pending pilot queue, source-backed leads, and the review path toward broader coverage. |
| [English month names](month-names.md) | The 12 full month-name preferences, title case, spelling evidence, and calendar and English-field limits. |

The built-in engine includes 51 recognized English-spelling loanword stems and 19 finite attached suffix keys. For example, `companyharumathi` → कम्पनीहरूमाथि and `mediasanga` → मिडियासँग. `school` keeps स्कुल first and offers स्कूल; `schoolma` inherits स्कुलमा and स्कूलमा in that order. These are source-assisted project preferences, with independent human linguistic review still pending. The [typing reference](typing-reference.md#english-spelling-loanwords) lists the roots and suffixes, and the [dated suffix review](loanword-suffixes-2026-10-01.md) records evidence and limits. Earlier [pilot](loanword-review.md) and [expansion](loanword-expansion-2026-09-28.md) records remain unchanged in scope.

The engine also accepts all 12 full English month names, from `january` → जनवरी to `december` → डिसेम्बर, with their normal title-case forms such as `September` → सेप्टेम्बर. Each has one preferred spelling. The [month reference](month-names.md) records these source-assisted project preferences separately from the original 20-word loanword pilot and later expansion. This converts month names; it does not convert Gregorian dates to the Bikram Sambat calendar.

ASCII number keys produce Devanagari digits by default: `123` → `१२३` and `3.14` → `३.१४`. Recognized addresses retain their original digits; English mode keeps input literal. Set `createEngine({ digits: 'latin' })` for ASCII digits and pass both engine functions to a field adapter or manager. Existing Devanagari digits remain unchanged in either style. The [digit configuration guide](api.md#digits-and-shared-field-configuration) shows a shared app/page setup.

For live typing, choose an integration scope: mark selected fields with `data-sahajlipi` and call `attachNepaliInputs()`; pass a page element as the root; or use `attachNepaliInputs(document, { scope: 'all' })` for every supported text field in that document. Add `data-sahajlipi-ignore` to fields that must stay English in an all-fields scope. The [API reference](api.md#browser-input-adapters) explains configuration, field-level controls, candidates, and cleanup.

Recognizable HTTP(S) and `www.` links, ASCII domain-shaped hosts, and ordinary ASCII email addresses stay literal by default in text conversion and attached fields. Preservation begins at early cues such as `https:`, `www.`, `name@`, and `camera.c`, without waiting for a complete address. The policy preserves original case and punctuation within URL suffixes, without checking whether the addresses exist. Plain `camera` still converts; use English mode before the first key if a fragment must stay literal throughout. Ordinary English and code still require host-selected literal spans or the existing mode controls. The [API guide](api.md#links-domains-and-email-addresses) defines the recognized cues and scope, punctuation boundaries, and `preserveTechnicalText` opt-out.

The experimental developer alpha **[`sahajlipi@0.1.0-alpha.3`](https://www.npmjs.com/package/sahajlipi/v/0.1.0-alpha.3)** was published on 2026-10-09 by `maheshnepal`, with package access managed through `ojastech`. Its public archive matches the reviewed merged source. The verified `alpha` and `latest` tags both point to `0.1.0-alpha.3`; unversioned `npm install sahajlipi` selects alpha.3. All published versions remain experimental Nepali-only releases. Pin with `npm install --save-exact sahajlipi@0.1.0-alpha.3`; choose `consonantMode: 'half'` for alpha.1 fallback endings. Alpha.1 retains its original `/` shortcut and does not expose `consonantMode` or backtick. The [release record](../release.md) documents current integrity, consumers and tag behavior; [project status](../status-and-roadmap.md) tracks remaining review.