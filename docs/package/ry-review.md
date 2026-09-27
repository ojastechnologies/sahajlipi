# Nepali ra-ya changes and review — 2026-09-27

This change implements ten exact Roman word mappings and preserves explicit Shift sounds during lookup. The entries are **source-assisted project preferences authorized for implementation**. They are not independently human-verified corpus labels. All 100 original development cases remain unreviewed, and no accepted outputs or reviewer decisions were changed.

## Scope and spelling evidence

The engine keeps ordinary र्य for the phonetic fallback. Specific complete words use र्‍य with U+200D after the virama. [Unicode 17.0, chapter 12, rule R5a](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-12/) describes the encoding mechanism; it does not assign Nepali spellings word by word. The visible glyph still depends on the font and shaping engine.

| Exact input | Preferred output | Consulted usage source |
| --- | --- | --- |
| `garyo` | गर्‍यो | [Nepal Kanoon Patrika — court decision](https://nkp.gov.np/full_detail/9337) |
| `maryo` | मर्‍यो | [Nepal Kanoon Patrika — court decision](https://nkp.gov.np/full_detail/9028) |
| `maaryo` | मार्‍यो | [Nepal Kanoon Patrika — court decision](https://nkp.gov.np/full_detail/9028) |
| `bharyo` | भर्‍यो | [Nagarik — opinion article](https://nagariknews.nagariknetwork.com/opinion/171387-1550462880.html) |
| `taryo` | तर्‍यो | [Nepal magazine — recollection](https://nepalmag.com.np/feeling/2017/01/23/20170123180759) |
| `saryo` | सर्‍यो | [Gorkhapatra — news headline](https://gorkhapatraonline.com/news/64479) |
| `puryaunu` | पुर्‍याउनु | [District Administration Office Parsa — procedure heading](https://daoparsa.moha.gov.np/en/post/saraka-ra-jaga-ga-pa-ra-pa-ta-gara-tha-pa-ra-ya-una-para-na-va-thha-pa-raka-ya) |
| `puryaaunu` | पुर्‍याउनु | [District Administration Office Parsa — procedure heading](https://daoparsa.moha.gov.np/en/post/saraka-ra-jaga-ga-pa-ra-pa-ta-gara-tha-pa-ra-ya-una-para-na-va-thha-pa-raka-ya) |
| `bharyang` | भर्‍याङ | [Nepal Kanoon Patrika — court decision](https://nkp.gov.np/full_detail/9853) |
| `bharyaanga` | भर्‍याङ | [Nepal Kanoon Patrika — court decision](https://nkp.gov.np/full_detail/9853) |

Published occurrences establish the stated Nepali word usage. They do not prove that every typist intends the same word from the informal Roman input. Source URLs, scope, access level and exact Unicode code points are preserved in the [machine report](../../benchmark/reports/nepali-ry-001.json).

- `maryo` and `maaryo` remain distinct: मर्‍यो and मार्‍यो.
- `puryaunu` is a listed shortcut for the long-aa sequence in पुर्‍याउनु; the ordinary `au` token still produces औ. `puryaaunu` writes the long vowel explicitly.
- `bharyang` supplies long आ and a complete final ङ; `bharyaanga` explicitly types both vowels. The fallback still keeps a bare final consonant half.
- `kaarya`, `suurya`, `saundarya`, `aachaarya`, `dhairya`, and `maurya` retain their ordinary conjuncts.
- Entries apply to complete words. Inflections and fused compounds need separate review; `/=` remains available for explicit joiner input.

The [package typing reference](typing-reference.md#र्य-and-र्‍य) documents the keys. The [demo guide](../demo/README.md) documents the playground that consumes this engine.

## Reserved Shift keys

Lookup first tries the exact normalized spelling. It uses a lowercase spelling only when no reserved sound key survives normalization. `T`, `D`, `S`, `R`, and vowel-following `H` therefore retain their explicit sounds even when a lowercase word is known.

| Keys | Output | Reason |
| --- | --- | --- |
| `Garyo` | गर्‍यो | G is incidental capitalization |
| `Saryo` | षर्यो | S explicitly selects ष |
| `gaRyo` | गऋयो | R explicitly selects ऋ |
| `baHini` | बःइनि | H after a vowel explicitly selects visarga |
| `Ram` / `Sita` | राम / सीता | Explicit aliases preserve these existing name readings |

This also corrects an existing lookup inconsistency: previously a known lowercase word could swallow `S`, `R`, or vowel-following `H`. Custom entries with the exact shifted key still take priority. Existing `Ram` and `Sita` examples retain their previous outputs through explicit aliases. Customizing lowercase `ram` or `sita` updates the corresponding alias unless an exact normalized cased override is supplied. Apps relying on other capitalization to select a lowercase known word should type that word in lowercase, or provide an exact custom entry.

## Recorded results

Run date: 2026-09-27; Node.js v22.22.3. Baseline: `e029d02af98f3af5fde2b656fc0a0f1a5cb86912`. The after run used a modified worktree based on that commit; the machine report identifies the exact engine and tool files by SHA-256. The phonetic module is byte-for-byte unchanged.

| Check | Before | After | Interpretation |
| --- | ---: | ---: | --- |
| Original seed contracts | 28/28 | 28/28 | Existing project behaviors preserved |
| Same final seed contracts | 38/50 | 50/50 | Fixed 50-contract denominator, including the new decisions and Shift guards |
| Final word top output | 36/47 | 47/47 | Exact preferred output on these selected contracts |
| Final expected candidate coverage | 37/48 | 48/48 | Required readings present; extra candidates are allowed by this metric |
| Final text contracts | 2/3 | 3/3 | Exact text including vowels and punctuation |
| Exploratory seed proposals | 0/2 | 0/2 | `janchu` and `padhchhu` remain unreviewed and outside the gate |
| Functional tests | 100/100 | 122/122 | Software regressions, not language accuracy |
| Original development source proposals | 7/100 | 7/100 | 7/80 word matches; 0/20 sentence matches; every source proposal unreviewed |
| Pinned Aksharantar test | 279/4,101 | 279/4,101 | Descriptive exact agreement; top and candidate counts unchanged |

The final fixture has 52 cases: 50 contracts and two exploratory proposals. The 22 added contracts cover ten exact word mappings, six ordinary-conjunct controls, two explicit joiner controls, one text case and three reserved Shift checks. Tests assert complete candidate arrays where a single reading is intended; the seed runner measures candidate coverage rather than precision.

The only changed output in the frozen 100-case development cohort is `sentence:ne_348`, whose `garyo` fragment gains the joiner. Other word/formatting differences still prevent a complete source-proposal match. The report uses the original proposals, not the assistant’s suggested replacements.

An automated overlap audit found zero Roman-key overlaps and zero native-output overlaps for the ten new word mappings against the pinned test set, after NFC normalization and joiner removal for the exclusion check. Scoring itself remains exact and does not remove joiners. `Ram` and `Sita` are aliases for pre-existing readings, not new vocabulary. Test labels were used only for overlap checks and aggregate scoring; no entries were chosen from test misses.

A local desktop Chromium check verified key-by-key typing, Backspace across lookup, candidate selection, literal English mode, marked/excluded fields, reserved Shift keys and name aliases, manual joiner keys, punctuation and layout width at 390 pixels. This does not establish a mobile-keyboard, assistive-technology or cross-browser support matrix, or certify a font-specific glyph shape.

<a id="remaining-spelling-ambiguities"></a>

## Dataset quality and contextual cases

The maintainer flagged the original seven unresolved validation tokens as likely misspellings. Six are now tracked as **suspected source misspellings or malformed tokens**; `dharyo` remains a separate contextual case because Nepali literary usage was found. These observations do not establish converter defects or block the targeted ra-ya change.

Keep these seven outside new spelling contracts until their intended input/output pairs are confirmed. Preserve the original source records, historical classifications and raw source-proposal agreement counts. No corrected output, canonical exclusion or independent language review has been admitted. The follow-up also covers two related cases (`zimmowarybata` and `lepryaundai`); the evidence below supplies candidates or occurrences, never automatic corpus corrections. Source IDs and input spellings identify development records from [AI4Bharat Aksharantar](https://huggingface.co/datasets/ai4bharat/Aksharantar). Its CC BY attribution and data terms are separate from the MIT code license.

| Source ID / input | Review disposition | Evidence and remaining question |
| --- | --- | --- |
| `nep1528` / `nachaunupathryo` | Suspected source error: consonant order | The published occurrence and the separately attested पर्थ्यो differ in consonant order; a joiner cannot decide the intended spelling. [Pathibhara Area Development Committee – temple history and beliefs](https://pathivara.gov.np/) (search-snippet) |
| `nep1699` / `gaukarya` | Suspected malformed source: boundary | An official heading supports गाउँ कार्यपालिका, but the isolated abbreviated/fused token remains unverified. [Surnaya Rural Municipality – site map](https://sunaryamun.gov.np/sitemap) (full-page) |
| `nep1952` / `karyakrammale` | Suspected malformed source: ending | कार्यक्रमले and कार्यक्रममा are attested contextual alternatives; the intended ending needs its original sentence. [PMAMP PIU Mustang – third-quarter progress report](https://piumustang.pmamp.gov.np/sites/default/files/2025-04/%E0%A4%A4%E0%A5%87%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A5%8B%20%E0%A4%A4%E0%A5%8D%E0%A4%B0%E0%A5%88%E0%A4%AE%E0%A4%BE%E0%A4%B8%E0%A4%BF%E0%A4%95%20%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%97%E0%A4%A4%E0%A5%80_PMAMP%20PIU%20Mustang.pdf) (search-snippet) |
| `nep2212` / `zimmowarybata` | False ry hit; lexical hold | The native label has री rather than र्य. जिम्मेवारीबाट is an official attested spelling candidate, not an accepted rewrite. [Nepal Kanoon Patrika – Decision No. 10191, उत्प्रेषण](https://nkp.gov.np/full_detail/9243) (full-page) |
| `nep2234` / `lepryaundai` | Printed lexeme attested; encoding/mapping hold | An official Grade 7 textbook prints लेप्र्याउँदै. Legacy font encoding does not establish ZWJ bytes or the informal Roman vowel/nasal mapping. [Curriculum Development Centre – नेपाली, कक्षा ७, lesson 11 ‘अबोध’](https://learning.cehrd.gov.np/pluginfile.php/164/mod_resource/content/1/grade%207%20Neplai.pdf) (full-page) |
| `nep2271` / `shaundaryikaran` | Suspected source misspelling: initial consonant | Legal prose attests सौन्दर्यीकरण with स; the original श spelling also occurs. Intended input and normative spelling need review. [Nepal Law Commission – Solid Waste Management Act, chapter 4](https://repository.lawcommission.gov.np/np/documents/prevailing-law/statutes-acts/%E0%A4%AB%E0%A5%8B%E0%A4%B9%E0%A4%B0%E0%A4%AE%E0%A5%88%E0%A4%B2%E0%A4%BE-%E0%A4%B5%E0%A5%8D%E0%A4%AF%E0%A4%B5%E0%A4%B8%E0%A5%8D%E0%A4%A5%E0%A4%BE%E0%A4%AA%E0%A4%A8-%E0%A4%90%E0%A4%A8-%E0%A5%A8/%E0%A4%AA%E0%A4%B0%E0%A4%BF%E0%A4%9A%E0%A5%8D%E0%A4%9B%E0%A5%87%E0%A4%A6-%E0%A5%AA-99/) (search-snippet) |
| `nep2294` / `dharyo` | Contextual word: sense/joiner unresolved | TU literary analyses attest धर्यो in Nepali verse, improving the earlier evidence. They do not settle this isolated input’s sense or preferred joiner. [Tribhuvan University repository – Nepali ghazal rhythm analysis, section 3.7.1.1](https://elibrary.tucl.edu.np/bitstreams/a7808749-5a58-4370-8539-29d54d22b609/download) (search-snippet) |
| `nep2387` / `karyatkramma` | Suspected source misspelling: extra consonant | कार्यक्रममा is a conditional comparison; deleting the source’s internal त requires contextual review. [Kantipur – जनकपुर साहित्य महोत्सव हुँदै](https://ekantipur.com/literature/2021/02/12/161312926396965039.html) (search-snippet) |
| `nep2412` / `judhnupathryo` | Suspected source error: consonant order | The थ-र-य order differs from पर्थ्यो; occurrence in opinion prose does not settle a correction. [Pathibhara Area Development Committee – temple history and beliefs](https://pathivara.gov.np/) (search-snippet) |

The textbook occurrence of लेप्र्याउँदै was visually checked on printed page 121 (PDF page 125). Its legacy text encoding separates lexical evidence from Unicode encoding evidence. The complete follow-up records in the machine report disclose indexed-only sources, failed retrievals, candidate scope and assistant review status. No canonical review decision was admitted.

## Reproduce the checks

This dated record uses two frozen revisions and the **recorded after revision's 50-contract fixture**. The current engine and fixture have since changed; see the [loanword benchmark record](loanword-benchmarks.md) for the latest 85-contract results. Run the following from a checkout containing both recorded commits. The snapshots are extracted into temporary directories and do not change the caller's checkout:

```sh
RY_BASELINE_DIR="$(mktemp -d /tmp/sahajlipi-ry-baseline.XXXXXX)"
RY_RECORDED_AFTER_DIR="$(mktemp -d /tmp/sahajlipi-ry-recorded-after.XXXXXX)"
git archive e029d02af98f3af5fde2b656fc0a0f1a5cb86912 | tar -x -C "$RY_BASELINE_DIR"
git archive 43b5a008366c943309f44bebfbae4e6df24f6173 | tar -x -C "$RY_RECORDED_AFTER_DIR"
node "$RY_BASELINE_DIR/benchmark/run.js" --fixtures "$RY_RECORDED_AFTER_DIR/benchmark/cases.jsonl" --check
node "$RY_RECORDED_AFTER_DIR/benchmark/run.js" --fixtures "$RY_RECORDED_AFTER_DIR/benchmark/cases.jsonl" --check
(cd "$RY_RECORDED_AFTER_DIR" && npm test)
```

The baseline seed command exits 1 and reports **38/50** contracts. The recorded after seed command exits 0 and reports **50/50** contracts; both retain the two exploratory misses. The test command runs the recorded after revision's **122 tests**. The frozen fixture SHA-256 is `437646bd9dd22c32d382318997906e29dce4b8087b458c901ec010d956f04eee`. To reproduce the original 28-contract baseline separately, run the baseline runner with its own fixture:

```sh
node "$RY_BASELINE_DIR/benchmark/run.js" --check
```

For the pinned public word comparison, download and verify the data using the [external evaluation guide](external-evaluation.md), then use each snapshot's own scorer:

```sh
RY_TEST_FILE="$PWD/benchmark/data/nep_test.json"
(cd "$RY_BASELINE_DIR" && node benchmark/aksharantar.js --data "$RY_TEST_FILE" --examples 0)
(cd "$RY_RECORDED_AFTER_DIR" && node benchmark/aksharantar.js --data "$RY_TEST_FILE" --examples 0)
```

Both frozen engines report **279/4,101** top and candidate matches. Extracted snapshots have no Git metadata. The scorer's optional revision lookup prints a `not a git repository` diagnostic and an unavailable revision label; the two commits above and the machine report's engine file hashes identify these engines. These counts reproduce the dated public-test comparison.

For the original development agreement, regenerate or use the preserved batch as described in the [review guide](review-batch.md). Its original case file must have SHA-256 `2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3`. Evaluate that same unchanged cohort with each snapshot's own diagnostic module:

```sh
node --input-type=module - "$RY_BASELINE_DIR" "$RY_RECORDED_AFTER_DIR" "$PWD/benchmark/data/review-batch-001/cases.jsonl" <<'JS'
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

Both report **7/100** exact source-proposal matches, with 7/80 word matches and 0/20 sentence matches. This prints aggregate counts without source sentences. Preserve source cases and edited reviewer sheets when creating or reusing a batch. The two temporary snapshot directories may be deleted when finished.

## Before a developer alpha

Complete proficient human review of the proposed mappings using the existing independent-review protocol. For a reviewed linguistic corpus, admit corrections, accepted alternatives and exclusions through that protocol separately from these software contracts. Suspected malformed entries may remain outside the approved corpus; resolving every source-quality diagnostic is not a prerequisite for this targeted core change. Then complete the real-browser/device support matrix and package/API/versioning checks in the [roadmap](../status-and-roadmap.md). This change supplies targeted implementation and evidence; it does not create a reviewed population-accuracy baseline or an npm release.
