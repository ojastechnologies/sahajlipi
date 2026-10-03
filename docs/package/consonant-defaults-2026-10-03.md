# Full-consonant default contracts — 2026-10-03

The source now defaults to `consonantMode: 'full'`. An unmarked final fallback consonant renders full; adjacent consonants still form automatic clusters. `createEngine({ consonantMode: 'half' })` retains the previous implicit final-halant behavior. Slash and backtick explicitly request a halant, and `/=` and backtick followed by `=` request a halant with a zero-width joiner.

This is an approved **software-contract update**, measured against literal, manually specified Unicode strings. The changed default and its selected tests do not establish better Nepali linguistic accuracy. The published `0.1.0-alpha.1` package is unchanged; these results describe the unpublished `0.1.0-alpha.2` source.

| Input | Default / explicit `full` | Strict `half` |
| --- | --- | --- |
| `k` / `ka` | क / क | क् / क |
| `kr` / `kra` | क्र / क्र | क्र् / क्र |
| `kri` | क्रि | क्रि |
| `kar` | कर | कर् |
| `k/` or k followed by backtick | क् | क् |
| `ka/` or ka followed by backtick | क् | क् |
| `par/=yo` or par followed by backtick and `=yo` | पर्‍यो | पर्‍यो |
| `k^` / `k~` | कं / कँ | क्ं / क्ँ |

The API option, explicit marks and browser typing behavior are documented in the [typing reference](typing-reference.md) and [API guide](api.md).

The separate [dated browser checks](browser-compatibility.md#full-consonant-source-candidate-follow-up--2026-10-03) and [desktop-006 machine record](../../browser/reports/desktop-006.json) cover editable Roman input, explicit halves, the demo setting and installed package consumers. Their desktop integration results are separate from the core contracts below.

## Recorded comparison

The [machine report](../../benchmark/reports/consonant-defaults-2026-10-03.json) compares immutable baseline `987e31f7ec4e49680d7a001c078debce3d7fb326` with the new source. It pins every source file, the seed and finite mode fixtures, the tools and all historical report hashes.

| Check | Prior default | New default | Explicit `full` | Strict `half` |
| --- | ---: | ---: | ---: | ---: |
| Same revised seed contracts | 130/160 | 160/160 | 160/160 | — |
| Archived original seed contracts | 142/142 | 128/142 | — | 142/142 |
| Eighteen added seed contracts | 2/18 | 18/18 | — | — |
| Finite full-mode contracts | 11/31 | 31/31 | 31/31 | — |
| Finite half-mode contracts | — | — | — | 31/31 |

On the revised seed, preferred word outputs are **101/126 → 126/126**, listed candidate coverage **104/129 → 129/129**, and complete text outputs **29/34 → 34/34**. The before/after totals use the same revised software policy; their increase is agreement with that policy, not an accuracy gain on unchanged language labels.

Strict `half` also matches the archived engine's **144/144 complete raw results**: 142 contract inputs and the two exploratory inputs. This comparison checks each whole word result object, including the full candidate array and `ambiguous`, or the whole text string. The two exploratory spelling proposals remain **0/2**, retain their original labels and stay outside the contract gate.

## Declared fixture revisions

The seed has **160 contracts and two exploratory cases**. Fourteen prior contract rows intentionally revise their preferred output and, for words, their required singleton candidate. Each retains its ID, input, status, category, order and previous provenance, then appends a dated explanation. The other **130 of 144 prior rows remain byte-for-byte identical**. Stable IDs such as `half-k` retain their historical names even though their current default target is full.

The revised rows are `half-k`, `half-kr`, `loanword-reserved-doctor`, `loanword-reserved-school`, `loanword-check-collision`, `loanword-fail-collision`, `loanword-phail-collision`, `month-shift-s`, `month-shift-d`, `month-short-jan`, `month-short-sep`, `mixed-early-ordinary-text`, `loanword-suffix-text-boundaries` and `native-spelling-text-boundaries`. The last three revise bare Shift `T`/`D`/`S` outputs inside text. The report records every old target, revised target and measured result.

Eighteen additions cover bare finals, digraphs, clusters, `kar`, an unsupported literal boundary, backtick/slash entry, joiner entry, nasal marks after full and explicitly half consonants, punctuation/newlines/digits and protected URL/email spans. The separate [31-case mode fixture](../../benchmark/consonant-modes-2026-10-03.json) contains literal expectations for both options without changing the general seed schema. Its targets were hand-specified from the approved typing rules before comparison; engine outputs did not generate or replace them.

All earlier dated reports and external/source-assisted references are unchanged. This record adds no human-reviewed language labels, external-corpus score, performance measurement, mobile compatibility or registry publication result. The finite compatibility checks cover their listed inputs, not every possible Roman spelling.

## Reproduce

From the checkout corresponding to the report's source hashes, with Node.js 18 or later:

```sh
CONSONANT_BASELINE_DIR=$(mktemp -d)
git archive 987e31f7ec4e49680d7a001c078debce3d7fb326 \
  src package.json benchmark/cases.jsonl benchmark/run.js benchmark/reports \
  | tar -x -C "$CONSONANT_BASELINE_DIR"
node benchmark/measure-consonant-defaults.js "$CONSONANT_BASELINE_DIR" --check

npm run benchmark -- --check
```

Add `--output <new-report.json>` to save a report. An existing output file is refused. `--check` exits with code 1 if a revised default/full contract, finite full/half case, archived half contract or raw strict comparison fails. Invalid inputs or changed frozen fixtures/source/report identities exit with code 2. Timestamp and host details may vary; pinned fixture hashes keep denominators fixed.

The seed CLI continues to check only its default engine. The dedicated comparison creates full and half engines programmatically and runs the seed CLI against the same revised fixture to confirm its API and CLI counts agree. Replaying an earlier dated report requires its earlier implementation and fixture, rather than the current default.
