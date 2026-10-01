# Source-assisted development review — 2026-10-01

The maintainer delegated completion of the [100-case development batch](review-batch.md) to a source-assisted review. **86 cases now have frozen project development references:** 74 words and 12 sentences. Fourteen cases are excluded, and no case remains waiting for the maintainer to identify a word.

These references support choosing and measuring the next engine changes. They are assistant research with maintainer authorization, not two independent human reviews or a representative held-out accuracy corpus. The original cases and earlier dated reports remain intact. No conversion rule changes in this review.

## Decisions and evidence

| Mode | Accept original proposal | Correct or add alternatives | Exclude | Waiting for clarification | Admitted |
| --- | ---: | ---: | ---: | ---: | ---: |
| Words | 67 | 7 | 6 | 0 | 74 |
| Sentences | 0 | 12 | 8 | 0 | 12 |
| **Total** | **67** | **19** | **14** | **0** | **86** |

The [frozen case ledger](../../benchmark/reports/nepali-source-review-2026-10-01.json) records each decision, exact-source hashes, reason, confidence, reference alternatives, evidence URLs, access scope and verification date. It contains 153 evidence entries referencing 138 distinct URLs. Sources were freshly checked for 81 cases; other entries reuse the [2026-09-27 research](assisted-online-review.md) with its original dates and access limits. A search-index excerpt is labelled as such; it is not described as a full page or visual PDF inspection.

