# Loanword and cha benchmark record — 2026-09-27

This record compares the default engine before and after the 20 [loanword project defaults](loanword-review.md) and the authorized `cha`/`chha` candidate order. The spellings are source-assisted project choices. No independent human linguistic labels have been admitted. The [machine report](../../benchmark/reports/nepali-loanwords-001.json) records the literal fixture, engine and tool SHA-256 hashes, commands, per-category counts, source URLs and review status.

## Recorded results

Run date: 2026-09-27; Node.js v22.22.3. The baseline is `43b5a008366c943309f44bebfbae4e6df24f6173`, the merged ra-ya update on `main`. Source files were extracted with `git show` into a temporary snapshot. The after run used a modified working tree based on that commit; its exact engine files are identified by SHA-256, without assigning it an uncreated commit ID. The phonetic and core conversion modules are byte-for-byte unchanged.

| Check | Before | After | Interpretation |
| --- | ---: | ---: | --- |
| Original current seed contracts | 50/50 | 50/50 | All 52 original rows and IDs retained, including two exploratory cases |
| Same expanded seed contracts | 60/85 | 85/85 | Both engines scored against the same final fixture |
| Expanded word top output | 57/80 | 80/80 | Exact preferred output for selected project contracts |
| Expanded expected candidate coverage | 60/82 | 82/82 | Required readings present; this metric permits extra suggestions |
| Expanded text exact output | 3/5 | 5/5 | Complete strings, including punctuation, decimal and danda |
| Exploratory proposals | 0/2 | 0/2 | Unreviewed targets, excluded from the contract gate |
| Functional tests | 122/122 | 151/151 | Software regression checks, not a language accuracy score |
| Frozen development source proposals | 7/100 | 7/100 | 7/80 word matches, 0/20 sentence matches, 7/80 word references in candidates |
| Pinned Aksharantar test | 279/4,101 | 281/4,101 | Top and candidate agreement; descriptive public-test comparison |

The expanded fixture has **87 rows: 85 contracts and two exploratory cases**. The 35 additions cover 20 exact loanword mappings, `cha` and `chha`, two incidental-capital examples, four reserved Shift controls, two suffix fallback controls, three collision controls, and two text integration cases. Expectations are literal fixture values, independent of the production lexicon. All 20 loanword defaults return exactly one candidate. `cha` now returns `['च', 'छ']`, while `chha` retains `['छ']`.

The seed runner measures coverage of required candidates. It does not score suggestion precision or establish that every valid linguistic reading is listed. Exact candidate arrays and their order are also asserted by the functional tests.

## External comparisons and separation

The frozen 100-case development cohort uses its **unchanged original source proposals**: 80 validation words and 20 prompted sentences. Every case remains unreviewed, with no accepted outputs or reviewer decisions. None of its engine outputs changed in this update. Research recommendations were not substituted for source labels.

The public Aksharantar file remains the pinned **4,101-row** test with SHA-256 `172c759fcbb9faeda0a23765ccd12ad0520fb535a05dca42dd9c9923ee5f554e`. No rows were excluded or relabeled. Its exact top and candidate counts change from **279/4,101 (6.80%)** to **281/4,101 (6.85%)**: AK-Freq changes from 245/2,108 to 246/2,108, AK-NEF from 9/817 to 10/817, and AK-NEI remains 25/1,176.

