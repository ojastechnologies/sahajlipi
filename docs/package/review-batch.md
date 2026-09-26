# First Nepali development review batch

This batch prepares **100 source proposals for Nepali-language review**: 80 words and 20 sentences. It is development data for diagnosing the current engine and deciding what to improve. Every selected case starts unreviewed; no proposed spelling is an accepted answer yet. Agreement with these proposals is **not an accuracy estimate**. The [recorded first diagnostic run](review-batch-baseline.md) gives the selection counts and initial breakdown.

## Prepare the batch

Run from the repository root with Node.js 18 or later. Follow the [external-data download instructions](external-evaluation.md) to obtain the pinned Aksharantar archive, extract its test file, and export the Bhasha-Abhijnaanam sentence review queue. Then extract the development word file and generate a new batch:

```sh
unzip -p benchmark/data/aksharantar-nep.zip nep_valid.json > benchmark/data/nep_valid.json
npm run benchmark:review-batch -- \
  --words benchmark/data/nep_valid.json \
  --test benchmark/data/nep_test.json \
  --sentences benchmark/data/nepali-sentence-review.jsonl \
  --output benchmark/data/review-batch-001
```

The generator refuses an existing output directory. Use a new path when rerunning so review edits remain intact. Raw inputs and generated review files live under the ignored `benchmark/data/` directory and are excluded from the distributed package.

### Sources and selection

