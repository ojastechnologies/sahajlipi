# First development batch: source-proposal agreement

Generated on 2026-09-26 using the default core engine at commit `64c49af3f3b160d3704d1cdd94c6a8e266042948` and v22.22.3.
The working tree contained evaluation-tooling and documentation changes; the core engine files were unchanged. Their exact hashes, source pins, selection details, selected source IDs, and generated artifact hashes are in the [run manifest](../../benchmark/reports/nepali-review-001.json).

**All 100 cases remain unreviewed.** The following counts compare the engine with source proposals, not accepted linguistic labels. They are not an accuracy estimate or confirmed root causes. The batch contains 80 validation words and 20 prompted sentence candidates; it contains no naturally typed, consented examples.

## Selection audit

- Pinned Aksharantar validation source: 2,804 word pairs.
- Excluded for Roman or native overlap with the existing word test: 25 pairs (20 Roman overlaps and 12 native overlaps; these counts overlap).
- Exact duplicate development pairs after overlap exclusion: 0.
- Selected word quotas: AK-Freq 40, AK-Uni 25, IndicCorp 10, Wikidata 5.
- Pinned sentence queue: 423 records; 352 have 3–20 Roman-input whitespace tokens; 20 selected.
- Seed: `sahajlipi-nepali-review-001`. Selection uses source identities before engine diagnostics.

## Exact source-proposal agreement

| Mode | Cases | Default output equals proposal | Word proposal in returned candidates |
| --- | ---: | ---: | ---: |
| Word | 80 | 7 | 7 |
| Sentence | 20 | 0 | Not measured |
| Total | 100 | 7 | Not a sentence candidate measure |

## Primary diagnostic signals

Each case appears in one primary group using the precedence documented in the [review guide](review-batch.md#use-the-error-breakdown). A primary group is an observable signal selected for triage; it does not establish why a spelling differs.

| Primary signal | Cases |
| --- | ---: |
| `exact-match` | 7 |
| `candidate-only` | 0 |
| `formatting-only` | 0 |
| `punctuation-only` | 0 |
| `final-virama` | 31 |
| `vowel-marks-only` | 18 |
| `shift-convention` | 9 |
| `other-mismatch` | 35 |

Additional nonexclusive signals flag 14 mismatches whose lowercase Roman input is paired with a reference containing a retroflex consonant or ष, and 8 sentences whose Roman and source-proposal whitespace token counts differ. These observations can coexist with another primary signal; they are not additional cases.

## Review before changes

The extra word-final virama and vowel-sign groups are useful places for reviewers to start. SahajLipi intentionally keeps an unvoweled consonant half and distinguishes explicit vowel lengths. A dataset spelling may omit vowels that the current key convention requires, so each proposed change needs confirmed readings and an explanation of how existing shortcuts are preserved.

Use the separate reviewer files described in the [review guide](review-batch.md). Reviewers should work independently, record accepted alternatives or exclusions, and reconcile disagreements. Confirmed cases remain development data; a separate reviewed held-out collection is still needed for future quality claims.

Regenerate the local artifacts with the documented command. Source rows and reviewer files stay under the ignored `benchmark/data/` directory. Only aggregate counts and the manifest are committed. No engine or demo behavior changes are included in this batch.