An overlap audit found **two Roman-key overlaps and two native-output overlaps** between the 20 approved defaults and this public test, at source IDs `nep1190` and `nep2895`. These are also its only changed engine outputs. The defaults came from prior institutional usage research and project authorization; they were not selected from test misses. The overlap still prevents interpreting the gain as an improvement on a clean held-out set. The original [2026-09-24 baseline](external-evaluation.md#initial-baseline) remains recorded separately. Neither this comparison nor the expanded seed score establishes population-wide Nepali typing accuracy.

AI4Bharat's Aksharantar CC BY attribution and the development sentence data terms are documented in the [external evaluation guide](external-evaluation.md). Raw data and private reviewer sheets remain outside the distributed package.

## Reproduce

Run from a repository checkout with Node.js 18 or later. Create a temporary baseline from the recorded commit, then use the **current final fixture for both engines**:

```sh
LOANWORD_BASELINE_DIR="$(mktemp -d /tmp/sahajlipi-loanword-baseline.XXXXXX)"
mkdir -p "$LOANWORD_BASELINE_DIR/src" "$LOANWORD_BASELINE_DIR/benchmark"
for file in package.json src/index.js src/lexicon.js src/phonetic.js benchmark/run.js benchmark/aksharantar.js benchmark/aksharantar-core.js benchmark/review-batch-core.js; do
  git show "43b5a008366c943309f44bebfbae4e6df24f6173:$file" > "$LOANWORD_BASELINE_DIR/$file"
done
git show 43b5a008366c943309f44bebfbae4e6df24f6173:benchmark/cases.jsonl > "$LOANWORD_BASELINE_DIR/benchmark/cases.jsonl"
node "$LOANWORD_BASELINE_DIR/benchmark/run.js" --fixtures "$PWD/benchmark/cases.jsonl" --check
npm run benchmark -- --check
```

The baseline command intentionally exits with code 1: it passes 60 of the 85 expanded contracts. The after command exits with code 0. To check the original 50-contract denominator separately:

```sh
node "$LOANWORD_BASELINE_DIR/benchmark/run.js" --fixtures "$LOANWORD_BASELINE_DIR/benchmark/cases.jsonl" --check
node benchmark/run.js --fixtures "$LOANWORD_BASELINE_DIR/benchmark/cases.jsonl" --check
npm test
```

For the public word comparison, obtain and verify the pinned data using the [external evaluation guide](external-evaluation.md), then run:

```sh
LOANWORD_TEST_FILE="$PWD/benchmark/data/nep_test.json"
node "$LOANWORD_BASELINE_DIR/benchmark/aksharantar.js" --data "$LOANWORD_TEST_FILE" --examples 0
npm run benchmark:aksharantar -- --data "$LOANWORD_TEST_FILE" --examples 0
```

The external CLI's revision label reads the command's current Git directory. Use the recorded engine file hashes to identify the extracted baseline and modified after engine precisely.

For the unchanged 100-case cohort, use the original ignored `benchmark/data/review-batch-001/cases.jsonl` generated by the [review batch protocol](review-batch.md). Its SHA-256 must remain `2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3`. This command loads each engine's existing diagnostic module against those same original cases:

```sh
node --input-type=module - "$LOANWORD_BASELINE_DIR" "$PWD" "$PWD/benchmark/data/review-batch-001/cases.jsonl" <<'JS'
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
const bytes = await readFile(process.argv[4]);
const expected = '2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3';
if (createHash('sha256').update(bytes).digest('hex') !== expected) {
  throw new Error('The original source-proposal cohort changed');
}
const cases = bytes.toString('utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
for (const root of process.argv.slice(2, 4)) {
  const { diagnoseReviewBatch } = await import(pathToFileURL(root + '/benchmark/review-batch-core.js'));
  console.log(JSON.stringify(diagnoseReviewBatch(cases).summary, null, 2));
}
JS
```

## Scope limits

These exact aliases do not introduce suffix handling, compound inference, protected URL/email spans, or an API. `bankma`, `fileharu`, `check`, `fail`, and `phail` retain their existing phonetic results. Reserved capitals remain sound keys: `Taxi`, `Doctor`, `School`, and `softwaRe` bypass the lowercase defaults. Only incidental capitals such as `Camera` and `Email` normalize to the approved aliases. Literal English typing is available through the existing browser mode switch.

## Browser interaction check

A fresh check on 2026-09-27 used Chromium 151.0.7922.34 against the demo. It passed key-by-key typing of all 20 aliases, Backspace and longer-word boundaries with caret position, `cha` candidate selection followed by editing to `chha`, incidental and reserved capitals, existing vowel lengths, half sounds and punctuation, paste, literal English mode, marked Nepali fields and unmarked English/email fields. The 390-pixel viewport had no horizontal overflow and no page errors were observed. The [machine report](../../benchmark/reports/nepali-loanwords-001.json) records the checks and timestamp.

Paste used a DOM `ClipboardEvent`, not the operating system clipboard. This desktop Chromium check with a narrow viewport does not establish mobile keyboard, assistive technology or cross-browser support. There is no timing or population accuracy claim in this report.
