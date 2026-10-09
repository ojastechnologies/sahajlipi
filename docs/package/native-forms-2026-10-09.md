# Reviewed native forms — 2026-10-09

**Unreleased repository update:** this batch adds 34 exact whole-key preferences for Nepali forms, compounds and inflections. Use a [local development installation](getting-started.md#local-development-installation) to try them. The **prepared, unpublished alpha.4 candidate** includes this batch and 211 starter keys; the verified published npm alpha.3 artifact has 177 keys and excludes it. The [candidate release section](../release.md#alpha4-release-candidate) records preparation status. Original source measurements below are separate from fresh versioned-candidate verification; package publication and website deployment have their own verification steps.

The batch reviews the 46 remaining word-default mismatches after the [earlier spelling follow-up](nepali-spelling-2026-10-09.md). Its frozen source ledger selects 34 additions and records 12 deferrals. The first displayed reading is a project typing preference; alternatives remain available where the Roman input admits multiple readings.

## Scope and evidence

Research checked complete Devanagari forms in original government publications, court records, academic documents, educational publications and authored Nepali writing. A separately attested stem was insufficient to approve an attached form. Search excerpts, extracted PDF text and visually checked PDF pages are identified separately in the ledger.

The research is **source-assisted**, with `humanVerified: false` and `independentHumanReview: false`. The maintainer chose two candidate orders; that decision is not an independent review of the language corpus. Published usage corroborates a spelling in context. It does not establish canonical Roman keys, frequency, the intended identity behind a name, or population-wide typing accuracy.

All eight selected PDF-backed additions have a relevant rendered page check. Supplementary indexed excerpts remain labeled as excerpts and are not the sole basis for an implemented entry. Some PDFs use legacy fonts or imperfect character mappings: visible glyphs corroborate the spelling, while the project Unicode strings come from the unchanged frozen references. Full PDFs and page images remain ignored research intermediates.

Only complete keys gain these preferences. This update does not add a native suffix grammar, infer arbitrary compounds, change phonetic tokens or expand the 51 recognized English loanword stems and their 19 finite suffix keys.

## Exact mappings and sources

The baseline is merged source `5baaad071a5a673c756eb48e2f7523a05c3295fd`, after the previous 13-key spelling change. The frozen ledger records the baseline strings below. “Preferred” means the displayed engine choice; the table makes no claim that a source measured its popularity.

| Complete Roman key | Baseline output | Preferred output | Alternative | Primary usage and access |
| --- | --- | --- | --- | --- |
| `futera` | फुतेर | फुटेर | — | [Kawasoti Agriculture](https://www.kawasotikrishi.gov.np/livestock-info/5218); full HTML text |
| `shanta` | शन्त | शान्त | शान्ता | [Budhanilkantha Municipality](https://www.budhanilkanthamun.gov.np/ne/elected-officials); full HTML text |
| `mahila` | महिल | महिला | माहिला | [NKP, page 2055](https://nkp.gov.np/full_detail/2055) and [Law Commission](https://lawcommission.gov.np/category/1790/); full HTML text |
| `astitwalai` | अस्तित्वलै | अस्तित्वलाई | — | [NKP, page 9714](https://nkp.gov.np/full_detail/9714); full HTML text |
| `vidhansabha` | विधन्सभ | विधानसभा | — | [Gorkhapatra](https://gorkhapatraonline.com/news/178908); full HTML text |
| `yasaprakar` | यसप्रकर | यसप्रकार | — | [NKP, page 6318](https://nkp.gov.np/full_detail/6318); full HTML text |
| `lepchaharu` | लेप्चहरु | लेप्चाहरू | — | [Gorkhapatra](https://gorkhapatraonline.com/news/164765); full HTML text |
| `angrejharuko` | अङ्रेझरुको | अङ्ग्रेजहरूको | अंग्रेजहरूको | [Himalaya Times](https://ehimalayatimes.com/2023/07/137023/) and [Gorkhapatra](https://gorkhapatraonline.com/news/19123); full HTML text |
| `adhyayama` | अध्ययम | अध्यायमा | — | [NKP, page 9211](https://nkp.gov.np/full_detail/9211); full HTML text |
| `karyaharuma` | कर्यहरुम | कार्यहरूमा | — | [Gorkhapatra](https://gorkhapatraonline.com/news/46481); full HTML text |
| `vedko` | वेद्को | वेदको | — | [Gorkhapatra](https://gorkhapatraonline.com/news/156789); full HTML text |
| `pairaheka` | पैरहेक | पाइरहेका | — | [Humla District Administration](https://daohumla.moha.gov.np/page/thana-thama-gha-ita-bha-apa-na-gata-bhaeka-ra-sa-va-ka-tha-kha-na-ja-vana-na-ra); full HTML text |
| `afumathi` | अफुमथि | आफूमाथि | — | [NKP, page 638](https://nkp.gov.np/full_detail/638); full HTML text |
| `sammanko` | सम्मन्को | सम्मानको | — | [NKP, page 162](https://nkp.gov.np/full_detail/162); full HTML text |
| `fulbariharu` | फुल्बरिहरु | फूलबारीहरू | — | [Little Angels’ School magazine](https://las.edu.np/magazine.pdf); visually checked PDF, page 199 |
| `goretaharuma` | गोरेतहरुम | गोरेटाहरूमा | — | [Kantipur](https://ekantipur.com/feature/2026/07/17/17842895897334850.html); full HTML text |
| `kendraharudwara` | केन्द्रहरुद्वर | केन्द्रहरूद्वारा | — | [Nepal Police bulletin](https://cid.nepalpolice.gov.np/media/filer_public/9c/1c/9c1c6fec-f13d-41ea-8cde-d3c1059e4497/asar-ebulletin-2081-04-07.pdf); visually checked PDF, printed page ११ |
| `hospitaltarfa` | होस्पितल्तर्फ | हस्पिटलतर्फ | — | [NKP, page 308](https://nkp.gov.np/full_detail/308); full HTML text |
| `manovaigyanikharule` | मनोवैज्ञनिखरुले | मनोवैज्ञानिकहरूले | — | [Tribhuvan University thesis](https://elibrary.tucl.edu.np/bitstreams/80f552d9-7df0-4a1c-83b1-bdb00cd6a114/download); visually checked PDF, printed page १० |
| `vigyanle` | विज्ञन्ले | विज्ञानले | — | [NKP, page 1631](https://nkp.gov.np/full_detail/1631); full HTML text |
| `gabhnuparchha` | गभ्नुपर्छ | गाभ्नुपर्छ | — | [Kohalpur Municipality plan](https://kohalpurmun.gov.np/sites/kohalpurmun.gov.np/files/documents/vison%20-%20final.pdf); visually checked PDF, page 100 |
| `fyankidinchhan` | फ्यन्किदिन्छन | फ्याँकिदिन्छन् | — | [Mysansar authored essay](https://www.mysansar.com/archives/2011/02/16972/); full HTML text |
| `lakhetiraheka` | लखेतिरहेक | लखेटिरहेका | — | [Government grade 8 textbook](https://learning.cehrd.gov.np/pluginfile.php/181/mod_resource/content/1/Nepali%20grade%208.pdf); visually checked PDF, printed page १९ |
| `samhalnubhaeko` | सम्हल्नुभएको | सम्हाल्नुभएको | — | [Nepal Insurance Authority](https://www.nia.gov.np/press/release/detail/athhayakashha-padalbta-pathabhara-garahanae); full HTML text |
| `bolaunuparne` | बोलौनुपर्ने | बोलाउनुपर्ने | — | [NKP, page 10453](https://nkp.gov.np/full_detail/10453); full HTML text |
| `bhagidarko` | भगिदर्को | भागीदारको | — | [Gorkhapatra editorial](https://gorkhapatraonline.com/news/180757); full HTML text |
| `sambhawanaharulai` | सम्भवनहरुलै | सम्भावनाहरूलाई | — | [Office of the President](https://president.gov.np/%E0%A4%B8%E0%A4%AE%E0%A5%8D%E0%A4%AE%E0%A4%BE%E0%A4%A8%E0%A4%A8%E0%A5%80%E0%A4%AF-%E0%A4%B0%E0%A4%BE%E0%A4%B7%E0%A5%8D%E0%A4%9F%E0%A5%8D%E0%A4%B0%E0%A4%AA%E0%A4%A4%E0%A4%BF-%E0%A4%B6%E0%A5%8D-227/); full HTML text |
| `dushprawrittiharuko` | दुश्प्रव्रित्तिहरुको | दुष्प्रवृत्तिहरूको | — | [Tribhuvan University thesis](https://elibrary.tucl.edu.np/bitstreams/382313c8-2fe2-46f4-b98e-d10050fb0146/download); visually checked PDF, page 51 |
| `suktiharu` | सुक्तिहरु | सूक्तिहरू | — | [Nepal Law Commission](https://lawcommission.gov.np/content/11069/11069-legal-maxims/); full HTML text |
| `asuraharuko` | असुरहरुको | असुरहरूको | — | [Tribhuvan University thesis](https://elibrary.tucl.edu.np/bitstreams/74a936c5-1441-45c0-bee2-db4b719360b7/download); visually checked PDF, page 79 / printed ७२ |
| `aspatalbichko` | अस्पतल्बिच्को | अस्पतालबीचको | — | [Nepal Police](https://nepalpolice.gov.np/news/2590/); full HTML text |
| `bhaktiganyukta` | भक्तिगञुक्त | भक्तिगानयुक्त | — | [Nagarik editorial](https://nagariknews.nagariknetwork.com/others/125477-1499491920.html?click_from=category); full HTML text |
| `purnakalinlai` | पुर्नकलिन्लै | पूर्णकालीनलाई | — | [CIAA annual report](https://ciaa.gov.np/uploads/publicationsAndReports/1548567688annual_report_207475.pdf); visually checked PDF, page 160 / printed १५१ |
| `lagalagi` | लगलगि | लगालगी | — | [Onlinekhabar authored reminiscence](https://www.onlinekhabar.com/2026/07/1981931/nagendra-raj-sharma-a-series-of-memories); full HTML text |

Nepal Kanoon Patrika links identify **publication page IDs**, not judgment decision numbers. The source ledger includes titles, locators, retrieval dates, access limits and supplementary sources for each row.

### Candidate ordering

- `mahila` displays **महिला** (woman/women), with **माहिला** (family/sibling ordinal) as the second candidate. The maintainer chose this order on 2026-10-09.
- `shanta` displays **शान्त** (calm/peaceful), with the personal-name spelling **शान्ता** as the second candidate. The maintainer chose this order on 2026-10-09.
- `angrejharuko` displays **अङ्ग्रेजहरूको**, with **अंग्रेजहरूको** as the second candidate. Both complete nasal spellings are attested. Choosing the explicit velar nasal first preserves the prior fallback's nasal style; it is a compatibility preference, not a frequency result.

The frozen reference arrays and their `preferredReferenceIndex: null` values are unchanged for these three inputs. A default now chosen for the software does not retroactively make the reviewed input uniquely intended.

## Typing and customization

Finish the complete listed key to receive its preferred reading. An incomplete token can still show ordinary phonetic conversion. The entries apply in both full and strict-half consonant modes; the listed reading keeps its supplied Unicode rather than adding a final half consonant.

Incidental capitals keep the existing normalization rules: for example, `viGyanle` still receives विज्ञानले. Reserved Shift sound capitals keep their phonetic meaning unless the host supplies an exact cased entry. Vowel-length keys, nasal marks, backtick and slash halants, ra-ya joiners, digits, address preservation and English mode retain their existing contracts.

From this repository checkout:

```js
import { convertWord, convertText, createEngine } from './src/index.js';

convertWord('mahila');
// { text: 'महिला', candidates: ['महिला', 'माहिला'], ambiguous: true }

convertWord('karyaharuma').text; // 'कार्यहरूमा'
convertText('mahila karyaharuma.');
// 'महिला कार्यहरूमा.'

const custom = createEngine({
  entries: { mahila: ['माहिला', 'महिला'] }
});
custom.convertWord('mahila').text; // 'माहिला'
```

An integrating app can show the candidates returned by `convertWord`. In the demo, choose the second reading from the dropdown or use `Alt+2` while the word is active; Space commits the displayed choice. The same adapter behavior applies to a host-provided candidate interface.

A listed `karyaharuma` does not teach the engine every ending of `karya`. Unlisted attached forms use the existing fallback unless a complete built-in or custom entry supplies them. Exact host entries retain priority in their own engine instance. This batch's `hospitaltarfa` is a complete native-form preference; it does not add `hospital` to the suffixable English stem inventory. Recognized technical text and explicitly English fields remain literal.

## Deferred cases

These twelve inputs remain in the unchanged development references. Deferral does not label the Roman input or reference a misspelling, remove it from evaluation, or claim its ordinary fallback is correct. It records why this focused batch does not assign that global default.

| Roman input | Frozen reference | Reason for deferral |
| --- | --- | --- |
| `header` | हेडर | Verified हेडर, but held for a separate English-loanword expansion so the recognized 51-stem inventory stays unchanged. |
| `premchandradwara` | प्रेमचन्द्रद्वारा | Attested full personal-name construction; a general name-default policy is outside this batch. |
| `indradevle` | इन्द्रदेवले | Attested full personal-name construction; retain the reference without assigning an isolated name globally. |
| `patrakaraharumathi` | पत्रकारहरूमाथि | Rendered source prints short-u पत्रकारहरुमाथि; the frozen long-u reference पत्रकारहरूमाथि is only in the normalized search excerpt. Await exact original-source evidence. |
| `pandejyule` | पाण्डेज्यूले | Attested surname and honorific; hold for a separate name vocabulary policy. |
| `tariniprasadale` | तारिणीप्रसादले | Attested personal name; the same court page also contains a name variant. No identity or global default is inferred. |
| `wajedle` | वाजेदले | Foreign surname appears in an indexed Nepali report; full source and primary identity/orthographic evidence remain insufficient. |
| `devnarasinh` | देवनरसिंह | Attested historical personal name; the cited archival originals were not inspected and isolated identity remains unspecified. |
| `javara` | जवरा | Official जवरा is attested, but related content also exposes जबरा. Do not collapse distinct surname spellings. |
| `chintaman` | चिन्तामन | Indexed government usage concerns an Indian place-name component; isolated input does not distinguish चिन्तामन from a possible Hindi-style चिंतामन intent. |
| `manjhi` | माझी | Government page attests Nepali माझी; Roman n can signal another intended nasalized name. No rule deletes it globally. |
| `gopalman` | गोपालमान | Attested full personal name; hold for a separate name vocabulary policy rather than imply an intended person. |

Ten rows concern names or name-related constructions, one is a separately scoped loanword, and one has an exact printed/indexed plural mismatch. Complete spelling evidence can be useful for a later name or loanword policy without resolving an isolated user's intent.

## Recorded comparison

The [new machine report](../../benchmark/reports/native-forms-2026-10-09.json) compares merged baseline source `5baaad071a5a673c756eb48e2f7523a05c3295fd` with the unreleased native-form update, using identical final seed contracts and the original frozen development references.

| Metric | Pre-batch baseline | Native-form update |
| --- | ---: | ---: |
| Same final seed contracts | 174/209 | 209/209 |
| Historical seed contracts | 174/174 | 174/174 |
| Reviewed word default matches any reference | 28/74 | 62/74 |
| Individual reviewed word-reference coverage | 30/79 | 67/79 |
| Exact complete reviewed sentences | 0/12 | 0/12 |

The final seed contains **209 contracts and two exploratory cases**. Thirty-four word contracts and one constructed text guard are appended; all **176 historical rows remain byte-for-byte unchanged**. The reviewed defaults improve by 34 cases and coverage by 37 references, including the three additional valid alternatives. **12 admitted word defaults and all 12 complete sentences still differ.**

The comparison keeps the original denominators: **74 admitted words / 79 listed word references**, **12 admitted sentences / 13 sentence references**, and **14 excluded cases**. No reference, preferred-reference flag or exclusion changes to improve a score. The selected targets guided implementation, so this comparison describes development progress rather than independent held-out accuracy.

The comparison record identifies the before and after engines, all eight runtime/declaration source files, original cases, frozen review, selected research ledger, seed fixture and measurement tools. Only `src/lexicon.js` changes among those eight files. Complete licensed sentence strings remain omitted from public results; their identities use hashes. Earlier dated reports and human review sheets keep their original contents.

PR #28 was subsequently rebased onto the merged [alpha.3 preparation PR #27](https://github.com/ojastechnologies/sahajlipi/pull/27) and [publication documentation PR #29](https://github.com/ojastechnologies/sahajlipi/pull/29), whose main source is `c4ce75a07b5607225dcb669195b4664d43c50292`. The engine, all 211 seed rows and the frozen measurements retain their recorded bytes. Those dated records identify the earlier alpha.2 manifest used during measurement. The current alpha.3 manifest and npm metadata do not change the recorded results or add these 34 forms to the verified published alpha.3 package. Reproduce the original record from the source identity recorded in PR #28; a measurement of a later checkout must use a new output file.

## Software validation

The complete Node suite passed **389/389 tests**, including **39/39 focused native-form checks**. The current seed passed **209/209 contracts** with two exploratory rows excluded.

The [desktop-007 record](../../browser/reports/desktop-007.json) records **69/69 desktop browser checks**, 23 in each of Chromium, Firefox and WebKit, with no retries, failures, skips, flaky outcomes or uncaught page errors. The new keyboard scenario covers all three new alternative lists, editing, undo and English mode; the installed vanilla consumer checks `mahila` candidates too. The [browser follow-up](browser-compatibility.md#native-form-follow-up--2026-10-09) gives the tested environment and scope.

A separate local tarball with 13 allowlisted files passed JavaScript public imports/options/isolation and strict TypeScript NodeNext core without DOM, DOM and Bundler consumers/tutorials. The emitted core tutorial ran in Node. The installed package was unreleased source using the existing alpha.2 manifest version; these checks neither identify nor replace the registry alpha.2 artifact. The browser report identifies the exact tested tarball; its checksum applies to that recorded archive.

`npm run test:site` passed the website build, static link checks and **11/11 website browser checks**. These software gates do not establish physical mobile/IME support, independent human spelling review or representative Nepali accuracy.

## Reproduce

Prepare the original `benchmark/data/review-batch-001/cases.jsonl` using the [review-batch instructions](review-batch.md#prepare-the-batch). Its SHA-256 must remain `2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3`. Preserve directories containing edited human review sheets.

```sh
NATIVE_FORMS_BASELINE_DIR=$(mktemp -d)
git archive 5baaad071a5a673c756eb48e2f7523a05c3295fd \
  src package.json benchmark/cases.jsonl benchmark/run.js benchmark/reports \
  | tar -x -C "$NATIVE_FORMS_BASELINE_DIR"
node benchmark/measure-native-forms.js "$NATIVE_FORMS_BASELINE_DIR" \
  --cases benchmark/data/review-batch-001/cases.jsonl \
  --output benchmark/data/native-forms-current-comparison.json

npm test
npm run benchmark -- --check
npm run benchmark:source-reviewed -- \
  --cases benchmark/data/review-batch-001/cases.jsonl \
  --output benchmark/data/native-forms-current.json
```

Choose a new output filename each time; both measurement commands refuse to overwrite an existing report. The dated comparison verifies the baseline's immutable file identities, preservation of the historical fixture and reports, and this batch's source/research scope before scoring exact Unicode. Its pins identify this particular update; a later engine change needs a new dated comparison rather than replacing this record. The current-engine source-review command reports remaining mismatches without turning selected development references into a language-accuracy gate.

## Records

- [Frozen 46-case source ledger](../../benchmark/reports/native-forms-research-2026-10-09.json): all 34 additions, 12 deferrals, source access and candidate decisions.
- [Native-form before/after measurement](../../benchmark/reports/native-forms-2026-10-09.json): pinned source identities, unchanged fixtures and development results.
- [Original frozen development review](source-review-2026-10-01.md): references, exclusions, admission policy and provenance.
- [Earlier spelling comparison](nepali-spelling-2026-10-09.md): the preceding 28/74 and 30/79 development baseline.
- [Desktop and installed-package record](../../browser/reports/desktop-007.json): 69 selected browser checks and the separately verified local package consumer.
- [Implementation plan](../superpowers/plans/2026-10-09-native-inflections.md): preservation constraints and required verification.
- [Typing reference](typing-reference.md#reviewed-native-word-spellings): user-facing keys and integration limits.
