# Benchmarks

SahajLipi has a small, executable **seed behavior benchmark**. It checks that the default engine keeps documented typing decisions working. It is not a measure of accuracy across Nepali users or vocabulary. The cases were selected from existing tests and project discussions, so a high score on this set is expected.

## Run it

From the repository root, with Node.js 18 or later:

```sh
npm run benchmark
npm run benchmark -- --check
```

The first command prints results and exits successfully even when a contract case differs. `--check` exits with code 1 for a **contract** regression. Exploratory cases are always shown but do not fail `--check`. An invalid or unreadable fixture file exits with code 2. CI runs `npm test` and `npm run benchmark -- --check` on the supported Node versions.

The dependency-free runner is [benchmark/run.js](../../benchmark/run.js). Its UTF-8, one-JSON-object-per-line fixtures are in [benchmark/cases.jsonl](../../benchmark/cases.jsonl). You can inspect a different fixture file with `node benchmark/run.js --fixtures path/to/cases.jsonl`; add `--check` if its contract cases should gate the command.

## Loanword suffix follow-up — 2026-10-01

The [dated suffix review and comparison](loanword-suffixes-2026-10-01.md#recorded-comparison) adds four selected contracts for `companyharumathi`, `schoolma`, `mediasanga` and text beside protected addresses. It also declares two intentional revisions to earlier fallback targets: `bankma` → बैंकमा and `fileharu` → फाइलहरू. IDs, inputs and statuses remain stable; provenance records the revisions. The other 133 of 135 historical rows remain byte-for-byte identical.

On the same revised final fixture, full contracts score **131/137 → 137/137**. The separate frozen historical fixture scores **133/133 → 131/133**, with only those two intended policy differences. The [machine report](../../benchmark/reports/loanword-suffixes-2026-10-01.json) retains both comparisons, the source-assisted [suffix research ledger](../../benchmark/reports/loanword-suffix-research-2026-10-01.json), source hashes and reproduction commands. Earlier dated benchmark reports are unchanged.

Against the unchanged source-assisted development references, word defaults improve **8/74 → 11/74** and individual candidate references **8/79 → 12/79**; complete sentences remain **0/12**. These development cases guided the implementation. Neither the selected software contracts nor this development comparison is a held-out or population-wide accuracy estimate. Use the [dated reproduction instructions](loanword-suffixes-2026-10-01.md#reproduce) to compare archived engine sources on the same fixtures.

## What a case means

Each case has a stable `id`, a `status` (`contract` or `exploratory`), a `mode` (`word` or `text`), an `input`, an `expectedTop`, a `category`, and a `provenance` note. Word cases also list `expectedCandidates`. The status identifies whether a difference is a regression against an agreed project behavior or a proposal awaiting review. A contract is **not** a claim that its spelling was independently validated by Nepali speakers.

For example, `kam` is a contract for the current default and its two suggestions:

```json
{"id":"kam-alternatives","status":"contract","mode":"word","category":"ambiguity","input":"kam","expectedTop":"कम","expectedCandidates":["कम","काम"],"provenance":"existing engine test: distinct alternatives"}
```

Word cases call `convertWord(input)` on the **default engine**, with no custom entries. Text cases call `convertText(input)`. Text conversion has no candidate API, so it is scored only for its complete output. Browser editing, caret handling, paste, undo, and mobile composition are covered by the separate automated tests, not by these word or text scores.

The runner compares JavaScript strings exactly, including Unicode code points such as the virama and zero-width joiner in `पर्‍यो`. It does not normalize strings or treat visually similar renderings as equal. On a mismatch it prints the input, expected and actual text, code points, expected and actual candidates, and fixture provenance. This helps distinguish a spelling difference from a shaping difference.

## Metrics and gate

| Result | Calculation | Meaning |
| --- | --- | --- |
| Word top output | Word cases where `convertWord(input).text === expectedTop` / word cases | Agreement with this fixture's preferred default |
| Expected candidate coverage | Required candidate readings present in `convertWord(input).candidates` / all required candidate readings | Whether the suggestions include the readings listed in these fixtures |
| Text exact output | Text cases where `convertText(input) === expectedTop` / text cases | Agreement for a complete text string, including punctuation |
| Full cases | Cases with the expected top output and, for word cases, **all** required candidates / cases | `--check` gate for contracts |

Candidate coverage is a recall measure over the **listed** readings. It does not measure whether extra suggestions are useful or whether the fixture lists every valid reading. The runner reports raw counts, separately for contract and exploratory cases, and full-case counts by category. It does not combine word and text results into a single accuracy percentage.

## Initial seed baseline

The following was produced with `npm run benchmark -- --check` on 2026-09-24 using Node.js v22.22.3:

| Set | Full cases | Word top output | Expected candidate coverage | Text exact output |
| --- | ---: | ---: | ---: | ---: |
| Contract | 28/28 | 26/26 | 27/27 | 2/2 |
| Exploratory | 0/2 | 0/2 | 0/2 | 0/0 |

The 28 contract cases cover the current starter lexicon, an ambiguous word, half consonants, Shift shortcuts, nasal marks, explicit halant and joiner entry, and punctuation. The two exploratory cases are **unreviewed proposed spellings**: `janchu` has target `जान्छु` but currently returns `जन्चु`; `padhchhu` has target `पढ्छु` but currently returns `पध्छु`. Their targets came from an earlier assistant hypothesis, not a Nepali speaker review. They remain visible to guide discussion and are excluded from the contract gate. Do not count them as verified defects or silently promote them to contracts.

The 28/28 contract result says only that this small, handpicked set matches the current behavior. It is **not** a population accuracy score, a measure of word coverage, or evidence that SahajLipi outperforms another input tool. Functional test counts from `npm test` have the same limitation.

## Ra-ya regression update — 2026-09-27

The [dated ra-ya review](ry-review.md) records the word-specific mappings, reserved Shift lookup correction, source-quality triage, commands and [machine report](../../benchmark/reports/nepali-ry-001.json). The recorded ra-ya fixture has **50 contracts and two exploratory cases**. On the same final fixture file, baseline `e029d02` passes **38/50** contracts and the updated engine passes **50/50**; both pass the original 28 contracts and both retain the two exploratory misses.

These are source-assisted project behavior contracts authorized for implementation, not independently reviewed Nepali corpus labels. At that recorded update, the unchanged 100-case development cohort had 7/100 exact source-proposal matches, and the pinned public word test had 279/4,101 top and candidate matches. The report preserves these results and discloses the lack of admitted human labels. It makes no population accuracy or performance claim.

## Loanword and cha update — 2026-09-27

The dated loanword seed has **85 contracts and two exploratory cases**. The [loanword benchmark record](loanword-benchmarks.md) and [machine report](../../benchmark/reports/nepali-loanwords-001.json) compare baseline `43b5a00` with the modified engine on the same final fixture: **60/85 → 85/85** full contracts, **57/80 → 80/80** word top output, **60/82 → 82/82** required candidate coverage, and **3/5 → 5/5** exact text output. Both engines preserve the original 50/50 contracts and the two exploratory misses. All 52 existing fixture rows and IDs are retained.

The 35 new contracts cover 20 source-assisted, user-authorized loanword defaults, the `cha`/`chha` distinction, incidental capitalization, reserved Shift sounds, whole-word suffix boundaries, collision controls and text integration. These are literal project behavior targets, not independent human linguistic labels. The unchanged development cohort remains at 7/100 source-proposal matches. The pinned public word test changes from the recorded 279/4,101 baseline to 281/4,101 exact top and candidate matches. Two pilot mappings overlap that public test, so this descriptive gain is not a clean held-out improvement claim. The dated ra-ya and initial baseline reports remain historical records.

## Gregorian month update — 2026-09-27

The dated month seed has **109 contracts and two exploratory cases**. The [month benchmark record](month-benchmarks.md) and [machine report](../../benchmark/reports/nepali-months-001.json) compare pinned baseline `264f249` with the modified engine on the same frozen fixture: **91/109 → 109/109** full contracts, **86/102 → 102/102** word top output, **88/104 → 104/104** required candidate coverage, and **5/7 → 7/7** text output. Both engines pass the original 85/85 contracts. All 87 existing rows and IDs remain byte-for-byte intact, including the two exploratory misses.

The 24 additions cover twelve literal CLDR-assisted Gregorian month spellings, four focused Title Case checks (including `September` and `December`), standalone reserved `S`/`D` sounds, unchanged `Jan`/`Sep` abbreviations, internal/all-capital Shift guards and two date strings retaining ASCII digits, commas and Gregorian years. Functional tests cover all twelve Title Case forms and custom-entry precedence. These are project behavior contracts, not independently reviewed linguistic labels or calendar conversion.

The frozen 100-case development cohort stays at 7/100 source-proposal matches; the public word test stays at 281/4,101 top and candidate matches. The twelve month mappings have no Roman-key or native-output overlap with that public test, and no audited word or Roman text-token overlap with the cohort. The month spellings were chosen from CLDR before external evaluation. This selected regression set and public-test comparison still do not establish held-out or population accuracy. The older loanword, ra-ya and initial reports retain their dated denominators and results.

## Mixed-text update — 2026-09-27

The dated first mixed-text seed has **119 contracts and two exploratory cases**. The [mixed-text benchmark record](mixed-text-benchmarks.md) and [machine report](../../benchmark/reports/mixed-text-001.json) compare baseline `4e6cc4e` with the modified engine on the same frozen fixture: **110/119 → 119/119** full contracts, **102/102 → 102/102** word top output, and **8/17 → 17/17** exact text output. Both engines pass the original **109/109** contracts. All 111 prior rows remain byte-for-byte intact, including the two exploratory misses that remain excluded from the gate.

The ten added text contracts score URL case and ports, email plus tags, `www.` and bare domains, URL suffix shortcut characters, wrappers and balanced path parentheses, Unicode boundaries, dotted Roman spellings, ordinary marks and decimal controls, and month names beside a domain or `mailto:` address. The baseline passes the ordinary-mark control (**1/10** new contracts); the updated engine passes **10/10**. Nine selected strings intentionally change output to preserve their recognizable technical spans.

These are project-authored software contracts with no independent linguistic labels. This report does not measure population-wide Nepali accuracy, external-corpus improvement, performance, or browser/device compatibility. Opt-out behavior, custom entries, the unchanged word API, and live editing are covered by separate functional tests. Historical month, loanword, ra-ya, and initial report counts remain dated records. The [new record](mixed-text-benchmarks.md#reproduce-the-recorded-comparison) pins core/fixture/tool hashes and explains reproduction without silently comparing a later engine or fixture.

### Early-address follow-up — 2026-09-27

The [early-address follow-up](mixed-text-benchmarks.md#early-address-follow-up--2026-09-27) and [machine report](../../benchmark/reports/early-address-001.json) record the next **six software contracts** for unfinished scheme, `www.`, email and dotted-domain cues, plus an unchanged ordinary-text control. Baseline `c0679b5` and the corrected engine use the same expanded fixture: **120/125 → 125/125** full contracts and **18/23 → 23/23** text output, with **102/102** word output unchanged. Both retain **119/119** prior contracts. All 121 previous rows remain byte-for-byte unchanged, including the two exploratory exclusions. The selected additions improve from **1/6 → 6/6**; no independent language labels, external-corpus results, timing, or browser support claim are added. The report's core, fixture, and tool hashes distinguish this correction from the first mixed-text implementation.

## Digit-default update — 2026-09-27

The [digit benchmark record](digits-benchmarks.md) and [machine report](../../benchmark/reports/digits-001.json) explicitly revise seven historical ASCII-digit expectations and add eight software contracts. The revised fixture has **133 contracts and two exploratory exclusions**. On the same revised fixture, baseline `660d088` and the digit engine score **119/133 → 133/133**, with word output **102/103 → 103/103**, required candidate coverage **104/105 → 105/105**, and text output **17/30 → 30/30**. The new cases score **1/8 → 8/8**.

The frozen historical fixture remains a separate check: baseline default **125/125**, new default **118/125** from the seven intentional digit changes, and the explicit `digits: 'latin'` engine **125/125**. These are different default policies, not an improvement on unchanged labels. All prior IDs, inputs, categories, statuses, and provenance text are retained; seven expectations and dated provenance suffixes are revised transparently, while the other 120 prior rows and historical machine reports are unchanged. The new report and measurement tool pin the sources, runner, both fixtures, and changed IDs. No linguistic labels, external-word result, timing measurement, or browser/device result is added by this comparison.

## Completed source-assisted development review — 2026-10-01

The [completed review](source-review-2026-10-01.md) freezes 86 project development cases from the original 100: 74 words and 12 sentences. Fourteen exclusions have no scored references. The unchanged `4e20b34` engine matches **8/74** word cases, covers **8/79** listed word references in candidates and matches **0/12** complete sentence cases. The frozen ledger preserves alternatives and evidence; the measurement records its hash and exact default engine identity.

Run `npm run benchmark:source-reviewed` after preparing the pinned batch. The research command reports mismatches without failing a gate and refuses to overwrite an existing output file. These source-assisted references are usable for development corrections, with no independent human or held-out accuracy claim. The earlier source-proposal and draft-review reports retain their original labels and denominators.

## Building a credible evaluation corpus

Before publishing an accuracy claim, collect a separate set of real Roman input and intended Unicode output from consenting typists. Keep a record of each item's source, license or permission, keyboard and language context where known, and whether the input was typed naturally or created to test a rule. Ask proficient Nepali reviewers to verify the intended spelling and record disagreements. Where one Roman spelling has multiple plausible words, include enough sentence context to identify the typist's intended result; do not declare one word universally correct without context.

Include common and uncommon words, inflections, names, short and long vowels, consonant clusters, nasal marks, punctuation, and mixed-language text. Publish the sampling and review rules, item counts by category, exclusions, and the corpus version. Keep a held-out evaluation set separate from examples used to change the lexicon or rules. If a held-out item is used to fix the engine, move it to regression coverage and replace it in the held-out set before later comparisons. Report top-output and candidate coverage with numerators, denominators, and error examples; report each category as well as the total. Do not compare systems until they have been tested on the same inputs with the same accepted-output rules.

## Performance protocol for a future report

There is **no performance result yet**. A future engine timing report should state the SahajLipi commit, benchmark corpus version, Node.js version, operating system, CPU, and run command. Warm up the engine, run a fixed mix of word and text inputs repeatedly, and report median and 95th-percentile time per conversion across repeated trials. Keep cold-start timing separate from steady-state timing and record variation between trials. Browser input latency needs its own experiment with real browsers and devices; Node.js `convertWord` timing cannot stand in for key-to-display latency or mobile composition behavior.

## External language data

The [external evaluation guide](external-evaluation.md) gives pinned download commands, file hashes, scoring rules, source licenses, a reproducible Aksharantar Nepali word baseline, and a separate Bhasha-Abhijnaanam sentence review queue. Its word result is descriptive. The sentence queue contains unreviewed source pairs and has no score. Neither changes the seed contract gate above.