Research used original Nepali material from courts, government offices, educational publications, municipalities and publishers. For example, the [Office of Company Registrar](https://ocr.gov.np/pages/registration/) attests कम्पनी and कम्पनीको; a [Nepal Telecom financial report](https://cms.ntc.net.np/storage/media/gM01GEEPTnfUBHHTAipjQnUzCoLkFXP3pcIQUX4n.pdf) provides indexed corroboration for कम्पनीहरूमाथि. The [Film Development Board](https://film.gov.np/destination/11) attests स्कुलमा, while the [APF association](https://wfa.apf.gov.np/) uses both स्कुलमा and स्कूलमा. Such usage supports a spelling or component; it does not prove one universal spelling or validate an entire sentence's factual content.

Three research passes inspected the original pairs, earlier research and relevant maintainer notes without consulting the current engine diagnostics. The consolidated references were frozen before the current measurement. Previous assistant research was reused, so the passes do not establish reviewer independence. The 21 existing Sheet A entries remain unchanged; their blank review dates were preserved rather than filled in retrospectively.

## Valid alternatives

Five word cases retain more than one usage-supported reference. None is assigned a unique preferred default without context.

| Input | Valid references | Reason |
| --- | --- | --- |
| `shanta` | शान्ता, शान्त | Personal name and adjective; the maintainer already identified both readings. |
| `mahila` | माहिला, महिला | Distinct readings, including the maintainer's additional reading. |
| `schoolma` | स्कूलमा, स्कुलमा | Two attested loanword spellings with the locative suffix. |
| `angrejharuko` | अंग्रेजहरूको, अङ्ग्रेजहरूको | Attested nasal spelling variants. |
| `bhagna` | भाग्न, भग्न | Infinitive “to flee” and the separate “broken” reading. |

The two other word corrections prefer **चिन्तामन** for `chintaman` and **माझी** for `manjhi` in this Nepali development set. Evidence for the original proposals relied on Hindi or native-name spellings; current Nepali usage supports the corrected forms. The ledger keeps that distinction and does not claim to identify the intended person from an isolated Roman name. Original Nepali reporting uses [दशरथ माझी](https://www.onlinekhabar.com/2023/06/1322276/mountain_man).

One sentence has two valid spacing references for स्रोतअनुसार / स्रोत अनुसार, with the joined form preferred. This produces **79 listed word references across 74 cases** and **13 sentence references across 12 cases**. References list observed valid readings, not every possible interpretation.

## Sentence corrections

The sentence source can add words that the Roman input does not contain. Clear corrections remove source-added सबैभन्दा (`ne_151`), सुट (`ne_168`) and स्वदेशी (`ne_381`); `dekhaunchha` uses देखाउँछ rather than source देखाउँदछ (`ne_231`). These are input–reference alignment repairs, rather than engine defects.

Literal periods and supplied spacing remain part of the references. Ordinary years use the predeclared Devanagari digit default; punctuation is not silently converted to danda. Hindi and Marathi sources are used only for identified name components where Nepali evidence is lacking, with cross-language scope and medium confidence recorded. Historical, financial and sports assertions in the sentences were not fact-checked.

Complete sentence inputs, proposals, references and engine outputs remain in ignored local research files. The public ledger contains IDs, hashes and small patches to the original proposals. Offsets are JavaScript UTF-16 positions. Applying those patches to the pinned local source reproduces the exact reviewed reference and checks its SHA-256. The original dataset attribution and underlying-text limitation are preserved.

## Exclusions

Excluded cases remain in the ledger and original batch, but have no scored references.

| Word input | Why excluded |
| --- | --- |
| `bhaktapurrajyama` | Fuses भक्तपुर and the separate word राज्यमा; the cited phrase has a space. |
| `elakama` | The paired एलाकामा does not align with the attested इलाकामा. |
| `warshadaikhi` | The pair has दैखि where the ordinary form uses देखि. |
| `mauribhiralgayatma` | The Roman `al` / `la` sequence does not align with the place name plus लगायतमा. |
| `banaesange` | The supplied ending does not match the attested बनाएसँगै. |
| `suttner` | No independent primary Nepali surname spelling verified; this is insufficient evidence, not a misspelling verdict. |

Sentence exclusions are `ne_75`, `ne_400`, `ne_360`, `ne_41`, `ne_29`, `ne_77`, `ne_389` and `ne_210`. Their individual reasons identify missing consonants, malformed words, added source words or unresolved foreign place-name alignment. Spelling lookups cannot recover the writer's intent from those defects, so neither the input nor its intended repair is invented.

## Current engine baseline

The [measurement report](../../benchmark/reports/nepali-source-review-baseline-2026-10-01.json) evaluates unchanged engine commit `4e20b34cbb5ce943189051cd4acf23f185adecb3` with its starter entries, default Devanagari digits and technical-text preservation, on Node.js v22.22.3. Core and tool hashes, source batch hash and frozen ledger hash identify the run.

| Metric | Result | Denominator |
| --- | ---: | --- |
| Word default matches any reference | **8/74** | Admitted word cases |
| Word cases with any reference in candidates | **8/74** | Admitted word cases |
| Word cases with all listed references in candidates | **7/74** | Admitted word cases |
| Listed word-reference candidate coverage | **8/79** | Individual listed word references |
| Preferred word default | **7/69** | Cases with a preferred reference; five ambiguous cases omitted |
| Exact complete sentence output | **0/12** | Admitted sentence cases, allowing either valid spacing reference |

These low results expose substantial remaining work for the selected development inputs. They are not population accuracy estimates. This is a new reviewed denominator with corrected references and exclusions, so comparing it directly with the old 7/100 unreviewed-proposal score would be misleading. No before/after engine improvement is claimed.

Examples of confirmed differences against the reviewed references:

| Input | Current output | Reviewed output |
| --- | --- | --- |
| `companyharumathi` | चोम्पञ्हरुमथि | कम्पनीहरूमाथि |
| `schoolma` | स्चूल्म | स्कुलमा / स्कूलमा |
| `mediasanga` | मेदिअसङ | मिडियासँग |
| `niskanda` | निस्कन्द | निस्कँदा |
| `gaunle` | गौन्ले | गाउँले |
| `dindaina` | दिन्दैन | दिँदैन |

The first implementation priority is reviewed loanword forms with attached Nepali suffixes. Exact `company` support does not cover `companyharumathi`. Follow with source-supported vowel/nasal forms and valid alternatives. Keep the existing Shift and explicit-mark controls working; these informal corpus spellings do not automatically justify changing the deterministic key rules. Add focused regression cases, compare on these frozen references, and disclose remaining failures.

## Reproduce or measure a later engine

First regenerate the exact original `cases.jsonl` using the pinned downloads and [batch instructions](review-batch.md#prepare-the-batch). Do not regenerate into the directory holding edited review sheets. The published ledger expects original batch SHA-256 `2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3`.

From the repository root:

```sh
npm run benchmark:source-reviewed
npm run benchmark:source-reviewed -- \
  --cases benchmark/data/review-batch-001/cases.jsonl \
  --review benchmark/reports/nepali-source-review-2026-10-01.json \
  --output benchmark/data/source-review-current.json
```

The [runner](../../benchmark/source-reviewed.js) checks the complete batch hash, every original ID and exact-string hashes, review provenance, nonempty evidence, exclusions, reference bounds and reconstructed hashes. It never normalizes away vowels, joiners, punctuation or whitespace. `--output` refuses an existing file, protecting earlier measurements.

Mismatches print counts and exit successfully because this is a development measurement, not a regression gate. Invalid data or an existing output file exits with code 2. CI continues to run the seed contract gate and tests for the review tooling; it does not silently download or score the ignored corpus. New measurement files contain current source hashes. To reproduce this dated baseline, use an engine checkout matching the recorded core hashes and the recorded tool version.

A future independent, consented real-typing corpus remains separate work before publishing representative accuracy claims. This completed source-assisted review is sufficient to start the next documented development corrections.