The word source is `nep_valid.json` from [AI4Bharat's Aksharantar](https://huggingface.co/datasets/ai4bharat/Aksharantar) at revision `e418c1fc928d9f5393af33268472cf20c1891be8`. Its SHA-256 is `9bc1c65df08c5f41eb61ffeaf631bf1bc3820c64ef71ae54b4868c5ac3ea9be7`. The pinned file has 2,804 rows: 1,989 IndicCorp, 525 AK-Freq, 279 AK-Uni, and 11 Wikidata. The generator checks the pinned input before selecting cases. It also verifies the original 423-item unreviewed sentence queue, whose SHA-256 is `362e56b6e24f4614731da2d30b2d62d47c0b71d42c46815c67368386425f4d37`; edited queues must not be used to regenerate this batch.

| Source | Selected cases |
| --- | ---: |
| Aksharantar AK-Freq | 40 words |
| Aksharantar AK-Uni | 25 words |
| Aksharantar Wikidata | 5 words |
| Aksharantar IndicCorp | 10 words |
| Bhasha-Abhijnaanam review queue | 20 sentences |
| **Total** | **100** |

Selection ranks eligible records with seeded SHA-256 using `sahajlipi-nepali-review-001`. The ranking is independent of the engine's output: the same eligible inputs and seed select the same cases after an engine change. Sentence candidates must remain unreviewed and contain 3–20 whitespace-delimited Roman-input tokens. Exact duplicate development word pairs are removed. The original Roman input and source proposal are preserved without spelling, punctuation, case, or spacing edits.

Before selecting words, the generator excludes development records that share either a Roman spelling or a native spelling with the pinned Aksharantar test file. This overlap check trims, lowercases, and NFC-normalizes Roman strings; it NFC-normalizes native strings and removes ZWJ and ZWNJ. These comparison keys do not change the stored source strings. The test references serve only to detect overlap; use the development cases to choose changes and keep the test labels out of that process.

These quotas deliberately cover different source categories. They do not reflect how frequently people type those words. The sentence queue comes from prompted romanization for a language-identification dataset and can contain changed or missing words. There is no naturally typed, consented collection in this batch. See [external evaluation](external-evaluation.md) for dataset attribution, terms, and known source limitations.

## Generated files

| File | Purpose |
| --- | --- |
| `cases.jsonl` | Selected cases, source provenance, `purpose: "development"`, `reviewStatus: "unreviewed"`, empty `reviews`, and empty `acceptedOutputs`. |
| `reviewer-a.jsonl`, `reviewer-b.jsonl` | Separate review copies for independent decisions, without engine output. |
| `reviewer-a.md`, `reviewer-b.md` | Readable review sheets with Roman input and source proposal, without engine output. |
| `diagnostics.json`, `diagnostics.md` | Engine output, agreement with unreviewed source proposals, and observable mismatch signals. |
| `manifest.json` | Source provenance, selected IDs, selection details, engine/tool hashes, runtime metadata, diagnostic summary, and artifact hashes. |

Give each reviewer only their own review files. Keep the diagnostics separate until both independent decisions have been recorded so the engine's current output does not influence the proposed answers.

## Review and reconcile

Two proficient Nepali reviewers should judge each Roman input and its source proposal independently. Each decision should record a stable reviewer ID, review date, decision (`accept`, `correct`, or `exclude`), suggested outputs, and a reason. A source proposal may be one valid answer among several, or the pair may not preserve the intended meaning. Record acceptable alternatives explicitly instead of forcing every input to have one spelling.

Append a completed entry to the case's `reviews` array in the reviewer's own JSONL copy, using these keys. This illustrative entry is a template, not a decision on any batch case:

```json
{
  "reviewerId": "reviewer-a",
  "reviewedAt": "2026-09-26",
  "decision": "correct",
  "suggestedOutputs": ["नमस्ते"],
  "reason": "Replace this with the reason for correcting the source proposal."
}
```

Use a stable reviewer ID and an ISO date for `reviewedAt`. Leave `acceptedOutputs` empty during independent review.

After both reviews, reconcile disagreements in `cases.jsonl`. Set `reviewStatus` to `accepted`, `corrected`, or `excluded`; fill `acceptedOutputs` only for admitted cases. Keep both reviews, reasons, source IDs, and any source correction. No case is a confirmed regression expectation until reconciliation is complete. The entire batch remains development data after review; reserve a separate reviewed set before making future accuracy claims.

## Use the error breakdown

The diagnostics compare the default output with the original, unreviewed source proposal using exact strings. For words, they also report whether the proposal appears in the returned candidates. Sentences have a single text-conversion output; word candidate agreement does not measure sentence candidate coverage.

Each case gets one primary signal using the table's order of precedence. Primary counts sum to the batch size; the full signal flags can overlap.

| Primary signal, in precedence order | Observable condition |
| --- | --- |
| `exact-match` | Default output equals the source proposal exactly. |
| `candidate-only` | A word's source proposal occurs in the returned candidates while the default differs. |
| `formatting-only` | Strings become equal after NFC normalization and removal of ZWJ and ZWNJ. |
| `punctuation-only` | Strings become equal after those formatting steps plus removal of Unicode punctuation and whitespace. |
| `final-virama` | Default output has more viramas immediately before the end of text, whitespace, or Unicode punctuation than the proposal. |
| `vowel-marks-only` | Strings become equal after removing only the dependent vowel signs `ािीुूृॄॅेैॉोौ`. |
| `shift-convention` | Roman input is lowercase, the source proposal contains ट, ठ, ड, ढ, or ष, and the default differs. |
| `other-mismatch` | Default differs and none of the preceding primary conditions applies. |

| Additional flag | Observable condition |
| --- | --- |
| `roman-collision` | Selected word cases share a trimmed, lowercase, NFC-normalized Roman spelling but have different source proposals. |
| `token-count-difference` | A sentence's Roman input and source proposal have different whitespace-delimited token counts. |

Formatting and punctuation comparisons are diagnostic only; they never change the exact-agreement counts or stored strings. The final-virama signal counts boundary viramas and does not require the rest of the strings to match.

These signals are hints for review, not established causes such as a missing lexical entry or a faulty phonetic rule. A mismatch can reflect ambiguity, a different typing convention, or a defective source pair. Counts in this batch describe these 100 selected proposals and should not be extrapolated to all Nepali typing.

Once reviewers have confirmed outputs, group recurring admitted errors, choose a focused correction, and add regression cases that also protect Shift shortcuts and existing alternatives. Compare before and after on the accepted development cases, disclose the reviewed denominator and exclusions, and report remaining failures. Keep source-proposal agreement separate from reviewed-output agreement. The batch generator itself changes neither the engine nor the browser demo.
