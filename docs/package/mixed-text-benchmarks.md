# Mixed-text benchmark record — 2026-09-27

This record measures whether the default whole-text converter follows the selected mixed-text preservation contract. The [API guide](api.md#links-domains-and-email-addresses) defines the current address policy, punctuation boundaries, and the engine opt-out. This dated record covers the first address-preservation policy; the [early-address follow-up](#early-address-follow-up--2026-09-27) records later cue preservation separately and does not replace these historical outputs. The [machine report](../../benchmark/reports/mixed-text-001.json) records exact inputs and outputs, per-set counts, engine and fixture identities, changed case IDs, commands, and limitations.

These are project-authored **software behavior contracts**. No independently reviewed linguistic labels were added, and the result is not a Nepali accuracy, timing, or browser-compatibility score.

## Recorded results

Recorded on 2026-09-27 using Node.js v22.22.3 on Darwin arm64. The baseline is commit `4e6cc4eed855f0d97bff366c619e5f4eff50e2a8`, extracted with `git archive`. The after run used a modified working tree based on that commit; its core files are pinned by SHA-256 in the report rather than assigned an uncreated commit identity. That exact after engine was subsequently committed as `c0679b5e41a56eb5bab762a422243a400adefe1f`, which the reproduction commands below archive along with its original fixture and report.

| Check | Before | After | Interpretation |
| --- | ---: | ---: | --- |
| Original contracts | 109/109 | 109/109 | Previous word and text contracts preserved |
| Same expanded contracts | 110/119 | 119/119 | Both engines use the same frozen fixture |
| Expanded word top output | 102/102 | 102/102 | Word behavior unchanged |
| Expanded text exact output | 8/17 | 17/17 | Selected complete strings, including addresses and punctuation |
| Added mixed-text contracts | 1/10 | 10/10 | Nine preservation targets change; the ordinary-mark control already passed |
| Exploratory proposals | 0/2 | 0/2 | Unreviewed targets; excluded from the contract gate |

The expanded fixture has **121 rows: 119 contracts and two exploratory cases**. All 111 previous rows and IDs remain byte-for-byte unchanged. The added cases are:

| Case ID | Behavior covered |
| --- | --- |
| `mixed-url-case-port` | Original HTTP(S) host/path case and numeric port |
| `mixed-email-tag` | Email case, dotted local part, plus tag, and danda outside the address |
| `mixed-www-path` | A `www.` address and path beside a Nepali word |
| `mixed-bare-domain-loanword` | A bare subdomain beside automatically converted loanwords |
| `mixed-query-explicit-marks` | `^`, `~`, `/=`, and `|` retained inside URL suffixes |
| `mixed-path-wrappers` | Enclosing punctuation, balanced path parentheses, and an email |
| `mixed-unicode-boundary` | ASCII addresses beside existing Devanagari and emoji |
| `mixed-dotted-roman-shape` | Documented heuristic: domain-shaped `pani.paani` stays literal |
| `mixed-ordinary-marks-and-decimal` | Existing decimal, explicit marks, and conversion of unprotected identifiers |
| `mixed-month-domain` | Month aliases beside a domain and `mailto:` address |

For example, `camera camera.co.np phone` changes from `क्यामेरा क्यामेरा.चो.न्प् फोन` to `क्यामेरा camera.co.np फोन`. The unchanged control `3.14 par/=yo ka^ kaa~ camera_file camera123|` still gives `3.14 पर्‍यो कं काँ क्यामेरा_फाइल क्यामेरा123।`: code-like identifiers do not acquire general literal preservation.

## Engine and fixture identity

The report pins `src/index.js`, `src/index.d.ts`, `src/text-policy.js`, `src/lexicon.js`, and `src/phonetic.js`. The baseline has no text-policy module; its digest is recorded as `null`. Lexicon and phonetic file digests are identical before and after. The expanded fixture SHA-256 is `3e2674bc1bc9c0acd58fcc159eecd6f4666b94897761d33512c76f2fd8addb16`; the original fixture digest is `2ed3e1aba19bfaaf2c48fa8b07f9dac9de3639ced2c6048648c206d486aa99ac`.

The benchmark runner digest is also recorded. A measurement-script digest identifies the script used for the recorded comparison, but it is not a shipped runner or a requirement to reconstruct its temporary paths. The portable commands below run the repository runner with frozen fixtures and reject different core, runner, or fixture identities.

## Reproduce the recorded comparison

Use Node.js 18 or later and a repository checkout whose Git history contains both immutable commits below. Run from the repository root. Both engines, the frozen 119-contract fixture, and the recorded report are extracted from those commits, so subsequent working-tree changes do not change this dated comparison. Hash checks reject different archived content.

```sh
MIXED_BASELINE_DIR=$(mktemp -d)
MIXED_AFTER_DIR=$(mktemp -d)
MIXED_FIXTURE_FILE=$(mktemp)
git archive 4e6cc4eed855f0d97bff366c619e5f4eff50e2a8 | tar -x -C "$MIXED_BASELINE_DIR"
git archive c0679b5e41a56eb5bab762a422243a400adefe1f | tar -x -C "$MIXED_AFTER_DIR"
cp "$MIXED_AFTER_DIR/benchmark/cases.jsonl" "$MIXED_FIXTURE_FILE"
node --input-type=module - "$MIXED_BASELINE_DIR" "$MIXED_AFTER_DIR" "$MIXED_FIXTURE_FILE" <<'JS'
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const report = JSON.parse(await readFile(process.argv[3] + '/benchmark/reports/mixed-text-001.json', 'utf8'));
const hash = async (path) => createHash('sha256').update(await readFile(path)).digest('hex');
for (const [root, identity] of [[process.argv[2], report.baseline], [process.argv[3], report.after]]) {
  for (const [file, expected] of Object.entries(identity.coreFileSha256)) {
    if (expected === null) {
      try {
        await readFile(root + '/' + file);
        throw new Error('Unexpected baseline file: ' + file);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    } else if (await hash(root + '/' + file) !== expected) {
      throw new Error('Core differs: ' + file);
    }
  }
  if (await hash(root + '/benchmark/run.js') !== report.benchmarkToolSha256) {
    throw new Error('Benchmark runner differs');
  }
}
if (await hash(process.argv[4]) !== report.fixture.sha256) {
  throw new Error('Recorded mixed-text fixture differs');
}
if (await hash(process.argv[2] + '/benchmark/cases.jsonl') !== report.fixture.priorFixtureSha256) {
  throw new Error('Original fixture differs');
}
JS
```

Run these benchmark commands separately if the shell stops on a nonzero exit status:

```sh
node "$MIXED_BASELINE_DIR/benchmark/run.js" --fixtures "$MIXED_FIXTURE_FILE" --check
node "$MIXED_AFTER_DIR/benchmark/run.js" --fixtures "$MIXED_FIXTURE_FILE" --check
```

The baseline intentionally exits with code **1** for **110/119** contracts; the recorded after engine exits with code **0** for **119/119**. Check the original denominator separately:

```sh
node "$MIXED_BASELINE_DIR/benchmark/run.js" --fixtures "$MIXED_BASELINE_DIR/benchmark/cases.jsonl" --check
node "$MIXED_AFTER_DIR/benchmark/run.js" --fixtures "$MIXED_BASELINE_DIR/benchmark/cases.jsonl" --check
```

Both commands pass **109/109** original contracts. Exploratory rows are printed but do not fail the gate. For the latest working tree rather than this dated comparison, run `npm run benchmark -- --check`; use `npm test` for the separate functional suite.

## Scope limits

The policy infers recognizable ASCII host and email shapes without DNS, public-suffix validation, full URL/email validation, or network access. Domain-shaped Roman words can therefore be preserved. Unrecognized code, filenames, arbitrary English, and Unicode hostnames/mailboxes have no general literal-text guarantee. See the [typing reference](typing-reference.md#mixed-text-and-literal-english) for explicit English controls.

This report measures default `convertText` only. Opt-out behavior, custom-entry precedence, the unchanged `convertWord` API, and browser live-editing paths are separate functional-test concerns. No new external linguistic comparison, independently reviewed corpus labels, mobile/browser support claim, assistive-technology result, or performance result is established. The [earlier month](month-benchmarks.md), [loanword](loanword-benchmarks.md), and [ra-ya](ry-review.md) results retain their original dated counts and evidence.


## Early-address follow-up — 2026-09-27

The [early-address machine report](../../benchmark/reports/early-address-001.json) records a separate correction prompted by incomplete addresses appearing as Nepali until enough of the host had been typed. The shared scanner now preserves unfinished addresses at `http:`, `https:`, `www.`, an ordinary ASCII local part followed by `@`, or the first letter after a domain dot. Plain `camera`, sentence-final `camera.`, decimals, and explicit Nepali marks keep their previous behavior. It does not predict an address before a cue appears or validate that the address is real.

The baseline is the immutable first mixed-text implementation, `c0679b5e41a56eb5bab762a422243a400adefe1f`. The corrected after engine is identified by core-file hashes in the report. Both runs use the same expanded fixture with **127 rows: 125 contracts and two excluded exploratory proposals**. All 121 prior rows remain byte-for-byte unchanged.

| Check | Before | After |
| --- | ---: | ---: |
| Prior mixed-text contracts | 119/119 | 119/119 |
| Same expanded contracts | 120/125 | 125/125 |
| Word top output | 102/102 | 102/102 |
| Text exact output | 18/23 | 23/23 |
| Six early-address additions | 1/6 | 6/6 |
| Exploratory proposals, excluded from gate | 0/2 | 0/2 |

The six appended IDs are `mixed-early-http-scheme`, `mixed-early-http-userinfo`, `mixed-early-www`, `mixed-early-email`, `mixed-early-domain`, and `mixed-early-ordinary-text`. Five selected strings intentionally change output; the ordinary-text control already passed. Separate functional tests cover intermediate keystrokes, cue deletion, caret movement, undo/redo, native input, paste, and composition. This default `convertText` comparison adds no independent linguistic labels, external word evaluation, performance measurement, or browser/device certification.

### Reproduce the early-address comparison

Use Node.js 18 or later, and a checkout with the after engine and fixture matching the report's hashes. The baseline is archived from its immutable commit; the after run below uses the selected checkout. Hash checks stop the comparison if later code or fixtures differ. The earlier 119-contract comparison remains reproducible from its own immutable snapshots above.

```sh
EARLY_BASELINE_DIR=$(mktemp -d)
EARLY_FIXTURE_FILE=$(mktemp)
git archive c0679b5e41a56eb5bab762a422243a400adefe1f | tar -x -C "$EARLY_BASELINE_DIR"
cp benchmark/cases.jsonl "$EARLY_FIXTURE_FILE"
node --input-type=module - "$EARLY_BASELINE_DIR" "$PWD" "$EARLY_FIXTURE_FILE" <<'JS'
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const report = JSON.parse(await readFile(process.argv[3] + '/benchmark/reports/early-address-001.json', 'utf8'));
const hash = async (path) => createHash('sha256').update(await readFile(path)).digest('hex');
for (const [root, identity] of [[process.argv[2], report.baseline], [process.argv[3], report.after]]) {
  for (const [file, expected] of Object.entries(identity.coreFileSha256)) {
    if (await hash(root + '/' + file) !== expected) throw new Error('Core differs: ' + file);
  }
  if (await hash(root + '/benchmark/run.js') !== report.benchmarkToolSha256) {
    throw new Error('Benchmark runner differs');
  }
}
if (await hash(process.argv[4]) !== report.fixture.sha256) throw new Error('Expanded fixture differs');
if (await hash(process.argv[2] + '/benchmark/cases.jsonl') !== report.fixture.priorFixtureSha256) {
  throw new Error('Prior mixed-text fixture differs');
}
JS
```

Run the commands separately if the shell stops on a nonzero exit status:

```sh
node "$EARLY_BASELINE_DIR/benchmark/run.js" --fixtures "$EARLY_FIXTURE_FILE" --check
node benchmark/run.js --fixtures "$EARLY_FIXTURE_FILE" --check
```

The baseline intentionally exits **1** for **120/125** contracts; the matching after engine exits **0** for **125/125**. Check the unchanged prior denominator with:

```sh
node "$EARLY_BASELINE_DIR/benchmark/run.js" --fixtures "$EARLY_BASELINE_DIR/benchmark/cases.jsonl" --check
node benchmark/run.js --fixtures "$EARLY_BASELINE_DIR/benchmark/cases.jsonl" --check
```

Both pass **119/119** prior contracts. These two dated reports retain distinct fixture and engine identities; use `npm run benchmark -- --check` for the latest checkout rather than a historical result.
