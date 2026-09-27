# Gregorian month benchmark record — 2026-09-27

This record compares the default engine before and after twelve full English Gregorian month defaults. The selected Nepali outputs come from [Unicode CLDR JSON 48.2.1](https://github.com/unicode-org/cldr-json/blob/26a79cb42bfcc90def764102aa2af126d9ef3108/cldr-json/cldr-dates-full/main/ne/ca-gregorian.json), pinned at commit `26a79cb42bfcc90def764102aa2af126d9ef3108`. The [month-name guide](month-names.md) explains the spellings, capitalization and limits; the [source record](../../benchmark/reports/month-research-2026-09-27.json) and [Unicode notice](../../LICENSES/Unicode-3.0.txt) preserve provenance and attribution. These are source-assisted project defaults. No independent human linguistic labels were admitted.

The [machine report](../../benchmark/reports/nepali-months-001.json) records literal cases, per-category counts, engine and fixture hashes, source selection, unchanged-label external comparisons and software checks.

## Recorded results

Run date: 2026-09-27; Node.js v22.22.3. The baseline is `264f24945d150d8aa084f42522e859d2fabd216c`, extracted with `git archive`. The after run used a modified working tree based on that commit; the report identifies its engine files by SHA-256. The phonetic fallback, browser adapter and type declarations are byte-for-byte unchanged. The changed files are the lexicon defaults and the core index module's alias setup for `September` and `December`; its conversion and tokenization functions retain their existing code.

| Check | Before | After | Interpretation |
| --- | ---: | ---: | --- |
| Original seed contracts | 85/85 | 85/85 | All 87 previous rows and IDs retained byte-for-byte, including two exploratory cases |
| Same expanded seed contracts | 91/109 | 109/109 | Both engines scored against the same frozen fixture |
| Expanded word top output | 86/102 | 102/102 | Exact preferred output for selected project contracts |
| Expanded expected candidate coverage | 88/104 | 104/104 | Required readings present; extra suggestions are permitted by this metric |
| Expanded text exact output | 5/7 | 7/7 | Complete strings, including digits, comma, year and danda |
| Exploratory proposals | 0/2 | 0/2 | Unreviewed targets, excluded from the contract gate |
| Functional tests | 151/151 | 168/168 | Software regression checks, not language accuracy |
| Frozen development source proposals | 7/100 | 7/100 | 7/80 word matches, 0/20 sentence matches, 7/80 word proposals in candidates |
| Pinned Aksharantar test | 281/4,101 | 281/4,101 | Top and candidate agreement; unchanged descriptive public-test result |

The expanded fixture has **111 rows: 109 contracts and two exploratory cases**. Its 24 additions contain literal targets for all twelve lowercase month names, four focused Title Case forms (`January`, `May`, `September`, `December`), standalone `S`/`D` sound keys, unchanged `Jan`/`Sep` abbreviations, `septembeR`/`SEPTEMBER` Shift guards, and two Gregorian date strings. All twelve defaults return exactly one candidate. Functional tests additionally cover all twelve Title Case names and lower/exact-cased custom-entry precedence.

The baseline passes six new controls and misses the sixteen new word targets and two date strings. The date `September 27, 2026` becomes `सेप्टेम्बर 27, 2026`; the year-boundary string `December 31, 2026| january 1, 2027` becomes `डिसेम्बर 31, 2026। जनवरी 1, 2027`. Digits and Gregorian years remain literal. No Bikram Sambat conversion is performed.

The seed runner measures coverage of required candidates. It does not measure suggestion precision or establish that every valid reading is listed. Exact arrays and their order are also checked by the functional tests. These counts describe selected project behavior, without a population accuracy or performance claim.

## External comparisons and separation

The month outputs were selected from official CLDR before inspecting the external evaluation data. The engine comparison then used the same pinned **4,101-row** public Aksharantar test and the unchanged **100-case** development cohort. No rows were excluded, relabeled or substituted with research recommendations. Every cohort item remains unreviewed with no accepted outputs or reviewer decisions.

The public test SHA-256 is `172c759fcbb9faeda0a23765ccd12ad0520fb535a05dca42dd9c9923ee5f554e`. Both engines return **281/4,101 (6.85%)** exact top matches and reference-in-candidate matches: AK-Freq 246/2,108, AK-NEF 10/817 and AK-NEI 25/1,176. There are no changed public-test outputs. The development cohort SHA-256 is `2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3`; it remains at 7/100 exact source-proposal matches, with no changed outputs or candidates.

An overlap audit of the twelve month mappings found **zero Roman-key and zero native-output overlaps** in the public word test, including an NFC/zero-width-joiner-normalized native comparison. In the cohort it found zero Roman or native word overlaps and zero month-name tokens in Roman sentence inputs. The exact audit scope and counts are recorded in the machine report. These selected defaults and public data still do not support a clean held-out or population accuracy claim.

The dated [loanword record](loanword-benchmarks.md) retains its 279/4,101 → 281/4,101 comparison and two overlapping pilot mappings. The [initial external baseline](external-evaluation.md#initial-baseline), loanword, ra-ya and initial seed reports retain their original results and denominators. AI4Bharat attribution and data terms remain in the [external evaluation guide](external-evaluation.md). Raw external data and private reviewer sheets are not redistributed in the package.

## Reproduce

Run from a checkout containing this recorded month engine and fixture, with Node.js 18 or later. Freeze a copy of the fixture and verify its hash and both engine identities against the machine report. The checks reject later engine or fixture changes instead of silently changing this dated comparison.

```sh
MONTH_BASELINE_DIR="$(mktemp -d /tmp/sahajlipi-month-before.XXXXXX)"
MONTH_FIXTURE_FILE="$(mktemp /tmp/sahajlipi-month-cases.XXXXXX)"
git archive 264f24945d150d8aa084f42522e859d2fabd216c | tar -x -C "$MONTH_BASELINE_DIR"
cp benchmark/cases.jsonl "$MONTH_FIXTURE_FILE"
node --input-type=module - "$MONTH_BASELINE_DIR" "$PWD" "$MONTH_FIXTURE_FILE" <<'JS'
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const report = JSON.parse(await readFile(process.argv[3] + '/benchmark/reports/nepali-months-001.json', 'utf8'));
const hash = async (path) => createHash('sha256').update(await readFile(path)).digest('hex');
for (const [root, identity] of [[process.argv[2], report.baseline], [process.argv[3], report.after]]) {
  for (const [file, expected] of Object.entries(identity.engineFileHashes)) {
    if (await hash(root + '/' + file) !== expected) throw new Error('Engine differs: ' + file);
  }
}
if (await hash(process.argv[4]) !== report.projectContractConformance.sameFinalFixture.sha256) {
  throw new Error('The recorded month fixture differs');
}
JS
node "$MONTH_BASELINE_DIR/benchmark/run.js" --fixtures "$MONTH_FIXTURE_FILE" --check
node benchmark/run.js --fixtures "$MONTH_FIXTURE_FILE" --check
```

The baseline command intentionally exits with code 1 (91/109); the after command exits with code 0 (109/109). Run the two benchmark commands separately if the shell stops on the expected baseline failure. Check the original 85-contract denominator and functional suite:

```sh
node "$MONTH_BASELINE_DIR/benchmark/run.js" --fixtures "$MONTH_BASELINE_DIR/benchmark/cases.jsonl" --check
node benchmark/run.js --fixtures "$MONTH_BASELINE_DIR/benchmark/cases.jsonl" --check
(cd "$MONTH_BASELINE_DIR" && npm test)
npm test
```

For the public word comparison, obtain and verify the pinned data using the [external evaluation guide](external-evaluation.md), then run:

```sh
MONTH_TEST_FILE="$PWD/benchmark/data/nep_test.json"
node "$MONTH_BASELINE_DIR/benchmark/aksharantar.js" --data "$MONTH_TEST_FILE" --examples 0
node benchmark/aksharantar.js --data "$MONTH_TEST_FILE" --examples 0
```

The external CLI's revision label reads the command's current Git directory. The verified engine hashes identify the extracted baseline and recorded after engine precisely.

For the unchanged development cohort, use the original ignored `benchmark/data/review-batch-001/cases.jsonl` generated by the [review batch protocol](review-batch.md):

```sh
node --input-type=module - "$MONTH_BASELINE_DIR" "$PWD" "$PWD/benchmark/data/review-batch-001/cases.jsonl" <<'JS'
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

The aliases apply to twelve complete English month names. No shortened month inputs, blanket uppercase folding, suffix or compound inference, new API, digit conversion, ordinal/gender rule or calendar conversion is introduced. The special full-word Title Case forms `September` and `December` inherit lowercase custom entries unless an exact normalized cased entry overrides them. Standalone `S` and `D`, internal reserved capitals and other all-capital spellings keep existing phonetic behavior. Literal English typing remains available through the browser mode switch.

## Browser interaction check

A fresh check on 2026-09-27 used Chromium 151.0.7922.34 against the demo. It passed key-by-key typing of all twelve lowercase and twelve Title Case month names, `September`/`December` Backspace prefix restoration and caret position, date text with ASCII digits and years, reserved Shift and internal/all-capital controls, unlisted lowercase `jan`/`sep`, the existing `maya` output, literal English mode, marked and unmarked fields, and custom-entry precedence. The demo guide also passed checks for the twelve mapping rows, a labelled month heading, consecutive section numbers and the absence of month character buttons. The 390-pixel editor and guide viewports had no horizontal overflow and no page errors were observed. The machine report records the checks and timestamp.

This desktop Chromium check does not establish mobile keyboard, assistive technology or cross-browser support. It records interaction behavior without a timing or linguistic accuracy result.
