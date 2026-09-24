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

## Building a credible evaluation corpus

Before publishing an accuracy claim, collect a separate set of real Roman input and intended Unicode output from consenting typists. Keep a record of each item's source, license or permission, keyboard and language context where known, and whether the input was typed naturally or created to test a rule. Ask proficient Nepali reviewers to verify the intended spelling and record disagreements. Where one Roman spelling has multiple plausible words, include enough sentence context to identify the typist's intended result; do not declare one word universally correct without context.

Include common and uncommon words, inflections, names, short and long vowels, consonant clusters, nasal marks, punctuation, and mixed-language text. Publish the sampling and review rules, item counts by category, exclusions, and the corpus version. Keep a held-out evaluation set separate from examples used to change the lexicon or rules. If a held-out item is used to fix the engine, move it to regression coverage and replace it in the held-out set before later comparisons. Report top-output and candidate coverage with numerators, denominators, and error examples; report each category as well as the total. Do not compare systems until they have been tested on the same inputs with the same accepted-output rules.

## Performance protocol for a future report

There is **no performance result yet**. A future engine timing report should state the SahajLipi commit, benchmark corpus version, Node.js version, operating system, CPU, and run command. Warm up the engine, run a fixed mix of word and text inputs repeatedly, and report median and 95th-percentile time per conversion across repeated trials. Keep cold-start timing separate from steady-state timing and record variation between trials. Browser input latency needs its own experiment with real browsers and devices; Node.js `convertWord` timing cannot stand in for key-to-display latency or mobile composition behavior.
