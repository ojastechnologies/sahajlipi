# Mixed-text benchmark record — 2026-09-27

This record measures whether the default whole-text converter follows the selected mixed-text preservation contract. The [API guide](api.md#links-domains-and-email-addresses) defines recognized address shapes, punctuation boundaries, and the engine opt-out. The [machine report](../../benchmark/reports/mixed-text-001.json) records exact inputs and outputs, per-set counts, engine and fixture identities, changed case IDs, commands, and limitations.

These are project-authored **software behavior contracts**. No independently reviewed linguistic labels were added, and the result is not a Nepali accuracy, timing, or browser-compatibility score.

## Recorded results

Recorded on 2026-09-27 using Node.js v22.22.3 on Darwin arm64. The baseline is commit `4e6cc4eed855f0d97bff366c619e5f4eff50e2a8`, extracted with `git archive`. The after run used a modified working tree based on that commit; its core files are pinned by SHA-256 in the report rather than assigned an uncreated commit identity.

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

Use Node.js 18 or later and a checkout containing this recorded after engine, fixture, and report. Run from the repository root. These commands intentionally verify hashes first: a later engine or fixture will fail verification instead of silently changing this dated comparison.

```sh
MIXED_BASELINE_DIR=$(mktemp -d)
MIXED_FIXTURE_FILE=$(mktemp)
git archive 4e6cc4eed855f0d97bff366c619e5f4eff50e2a8 | tar -x -C "$MIXED_BASELINE_DIR"
cp benchmark/cases.jsonl "$MIXED_FIXTURE_FILE"
node --input-type=module - "$MIXED_BASELINE_DIR" "$PWD" "$MIXED_FIXTURE_FILE" <<'JS'
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
node benchmark/run.js --fixtures "$MIXED_FIXTURE_FILE" --check
```

The baseline intentionally exits with code **1** for **110/119** contracts; the recorded after engine exits with code **0** for **119/119**. Check the original denominator separately:

```sh
node "$MIXED_BASELINE_DIR/benchmark/run.js" --fixtures "$MIXED_BASELINE_DIR/benchmark/cases.jsonl" --check
node benchmark/run.js --fixtures "$MIXED_BASELINE_DIR/benchmark/cases.jsonl" --check
```

Both commands pass **109/109** original contracts. Exploratory rows are printed but do not fail the gate. For the latest working tree rather than this dated comparison, run `npm run benchmark -- --check`; use `npm test` for the separate functional suite.

## Scope limits

The policy infers recognizable ASCII host and email shapes without DNS, public-suffix validation, full URL/email validation, or network access. Domain-shaped Roman words can therefore be preserved. Unrecognized code, filenames, arbitrary English, and Unicode hostnames/mailboxes have no general literal-text guarantee. See the [typing reference](typing-reference.md#mixed-text-and-literal-english) for explicit English controls.

This report measures default `convertText` only. Opt-out behavior, custom-entry precedence, the unchanged `convertWord` API, and browser live-editing paths are separate functional-test concerns. No new external linguistic comparison, independently reviewed corpus labels, mobile/browser support claim, assistive-technology result, or performance result is established. The [earlier month](month-benchmarks.md), [loanword](loanword-benchmarks.md), and [ra-ya](ry-review.md) results retain their original dated counts and evidence.
