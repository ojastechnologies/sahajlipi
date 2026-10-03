# Reviewed native spellings — 2026-10-01

**Publication follow-up (2026-10-03):** Alpha.1 and alpha.2 were subsequently published on npm and their registry artifacts verified against the reviewed source. See the [release record](../release.md) for current distribution status. The preparation status and measurements below retain their 2026-10-01 scope.

This update adds four exact starter entries from the [frozen development review](source-review-2026-10-01.md). It follows the [loanword suffix slice](loanword-suffixes-2026-10-01.md), using lexical preferences for specific informal spellings while preserving the ordinary phonetic key rules. The default core engine and Nepali-enabled browser fields use the same entries.

The [source ledger](../../benchmark/reports/nepali-spelling-research-2026-10-01.json) records exact references, new and reused evidence, original access dates, sources and a separately frozen constructed control sample. These are source-assisted project preferences. They are not independent human language reviews, general spelling correction or representative accuracy evidence.

## Exact preferences

| Roman input | Before | New preferred output | Spelling supplied |
| --- | --- | --- | --- |
| `halyo` | हल्यो | हाल्यो | Long आ in this verb form |
| `nabhani` | नभनि | नभनी | Long final ी |
| `gaunle` | गौन्ले | गाउँले | आ + independent उ + chandrabindu |
| `dindaina` | दिन्दैन | दिँदैन | Chandrabindu on the first vowel |

Each entry currently returns one candidate. It is a preferred reading for the exact key, rather than a context-sensitive claim that an isolated Roman input has only one possible interpretation.

```js
import { convertWord, convertText, createEngine } from 'sahajlipi';

convertWord('gaunle');
// { text: 'गाउँले', candidates: ['गाउँले'], ambiguous: false }

convertText('halyo nabhani gaunle dindaina.');
// 'हाल्यो नभनी गाउँले दिँदैन.'

const custom = createEngine({ entries: { halyo: ['खसाल्यो', 'हाल्यो'] } });
custom.convertWord('halyo').candidates; // ['खसाल्यो', 'हाल्यो']
convertWord('halyo').text;             // 'हाल्यो' — independent default engine
```

Incidental title case such as `Halyo` follows the existing normalization. Reserved capitals `T`, `D`, `S`, `R` and contextual `H` retain their explicit sounds, unless an exact custom entry overrides the input. Custom exact readings keep normal precedence.

