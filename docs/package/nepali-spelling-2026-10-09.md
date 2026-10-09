# Reviewed native spellings — 2026-10-09

**Unreleased source update:** these spellings are available in this repository checkout and its demo. The published `sahajlipi@0.1.0-alpha.2` package does not include this batch. Package metadata still says alpha.2; use a [local development installation](getting-started.md#local-development-installation) to try the update. A future alpha publication will have its own release record.

This follow-up adds twelve exact native-word preferences and the missing भाग्न alternative for `bhagna`, using the [unchanged development references](source-review-2026-10-01.md). It follows the [earlier four-word update](nepali-spelling-2026-10-01.md). The repository engine and Nepali-enabled browser fields use the same entries.

The [new source ledger](../../benchmark/reports/nepali-spelling-research-2026-10-09.json) records the thirteen target IDs, frozen references, source checks on 2026-10-09, access limits and implementation order. These are source-assisted project preferences, with no independent human review or representative accuracy claim. Published usage attests a spelling in context; it does not establish the intended meaning of every isolated informal Roman input.

## Exact preferences and evidence

The twelve single-reading entries use their existing frozen preferred references. The linked sources below were checked for the whole spelling; two checks are limited to indexed PDF excerpts, as recorded in the ledger.

| Roman key | Alpha.2 output | New output | Source and access |
| --- | --- | --- | --- |
| `imandar` | इमन्दर | इमान्दार | [Kathmandu Metropolitan City](https://metronews.kathmandu.gov.np/news/detail/483), full HTML text |
| `sarasar` | सरसर | सरासर | [Nepal Kanoon Patrika, page 1654](https://nkp.gov.np/full_detail/1654), full HTML text |
| `sakos` | सकोस | सकोस् | [Kawasoti Agriculture](https://www.kawasotikrishi.gov.np/livestock-info/5218), full HTML text, final virama |
| `kathanak` | कथनक | कथानक | [Information and Broadcasting Department](https://doib.gov.np/pages/7981026/), full HTML text |
| `arambha` | अरम्भ | आरम्भ | [Tourism Department](https://tourismdepartment.gov.np/pages/tourism-destination/), full HTML text |
| `ekadhik` | एकधिक | एकाधिक | [IGNOU Nepali educational text](https://egyankosh.ac.in/bitstream/123456789/89717/3/Unit-1.pdf), indexed excerpt; PDF not inspected |
| `jaghanya` | जघञ | जघन्य | [Nepal Kanoon Patrika, page 10160](https://nkp.gov.np/full_detail/10160), full HTML text |
| `pukar` | पुकर | पुकार | [Nepal Police Aasara publication](https://www.nepalpolice.gov.np/media/filer_public/03/c6/03c6d652-1a18-4ce7-8136-05e6a608aec3/aasara_2079m.pdf), indexed excerpt; PDF not inspected |
| `niskanda` | निस्कन्द | निस्कँदा | [Makawanpur District Administration](https://daomakawanpur.moha.gov.np/en/post/sha-ra-jal-tatha-ma-sama-va-ja-nia-na-va-bha-ga-ma-sama-pa-ra-va-na-ma-na-maha), full HTML text, chandrabindu |
| `bora` | बोर | बोरा | [Nepal Kanoon Patrika, page 9177](https://nkp.gov.np/full_detail/9177), full HTML text, sack sense |
| `utthan` | उत्थन | उत्थान | [Nepal Kanoon Patrika, page 2438](https://nkp.gov.np/full_detail/2438), full HTML text |
| `samanjasya` | समन्जस्य | सामञ्जस्य | [Nepal Kanoon Patrika, page 2438](https://nkp.gov.np/full_detail/2438), full HTML text, ञ्ज conjunct |

`bhagna` keeps its existing displayed reading **भग्न** and now offers **भाग्न** as the second candidate. भग्न is attested in the [Lumbini Public Service Commission syllabus](https://ppsc.lumbini.gov.np/media/list/%E0%A4%95%E0%A4%B5%E0%A4%B0%E0%A4%9C_final.pdf), whose extracted PDF text was inspected; visual pages were not. The distinct infinitive भाग्न is attested in the [Kawasoti Agriculture article](https://www.kawasotikrishi.gov.np/livestock-info/5218), inspected as HTML text. The frozen reference order remains `[भाग्न, भग्न]` with no preferred reference. Engine order `[भग्न, भाग्न]` preserves the existing default and makes no frequency or unique-meaning claim.

## Typing and customization

Use the complete listed lowercase key. Incidental capitals such as `Imandar` and `Kathanak` follow existing normalization; reserved Shift sounds remain explicit. For example, `Sarasar`, `niSkanda` and `kaThanak` retain their phonetic readings. `samanjasya` supplies the reviewed ञ्ज cluster as a whole-word preference; it does not change the ordinary `ny` token.

These exact entries retain priority in both full and half consonant modes. Attached native forms such as `imandarko` use ordinary conversion unless the host supplies a complete custom entry. Vowel lengths, explicit nasal marks, backtick/slash halants, joiners, recognized loanword suffixes, protected addresses and literal English mode keep their existing behavior. The [typing reference](typing-reference.md#reviewed-native-word-spellings) lists the original four keys and this unreleased batch separately.

From this source checkout:

```js
import { convertWord, convertText, createEngine } from './src/index.js';

convertWord('niskanda');
// { text: 'निस्कँदा', candidates: ['निस्कँदा'], ambiguous: false }

convertWord('bhagna');
// { text: 'भग्न', candidates: ['भग्न', 'भाग्न'], ambiguous: true }

convertText('imandar niskanda sakos.');
// 'इमान्दार निस्कँदा सकोस्.'

const custom = createEngine({ entries: { bhagna: ['भाग्न', 'भग्न'] } });
custom.convertWord('bhagna').text; // 'भाग्न'
```

In browser fields, finish `bhagna` and choose भाग्न from the candidate dropdown or with `Alt+2` while the word is active. Space commits the displayed choice. The repository demo and marked fields use the same engine; English mode keeps subsequent Roman input literal.

## Recorded comparison

The [machine report](../../benchmark/reports/nepali-spelling-2026-10-09.json) compares the published alpha.2 source commit `48a0321bed417b1e995f66adbcbf9ade2c82f1cf` with this unreleased update. Both engines are measured on the same final seed fixture and the unchanged reviewed development references. Engine, fixture, tool, original batch and ledger hashes identify the comparison.

| Metric | Alpha.2 source | Unreleased update |
| --- | ---: | ---: |
| Same final seed contracts | 160/174 | 174/174 |
| Historical seed contracts | 160/160 | 160/160 |
| Reviewed word default matches any reference | 16/74 | 28/74 |
| Reviewed word cases with any reference in candidates | 16/74 | 28/74 |
| Reviewed word cases with all listed references in candidates | 15/74 | 28/74 |
| Individual reviewed word-reference coverage | 17/79 | 30/79 |
| Preferred reviewed word default | 14/69 | 26/69 |
| Exact complete reviewed sentences | 0/12 | 0/12 |

The final seed has **174 contracts and two exploratory cases**. Thirteen word contracts and one synthetic text guard are appended; all 162 historical rows remain byte-for-byte unchanged. The historical fixture stays at **160/160** for both engines. The new cases protect the chosen software behavior, including candidate coverage for `bhagna`.

The reviewed denominator stays at **74 admitted words / 79 listed word references** and **12 admitted sentences / 13 sentence references**, with 14 excluded cases. Twelve defaults improve; the `bhagna` default already matched a valid reference, and its additional candidate improves coverage. The targets guided implementation, so these gains describe development progress. **46 admitted word defaults and all 12 complete sentences still differ.** No new independently reviewed natural-typing sample or held-out accuracy result is added.

The ledger defers `mahila`, `shanta` and `angrejharuko`, whose listed alternatives do not specify a uniquely preferred default, plus contextual names and broader compounds. The [roadmap](../status-and-roadmap.md#priorities) tracks the remaining spelling work and independent typing evidence. Earlier dated measurements, original cases, review decisions and human review sheets retain their original contents.

## Software validation

Local validation on 2026-10-09 passed **345/345 Node tests**, **174/174 seed contracts**, **66/66 desktop browser checks** across Chromium, Firefox and WebKit, and **11/11 website checks**. The website build and public-link checks also passed.

A local unpublished tarball of this checkout passed standalone JavaScript and strict TypeScript NodeNext/Bundler consumers. Its installed engine passed all 13 new entry checks and a mixed-text integration check. This does not republish the npm alpha.2 artifact. These software checks do not establish physical mobile/IME compatibility, independent human spelling review or representative language accuracy.

## Reproduce

Prepare the pinned original `benchmark/data/review-batch-001/cases.jsonl` using the [review-batch instructions](review-batch.md#prepare-the-batch). Its SHA-256 must be `2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3`. Preserve any existing directory containing edited review sheets.

From a checkout containing this update:

```sh
SPELLING_BASELINE_DIR=$(mktemp -d)
git archive 48a0321bed417b1e995f66adbcbf9ade2c82f1cf \
  src package.json benchmark/cases.jsonl benchmark/run.js benchmark/reports \
  | tar -x -C "$SPELLING_BASELINE_DIR"
node benchmark/measure-reviewed-spelling.js "$SPELLING_BASELINE_DIR" \
  --cases benchmark/data/review-batch-001/cases.jsonl \
  --output benchmark/data/nepali-spelling-current.json

npm test
npm run benchmark -- --check
npm run benchmark:source-reviewed
```

Choose a new output path on each measurement; the tool refuses to overwrite an existing report. The comparison checks frozen source identities and exact Unicode strings. The final source hashes in the machine report distinguish this run from a later checkout with the same package version. The current-engine source-review command reports remaining development mismatches without making them a regression gate.

This is a repository update prepared for review. Package publication and website deployment remain separate actions; the released alpha.2 artifact retains its recorded behavior.
