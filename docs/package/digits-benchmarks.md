# Digit rendering benchmark record

The 2026-09-27 digit update makes Devanagari digits the default outside protected addresses. The [API guide](api.md#digits-and-shared-field-configuration) defines `digits: 'devanagari' | 'latin'`, custom candidate handling, and browser configuration. This page records selected **software behavior contracts**, with the complete inputs, outputs, source identities, commands, and limits in [digits-001.json](../../benchmark/reports/digits-001.json). It adds no independently reviewed linguistic labels or language-accuracy result.

## Recorded results

Measured with Node.js `v22.22.3` on macOS arm64 on **2026-09-27T13:56:12.410Z**. The baseline is immutable commit `660d088ed60410feb0c6ad4c43d33214c24296f9`; the after engine is a working tree based on that commit, pinned by core-file hashes. There are two fixture definitions:

| Fixture and configuration | Before | After | Interpretation |
| --- | --- | --- | --- |
| Historical 125 contracts, default engine | 125/125 | 118/125 | Seven ASCII-digit expectations intentionally differ under the new default. |
| Historical 125 contracts, explicit `digits: 'latin'` after engine | — | 125/125 | Configured Latin digits retain the prior exact outputs and required candidates. |
| Revised 133 contracts, default engine | 119/133 | 133/133 | Same revised fixture used for both engines. |
| Eight appended digit contracts | 1/8 | 8/8 | Existing Devanagari control already passes; seven selected outputs change. |

The revised fixture contains **135 rows: 133 contracts and two unchanged exploratory proposals excluded from the gate**. Word top output is **102/103 → 103/103**, required candidate coverage **104/105 → 105/105**, and text exact output **17/30 → 30/30**. The fixture SHA-256 is `c5d2b7bbca573368a7531b7d21a5b989f7ca67d937ff0ae49cc3b3d923449fe7`; the historical fixture SHA-256 is `2b3d794b761dc8e9d459becb85bbed1be39a7f6bfbdae48b2cfe6d14dc876cc6`.

**125/125 and 133/133 use different expectations.** Their difference is a disclosed default-policy change, not an accuracy or performance improvement on unchanged labels. The historical [mixed-text and early-address reports](mixed-text-benchmarks.md), month, loanword, and ra-ya records retain their original outputs, denominators, and hashes.

## Revised historical rows

Seven existing `expectedTop` strings now use Devanagari digit code points; their provenance appends the dated, user-authorized policy revision. IDs, inputs, categories, contract status, and prior provenance text remain intact. The other **120 of 127** prior rows remain byte-for-byte identical.

| Case ID | Numeric context |
| --- | --- |
| `period-decimal-danda` | Decimal and danda |
| `ry-vowels-and-punctuation` | Existing vowel/ra-ya text with punctuation and numbers |
| `loanword-text-cha-vowels-punctuation` | Loanwords, vowel controls, and decimal |
| `month-gregorian-date` | Month name and Gregorian date |
| `month-gregorian-year-boundary` | Month name and year boundary |
| `mixed-ordinary-marks-and-decimal` | Ordinary text, explicit marks, and decimal |
| `mixed-early-ordinary-text` | Address-cue negative control with ordinary decimal |

The archived baseline freezes the old expectations. The new report records all seven old and new outputs and separately measures the new default against the historical fixture. This makes the intentional incompatibility visible rather than relabeling an old result as passing.

## New contracts

| Case ID | Selected behavior |
| --- | --- |
| `digits-all-ten` | All ten ASCII digit keys become Devanagari. |
| `digits-decimal-danda` | Decimal point remains a period and pipe becomes danda. |
| `digits-date-time-fraction` | Digits change while date/time/fraction separators remain. |
| `digits-existing-devanagari` | Existing Devanagari digits remain unchanged. |
| `digits-word-api` | Direct `convertWord` returns a digit-rendered candidate. |
| `digits-technical-spans` | Numbers in protected addresses stay literal while surrounding numbers convert. |
| `digits-before-address-cue` | A plain token before an address cue still follows ordinary conversion. |
| `digits-mixed-scripts` | ASCII digits beside existing Devanagari digits use the selected default. |

Custom-entry candidates, deduplication after digit rendering, invalid option values, and the Latin option have separate functional tests. The language lexicon, phonetic tables, and technical-span scanner are unchanged by this feature.

## Reproduce the recorded comparison

Use Node.js 18 or later and a checkout whose source and fixture hashes match digits-001. If later code has changed, select or archive the digit implementation from repository history before running these commands; a current green benchmark with a different fixture is a separate result. The verification stops on a source, fixture, runner, measurement-tool, or historical-report mismatch.

```sh
DIGITS_BASELINE_DIR=$(mktemp -d)
DIGITS_REPLAY_FILE=$(mktemp)
git archive 660d088ed60410feb0c6ad4c43d33214c24296f9 | tar -x -C "$DIGITS_BASELINE_DIR"
node --input-type=module - "$DIGITS_BASELINE_DIR" <<'JS'
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const report = JSON.parse(await readFile('benchmark/reports/digits-001.json', 'utf8'));
const hash = async (path) => createHash('sha256').update(await readFile(path)).digest('hex');
const afterFiles = {
  ...report.after.coreFileSha256,
  [report.fixture.path]: report.fixture.sha256,
  'benchmark/run.js': report.benchmarkToolSha256.after,
  [report.measurementTool.path]: report.measurementTool.sha256,
  ...report.historicalReportSha256,
};
for (const [path, expected] of Object.entries(afterFiles)) {
  if (await hash(path) !== expected) throw new Error('Recorded after source differs: ' + path);
}
const baselineFiles = {
  ...report.baseline.coreFileSha256,
  [report.fixture.path]: report.fixture.priorFixtureSha256,
  'benchmark/run.js': report.benchmarkToolSha256.before,
};
for (const [path, expected] of Object.entries(baselineFiles)) {
  if (await hash(process.argv[2] + '/' + path) !== expected) throw new Error('Baseline differs: ' + path);
}
console.log('All recorded comparison hashes match.');
JS
node benchmark/measure-digits.js "$DIGITS_BASELINE_DIR" --output "$DIGITS_REPLAY_FILE"
```

[`measure-digits.js`](../../benchmark/measure-digits.js) verifies four actual default-engine CLI runs against its own exact-output and expected-candidate summaries: before/after on the historical fixture, then before/after on the revised fixture. The expected CLI failures are historical-after **118/125** and revised-before **119/133**, each exiting **1**; the historical-before **125/125** and revised-after **133/133** runs exit **0**. The tool checks these expected results and succeeds when the complete comparison is reproduced.

The explicit Latin compatibility result is a separate programmatic evaluation using `createEngine({ digits: 'latin' })` on the historical fixture. The default-engine CLI has no custom-engine injection, so it is not described as a CLI result. The generated replay report includes both methods. Its timestamp and local command paths will differ; compare exact outputs, case IDs, source hashes, and denominators. Keep the new output separate from the committed immutable report.

For regression checks on the latest checkout, run:

```sh
npm test
npm run benchmark -- --check
```

## Scope and limits

Digit rendering replaces ASCII digit characters; it does not parse numbers, validate dates, change values, perform locale formatting, or convert between Gregorian and Bikram Sambat calendars. Existing Devanagari digits are preserved by both styles, so `digits: 'latin'` is not a Devanagari-to-ASCII normalization API.

Address protection remains the existing ASCII pattern heuristic. Before an address cue appears, ordinary text and digits use the selected style. English mode, live restoration at a cue, caret editing, undo, paste, composition, and field exclusions need separate DOM/browser evidence; the [browser compatibility guide](browser-compatibility.md) records that scope. Numeric `<input type="number">` fields remain outside the browser adapter.

This selected project-authored regression set does not measure population-wide Nepali accuracy, external-corpus improvement, typing latency, real mobile input, installed IMEs, OS clipboard integration, assistive technology, or broad browser compatibility. The two exploratory language proposals remain unreviewed and outside `--check`.