No fallback rule changes: `pani` / `paani`, short / long vowels, `au`, explicit `^` / `~`, and bare half-consonants remain distinct. For example, `ki` stays कि, `kii` stays की and `k` stays क्. Longer native forms such as `halyoko` or `gaunleko` do not automatically reuse these entries. The finite suffix rule remains restricted to the listed English loanword stems. The [typing reference](typing-reference.md#reviewed-native-word-spellings) describes the current keys.

While a word is active, the adapter re-evaluates its accumulated Roman spelling after each key. A complete listed key selects its entry; an unfinished or unlisted spelling can use the fallback. English mode keeps subsequent input literal. Recognized links and email spans retain their separate preservation policy; these four entries do not extend address recognition or rewrite existing text.

## Source checks and decisions

All four exact reference spellings were already frozen in the development ledger before this implementation. This research rechecks their published use and strengthens the fourth case with directly opened institutional HTML. It does not change those references to match the new engine.

| Case | Original source | Current access | What it supports |
| --- | --- | --- | --- |
| `halyo` | [Nepal Law Journal, decision page 5159](https://nkp.gov.np/full_detail/5159) | Direct HTML, checked 2026-10-01 | Whole हाल्यो with long आ and ल्य cluster in testimony. Historical transcription has other irregularities; this is usage evidence. |
| `nabhani` | [Nepal Law Journal, decision page 5950](https://nkp.gov.np/full_detail/5950) | Direct HTML, checked 2026-10-01 | Whole नभनी with U+0940, the long ी sign. |
| `gaunle` | [Sanskritik Sansthan, Matoko Geet second edition](https://www.sanskritiksansthan.gov.np/content/527) | Direct HTML, checked 2026-10-01 | Whole गाउँले in production cast-role descriptions. |
| `dindaina` | [Suryodaya Municipality, citrus cultivation guidance](https://www.suryodayakrishi.gov.np/fruit-farming-technology-info/1402) | Direct HTML, checked 2026-10-01 | Whole दिँदैन with chandrabindu in agricultural guidance. |

The older [National Assembly transcript citation](https://na.parliament.gov.np/uploads/attachments/oqw7slnndhb0wnrq.pdf) remains limited to indexed excerpts; its full PDF and visual page were not inspected. The ledger preserves that access scope and the original evidence dates. Direct institutional usage attests the native spelling in its context; it does not rank every Roman input, establish one universal spelling or supply a population frequency estimate.

The old frozen reason for `nabhani` incorrectly describes its final vowel as short even though the stored reference is नभनी. The new ledger clarifies that the final ी is long. The old report and reference hashes remain unchanged.

## Constructed control sample

A source research pass froze **11 short word controls before seeing new engine outcomes**. Their Nepali forms come from the municipal page above; their Roman keys were constructed from the documented typing rules after the four-entry design. They exclude the four target keys, prior development word keys and baseline lexicon keys.

Examples include `maaTo` → माटो, `haa~gaa` → हाँगा and `dhaanako` → धानको. These controls exercise explicit vowel lengths, final `a`, Shift `T`, chandrabindu and a fully typed native form. Their cases, source locators, freeze time, provenance and exact hashes are published in the [source ledger](../../benchmark/reports/nepali-spelling-research-2026-10-01.json).

This is a convenience conformance sample from one source with assistant-constructed keys. **It is not blind natural-typing data, independent human review, held-out linguistic accuracy or a representative corpus.** All measured outcomes are recorded without tuning references or entries after seeing the results. Only short word forms and citation metadata are published; full source sentences and articles are not redistributed.

## Recorded comparison

The [machine report](../../benchmark/reports/nepali-spelling-2026-10-01.json) compares baseline `cbcd77aae14e1845567e416c29f05658e0fe8e62` with the four-entry update on the same final fixture and unchanged reviewed references. It pins the source files, tools, original batch, frozen review, new source ledger and controls. The spelling change adds exactly four lexicon keys: **160 → 164**; all previous entry arrays and every other runtime source file are preserved. Alpha package metadata is separate from the conversion comparison.

| Metric | Before | After |
| --- | ---: | ---: |
| Same final seed contracts | 137/142 | 142/142 |
| Seed word default matches | 106/110 | 110/110 |
| Seed required candidate references | 109/113 | 113/113 |
| Seed complete text matches | 31/32 | 32/32 |
| Five newly added spelling contracts | 0/5 | 5/5 |
| Historical frozen seed contracts | 137/137 | 137/137 |
| Reviewed word default matches any reference | 11/74 | 15/74 |
| Individual reviewed word-reference candidate coverage | 12/79 | 16/79 |
| Exact complete reviewed sentences | 0/12 | 0/12 |

The final fixture has **142 contracts and two exploratory cases**. It appends four word contracts and one synthetic text guard; **all 139 prior rows remain byte-for-byte unchanged**. Unlike the earlier suffix slice, this spelling slice revises no historical contract expectations. Existing exploratory cases remain separate from the gate.

The reviewed comparison keeps **74 admitted word cases / 79 word references** and **12 admitted sentence cases / 13 sentence references**, with the same 14 exclusions. These four cases guided the implementation, so the gains are descriptive development results. Complete sentences still differ; the change does not establish general spelling quality or readiness for every production use. Earlier dated reports retain their original sources, counts and outputs.

The separately frozen constructed sample scores **11/11 before and 11/11 after**. It adds conformance evidence for its selected fully typed keys; it shows no improvement on new natural-typing labels. All outcomes and source metadata are retained in the report.

## Implementation validation

Local validation on 2026-10-01 passed **304/304 Node tests**, **142/142 seed contracts** and **60/60 desktop browser checks** (20 scenarios per engine). The [desktop-005 record](../../browser/reports/desktop-005.json) records engine versions, runtime/test hashes and the installed candidate tarball. Public JavaScript imports and strict TypeScript NodeNext/Bundler consumers also passed for `0.1.0-alpha.1`.

The website build and publication checks passed. These software results do not establish registry availability, mobile/IME compatibility or representative language accuracy. The [release record](../release.md#current-alpha-candidate) separately tracks npm publication.

## Reproduce

Use a checkout of this spelling update and regenerate the pinned original `benchmark/data/review-batch-001/cases.jsonl` using the [review-batch instructions](review-batch.md#prepare-the-batch). Its SHA-256 must be `2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3`; preserve any directory holding edited review sheets.

```sh
SPELLING_BASELINE_DIR=$(mktemp -d)
git archive cbcd77aae14e1845567e416c29f05658e0fe8e62 \
  src package.json benchmark/cases.jsonl benchmark/run.js benchmark/reports \
  | tar -x -C "$SPELLING_BASELINE_DIR"
node benchmark/measure-native-spelling.js "$SPELLING_BASELINE_DIR" \
  --cases benchmark/data/review-batch-001/cases.jsonl \
  --output benchmark/data/nepali-spelling-current.json

npm test
npm run benchmark -- --check
npm run benchmark:source-reviewed
```

The measurement command checks frozen data and source identities, compares exact Unicode strings and refuses an existing output file. Reproducing the dated result requires the recorded source hashes, rather than a later engine with the same command. The general source-review command measures the current engine on the unchanged development references. Selected core, adapter and browser regressions protect the documented behavior separately; they do not certify real mobile keyboards or every framework.

## Alpha candidate status

The repository is prepared for **`0.1.0-alpha.1`**, with public access and the `alpha` tag. This is an **unpublished candidate**: authenticated registry publication and a clean registry-consumer verification remain pending. The [release policy](../release.md) records package checks, compatibility, distribution boundaries and the remaining checklist; [getting started](getting-started.md) uses a local tarball until a registry release is verified. Candidate preparation does not convert the selected development measurements into a representative accuracy estimate.
