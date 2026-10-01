# Loanword suffixes — 2026-10-01

This update implements the first correction slice from the [completed source-assisted development review](source-review-2026-10-01.md). It joins recognized English loanword stems to a finite set of Nepali endings, adds `media` → मिडिया and exposes स्कूल as an alternative while keeping `school` → स्कुल first. The default engine and Nepali-enabled browser fields use the same rule. English mode and recognized addresses keep their existing literal behavior.

The [research ledger](../../benchmark/reports/loanword-suffix-research-2026-10-01.json) records sources, access dates, observed forms, mapping decisions and limits. These are source-assisted project typing conventions, authorized for implementation. They are not independent human reviews, an exhaustive loanword dictionary or a representative accuracy estimate. Earlier [pilot](loanword-review.md), [expansion](loanword-expansion-2026-09-28.md) and [development baseline](source-review-2026-10-01.md#current-engine-baseline) records retain their dated counts and outputs.

## Behavior and scope

| Input | Default | Candidates |
| --- | --- | --- |
| `companyharumathi` | कम्पनीहरूमाथि | कम्पनीहरूमाथि |
| `schoolma` | स्कुलमा | स्कुलमा, स्कूलमा |
| `mediasanga` | मिडियासँग | मिडियासँग |
| `camerako` | क्यामेराको | क्यामेराको |
| `companyharuko` | कम्पनीहरूको | कम्पनीहरूको |

There are **51 recognized English loanword stems**: the earlier 50 plus `media`. The [typing reference](typing-reference.md#english-spelling-loanwords) lists them. There are **19 suffix keys**:

| Base ending key | Native ending |
| --- | --- |
| `ma` | मा |
| `ko` | को |
| `ka` | का |
| `ki` | की |
| `le` | ले |
| `lai` | लाई |
| `bata` | बाट |
| `sanga` | सँग |
| `mathi` | माथि |
| `haru` | हरू |

The nine additional keys are `haruma`, `haruko`, `haruka`, `haruki`, `harule`, `harulai`, `harubata`, `harusanga` and `harumathi`: plural हरू followed by one of the other nine endings. These are complete typing keys; no repeated or recursive ending chain is recognized. `sangai`, `cameramaa` and extra chains remain outside this slice.

The rule preserves each stem’s full Unicode spelling and joins the ending directly. It does not remove final vowels, insert a virama, select genitive agreement or decide whether a phrase is grammatical. For example, कम्पनी keeps its final ी in कम्पनीहरूको, and मिडिया keeps its final ा in मिडियासँग. The short ASCII suffix keys are explicit project input conventions; they do not change the fallback’s ordinary short/long vowel rules.

`school` and its recognized attached forms return the short-u reading first and long-u reading second. Both spellings are attested in institutional material; the order preserves the existing default rather than claiming a frequency or normative ranking. Other source-observed loanword variants remain outside the built-in alternatives in this change.

## Lookup and customization

The [implementation](../../src/loanwords.js) holds an explicit stem catalogue and finite suffix map. The [core lookup](../../src/index.js) gives an exact normalized entry priority, then tries the recognized stem plus complete ending. Ordered stem readings come from the current engine’s dictionary, so customization applies without a separate suffix API.

```js
import { createEngine, convertWord } from 'sahajlipi';

const engine = createEngine({
  entries: {
    school: ['स्कूल', 'स्कुल'],
    schoolma: ['विद्यालयमा'],
  },
});

engine.convertWord('schoolko').candidates; // ['स्कूलको', 'स्कुलको']
engine.convertWord('schoolma').candidates; // ['विद्यालयमा'] — exact entry wins
convertWord('schoolma').candidates;        // ['स्कुलमा', 'स्कूलमा']
```

Only recognized stems participate. Adding `mybrand` as a custom entry does not create suffix forms for `mybrandma`; use an exact custom entry for that form. Month names and ordinary native Nepali entries do not gain this derivation.

A recognized stem reading containing only ASCII Latin letters retains the Roman ending. For example, `company: ['company']` produces literal `companyma`; a mixed candidate list `['संस्था', 'company']` produces `['संस्थामा', 'companyma']`. Other custom strings receive the native ending verbatim. The engine does not validate custom script or repair its vowel/virama boundaries; use exact compound entries when specialized joining is needed.

Normalization still preserves reserved `T`, `D`, `S`, `R` and contextual `H`. `Companyma` normalizes to the recognized lowercase form, while `Schoolma` keeps the explicit `S` sound and uses ordinary conversion unless an exact custom entry exists. Explicit marks retain their segment processing and single-reading behavior. Technical-span preservation happens outside word lookup: `companyma.com` and `schoolma@example.com` remain literal in `convertText` and attached fields. Disabling an adapter keeps subsequent input literal and does not rewrite existing text.

During live typing, an unfinished ending may temporarily use the phonetic fallback. Once a complete supported ending is present, the adapter re-evaluates the active Roman spelling and displays the derived form. Backspace, candidates, paste and undo use the existing shared engine and editing paths; no separate browser suffix dictionary is introduced.

## Evidence and inference

The original research pass inspected published Nepali usage and instructional material without consulting current engine diagnostics. The three reviewed failure targets came from the frozen development references; this is development-led work, so its comparison cannot be presented as a held-out evaluation.

Direct examples include कम्पनीमा / कम्पनीको from the [Office of Company Registrar registration guide](https://ocr.gov.np/pages/registration/), कम्पनीहरू / कम्पनीहरूको / कम्पनीहरूले from its [scope page](https://ocr.gov.np/pages/scopes/), and कम्पनीबाट / कम्पनीलाई from its [monitoring page](https://ocr.gov.np/pages/monitoring/). An [original Nepali textbook chapter](https://pressbooks.bccampus.ca/nepali/chapter/chapter-6-unit-4-grammar-focus/) explains joining मा and spatial endings, with examples including स्कुलमा and टेबलमाथि. Its [genitive chapter](https://pressbooks.bccampus.ca/nepali/chapter/chapter-4-unit-4-grammar-focus/) explains को / की / का agreement with the possessed noun; the converter leaves that choice to the typed ending.

[Nepal Police’s original article](https://www.nepalpolice.gov.np/news/print/4077/) directly attests मिडिया and मिडियासँग. The [APF Women’s Association](https://wfa.apf.gov.np/) directly uses both स्कुलमा and स्कूलमा. Exact कम्पनीहरूमाथि was corroborated only in a search-indexed excerpt of a [Nepal Telecom financial report](https://cms.ntc.net.np/storage/media/gM01GEEPTnfUBHHTAipjQnUzCoLkFXP3pcIQUX4n.pdf); the full PDF and visual page were not inspected. Its limited access scope remains disclosed alongside direct support for the plural and spatial components.

The finite `haru` plus one-ending combinations are productive project derivations from attested morphology. **Every generated stem–ending pair was not separately verified against a source.** A mechanical spelling output is not a guarantee that the form fits a sentence or English sense. `media` uses the communication/media reading; other English meanings receive no context-sensitive interpretation.

All evidence below was checked **2026-10-01**. The ledger retains the exact access scope; indexed PDF excerpts are distinct from directly opened HTML.

| ID | Original source | Access scope | Short observed forms |
| --- | --- | --- | --- |
| LS01 | [Office of Company Registrar — registration information](https://ocr.gov.np/pages/registration/) | `direct-html` | कम्पनीमा, कम्पनीको, कम्पनीले, कम्पनीका |
| LS02 | [Office of Company Registrar — scope of work](https://ocr.gov.np/pages/scopes/) | `direct-html` | कम्पनीहरू, कम्पनीहरूको, कम्पनीहरूले |
| LS03 | [Office of Company Registrar — monitoring arrangements](https://ocr.gov.np/pages/monitoring/) | `direct-html` | कम्पनीबाट, कम्पनीलाई, कम्पनीहरूलाई |
| LS04 | [Introduction to the Nepali Language — Chapter 6 Unit 4 Grammar Focus](https://pressbooks.bccampus.ca/nepali/chapter/chapter-6-unit-4-grammar-focus/) | `direct-html` | टेबलमा, टेबलमाथि, कक्षामा, स्कुलमा, अफिसमा |
| LS05 | [Introduction to the Nepali Language — Chapter 4 Unit 4 Grammar Focus](https://pressbooks.bccampus.ca/nepali/chapter/chapter-4-unit-4-grammar-focus/) | `direct-html` | तपाईंको, तपाईंकी, तपाईंका, उनीहरूको |
| LS06 | [Nepal Police — information dissemination by central spokesperson](https://www.nepalpolice.gov.np/news/print/4077/) | `direct-html` | मिडिया, मिडियासँग |
| LS07 | [Armed Police Force Women’s Association — activities](https://wfa.apf.gov.np/) | `direct-html` | स्कुलमा, स्कूलमा, स्कुलको, स्कुलका |
| LS08 | [Nepal Telecom — consolidated financial statements 2077/78](https://cms.ntc.net.np/storage/media/gM01GEEPTnfUBHHTAipjQnUzCoLkFXP3pcIQUX4n.pdf) | `search-indexed-pdf-excerpt` | कम्पनीहरूमाथि |
| LS09 | [Nepal Law Journal — decision 9344](https://nkp.gov.np/full_detail/9344) | `direct-html` | कम्पनीसँग, कम्पनीहरूलाई |
| LS10 | [Nepal Police — social media character-assassination arrest report](https://www.nepalpolice.gov.np/news/7952/) | `direct-html` | भिडियोको |
| LS11 | [Suryodaya Municipality — coffee crop FAQ](https://www.suryodayakrishi.gov.np/faq/978/1031) | `direct-html` | कफीको, कफीका, कफीमा, कफीलाई |
| LS12 | [Radio Nepal — Jhankar 2079 annual publication](https://radionepal.gov.np/wp-content/uploads/2023/04/Radio-Nepal-Jhankar-2079-compressed.pdf) | `search-indexed-pdf-excerpt` | रेडियोमा |

Coffee and radio edge-case evidence is included as research context. `coffee` is not added as a recognized stem. Neither complete source articles nor raw corpora are redistributed.

## Recorded comparison

The [machine report](../../benchmark/reports/loanword-suffixes-2026-10-01.json) compares baseline commit `d3bb77f39f78b436d613424e78979b0357d8d7da` with the suffix engine on the same frozen final contract fixture and unchanged reviewed development references. It records source/tool hashes, engine identities, runtime, fixture hashes, original batch and frozen ledger identities, exclusions and per-case outcomes.

| Metric | Before | After |
| --- | ---: | ---: |
| Revised final seed contracts | 131/137 | 137/137 |
| Seed word default matches | 101/106 | 106/106 |
| Seed required candidate references | 103/109 | 109/109 |
| Seed complete text matches | 30/31 | 31/31 |
| Four newly added suffix contracts | 0/4 | 4/4 |
| Historical frozen seed contracts | 133/133 | 131/133 |
| Reviewed word default matches any reference | 8/74 | 11/74 |
| Word cases with any reference in candidates | 8/74 | 11/74 |
| Word cases with all references in candidates | 7/74 | 10/74 |
| Individual word-reference candidate coverage | 8/79 | 12/79 |
| Reviewed preferred word default | 7/69 | 9/69 |
| Exact complete reviewed sentences | 0/12 | 0/12 |

The three target word cases now match the frozen references. Complete sentences still differ because other words, vowels, nasals and spelling alternatives remain unresolved by this slice.

The final seed fixture contains **137 contracts and two exploratory cases**. Four contracts are added for the three reviewed target words and text conversion beside addresses. Two existing software expectations intentionally change: `bankma` now expects बैंकमा and `fileharu` expects फाइलहरू, replacing their earlier phonetic-fallback targets. Their IDs, inputs, statuses, categories and original provenance prefixes remain intact; each revised provenance discloses the policy change. **133 of the 135 prior rows remain byte-for-byte identical.**

The historical frozen fixture is scored separately: its two earlier suffix-fallback targets are the only changed outputs (**133/133 → 131/133**). The revised final fixture scores **131/137 → 137/137** on the same declared new targets. This separates intentional behavior revisions from improvements on unchanged references rather than presenting the old fixture as fully preserved. These selected software contracts measure promised behavior. They do not measure word frequency, population linguistic accuracy or performance.

The reviewed development comparison keeps the same **74 word cases / 79 word references** and **12 sentence cases / 13 sentence references**. The 14 exclusions remain excluded and original references are not revised to favor the new engine. Independent human review remains pending, and the cases guided this implementation. The unchanged-reference gains are descriptive development results, not held-out or population accuracy.

## Implementation validation

The local run on 2026-10-01 passed **296/296 Node tests**, **137/137 seed contracts**, and **57/57 desktop browser checks** (19 scenarios in each of Chromium, Firefox and WebKit). The [desktop-004 record](../../browser/reports/desktop-004.json) preserves the tested runtime/test hashes, engine versions and installed-tarball identity. Installed-package JavaScript imports, strict TypeScript consumers, and the bundled vanilla/React examples also passed. The website build and publication checks passed.

The suffix browser scenarios check Roman-source Backspace editing, spelling selection, address restoration and English mode. As in the earlier adapter, entering a domain cue makes the token literal; deleting that cue resumes the preferred spelling, rather than remembering a previously selected alternative. Ordinary punctuation and whitespace still preserve a selected reading. These checks cover the documented desktop flows only.

## Reproduce

Use a checkout of the suffix change and regenerate the pinned original `benchmark/data/review-batch-001/cases.jsonl` using the [review-batch instructions](review-batch.md#prepare-the-batch). Its SHA-256 must be `2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3`; do not regenerate into a directory holding edited review sheets.

```sh
SUFFIX_BASELINE_DIR=$(mktemp -d)
git archive d3bb77f39f78b436d613424e78979b0357d8d7da \
  src package.json benchmark/cases.jsonl benchmark/run.js benchmark/reports \
  | tar -x -C "$SUFFIX_BASELINE_DIR"
node benchmark/measure-loanword-suffixes.js "$SUFFIX_BASELINE_DIR" \
  --cases benchmark/data/review-batch-001/cases.jsonl \
  --output benchmark/data/loanword-suffixes-current.json

npm test
npm run benchmark -- --check
npm run benchmark:source-reviewed
```

The measurement command checks the frozen fixture, baseline core and review-source identities. It compares every admitted development reference exactly, preserving vowels, joiners, punctuation and spacing. Use a fresh output path; it refuses an existing report. Reproducing the dated result requires the recorded source hashes, rather than a later engine with the same command. The generic source-review command measures the current engine against the original frozen review ledger.

Selected adapter and desktop browser regressions verify live editing, candidate selection, protected addresses and English mode separately. Those functional checks do not certify mobile keyboards, installed IMEs or every framework. The [browser guide](browser-compatibility.md) retains the broader tested scope and limits.
