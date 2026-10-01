# Source-assisted online review — development batch 001

**Follow-up:** the maintainer-delegated [2026-10-01 review](source-review-2026-10-01.md) completes this batch with frozen project development references and a reproducible measurement. This page and its linked report retain the earlier draft decisions and dates as a historical record.

Research and publication date: **2026-09-27**. Reviewer: `assistant-online`.

**All 100 recommendations are drafts. None is independently human verified or admitted as a canonical benchmark answer.** This report publishes the research so contributors can inspect its evidence and challenge its conclusions. It does not change engine behavior or any benchmark score.

## Coverage

| Case type | Cases | Recommend accept | Recommend correct / add alternatives | Recommend hold / exclude |
| --- | ---: | ---: | ---: | ---: |
| Words | 80 | 67 | 5 | 8 |
| Sentences | 20 | 0 | 7 | 13 |
| Total | 100 | 67 | 12 | 21 |

The pass consulted **107 distinct source URLs**. There are 109 source-reference records: 49 full-page accesses and 60 search-snippet accesses; reused URLs account for the difference. These counts describe recorded evidence access during the research pass. They do not certify the current availability or authority of every linked page.

The [machine-readable report](../../benchmark/reports/nepali-assisted-online-001.json) preserves all 100 case IDs, draft decisions, confidence, reasons, evidence scope, alignment notes and source references. Exact word inputs, original proposals and suggested word readings are included. Complete sentence inputs, source proposals and suggested sentence texts are omitted; use their source IDs and the pinned local batch to inspect the original records. Raw archives and human reviewer worksheets remain local.

## Method and limits

- **Recommend accept:** the source spelling is a plausible reading supported by usage, component or name evidence. It does not establish the typist’s intended meaning or an accepted linguistic label.
- **Recommend correct / add alternatives:** propose a separate corrected reading or additional candidate. The original source remains unchanged; plausible alternatives are retained in the draft suggestions.
- **Recommend hold / exclude:** the pair needs context, contains alignment issues or lacks sufficient evidence. This is a recommendation, not an admitted canonical exclusion or a claim that the spelling is invalid in every context.
- **Confidence:** the assistant’s qualitative judgment about the stated evidence, not a calibrated probability.

Online usage is an attestation, not a normative spelling ruling. Component evidence is weaker than a complete word attestation; names need identity context; references in other languages do not establish a Nepali standard. `search-snippet` means only an indexed excerpt was available. The pass does not claim to have checked every word against the complete official Pragya dictionary or to have fact-checked the source sentences’ historical, medical, financial or other assertions.

The coordinating assistant had context from Reviewer A’s first 21 draft decisions. The research assignments used the original case file without engine diagnostics or reviewer worksheets. Parallel assistants do not supply independent proficient human reviews. Existing human draft decisions were not completed, overwritten or attributed to the assistant.

These notes review informal Roman readings. They are not automatic changes to Shift keys, vowel length, half consonants, punctuation or the lexicon. The later [ra-ya implementation and source-quality triage](ry-review.md) is recorded separately; this page preserves the earlier dated research recommendations.

## Provenance and attribution

The cases are the same 80 development words and 20 sentence proposals selected by the [development review protocol](review-batch.md). The [original run manifest](../../benchmark/reports/nepali-review-001.json) records the deterministic selection, source revisions, categories and overlap exclusion. Its [baseline report](review-batch-baseline.md) measures agreement with unreviewed source proposals; these draft recommendations do not change that denominator or become a new accuracy score.

- **AI4Bharat Aksharantar:** [dataset card](https://huggingface.co/datasets/ai4bharat/Aksharantar/blob/main/README.md), [source-specific license statement](https://indicnlp.ai4bharat.org/aksharantar/#license), [paper](https://aclanthology.org/2023.findings-emnlp.4/). The paper identifies manually created data as [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) and mined data as [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/). The word records preserve their upstream categories: 40 AK-Freq and 25 AK-Uni manual examples; 10 IndicCorp and 5 Wikidata mined examples. The reproduced word strings are unchanged; suggested alternatives are separate draft annotations. Upstream data terms remain separate from the project’s MIT code and documentation license.
- **AI4Bharat Bhasha-Abhijnaanam:** [dataset card](https://huggingface.co/datasets/ai4bharat/Bhasha-Abhijnaanam/blob/main/README.md), [paper](https://aclanthology.org/2023.acl-short.71/). The card labels collected data/packaging CC0-1.0 and notes that AI4Bharat does not own all underlying extracted text. This publication includes IDs and research notes instead of complete sentence texts.
- **Consulted evidence:** each case links its source and describes exactly what it supports. Linked material retains its own terms. A citation for a component does not verify a full word, Roman mapping or sentence.

The machine report records the original case-file SHA-256 (`2f92bcf5a16d35b6a31dca052e4e358ffe417b5dcec0e8cc704d17f8acbf23e3`) and the local research artifact hashes. The original files and canonical case fields remain unchanged. No raw source archive, absolute workstation path or human reviewer worksheet is included in the public report.

## Inspect the sentence records locally

Follow the [pinned download instructions](external-evaluation.md) and [batch generation instructions](review-batch.md). Use a new output directory if a batch already exists, preserving prior review edits. Verify the generated case-file hash against the value above before comparing records.

For an unchanged batch at the standard local path, select one case by its public ID:

```sh
node --input-type=module - sentence:ne_348 <<'JS'
import { readFile } from 'node:fs/promises';
const rows = (await readFile('benchmark/data/review-batch-001/cases.jsonl', 'utf8'))
  .split(/\r?\n/).filter(Boolean).map(JSON.parse);
const selected = rows.find(row => row.id === process.argv[2]);
if (!selected) throw new Error('Case ID not found');
console.log(JSON.stringify(selected, null, 2));
JS
```

Replace the case ID with another listed below; use your chosen output path if it differs. The public machine report is a review projection, not runner fixtures or a substitute for the original sentence records.

## Before using a recommendation

Confirm the intended reading, acceptable alternatives, compound boundaries and names. Keep the original source strings intact; identify any repair separately. Resolve punctuation, spacing, digit and Unicode-joiner policies without silently normalizing differences away. Record actual reviewers and dates only for reviews they perform, and reconcile independent proficient human reviews under the [review protocol](review-batch.md#review-and-reconcile) before admitting canonical outputs or exclusions. Keep this development research separate from held-out accuracy claims.

## Per-case recommendations

Each heading retains the original batch row and source ID. The proposed decisions below remain drafts, including every use of the word “accept”. Jump to the [word reviews](#case-001) or [sentence reviews](#case-081).

<a id="case-001"></a>

### 1. word-validation:nep355

- Mode / source: `word` / `nep355` / `AK-Freq`
- Exact Roman input: <code>&quot;futera&quot;</code>
- Original source proposal: <code>&quot;फुटेर&quot;</code>
- Draft suggested outputs: <code>[&quot;फुटेर&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The proposed verb form occurs in a Nepali news headline; futera is a plausible informal spelling, although the Roman input does not encode the retroflex consonant explicitly.

Consulted evidence:

- [Ratopati — पाइप फुटेर बबरमहल जलमग्न हुनु विकास मोडेलको असफलता](https://www.ratopati.com/story/473542/babarmahal-submerged-after-pipe-bursts-39failure39-of-development-model) (full-page): Matched फुटेर in headline and body.

<a id="case-002"></a>

### 2. word-validation:nep778

- Mode / source: `word` / `nep778` / `AK-Freq`
- Exact Roman input: <code>&quot;imandar&quot;</code>
- Original source proposal: <code>&quot;इमान्दार&quot;</code>
- Draft suggested outputs: <code>[&quot;इमान्दार&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact proposed adjective appears in an official Kathmandu Metropolitan City headline. Short and long vowels are not fully specified by informal Roman input.

Consulted evidence:

- [Kathmandu Metropolitan City Metro News — हावाको स्वच्छताका लागि उपलब्ध उपायको इमान्दार कार्यान्वयनमा जोड](https://metronews.kathmandu.gov.np/news/detail/483) (full-page): Matched इमान्दार in headline, lines 349–351.

<a id="case-003"></a>

### 3. word-validation:nep295

- Mode / source: `word` / `nep295` / `AK-Freq`
- Exact Roman input: <code>&quot;nabhani&quot;</code>
- Original source proposal: <code>&quot;नभनी&quot;</code>
- Draft suggested outputs: <code>[&quot;नभनी&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in search excerpt only; article fetch timed out; intended Roman reading remains unverified
- Assistant reasoning: A Nepali report uses the exact negative conjunctive form. Evidence was available in the indexed excerpt; fetching the article failed, so this remains a draft reading.

Consulted evidence:

- [Gorkhapatra — गोठ गोठमा पशु प्राविधिक](https://gorkhapatraonline.com/news/143266) (search-snippet): Indexed text matches दिनरात नभनी; full article could not be fetched.

<a id="case-004"></a>

### 4. word-validation:nep501

- Mode / source: `word` / `nep501` / `AK-Freq`
- Exact Roman input: <code>&quot;shanta&quot;</code>
- Original source proposal: <code>&quot;शान्ता&quot;</code>
- Draft suggested outputs: <code>[&quot;शान्ता&quot;, &quot;शान्त&quot;]</code>
- Assistant recommendation: **correct — draft**; confidence: medium.
- Evidence scope: Whole spelling/name context for शान्ता; adjective attestation for शान्त; intended Roman reading remains unverified
- Assistant reasoning: Both the personal name and the adjective are attested. A context-free shanta does not determine which reading the writer intended; retain the source name and add the adjective.

Consulted evidence:

- [Budhanilkantha Municipality — Elected Officials](https://www.budhanilkanthamun.gov.np/ne/elected-officials) (full-page): Matched शान्ता in official name at line 156; शान्त in municipal slogan at line 17.

<a id="case-005"></a>

### 5. word-validation:nep662

- Mode / source: `word` / `nep662` / `AK-Freq`
- Exact Roman input: <code>&quot;sarasar&quot;</code>
- Original source proposal: <code>&quot;सरासर&quot;</code>
- Draft suggested outputs: <code>[&quot;सरासर&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact proposed adverb appears in a Nepali short story published by Gorkhapatra.

Consulted evidence:

- [Gorkhapatra — रिटायर्ड हाकिम (कथा)](https://gorkhapatraonline.com/news/14203) (full-page): Matched सरासर at lines 136 and 176.

<a id="case-006"></a>

### 6. word-validation:nep679

- Mode / source: `word` / `nep679` / `AK-Freq`
- Exact Roman input: <code>&quot;saundaryako&quot;</code>
- Original source proposal: <code>&quot;सौन्दर्यको&quot;</code>
- Draft suggested outputs: <code>[&quot;सौन्दर्यको&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact genitive form appears in the Department of Tourism description of Patan.

Consulted evidence:

- [Department of Tourism — मुख्य पर्यटन गन्तव्य](https://www.tourismdepartment.gov.np/pages/tourism-destination/) (full-page): Matched सौन्दर्यको at line 64.

<a id="case-007"></a>

### 7. word-validation:nep516

- Mode / source: `word` / `nep516` / `AK-Freq`
- Exact Roman input: <code>&quot;sakos&quot;</code>
- Original source proposal: <code>&quot;सकोस्&quot;</code>
- Draft suggested outputs: <code>[&quot;सकोस्&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The final virama is attested on this optative verb form in a government agricultural article. This spelling check does not establish a deterministic keyboard mapping.

Consulted evidence:

- [Kawasoti Krishi — माछा पालन](https://www.kawasotikrishi.gov.np/livestock-info/5218) (full-page): Matched सकोस् at line 171.

<a id="case-008"></a>

### 8. word-validation:nep644

- Mode / source: `word` / `nep644` / `AK-Freq`
- Exact Roman input: <code>&quot;mahila&quot;</code>
- Original source proposal: <code>&quot;माहिला&quot;</code>
- Draft suggested outputs: <code>[&quot;माहिला&quot;, &quot;महिला&quot;]</code>
- Assistant recommendation: **correct — draft**; confidence: medium.
- Evidence scope: Whole spelling of माहिला in ordinal context; whole spelling of महिला in an official publication excerpt; intended Roman reading remains unverified
- Assistant reasoning: माहिला is attested in an ordinal/family context and महिला is the distinct reading used for women. Informal mahila does not settle vowel length or intended meaning; preserve both as draft alternatives.

Consulted evidence:

- [Nepal Kanoon Patrika — decision page 2055](https://nkp.gov.np/full_detail/2055) (full-page): Matched माहिला at lines 55–56 in a siblings/ordinal context.
- [Siddhicharan Municipality — Our Mission](https://siddhicharanmun.gov.np/our-mission-detail/) (search-snippet): Indexed mission text matches महिला alongside children and youth; page fetch failed.

<a id="case-009"></a>

### 9. word-validation:nep753

- Mode / source: `word` / `nep753` / `AK-Freq`
- Exact Roman input: <code>&quot;schoolma&quot;</code>
- Original source proposal: <code>&quot;स्कूलमा&quot;</code>
- Draft suggested outputs: <code>[&quot;स्कूलमा&quot;, &quot;स्कुलमा&quot;]</code>
- Assistant recommendation: **correct — draft**; confidence: medium.
- Evidence scope: Whole inflected spelling attested for both variants; स्कूलमा only in indexed PDF excerpt; intended Roman reading remains unverified
- Assistant reasoning: The source spelling is attested in a Nepali school guide; an educational Nepali grammar text uses the short-vowel spelling. Preserve both pending an editorial spelling policy; the evidence does not rank them for this Roman input.

Consulted evidence:

- [Sendai Tourism, Convention and International Association — Nepali school-life guide](https://www.int.sentia-sendai.jp/child/school/n/pdf/Nepali_JES.pdf) (search-snippet): Indexed PDF text matches स्कूलमा; fetching the PDF failed.
- [Introduction to the Nepali Language — Unit 4 Grammar Focus](https://pressbooks.bccampus.ca/nepali/chapter/chapter-6-unit-4-grammar-focus/) (full-page): Matched उनीहरू स्कुलमा थिए। at line 1013.

<a id="case-010"></a>

### 10. word-validation:nep586

- Mode / source: `word` / `nep586` / `AK-Freq`
- Exact Roman input: <code>&quot;dil&quot;</code>
- Original source proposal: <code>&quot;दिल&quot;</code>
- Draft suggested outputs: <code>[&quot;दिल&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in textbook excerpt; pronunciation/meaning not independently confirmed from the PDF; intended Roman reading remains unverified
- Assistant reasoning: A government-hosted Nepali textbook excerpt uses the source spelling in a dental/retroflex minimal pair. It supports this lexical reading without resolving the consonant distinction in informal dil.

Consulted evidence:

- [Dhangadhimai Municipality — Nepali textbook PDF](https://dhangadhimaimun.gov.np/sites/dhangadhimaimun.gov.np/files/documents/Nepali_Class8.pdf) (search-snippet): Indexed exercise matches डिल – दिल; PDF fetch failed.

<a id="case-011"></a>

### 11. word-validation:nep794

- Mode / source: `word` / `nep794` / `AK-Freq`
- Exact Roman input: <code>&quot;astitwalai&quot;</code>
- Original source proposal: <code>&quot;अस्तित्वलाई&quot;</code>
- Draft suggested outputs: <code>[&quot;अस्तित्वलाई&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact noun plus dative suffix appears in a Supreme Court decision published by Nepal Kanoon Patrika.

Consulted evidence:

- [Nepal Kanoon Patrika — decision page 9714](https://nkp.gov.np/full_detail/9714) (full-page): Matched अस्तित्वलाई at line 149.

<a id="case-012"></a>

### 12. word-validation:nep800

- Mode / source: `word` / `nep800` / `AK-Freq`
- Exact Roman input: <code>&quot;vidhansabha&quot;</code>
- Original source proposal: <code>&quot;विधानसभा&quot;</code>
- Draft suggested outputs: <code>[&quot;विधानसभा&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact compound appears in Nepali reporting about the Bihar legislature. This establishes Nepali usage of the term, not the intended political context of the isolated word.

Consulted evidence:

- [Gorkhapatra — नेपाल-भारत सीमा ७२ घण्टाका लागि बन्द, जनजीवन प्रभावित](https://gorkhapatraonline.com/news/178908) (full-page): Matched विधानसभा at line 46.

<a id="case-013"></a>

### 13. word-validation:nep729

- Mode / source: `word` / `nep729` / `AK-Freq`
- Exact Roman input: <code>&quot;kathanak&quot;</code>
- Original source proposal: <code>&quot;कथानक&quot;</code>
- Draft suggested outputs: <code>[&quot;कथानक&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact compound appears in a government department description of narrative films.

Consulted evidence:

- [Department of Information and Broadcasting — परिचय](https://doib.gov.np/pages/7981026/) (full-page): Matched कथानक at line 212.

<a id="case-014"></a>

### 14. word-validation:nep719

- Mode / source: `word` / `nep719` / `AK-Freq`
- Exact Roman input: <code>&quot;arambha&quot;</code>
- Original source proposal: <code>&quot;आरम्भ&quot;</code>
- Draft suggested outputs: <code>[&quot;आरम्भ&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact noun is used in an official tourism description. The informal initial a does not specify vowel length, but the source word is a plausible reading.

Consulted evidence:

- [Department of Tourism — मुख्य पर्यटन गन्तव्य](https://www.tourismdepartment.gov.np/pages/tourism-destination/) (full-page): Matched आरम्भ at line 68.

<a id="case-015"></a>

### 15. word-validation:nep570

- Mode / source: `word` / `nep570` / `AK-Freq`
- Exact Roman input: <code>&quot;yasaprakar&quot;</code>
- Original source proposal: <code>&quot;यसप्रकार&quot;</code>
- Draft suggested outputs: <code>[&quot;यसप्रकार&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The unspaced source form is attested in an official court publication. This is usage evidence, not a comprehensive rule that the expression must always be written without a space.

Consulted evidence:

- [Nepal Kanoon Patrika — decision page 6318](https://nkp.gov.np/full_detail/6318) (full-page): Matched यसप्रकार at lines 42, 60 and 61.

<a id="case-016"></a>

### 16. word-validation:nep500

- Mode / source: `word` / `nep500` / `AK-Freq`
- Exact Roman input: <code>&quot;ekadhik&quot;</code>
- Original source proposal: <code>&quot;एकाधिक&quot;</code>
- Draft suggested outputs: <code>[&quot;एकाधिक&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole headword and definition in a community-hosted Nepali dictionary compilation; intended Roman reading remains unverified
- Assistant reasoning: A Nepali dictionary compilation lists this adjective. The consulted page is community hosted, so its entry is lexical evidence rather than a directly inspected official Academy dictionary.

Consulted evidence:

- [Nepali Wiktionary — नेपाली शब्दसमूह ०८ ऋऔ](https://ne.wiktionary.org/wiki/%E0%A4%A8%E0%A5%87%E0%A4%AA%E0%A4%BE%E0%A4%B2%E0%A5%80_%E0%A4%B6%E0%A4%AC%E0%A5%8D%E0%A4%A6%E0%A4%B8%E0%A4%AE%E0%A5%82%E0%A4%B9_%E0%A5%A6%E0%A5%AE_%E0%A4%8B%E0%A4%94) (full-page): Matched एकाधिक as adjective headword at line 252.

<a id="case-017"></a>

### 17. word-validation:nep665

- Mode / source: `word` / `nep665` / `AK-Freq`
- Exact Roman input: <code>&quot;basyo&quot;</code>
- Original source proposal: <code>&quot;बस्यो&quot;</code>
- Draft suggested outputs: <code>[&quot;बस्यो&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact finite verb form appears in an official court publication.

Consulted evidence:

- [Nepal Kanoon Patrika — decision page 9073](https://nkp.gov.np/full_detail/9073) (full-page): Matched बस्यो at line 88.

<a id="case-018"></a>

### 18. word-validation:nep558

- Mode / source: `word` / `nep558` / `AK-Freq`
- Exact Roman input: <code>&quot;lepchaharu&quot;</code>
- Original source proposal: <code>&quot;लेप्चाहरू&quot;</code>
- Draft suggested outputs: <code>[&quot;लेप्चाहरू&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: A Nepali cultural report contains the exact plural ethnic-group spelling. The short/long plural-suffix vowel is not encoded unambiguously in informal haru.

Consulted evidence:

- [Gorkhapatra — पहिचान खोज्दै लेप्चा जाति](https://gorkhapatraonline.com/news/164765) (full-page): Matched लेप्चाहरू at line 66.

<a id="case-019"></a>

### 19. word-validation:nep587

- Mode / source: `word` / `nep587` / `AK-Freq`
- Exact Roman input: <code>&quot;angrejharuko&quot;</code>
- Original source proposal: <code>&quot;अंग्रेजहरूको&quot;</code>
- Draft suggested outputs: <code>[&quot;अंग्रेजहरूको&quot;, &quot;अङ्ग्रेजहरूको&quot;]</code>
- Assistant recommendation: **correct — draft**; confidence: medium.
- Evidence scope: Whole spelling attested for both nasal-writing variants; intended Roman reading remains unverified
- Assistant reasoning: The anusvara spelling appears in one Nepali publication and the explicit velar-nasal spelling in another. Preserve both as attested orthographic alternatives pending the project spelling policy; neither source proves this input has one uniquely intended spelling.

Consulted evidence:

- [Himalaya Times — गोर्खा भर्ती, सुगौली सन्धि र १९५० को सन्धि](https://ehimalayatimes.com/2023/07/137023/) (full-page): Matched अंग्रेजहरूको at line 138.
- [Gorkhapatra — मर्यादित शिक्षण पेसा](https://gorkhapatraonline.com/news/19123) (full-page): Matched अङ्ग्रेजहरूको at line 129.

<a id="case-020"></a>

### 20. word-validation:nep435

- Mode / source: `word` / `nep435` / `AK-Freq`
- Exact Roman input: <code>&quot;jaghanya&quot;</code>
- Original source proposal: <code>&quot;जघन्य&quot;</code>
- Draft suggested outputs: <code>[&quot;जघन्य&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact adjective appears in an official court publication defining categories of offences. This review uses its spelling only.

Consulted evidence:

- [Nepal Kanoon Patrika — decision page 10160](https://nkp.gov.np/full_detail/10160) (full-page): Matched जघन्य at line 134.

<a id="case-021"></a>

### 21. word-validation:nep491

- Mode / source: `word` / `nep491` / `AK-Freq`
- Exact Roman input: <code>&quot;pukar&quot;</code>
- Original source proposal: <code>&quot;पुकार&quot;</code>
- Draft suggested outputs: <code>[&quot;पुकार&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole headword and definition in a community-hosted Nepali dictionary compilation; intended Roman reading remains unverified
- Assistant reasoning: A Nepali dictionary compilation lists the exact headword. This community-hosted transcription is lexical evidence, not independent human verification.

Consulted evidence:

- [Nepali Wiktionary — नेपाली शब्दसमूह ३९ पु](https://ne.wiktionary.org/wiki/%E0%A4%A8%E0%A5%87%E0%A4%AA%E0%A4%BE%E0%A4%B2%E0%A5%80_%E0%A4%B6%E0%A4%AC%E0%A5%8D%E0%A4%A6%E0%A4%B8%E0%A4%AE%E0%A5%82%E0%A4%B9_%E0%A5%A9%E0%A5%AF_%E0%A4%AA%E0%A5%81) (full-page): Matched पुकार/पुकारा as headword at line 129.

<a id="case-022"></a>

### 22. word-validation:nep290

- Mode / source: `word` / `nep290` / `AK-Freq`
- Exact Roman input: <code>&quot;adhyayama&quot;</code>
- Original source proposal: <code>&quot;अध्यायमा&quot;</code>
- Draft suggested outputs: <code>[&quot;अध्यायमा&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole inflected spelling in government-hosted PDF search excerpt only; intended Roman reading remains unverified
- Assistant reasoning: The exact noun plus locative suffix is present in an indexed excerpt from a government-hosted grammar document. No full PDF inspection was completed.

Consulted evidence:

- [Government-hosted Majhi Grammar — chapter 2](https://giwmscdnone.gov.np/media/pdf_upload/Majhi%20Grammar_8gym8rc.pdf) (search-snippet): Indexed chapter introduction matches यस अध्यायमा.

<a id="case-023"></a>

### 23. word-validation:nep360

- Mode / source: `word` / `nep360` / `AK-Freq`
- Exact Roman input: <code>&quot;karyaharuma&quot;</code>
- Original source proposal: <code>&quot;कार्यहरूमा&quot;</code>
- Draft suggested outputs: <code>[&quot;कार्यहरूमा&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact noun with plural and locative suffixes appears in a Nepali article about workplace motivation.

Consulted evidence:

- [Gorkhapatra — उत्प्रेरणा र कार्यसन्तुष्टिको अन्तरसम्बन्ध](https://gorkhapatraonline.com/news/46481) (full-page): Matched कार्यहरूमा at line 124.

<a id="case-024"></a>

### 24. word-validation:nep438

- Mode / source: `word` / `nep438` / `AK-Freq`
- Exact Roman input: <code>&quot;paridhibhitra&quot;</code>
- Original source proposal: <code>&quot;परिधिभित्र&quot;</code>
- Draft suggested outputs: <code>[&quot;परिधिभित्र&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact source compound appears in an official court publication.

Consulted evidence:

- [Nepal Kanoon Patrika — decision page 9384](https://nkp.gov.np/full_detail/9384) (full-page): Matched परिधिभित्र at line 38.

<a id="case-025"></a>

### 25. word-validation:nep612

- Mode / source: `word` / `nep612` / `AK-Freq`
- Exact Roman input: <code>&quot;niskanda&quot;</code>
- Original source proposal: <code>&quot;निस्कँदा&quot;</code>
- Draft suggested outputs: <code>[&quot;निस्कँदा&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact nasalized verb form appears in a Nepali article. The source chandrabindu is supported despite its omission from informal niskanda.

Consulted evidence:

- [Shilapatra — चिसो मौसममा मर्निङ वाकः सबेरैभन्दा अबेर उपयुक्त](https://shilapatra.com/detail/151000) (full-page): Matched निस्कँदा at line 129.

<a id="case-026"></a>

### 26. word-validation:nep663

- Mode / source: `word` / `nep663` / `AK-Freq`
- Exact Roman input: <code>&quot;gaunle&quot;</code>
- Original source proposal: <code>&quot;गाउँले&quot;</code>
- Draft suggested outputs: <code>[&quot;गाउँले&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact nasalized noun occurs in a government cultural institution production cast list.

Consulted evidence:

- [Sanskritik Sansthan — माटोको गीत दोस्रो संस्करण](https://www.sanskritiksansthan.gov.np/content/527) (full-page): Matched गाउँले at lines 150–152.

<a id="case-027"></a>

### 27. word-validation:nep760

- Mode / source: `word` / `nep760` / `AK-Freq`
- Exact Roman input: <code>&quot;gherieko&quot;</code>
- Original source proposal: <code>&quot;घेरिएको&quot;</code>
- Draft suggested outputs: <code>[&quot;घेरिएको&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact inflected verb form is used in an official court publication.

Consulted evidence:

- [Nepal Kanoon Patrika — decision page 9024](https://nkp.gov.np/full_detail/9024) (full-page): Matched घेरिएको at line 141.

<a id="case-028"></a>

### 28. word-validation:nep647

- Mode / source: `word` / `nep647` / `AK-Freq`
- Exact Roman input: <code>&quot;vedko&quot;</code>
- Original source proposal: <code>&quot;वेदको&quot;</code>
- Draft suggested outputs: <code>[&quot;वेदको&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact genitive form occurs in a Nepali article about the Vedas. The informal final consonant in ved is compatible with this lexical reading.

Consulted evidence:

- [Gorkhapatra — वेद र वेदका मन्त्र](https://gorkhapatraonline.com/news/156789) (full-page): Matched वेदको at lines 51 and 65.

<a id="case-029"></a>

### 29. word-validation:nep433

- Mode / source: `word` / `nep433` / `AK-Freq`
- Exact Roman input: <code>&quot;pairaheka&quot;</code>
- Original source proposal: <code>&quot;पाइरहेका&quot;</code>
- Draft suggested outputs: <code>[&quot;पाइरहेका&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact inflected verb occurs in a District Administration Office page title.

Consulted evidence:

- [District Administration Office Humla — livelihood allowance notice](https://daohumla.moha.gov.np/page/thana-thama-gha-ita-bha-apa-na-gata-bhaeka-ra-sa-va-ka-tha-kha-na-ja-vana-na-ra) (full-page): Matched पाइरहेका in title at line 91.

<a id="case-030"></a>

### 30. word-validation:nep443

- Mode / source: `word` / `nep443` / `AK-Freq`
- Exact Roman input: <code>&quot;naline&quot;</code>
- Original source proposal: <code>&quot;नलिने&quot;</code>
- Draft suggested outputs: <code>[&quot;नलिने&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attested in running Nepali text; intended Roman reading remains unverified
- Assistant reasoning: The exact negative infinitival form appears in an official court publication.

Consulted evidence:

- [Nepal Kanoon Patrika — decision page 143](https://nkp.gov.np/full_detail/143) (full-page): Matched नलिने at line 132.

<a id="case-031"></a>

### 31. word-validation:nep632

- Mode / source: `word` / `nep632` / `AK-Freq`
- Exact Roman input: <code>&quot;bora&quot;</code>
- Original source proposal: <code>&quot;बोरा&quot;</code>
- Draft suggested outputs: <code>[&quot;बोरा&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: high.
- Evidence scope: Whole spelling and Nepali lexical meaning
- Assistant reasoning: The dictionary supports बोरा as the sack noun. Informal bora is a plausible rendering; the reference does not establish which sense a user intended.

Consulted evidence:

- [Bora — Nepali dictionary section (Wisdomlib, attributed to unoes Nepali-English Dictionary)](https://www.wisdomlib.org/definition/bora) (full-page): Nepali dictionary subsection explicitly lists बोरा as a sack. The Nepali subsection was consulted, not the Hindi/Marathi entries.

<a id="case-032"></a>

### 32. word-validation:nep344

- Mode / source: `word` / `nep344` / `AK-Freq`
- Exact Roman input: <code>&quot;halyo&quot;</code>
- Original source proposal: <code>&quot;हाल्यो&quot;</code>
- Draft suggested outputs: <code>[&quot;हाल्यो&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: high.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: हाल्यो is attested as a verb form in published Nepali. It is a plausible reading of halyo.

Consulted evidence:

- [सामाजिक सञ्जाल एक्सले भारत सरकारविरुद्ध हाल्यो मुद्दा — Online Khabar](https://www.onlinekhabar.com/2025/03/1646297/social-network-x-files-lawsuit-against-indian-government) (full-page): The headline contains हाल्यो, a past-tense verb form.

<a id="case-033"></a>

### 33. word-validation:nep504

- Mode / source: `word` / `nep504` / `AK-Freq`
- Exact Roman input: <code>&quot;afumathi&quot;</code>
- Original source proposal: <code>&quot;आफूमाथि&quot;</code>
- Draft suggested outputs: <code>[&quot;आफूमाथि&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The source attests the joined form आफूमाथि. This supports the source spelling but does not prove the original Roman user's intent.

Consulted evidence:

- [Notice 079-9-26 — House of Representatives voting record](https://hr.parliament.gov.np/uploads/attachments/tv9oh3iuyjuweywu.pdf) (search-snippet): The indexed voting-record excerpt uses आफूमाथि. Opening the PDF failed; evidence is limited to the indexed excerpt.

<a id="case-034"></a>

### 34. word-validation:nep288

- Mode / source: `word` / `nep288` / `AK-Freq`
- Exact Roman input: <code>&quot;dindaina&quot;</code>
- Original source proposal: <code>&quot;दिँदैन&quot;</code>
- Draft suggested outputs: <code>[&quot;दिँदैन&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The attested negative verb form includes chandrabindu. Informal dindaina plausibly omits that nasalization distinction.

Consulted evidence:

- [National Assembly transcript — attachment oqw7slnndhb0wnrq.pdf](https://na.parliament.gov.np/uploads/attachments/oqw7slnndhb0wnrq.pdf) (search-snippet): The indexed transcript excerpt contains दिँदैन. The PDF could not be inspected.

<a id="case-035"></a>

### 35. word-validation:nep560

- Mode / source: `word` / `nep560` / `AK-Freq`
- Exact Roman input: <code>&quot;utthan&quot;</code>
- Original source proposal: <code>&quot;उत्थान&quot;</code>
- Draft suggested outputs: <code>[&quot;उत्थान&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The official programme name corroborates उत्थान, including the त्थ cluster. Informal utthan is a plausible rendering.

Consulted evidence:

- [राष्ट्रपति महिला उत्थान कार्यक्रम — Office of the President](https://president.gov.np/%E0%A4%B0%E0%A4%BE%E0%A4%B7%E0%A5%8D%E0%A4%9F%E0%A5%8D%E0%A4%B0%E0%A4%AA%E0%A4%A4%E0%A4%BF%E0%A4%95%E0%A5%8B-%E0%A4%A8%E0%A4%BE%E0%A4%AE%E0%A4%AE%E0%A4%BE-%E0%A4%B8%E0%A4%82%E0%A4%9A%E0%A4%BE%E0%A4%B2/) (search-snippet): The programme title and indexed description repeatedly use उत्थान. Full page fetch failed.

<a id="case-036"></a>

### 36. word-validation:nep786

- Mode / source: `word` / `nep786` / `AK-Freq`
- Exact Roman input: <code>&quot;samanjasya&quot;</code>
- Original source proposal: <code>&quot;सामञ्जस्य&quot;</code>
- Draft suggested outputs: <code>[&quot;सामञ्जस्य&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: Government policy usage corroborates सामञ्जस्य. This is evidence for the ञ्ज spelling, not proof of a deterministic input mapping.

Consulted evidence:

- [वाणिज्य नीति, २०८१ — Government of Nepal](https://giwmscdnone.gov.np/media/pdf_upload/doc02016020250121174623-3-31_bf05bzx.pdf) (search-snippet): The indexed clause 11.13 excerpt contains सामञ्जस्य; visual PDF inspection was not performed.

<a id="case-037"></a>

### 37. word-validation:nep764

- Mode / source: `word` / `nep764` / `AK-Freq`
- Exact Roman input: <code>&quot;hetu&quot;</code>
- Original source proposal: <code>&quot;हेतु&quot;</code>
- Draft suggested outputs: <code>[&quot;हेतु&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: high.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: हेतु is attested in official Nepali prose and is a plausible rendering of hetu.

Consulted evidence:

- [गृहसचिव दिनेश भट्टराईबाट सशस्त्र प्रहरी  कर्मचारीहरुलाई  निर्देशन](https://apf.gov.np/news/4724-news-1) (full-page): The Armed Police Force article text contains हेतु in a purpose construction.

<a id="case-038"></a>

### 38. word-validation:nep442

- Mode / source: `word` / `nep442` / `AK-Freq`
- Exact Roman input: <code>&quot;sammanko&quot;</code>
- Original source proposal: <code>&quot;सम्मानको&quot;</code>
- Draft suggested outputs: <code>[&quot;सम्मानको&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The official legal provision supports सम्मानको as सम्मान plus the genitive ending.

Consulted evidence:

- [परिच्छेद–९ विविध – नेपाल कानून आयोग](https://repository.lawcommission.gov.np/np/documents/prevailing-law/statutes-acts/%E0%A4%B5%E0%A4%BF%E0%A4%A8%E0%A4%BF%E0%A4%AE%E0%A5%87%E0%A4%AF-%E0%A4%85%E0%A4%A7%E0%A4%BF%E0%A4%95%E0%A4%BE%E0%A4%B0-%E0%A4%AA%E0%A4%A4%E0%A5%8D%E0%A4%B0-%E0%A4%90%E0%A4%A8-%E0%A5%A8%E0%A5%A6/%E0%A4%AA%E0%A4%B0%E0%A4%BF%E0%A4%9A%E0%A5%8D%E0%A4%9B%E0%A5%87%E0%A4%A6-%E0%A5%AF-%E0%A4%B5%E0%A4%BF%E0%A4%B5%E0%A4%BF%E0%A4%A7-4/) (search-snippet): The indexed legal provision repeats सम्मानको in a phrase about acceptance for honour.

<a id="case-039"></a>

### 39. word-validation:nep453

- Mode / source: `word` / `nep453` / `AK-Freq`
- Exact Roman input: <code>&quot;kramik&quot;</code>
- Original source proposal: <code>&quot;क्रमिक&quot;</code>
- Draft suggested outputs: <code>[&quot;क्रमिक&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The guidelines corroborate क्रमिक in the sense of sequential progression. The consonant cluster and vowel marks are plausible for kramik.

Consulted evidence:

- [Inspector/ASI candidate guidelines (2076-12-05) — Nepal Police](https://nepalpolice.gov.np/media/filer_public/ae/e4/aee44765-826c-457f-a8cb-663eb5d8fd74/insp-asi-pbt-guidelines-for-candidates-2076-12-05.pdf) (search-snippet): The Nepal Police candidate guidelines excerpt uses क्रमिक; PDF rendering was not inspected.

<a id="case-040"></a>

### 40. word-validation:nep628

- Mode / source: `word` / `nep628` / `AK-Freq`
- Exact Roman input: <code>&quot;bhagna&quot;</code>
- Original source proposal: <code>&quot;भाग्न&quot;</code>
- Draft suggested outputs: <code>[&quot;भाग्न&quot;, &quot;भग्न&quot;]</code>
- Assistant recommendation: **correct — draft**; confidence: medium.
- Evidence scope: Two separately attested Nepali spellings; Roman ambiguity inferred
- Assistant reasoning: Retain the attested source भाग्न. The separately attested adjective भग्न is also a plausible informal reading of bhagna because vowel length and the final inherent vowel are not explicit. This is a candidate addition, not an assertion that the source is wrong.

Consulted evidence:

- [परिच्छेद–७,भाग्न लागेकोमा हतियार प्रयोग गर्ने तथा भागेकोमा खान तलास गर्ने – नेपाल कानून आयोग](https://repository.lawcommission.gov.np/np/documents/prevailing-law/rules-and-regulations/%E0%A4%95%E0%A4%BE%E0%A4%B0%E0%A4%BE%E0%A4%97%E0%A4%BE%E0%A4%B0-%E0%A4%A8%E0%A4%BF%E0%A4%AF%E0%A4%AE%E0%A4%BE%E0%A4%B5%E0%A4%B2%E0%A5%80-%E0%A5%A8%E0%A5%A6%E0%A5%A8%E0%A5%A6/%E0%A4%AA%E0%A4%B0%E0%A4%BF%E0%A4%9A%E0%A5%8D%E0%A4%9B%E0%A5%87%E0%A4%A6-%E0%A5%AD-11/) (search-snippet): The prison-rule heading and indexed clause use भाग्न.
- [गतिविधीहरु – Page 13 – नेपाल कानून आयोग](https://repository.lawcommission.gov.np/np/category/documents/activities/page/13/) (search-snippet): The indexed orthography-guide word list includes भग्न; the page fetch timed out.
- [नेपाली शब्दसमूह ४५ भ - विक्सनरी](https://ne.wiktionary.org/wiki/%E0%A4%A8%E0%A5%87%E0%A4%AA%E0%A4%BE%E0%A4%B2%E0%A5%80_%E0%A4%B6%E0%A4%AC%E0%A5%8D%E0%A4%A6%E0%A4%B8%E0%A4%AE%E0%A5%82%E0%A4%B9_%E0%A5%AA%E0%A5%AB_%E0%A4%AD) (search-snippet): The Nepali dictionary-style excerpt lists भग्न as an adjective for broken or ruined. This is a community-maintained secondary reference.

<a id="case-041"></a>

### 41. word-validation:nep250

- Mode / source: `word` / `nep250` / `AK-Uni`
- Exact Roman input: <code>&quot;header&quot;</code>
- Original source proposal: <code>&quot;हेडर&quot;</code>
- Draft suggested outputs: <code>[&quot;हेडर&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: An official bilingual training guide corroborates हेडर as an English loan. Its building-context sense does not determine whether this isolated input means a sports, document, or masonry header.

Consulted evidence:

- [Masonry training guide — Foreign Employment Board](https://feb.gov.np/extra_upload/5c50334d6095a_5.%20Final%20training_guide_mason.pdf) (search-snippet): The masonry training-guide excerpt pairs English Header with हेडर. The indexed excerpt was consulted, not a visual PDF page.

<a id="case-042"></a>

### 42. word-validation:nep84

- Mode / source: `word` / `nep84` / `AK-Uni`
- Exact Roman input: <code>&quot;fulbariharu&quot;</code>
- Original source proposal: <code>&quot;फूलबारीहरू&quot;</code>
- Draft suggested outputs: <code>[&quot;फूलबारीहरू&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The published poem corroborates the plural फूलबारीहरू. The Roman input does not explicitly mark vowel length; retain this as a plausible reading.

Consulted evidence:

- [The Bud 2080 — Little Angels' School magazine](https://las.edu.np/magazine.pdf) (search-snippet): The school's published magazine excerpt contains फूलबारीहरू; visual PDF inspection was not performed.

<a id="case-043"></a>

### 43. word-validation:nep171

- Mode / source: `word` / `nep171` / `AK-Uni`
- Exact Roman input: <code>&quot;goretaharuma&quot;</code>
- Original source proposal: <code>&quot;गोरेटाहरूमा&quot;</code>
- Draft suggested outputs: <code>[&quot;गोरेटाहरूमा&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: high.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The joined plural-plus-locative form गोरेटाहरूमा is directly attested in published Nepali.

Consulted evidence:

- [सिंजा संस्कृति झल्काउने जुम्लाको भुइँकाफल टिप्ने चलन - कान्तिपुर](https://ekantipur.com/feature/2026/07/17/17842895897334850.html) (full-page): The article body contains गोरेटाहरूमा for activity on village paths.

<a id="case-044"></a>

### 44. word-validation:nep239

- Mode / source: `word` / `nep239` / `AK-Uni`
- Exact Roman input: <code>&quot;bhaktapurrajyama&quot;</code>
- Original source proposal: <code>&quot;भक्तपुरराज्यमा&quot;</code>
- Draft suggested outputs: <code>[]</code>
- Assistant recommendation: **exclude — draft**; confidence: low.
- Evidence scope: Spaced phrase attestation; fused whole source spelling not verified
- Assistant reasoning: The place name and phrase are supported only in the spaced form भक्तपुर राज्यमा. The fused source boundary is unresolved, and I cannot treat component attestation as confirmation of the complete word. Hold this case for a proficient reviewer rather than automatically accepting or correcting it.

Consulted evidence:

- [Bhaktapur municipal publication BKT-268](https://www.bhaktapurmun.gov.np/sites/bhaktapurmun.gov.np/files/documents/BKT-268%20Reduce.pdf) (search-snippet): The municipal history excerpt contains भक्तपुर राज्यमा with a space. It does not attest the fused source spelling भक्तपुरराज्यमा.

<a id="case-045"></a>

### 45. word-validation:nep279

- Mode / source: `word` / `nep279` / `AK-Uni`
- Exact Roman input: <code>&quot;kendraharudwara&quot;</code>
- Original source proposal: <code>&quot;केन्द्रहरूद्वारा&quot;</code>
- Draft suggested outputs: <code>[&quot;केन्द्रहरूद्वारा&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The official bulletin corroborates the full form केन्द्रहरूद्वारा, including the plural and instrumental components.

Consulted evidence:

- [Crime Investigation monthly e-bulletin, Mangsir 2081 — Nepal Police](https://cid.nepalpolice.gov.np/media/filer_public/65/29/65290821-26b2-41f9-8694-071b755c4487/mansir-me-2081.pdf) (search-snippet): The community-policing activity excerpt contains केन्द्रहरूद्वारा.

<a id="case-046"></a>

### 46. word-validation:nep237

- Mode / source: `word` / `nep237` / `AK-Uni`
- Exact Roman input: <code>&quot;hospitaltarfa&quot;</code>
- Original source proposal: <code>&quot;हस्पिटलतर्फ&quot;</code>
- Draft suggested outputs: <code>[&quot;हस्पिटलतर्फ&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: high.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The legal record corroborates हस्पिटलतर्फ. It is a plausible Nepali rendering of the loan plus the direction ending in hospitaltarfa.

Consulted evidence:

- [नेपाल कानून पत्रिका](https://nkp.gov.np/full_detail/308) (full-page): The court-record body contains हस्पिटलतर्फ in a passage about taking someone for treatment.

<a id="case-047"></a>

### 47. word-validation:nep217

- Mode / source: `word` / `nep217` / `AK-Uni`
- Exact Roman input: <code>&quot;manovaigyanikharule&quot;</code>
- Original source proposal: <code>&quot;मनोवैज्ञानिकहरूले&quot;</code>
- Draft suggested outputs: <code>[&quot;मनोवैज्ञानिकहरूले&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The police magazine corroborates the entire plural instrumental form मनोवैज्ञानिकहरूले.

Consulted evidence:

- [Crime Investigation magazine 2071 — Nepal Police](https://cid.nepalpolice.gov.np/media/filer_public/36/a8/36a88505-8f15-49b8-9cef-add9e8aa2b78/cid_magazine_2071.pdf) (search-snippet): The criminal-investigation magazine excerpt contains मनोवैज्ञानिकहरूले in discussion of cognitive-psychology research.

<a id="case-048"></a>

### 48. word-validation:nep52

- Mode / source: `word` / `nep52` / `AK-Uni`
- Exact Roman input: <code>&quot;premchandradwara&quot;</code>
- Original source proposal: <code>&quot;प्रेमचन्द्रद्वारा&quot;</code>
- Draft suggested outputs: <code>[&quot;प्रेमचन्द्रद्वारा&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation in a proper-name context
- Assistant reasoning: The exact spelling is attested in a literary-name context. Accept provisionally as a plausible proper-name plus द्वारा; the isolated input cannot establish the person's identity.

Consulted evidence:

- [TU thesis section 3.5: विश्वेश्वरप्रसाद कोइरालाको कथायात्रा र चरण विभाजन](https://elibrary.tucl.edu.np/bitstreams/6ebe171c-ca10-4cfe-bb64-3b9e7750da6c/download) (search-snippet): The TU thesis excerpt contains प्रेमचन्द्रद्वारा when discussing a Hindi literary editor.

<a id="case-049"></a>

### 49. word-validation:nep261

- Mode / source: `word` / `nep261` / `AK-Uni`
- Exact Roman input: <code>&quot;vigyanle&quot;</code>
- Original source proposal: <code>&quot;विज्ञानले&quot;</code>
- Draft suggested outputs: <code>[&quot;विज्ञानले&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The textbook supports विज्ञानले as विज्ञान with the instrumental ending. Informal vigyan plausibly represents the ज्ञ cluster.

Consulted evidence:

- [Nepali Class 8 textbook hosted by Dhangadhimai Municipality](https://dhangadhimaimun.gov.np/sites/dhangadhimaimun.gov.np/files/documents/Nepali_Class8.pdf) (search-snippet): The Nepali Class 8 textbook excerpt repeatedly uses विज्ञानले.

<a id="case-050"></a>

### 50. word-validation:nep77

- Mode / source: `word` / `nep77` / `AK-Uni`
- Exact Roman input: <code>&quot;gabhnuparchha&quot;</code>
- Original source proposal: <code>&quot;गाभ्नुपर्छ&quot;</code>
- Draft suggested outputs: <code>[&quot;गाभ्नुपर्छ&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The exact joined verb construction गाभ्नुपर्छ is attested in an education publication.

Consulted evidence:

- [Teacher Education Book 2072 — National Centre for Educational Development](https://nced.gov.np/np/files/multipleupload/0-02-Aug-2017-06-08-37Teacher%20Education%20Book%202072.pdf) (search-snippet): The teacher-education publication's indexed excerpt contains गाभ्नुपर्छ in discussion of merging small schools.

<a id="case-051"></a>

### 51. word-validation:nep99

- Mode / source: `word` / `nep99` / `AK-Uni`
- Exact Roman input: <code>&quot;fyankidinchhan&quot;</code>
- Original source proposal: <code>&quot;फ्याँकिदिन्छन्&quot;</code>
- Draft suggested outputs: <code>[&quot;फ्याँकिदिन्छन्&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The published literary example supports the whole form with chandrabindu and the final virama. Informal fyankidinchhan plausibly represents those details.

Consulted evidence:

- [पाठक — literary essay hosted by Sahitya Sangraha](https://sahityasangraha.com/2014/01/24/%E0%A4%B9%E0%A4%BE%E0%A4%81%E0%A4%B8%E0%A5%8D%E0%A4%AF-%E0%A4%AC%E0%A5%8D%E0%A4%AF%E0%A4%99%E0%A5%8D%E0%A4%97%E0%A5%8D%E0%A4%AF-%E0%A4%AA%E0%A4%BE%E0%A4%A0%E0%A4%95/) (search-snippet): The indexed literary essay contains फ्याँकिदिन्छन्.

<a id="case-052"></a>

### 52. word-validation:nep133

- Mode / source: `word` / `nep133` / `AK-Uni`
- Exact Roman input: <code>&quot;mediasanga&quot;</code>
- Original source proposal: <code>&quot;मिडियासँग&quot;</code>
- Draft suggested outputs: <code>[&quot;मिडियासँग&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The source corroborates the loan noun मिडिया joined to सँग. It is a plausible informal reading of mediasanga.

Consulted evidence:

- [Samhita, Poush 2078 — Press Council Nepal](https://www.presscouncilnepal.gov.np/np/wp-content/uploads/2022/02/Samhita-_Push-078.pdf) (search-snippet): The Press Council publication's excerpt uses मिडियासँग.

<a id="case-053"></a>

### 53. word-validation:nep197

- Mode / source: `word` / `nep197` / `AK-Uni`
- Exact Roman input: <code>&quot;indradevle&quot;</code>
- Original source proposal: <code>&quot;इन्द्रदेवले&quot;</code>
- Draft suggested outputs: <code>[&quot;इन्द्रदेवले&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation in a proper-name context
- Assistant reasoning: The spelling इन्द्रदेवले is attested as a personal-name construction. It does not establish whether the dataset means that person or the deity.

Consulted evidence:

- [Purnima 11(3) — historical journal archived by Digital Himalaya](https://d1i1jdw69xsqx0.cloudfront.net/digitalhimalaya/collections/journals/purnima/pdf/Purnima_11_03.pdf) (search-snippet): The Purnima historical-journal excerpt contains इन्द्रदेवले in a royal-name context.

<a id="case-054"></a>

### 54. word-validation:nep206

- Mode / source: `word` / `nep206` / `AK-Uni`
- Exact Roman input: <code>&quot;lakhetiraheka&quot;</code>
- Original source proposal: <code>&quot;लखेटिरहेका&quot;</code>
- Draft suggested outputs: <code>[&quot;लखेटिरहेका&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The official textbook activity corroborates the full continuous verb form लखेटिरहेका.

Consulted evidence:

- [Nepali Grade 8 — CEHRD learning portal](https://learning.cehrd.gov.np/pluginfile.php/181/mod_resource/content/1/Nepali%20grade%208.pdf) (search-snippet): The indexed Grade 8 Nepali textbook activity contains लखेटिरहेका.

<a id="case-055"></a>

### 55. word-validation:nep248

- Mode / source: `word` / `nep248` / `AK-Uni`
- Exact Roman input: <code>&quot;patrakaraharumathi&quot;</code>
- Original source proposal: <code>&quot;पत्रकारहरूमाथि&quot;</code>
- Draft suggested outputs: <code>[&quot;पत्रकारहरूमाथि&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The full plural-plus-postposition form पत्रकारहरूमाथि is corroborated by a professional journalism publication.

Consulted evidence:

- [Karnaliko Patrakarita — Press Council Nepal](https://www.presscouncilnepal.gov.np/np/wp-content/uploads/2025/06/karnaliko-patrakarita-1.pdf) (search-snippet): The Press Council volume excerpt contains पत्रकारहरूमाथि.

<a id="case-056"></a>

### 56. word-validation:nep262

- Mode / source: `word` / `nep262` / `AK-Uni`
- Exact Roman input: <code>&quot;samhalnubhaeko&quot;</code>
- Original source proposal: <code>&quot;सम्हाल्नुभएको&quot;</code>
- Draft suggested outputs: <code>[&quot;सम्हाल्नुभएको&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The official release corroborates the respectful verb form सम्हाल्नुभएको. Informal samhalnubhaeko is a plausible rendering.

Consulted evidence:

- [अध्यक्ष पौडेलबाट पदभार ग्रहण — Nepal Insurance Authority](https://www.nia.gov.np/press/release/detail/athhayakashha-padalbta-pathabhara-garahanae) (search-snippet): The official appointment-release excerpt contains सम्हाल्नुभएको; full-page fetching timed out.

<a id="case-057"></a>

### 57. word-validation:nep62

- Mode / source: `word` / `nep62` / `AK-Uni`
- Exact Roman input: <code>&quot;bolaunuparne&quot;</code>
- Original source proposal: <code>&quot;बोलाउनुपर्ने&quot;</code>
- Draft suggested outputs: <code>[&quot;बोलाउनुपर्ने&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The municipal law supports the joined obligation construction बोलाउनुपर्ने.

Consulted evidence:

- [Musikot municipal Cooperative Act 2074](https://musikotmunrukum.gov.np/sites/musikotmunrukum.gov.np/files/documents/%E0%A4%AE%E0%A5%81%E0%A4%B8%E0%A4%BF%E0%A4%95%E0%A5%8B%E0%A4%9F%20%E0%A4%A8%E0%A4%97%E0%A4%B0%E0%A4%AA%E0%A4%BE%E0%A4%B2%E0%A4%BF%E0%A4%95%E0%A4%BE%E0%A4%95%E0%A5%8B%20%E0%A4%B8%E0%A4%B9%E0%A4%95%E0%A4%BE%E0%A4%B0%E0%A5%80%20%E0%A4%90%E0%A4%A8%20%20%E0%A5%A8%E0%A5%A6%E0%A5%AD%E0%A5%AA.pdf) (search-snippet): The cooperative-law excerpt repeatedly uses बोलाउनुपर्ने.

<a id="case-058"></a>

### 58. word-validation:nep103

- Mode / source: `word` / `nep103` / `AK-Uni`
- Exact Roman input: <code>&quot;pandejyule&quot;</code>
- Original source proposal: <code>&quot;पाण्डेज्यूले&quot;</code>
- Draft suggested outputs: <code>[&quot;पाण्डेज्यूले&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: high.
- Evidence scope: Whole spelling attestation in a named honorific context
- Assistant reasoning: The exact surname-plus-honorific form is attested in an official record. Identity still needs context; retain this plausible spelling.

Consulted evidence:

- [महान्यायाधिवक्ताको कार्यालय](https://ag.gov.np/oag-post/1618) (full-page): The workshop record contains पाण्डेज्यूले in reference to Padma Prasad Pande.

<a id="case-059"></a>

### 59. word-validation:nep175

- Mode / source: `word` / `nep175` / `AK-Uni`
- Exact Roman input: <code>&quot;companyharumathi&quot;</code>
- Original source proposal: <code>&quot;कम्पनीहरूमाथि&quot;</code>
- Draft suggested outputs: <code>[&quot;कम्पनीहरूमाथि&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The report corroborates the complete loanword-plus-plural-plus-postposition form कम्पनीहरूमाथि. Informal company is an English-spelled loan and fits this reading.

Consulted evidence:

- [Nepal Telecom consolidated financial statements, 2077/78](https://cms.ntc.net.np/storage/media/gM01GEEPTnfUBHHTAipjQnUzCoLkFXP3pcIQUX4n.pdf) (search-snippet): The Nepal Telecom financial-report excerpt contains कम्पनीहरूमाथि. Text extraction elsewhere in the excerpt is imperfect, so this is corroboration rather than normative proof.

<a id="case-060"></a>

### 60. word-validation:nep189

- Mode / source: `word` / `nep189` / `AK-Uni`
- Exact Roman input: <code>&quot;bhagidarko&quot;</code>
- Original source proposal: <code>&quot;भागीदारको&quot;</code>
- Draft suggested outputs: <code>[&quot;भागीदारको&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: high.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The editorial body corroborates भागीदारको. It is a plausible genitive form for informal bhagidarko.

Consulted evidence:

- [ताजा जनादेश उपयुक्त मौका](https://gorkhapatraonline.com/news/180757) (full-page): The article body contains भागीदारको.

<a id="case-061"></a>

### 61. word-validation:nep162

- Mode / source: `word` / `nep162` / `AK-Uni`
- Exact Roman input: <code>&quot;sambhawanaharulai&quot;</code>
- Original source proposal: <code>&quot;सम्भावनाहरूलाई&quot;</code>
- Draft suggested outputs: <code>[&quot;सम्भावनाहरूलाई&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The official address supports the full plural dative construction सम्भावनाहरूलाई. The Roman bh and w conventions remain informal.

Consulted evidence:

- [सम्माननीय राष्ट्रपति श्रीमती विद्यादेवी भण्डारीज्यूले विभिन्न सञ्चार माध्यमका प्रकाशक/सम्पादकहरूसँग भेटघाटको अवसरमा व्यक्त गर्नुभएको विचार - राष्ट्रपतिको कार्यालय](https://president.gov.np/%E0%A4%B8%E0%A4%AE%E0%A5%8D%E0%A4%AE%E0%A4%BE%E0%A4%A8%E0%A4%A8%E0%A5%80%E0%A4%AF-%E0%A4%B0%E0%A4%BE%E0%A4%B7%E0%A5%8D%E0%A4%9F%E0%A5%8D%E0%A4%B0%E0%A4%AA%E0%A4%A4%E0%A4%BF-%E0%A4%B6%E0%A5%8D-227/) (search-snippet): The President's indexed address contains सम्भावनाहरूलाई; full-page fetching timed out.

<a id="case-062"></a>

### 62. word-validation:nep183

- Mode / source: `word` / `nep183` / `AK-Uni`
- Exact Roman input: <code>&quot;dushprawrittiharuko&quot;</code>
- Original source proposal: <code>&quot;दुष्प्रवृत्तिहरूको&quot;</code>
- Draft suggested outputs: <code>[&quot;दुष्प्रवृत्तिहरूको&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The interview corroborates the plural genitive spelling दुष्प्रवृत्तिहरूको, including ष्प्र and वृ. That spelling is a plausible intended informal reading, not a core-keyboard mapping.

Consulted evidence:

- [\*‘आख्यान विधाले घरघरको कथा बोलिरहेको हुन्छ’ \| Nepal's first 24-hour updated news portal - Ratopati](https://www.ratopati.com/story/497777/the-narrative-genre-is-telling-the-story-of-every-household) (search-snippet): The indexed literary interview contains दुष्प्रवृत्तिहरूको. The full article was blocked by the host.

<a id="case-063"></a>

### 63. word-validation:nep147

- Mode / source: `word` / `nep147` / `AK-Uni`
- Exact Roman input: <code>&quot;suktiharu&quot;</code>
- Original source proposal: <code>&quot;सूक्तिहरू&quot;</code>
- Draft suggested outputs: <code>[&quot;सूक्तिहरू&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The official book title corroborates the plural सूक्तिहरू. Roman suktiharu does not itself disambiguate the long उ sound.

Consulted evidence:

- [Legal Maxims – कानूनी सूक्तिहरू – नेपाल कानून आयोग](https://repository.lawcommission.gov.np/np/documents/legal-maxims-%E0%A4%95%E0%A4%BE%E0%A4%A8%E0%A5%82%E0%A4%A8%E0%A5%80-%E0%A4%B8%E0%A5%82%E0%A4%95%E0%A5%8D%E0%A4%A4%E0%A4%BF%E0%A4%B9%E0%A4%B0%E0%A5%82/) (search-snippet): The Law Commission publication title explicitly contains सूक्तिहरू. Full-page fetching timed out.

<a id="case-064"></a>

### 64. word-validation:nep73

- Mode / source: `word` / `nep73` / `AK-Uni`
- Exact Roman input: <code>&quot;asuraharuko&quot;</code>
- Original source proposal: <code>&quot;असुरहरूको&quot;</code>
- Draft suggested outputs: <code>[&quot;असुरहरूको&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: Whole spelling attestation; informal Roman association inferred, intended reading not verified
- Assistant reasoning: The cultural essay corroborates असुरहरूको. It is a plausible plural genitive reading of asuraharuko.

Consulted evidence:

- [धार्मिक परम्पराका प्राचीन दुई मार्गः सुर र असुर – Online Khabar](https://www.onlinekhabar.com/2018/05/676615/%E0%A4%A7%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%AE%E0%A4%BF%E0%A4%95-%E0%A4%AA%E0%A4%B0%E0%A4%AE%E0%A5%8D%E0%A4%AA%E0%A4%B0%E0%A4%BE%E0%A4%95%E0%A4%BE-%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%BE%E0%A4%9A%E0%A5%80) (search-snippet): The indexed essay contains असुरहरूको when discussing mythological groups.

<a id="case-065"></a>

### 65. word-validation:nep45

- Mode / source: `word` / `nep45` / `AK-Uni`
- Exact Roman input: <code>&quot;tariniprasadale&quot;</code>
- Original source proposal: <code>&quot;तारिणीप्रसादले&quot;</code>
- Draft suggested outputs: <code>[&quot;तारिणीप्रसादले&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: high.
- Evidence scope: Whole spelling attestation in a proper-name context
- Assistant reasoning: The full form is attested as a person's name plus ले. It supports a plausible proper-name reading, while the isolated dataset row does not establish identity.

Consulted evidence:

- [इतिहास: जनक्रान्तिमा रेडियो  - कान्तिपुर](https://ekantipur.com/koseli/2022/02/05/164403134365231121.html) (full-page): The historical feature body contains तारिणीप्रसादले in the Radio Nepal founding narrative.

<a id="case-066"></a>

### 66. word-validation:nep2469

- Mode / source: `word` / `nep2469` / `IndicCorp`
- Exact Roman input: <code>&quot;elakama&quot;</code>
- Original source proposal: <code>&quot;एलाकामा&quot;</code>
- Draft suggested outputs: <code>[]</code>
- Assistant recommendation: **exclude — draft**; confidence: low.
- Evidence scope: comparison-spelling-only
- Assistant reasoning: Sources attest इलाका / इलाकामा, whereas the exact pair uses elakama / एलाकामा. Context is needed to decide whether this is a regional form, name, or source misspelling; do not silently change initial e to i.
- Alignment notes: Initial vowel needs source context.

Consulted evidence:

- [शब्दसखा — इलाका](https://sabdasakha.com/word/%E0%A4%87%E0%A4%B2%E0%A4%BE%E0%A4%95%E0%A4%BE) (search-snippet): The indexed dictionary entry attests इलाका; full-page fetch returned 403.
- [Nepal Police — surveillance cameras inauguration](https://ktmvalley.nepalpolice.gov.np/news/469/) (search-snippet): Usage attests इलाकामा, not the dataset spelling एलाकामा.

<a id="case-067"></a>

### 67. word-validation:nep1258

- Mode / source: `word` / `nep1258` / `IndicCorp`
- Exact Roman input: <code>&quot;wajedle&quot;</code>
- Original source proposal: <code>&quot;वाजेदले&quot;</code>
- Draft suggested outputs: <code>[&quot;वाजेदले&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: whole-spelling-attestation
- Assistant reasoning: Nepali reporting directly attests वाजेदले as an inflected foreign surname. Informal w/v and unmarked vowel length make this a plausible reading; no identity claim is established.

Consulted evidence:

- [Sagarmatha TV — report about Wazed](https://sagarmatha.tv/2024/09/137479/) (search-snippet): Indexed article attests वाजेदले; full-page retrieval was unavailable.

<a id="case-068"></a>

### 68. word-validation:nep1076

- Mode / source: `word` / `nep1076` / `IndicCorp`
- Exact Roman input: <code>&quot;aspatalbichko&quot;</code>
- Original source proposal: <code>&quot;अस्पतालबीचको&quot;</code>
- Draft suggested outputs: <code>[&quot;अस्पतालबीचको&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: whole-spelling-attestation
- Assistant reasoning: An official Nepal Police article contains अस्पतालबीचको exactly. The informal Roman omits long-vowel distinctions; the spelling is a plausible compound reading.

Consulted evidence:

- [Nepal Police — agreement with Megha Hospital](https://nepalpolice.gov.np/news/2590/) (full-page): Article body contains अस्पतालबीचको.

<a id="case-069"></a>

### 69. word-validation:nep1540

- Mode / source: `word` / `nep1540` / `IndicCorp`
- Exact Roman input: <code>&quot;bhaktiganyukta&quot;</code>
- Original source proposal: <code>&quot;भक्तिगानयुक्त&quot;</code>
- Draft suggested outputs: <code>[&quot;भक्तिगानयुक्त&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: whole-spelling-attestation
- Assistant reasoning: A Nepali editorial attests भक्तिगानयुक्त exactly; the Roman sequence corresponds to the compound without requiring added words.

Consulted evidence:

- [Nagarik — जन्मोत्सव जीवनमय बनोस्](https://nagariknews.nagariknetwork.com/amp/others/125477-1499491920.html) (search-snippet): Indexed editorial contains भक्तिगानयुक्त; full-page retrieval failed.

<a id="case-070"></a>

### 70. word-validation:nep2051

- Mode / source: `word` / `nep2051` / `IndicCorp`
- Exact Roman input: <code>&quot;purnakalinlai&quot;</code>
- Original source proposal: <code>&quot;पूर्णकालीनलाई&quot;</code>
- Draft suggested outputs: <code>[&quot;पूर्णकालीनलाई&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: whole-spelling-attestation
- Assistant reasoning: An Auditor General report attests पूर्णकालीनलाई. This is a plausible inflected reading with vowel length inferred in informal Roman.

Consulted evidence:

- [Office of the Auditor General — employment-program audit](https://old.oag.gov.np/uploads/files/kWR-%E0%A4%95%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%AF%E0%A4%AE%E0%A5%82%E0%A4%B2%E0%A4%95%20%E0%A4%B0%E0%A5%8B%E0%A4%9C%E0%A4%97%E0%A4%BE%E0%A4%B0%20%E0%A4%95%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%AF%E0%A4%95%E0%A5%8D%E0%A4%B0%E0%A4%AE%20%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%A4%E0%A4%BF%E0%A4%B5%E0%A5%87%E0%A4%A6%E0%A4%A8%20%E0%A5%A8%E0%A5%A6%E0%A5%AD%E0%A5%AE.pdf) (search-snippet): Indexed report contains पूर्णकालीनलाई.

<a id="case-071"></a>

### 71. word-validation:nep1657

- Mode / source: `word` / `nep1657` / `IndicCorp`
- Exact Roman input: <code>&quot;warshadaikhi&quot;</code>
- Original source proposal: <code>&quot;वर्षदैखि&quot;</code>
- Draft suggested outputs: <code>[]</code>
- Assistant recommendation: **exclude — draft**; confidence: low.
- Evidence scope: comparison-spelling-only
- Assistant reasoning: Official usage supports वर्षदेखि, but the pair explicitly uses warshadaikhi / वर्षदैखि. Substituting देखि would repair the input vowel as well as the target; hold for source or dialect context.
- Alignment notes: dai versus de cannot be silently repaired.

Consulted evidence:

- [Nepal Law Commission — cooperative-law penalties](https://repository.lawcommission.gov.np/np/documents/prevailing-law/statutes-acts/%E0%A4%B8%E0%A4%B9%E0%A4%95%E0%A4%BE%E0%A4%B0%E0%A5%80-%E0%A4%90%E0%A4%A8-%E0%A5%A8%E0%A5%A6%E0%A5%AD%E0%A5%AA/%E0%A4%AA%E0%A4%B0%E0%A4%BF%E0%A4%9A%E0%A5%8D%E0%A4%9B%E0%A5%87%E0%A4%A6-%E0%A5%A7%E0%A5%AF-%E0%A4%95%E0%A4%B8%E0%A5%82%E0%A4%B0-%E0%A4%A6%E0%A4%A3%E0%A5%8D%E0%A4%A1-%E0%A4%9C%E0%A4%B0/) (search-snippet): Indexed text attests वर्षदेखि; full-page retrieval unavailable.

<a id="case-072"></a>

### 72. word-validation:nep881

- Mode / source: `word` / `nep881` / `IndicCorp`
- Exact Roman input: <code>&quot;devnarasinh&quot;</code>
- Original source proposal: <code>&quot;देवनरसिंह&quot;</code>
- Draft suggested outputs: <code>[&quot;देवनरसिंह&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: name-spelling-attestation
- Assistant reasoning: A Nepali historical article attests the name देवनरसिंह. The Roman form is a plausible name reading; occurrence does not identify which person this isolated dataset row means.

Consulted evidence:

- [Gorkhapatra — त्यतिबेला इलम सिक्न जापान](https://gorkhapatraonline.com/news/15596) (full-page): Article attests देवनरसिंह in a personal name.

<a id="case-073"></a>

### 73. word-validation:nep1089

- Mode / source: `word` / `nep1089` / `IndicCorp`
- Exact Roman input: <code>&quot;mauribhiralgayatma&quot;</code>
- Original source proposal: <code>&quot;मौरीभिरलगायतमा&quot;</code>
- Draft suggested outputs: <code>[&quot;मौरीभिरलगायतमा&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: low.
- Evidence scope: component-attestation
- Assistant reasoning: Municipal usage supports the place-name root मौरीभिर. लगायतमा is a plausible appended form; the full joined string was not independently attested. Keep compound segmentation open.
- Alignment notes: Only root independently attested; full compound needs human confirmation.

Consulted evidence:

- [Baglung Municipality — approved municipal programs](https://baglungmun.gov.np/sites/baglungmun.gov.np/files/documents/Baglung%20Municipality%201%20_%20Report_2081.pdf) (search-snippet): Indexed PDF attests मौरीभिर; full PDF fetch timed out.

<a id="case-074"></a>

### 74. word-validation:nep1476

- Mode / source: `word` / `nep1476` / `IndicCorp`
- Exact Roman input: <code>&quot;banaesange&quot;</code>
- Original source proposal: <code>&quot;बनाएसँगे&quot;</code>
- Draft suggested outputs: <code>[]</code>
- Assistant recommendation: **exclude — draft**; confidence: low.
- Evidence scope: comparison-spelling-only
- Assistant reasoning: A Nepali article directly attests बनाएसँगै. The source uses बनाएसँगे and the Roman ends sange; the final-vowel correction is not established by the exact input. Hold rather than silently normalize.
- Alignment notes: sange / सँगे versus सँगै needs reviewer context.

Consulted evidence:

- [Kantipur — रसुवागढी नाका reopening report](https://ekantipur.com/business/2026/01/01/rasuwagadhi-border-checkpoint-reopens-after-6-months-41-27.html) (full-page): Article body attests बनाएसँगै.

<a id="case-075"></a>

### 75. word-validation:nep1831

- Mode / source: `word` / `nep1831` / `IndicCorp`
- Exact Roman input: <code>&quot;lagalagi&quot;</code>
- Original source proposal: <code>&quot;लगालगी&quot;</code>
- Draft suggested outputs: <code>[&quot;लगालगी&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: whole-spelling-attestation
- Assistant reasoning: A Nepali literary reminiscence directly uses लगालगी. That supports a Nepali reading of this Roman form; a Hindi dictionary alone would not suffice.

Consulted evidence:

- [Online Khabar — memories of Nagendra Raj Sharma](https://www.onlinekhabar.com/2026/07/1981931/nagendra-raj-sharma-a-series-of-memories) (full-page): Article body contains लगालगी.

<a id="case-076"></a>

### 76. word-validation:nep815

- Mode / source: `word` / `nep815` / `Wikidata`
- Exact Roman input: <code>&quot;suttner&quot;</code>
- Original source proposal: <code>&quot;सटनर&quot;</code>
- Draft suggested outputs: <code>[]</code>
- Assistant recommendation: **exclude — draft**; confidence: low.
- Evidence scope: cross-language-comparison-only
- Assistant reasoning: Only cross-language Devanagari usage of सटनर with Suttner was found, not a verified Nepali name entry for this case. Foreign-name vowel and conjunct conventions require context.

Consulted evidence:

- [Hindi examination-paper mirror — Bertha von Suttner](https://cdn-images.prepp.in/public/image/MP_Police_Constable_2023_Question_Paper_and_Answer_Key_PDF_Aug_20_2023_Shift_1__96f80f8fc9240258ddb498d9d910b939.pdf) (search-snippet): Indexed Hindi paper pairs Suttner with सटनर; it does not establish a Nepali spelling.

<a id="case-077"></a>

### 77. word-validation:nep810

- Mode / source: `word` / `nep810` / `Wikidata`
- Exact Roman input: <code>&quot;javara&quot;</code>
- Original source proposal: <code>&quot;जवरा&quot;</code>
- Draft suggested outputs: <code>[]</code>
- Assistant recommendation: **exclude — draft**; confidence: low.
- Evidence scope: limited-name-attestation
- Assistant reasoning: A municipal literary journal indexes जवरा in a bibliographic citation. This limited, OCR-prone occurrence does not identify the Wikidata name or validate the exact javara label. Preserve the source pending identity verification.

Consulted evidence:

- [Bharatpur Municipality — Pragya journal](https://bharatpurmun.gov.np/sites/bharatpurmun.gov.np/files/documents/Bharatpur%20Pragya__Journal.pdf) (search-snippet): Indexed journal citation contains जवरा; full PDF retrieval failed.

<a id="case-078"></a>

### 78. word-validation:nep806

- Mode / source: `word` / `nep806` / `Wikidata`
- Exact Roman input: <code>&quot;chintaman&quot;</code>
- Original source proposal: <code>&quot;चिंतामन&quot;</code>
- Draft suggested outputs: <code>[]</code>
- Assistant recommendation: **exclude — draft**; confidence: low.
- Evidence scope: cross-language-and-name-comparison
- Assistant reasoning: Hindi sources attest चिंतामन and a Nepali thesis indexes चिन्तामन. These support a possible name but do not verify the exact Nepali name identity or spelling choice of this isolated row. Do not replace anusvara with a conjunct automatically.

Consulted evidence:

- [Hindwi dictionary — चिंतामन](https://www.hindwi.org/hindi-dictionary/meaning-of-chintaaman) (search-snippet): Hindi entry attests चिंतामन; evidence is not a Nepali standard.
- [Tribhuvan University — literary thesis](https://elibrary.tucl.edu.np/bitstreams/c24d3f86-ce63-4bfa-ad4f-80b60a3fa65b/download) (search-snippet): Indexed Nepali thesis uses चिन्तामन, a comparison form.

<a id="case-079"></a>

### 79. word-validation:nep813

- Mode / source: `word` / `nep813` / `Wikidata`
- Exact Roman input: <code>&quot;manjhi&quot;</code>
- Original source proposal: <code>&quot;मांझी&quot;</code>
- Draft suggested outputs: <code>[]</code>
- Assistant recommendation: **exclude — draft**; confidence: low.
- Evidence scope: name-and-language-ambiguity
- Assistant reasoning: Government Nepali usage attests माझी; an encyclopedia attests मांझी for an Indian personal name. With no identity context, neither a correction to माझी nor automatic acceptance of मांझी is established for manjhi.

Consulted evidence:

- [NFDIN — माझी](https://nfdin.gov.np/pages/majhi/) (full-page): Nepal government page attests माझी.
- [Wikipedia — Dashrath Manjhi](https://en.wikipedia.org/wiki/Dashrath_Manjhi) (search-snippet): Native-name field attests मांझी for a specific Indian name.

<a id="case-080"></a>

### 80. word-validation:nep811

- Mode / source: `word` / `nep811` / `Wikidata`
- Exact Roman input: <code>&quot;gopalman&quot;</code>
- Original source proposal: <code>&quot;गोपालमान&quot;</code>
- Draft suggested outputs: <code>[&quot;गोपालमान&quot;]</code>
- Assistant recommendation: **accept — draft**; confidence: medium.
- Evidence scope: name-spelling-attestation
- Assistant reasoning: A Nepali publisher author page directly attests गोपालमान. That supports the proposed name spelling as a plausible Roman reading; the isolated dataset name identity remains unconfirmed.

Consulted evidence:

- [Kantipur — Gopalman Shrestha author page](https://ekantipur.com/author/author-GopalmanShrestha-oE1lL) (full-page): Author heading contains गोपालमान.

<a id="case-081"></a>

### 81. sentence:ne_348

- Mode / source: `text` / `ne_348`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 1 (texts omitted).
- Assistant recommendation: **correct — draft**; confidence: medium.
- Evidence scope: Official English name context; draft Nepali reading and exact formatting assessment. No historical claim verification or independent human review.
- Assistant reasoning: The words form a plausible reading without changing the historical statement. Preserve the supplied ASCII year, terminal period, trailing space and the space after the first hyphen. The repeated conjunction and postposition are retained rather than edited for style.
- Alignment notes: The source changes 1833 to १८३३. The source replaces the supplied final . with ।. The source removes the space in the first governor- general and the trailing space.

Consulted evidence:

- [Past Governor 1834–1854 — Raj Bhavan, West Bengal](https://rajbhavankolkata.gov.in/html/pastgov1834_1854_new.html) (full-page): The consulted page identifies the Charter Act, Fort William and Governor General of India terminology; it does not certify Nepali loanword spellings.

<a id="case-082"></a>

### 82. sentence:ne_75

- Mode / source: `text` / `ne_75`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 0 (texts omitted).
- Assistant recommendation: **exclude — draft**; confidence: high.
- Evidence scope: Excluded on internal Roman/source alignment. Official usage was consulted for comparison only; no complete sentence certified.
- Assistant reasoning: The initial Roman tasaratha is not a reliable spelling of source तसर्थ. Do not silently replace it with tasartha or tasarth. The vrihat versus वृहत् reading also needs an authoritative spelling decision; the observed official usage does not establish the writer’s intended Roman form.
- Alignment notes: tasaratha is not cleanly aligned to तसर्थ. vrihat/वृहत् spelling and final consonant require human confirmation. The source changes terminal . to ।.

Consulted evidence:

- [Nepal Supreme Court decision, Nepal Kanoon Patrika 1371](https://nkp.gov.np/full_detail/1371) (search-snippet): The consulted search excerpt uses तसर्थ and वृहत in legal prose, providing word usage rather than a mapping from tasaratha.

<a id="case-083"></a>

### 83. sentence:ne_151

- Mode / source: `text` / `ne_151`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 0 (texts omitted).
- Assistant recommendation: **exclude — draft**; confidence: high.
- Evidence scope: Internal missing-word comparison plus creator/foundation film-name context; no critical opinion or historical claim verification.
- Assistant reasoning: The source inserts सबैभन्दा before सफल although the Roman has only safal. The proper names can be identified, but name evidence cannot justify this extra word. Exclude the pair pending source repair and human review.
- Alignment notes: सबैभन्दा has no Roman counterpart. The Raylai → रेलाई name reading still needs Nepali review. The source changes terminal . to ।.

Consulted evidence:

- [Charulata (The Lonely Wife) — Satyajit Ray Org](https://satyajitray.org/charulata-the-lonely-wife/) (full-page): The consulted film page identifies Charulata and Satyajit Ray; it does not support adding a superlative to the Roman sentence.

<a id="case-084"></a>

### 84. sentence:ne_187

- Mode / source: `text` / `ne_187`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 1 (texts omitted).
- Assistant recommendation: **correct — draft**; confidence: medium.
- Evidence scope: Official educational usage supports selected Nepali spellings; the full sentence remains an AI draft, without financial advice validation.
- Assistant reasoning: The source is a plausible reading of every supplied word. Keep the period as typed. Do not rewrite the financial advice or alter its wording; the reference check is limited to spelling usage.
- Alignment notes: The source changes terminal . to ।.

Consulted evidence:

- [Generative AI and search — Sikai Chautari, CEHRD](https://learning.cehrd.gov.np/mod/page/view.php?id=1132) (full-page): The consulted government educational page uses सधैँ and जाँच, supporting those spellings only.

<a id="case-085"></a>

### 85. sentence:ne_168

- Mode / source: `text` / `ne_168`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 0 (texts omitted).
- Assistant recommendation: **exclude — draft**; confidence: high.
- Evidence scope: No external verification. Excluded on direct internal alignment; no online reference is asserted to resolve the missing word or Sanda spelling.
- Assistant reasoning: The source adds सुट immediately before बक्सिङ; the Roman contains boxing but no shoot/suit token. The Sanda name reading also deserves review, but this missing word already makes the source pair unsuitable.
- Alignment notes: सुट has no Roman counterpart. sanDaasanga → सान्डासँग includes a proper-name vowel decision requiring review. The source changes terminal . to ।.

Consulted evidence:

No external verification recorded. The draft recommendation rests on the stated internal alignment issue.

<a id="case-086"></a>

### 86. sentence:ne_96

- Mode / source: `text` / `ne_96`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 1 (texts omitted).
- Assistant recommendation: **correct — draft**; confidence: medium.
- Evidence scope: Official Nepali usage checks for चश्मा, प्याड and शिल्ड only; these pages do not establish the safety recommendation or exact gum-shield compound.
- Assistant reasoning: All supplied words can be retained. The English loan shield is more plausibly शिल्ड than the source सिल्ड. Keep the comma and period. The spelling evidence is limited; a Nepali speaker should confirm the loanword and compound.
- Alignment notes: shieldharu corresponds to a loanword beginning श rather than source स; confirmation remains necessary. The source changes terminal . to ।.

Consulted evidence:

- [Junior Optical Dispenser — Ministry of Education career guide](https://cgs.moest.gov.np/home/careerdetail/9) (search-snippet): The consulted search excerpt uses चश्मा in an official occupational description; direct page retrieval was unavailable.
- [Sample forms — Shantinagar Rural Municipality](https://shantinagarmun.gov.np/sample-forms) (search-snippet): The consulted search excerpt uses प्याड as a loanword in municipal form names, without certifying the elbow-pad compound.
- [Photo gallery — Lamahi Municipality](https://lamahimun.gov.np/photo-gallery) (search-snippet): The consulted search excerpt spells the shield loanword शिल्ड in a sports title; direct page retrieval was unavailable.

<a id="case-087"></a>

### 87. sentence:ne_9

- Mode / source: `text` / `ne_9`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 0 (texts omitted).
- Assistant recommendation: **exclude — draft**; confidence: medium.
- Evidence scope: Official Indian name spelling provides context only; the Roman alias remains unresolved. No claim about state size was checked.
- Assistant reasoning: The word sequence is broadly plausible, but the foreign place-name chhattisgaD does not explicitly mark the final aspiration in the source छत्तीसगढ. Informal Roman may omit it; this is uncertainty about the name alias, not a failure against deterministic Shift keys. Hold for a human name decision. Period-to-comma and extra spacing are separate exact-target issues.
- Alignment notes: chhattisgaD versus छत्तीसगढ needs an informal name-alias decision; deterministic key mappings are not the review criterion. The source changes the first . to a comma and the last . to ।. The source inserts a doubled space after भारतको.

Consulted evidence:

- [Chhattisgarh — an modern name, IGNCA](https://ignca.gov.in/coilnet/chgr0001.htm) (search-snippet): The consulted page uses छत्तीसगढ़ alongside Chhattisgarh, supporting name context without approving the specific Roman alias chhattisgaD.

<a id="case-088"></a>

### 88. sentence:ne_400

- Mode / source: `text` / `ne_400`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 0 (texts omitted).
- Assistant recommendation: **exclude — draft**; confidence: high.
- Evidence scope: Internal missing-consonant comparison plus official school name context, from a consulted search excerpt; no relationship or historical claim verification.
- Assistant reasoning: sudhaara cannot reliably represent the source सुधारक because its final k is absent. The Suniti Devi and Keshav/Keshab Chandra name forms are also not settled by English name evidence. Exclude rather than adding a missing consonant to the Roman.
- Alignment notes: sudhaara lacks the final consonant present in सुधारक. suniti → सुनिती and keshavchandra → केशवचन्द्र require name-vowel and variant confirmation. The source changes terminal . to ।.

Consulted evidence:

- [Victoria Institution history — Banglar Shiksha school portal](https://school.banglarshiksha.gov.in/ws/website/history/19170104010) (search-snippet): The consulted search excerpt contains the Suniti Devi and Keshab Chandra Sen names; direct retrieval was unavailable and Nepali spellings remain unverified.

<a id="case-089"></a>

### 89. sentence:ne_176

- Mode / source: `text` / `ne_176`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 0 (texts omitted).
- Assistant recommendation: **exclude — draft**; confidence: medium.
- Evidence scope: Official Hindi name context only; unresolved Nepali proper-name mapping. No historical allegation was assessed.
- Assistant reasoning: The main words are largely aligned, but the source जहाँनारा is not securely supported by the supplied Jahanara. The consulted official Hindi material uses a different conventional name spelling. Leave Nepali spelling unresolved; do not substitute an externally standardized name or alter the historical statement.
- Alignment notes: Jahanara → जहाँनारा needs a name spelling decision; the source nasal/consonant sequence is uncertain. Aurangzeble → औरङ्गजेबले and Shahajahan → शाहजहाँ need human name review. The source changes terminal . to । and removes the trailing space.

Consulted evidence:

- [Taj Mahal — Uttar Pradesh NRI Department](https://nri.up.gov.in/hi/article/taj-mahal) (full-page): The consulted page uses शाहजहाँ and जहाँआरा. This supports identifying the names, but does not certify source जहाँनारा as Nepali.

<a id="case-090"></a>

### 90. sentence:ne_291

- Mode / source: `text` / `ne_291`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 1 (texts omitted).
- Assistant recommendation: **correct — draft**; confidence: medium.
- Evidence scope: Official historical gazetteer name context from a consulted search excerpt; full Nepali transliteration remains draft and the account itself was not fact-checked.
- Assistant reasoning: A plausible full reading preserves the supplied words and historical assertion. Correct the exact target to keep ASCII 1674 and the terminal period. Proper-name and chief-loanword spelling still require human confirmation; no extra content is inserted.
- Alignment notes: The source changes 1674 to १६७४. The source changes terminal . to ।. Prataprao, bahalol and commander-in-chief are name/loanword spellings requiring human confirmation.

Consulted evidence:

- [Jalgaon historical gazetteer — Maharashtra Gazetteers Department](https://gazetteers.maharashtra.gov.in/cultural.maharashtra.gov.in/english/gazetteer/JALGAON/his_muslim.html) (search-snippet): The consulted search excerpt contains Prataprao Gujar and Bahlol Khan name forms; direct retrieval was unavailable, and Nepali spellings are not certified.

<a id="case-091"></a>

### 91. sentence:ne_360

- Mode / source: `text` / `ne_360`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 0 (texts omitted).
- Assistant recommendation: **exclude — draft**; confidence: high.
- Evidence scope: Internal missing-word and name-vowel comparison, with official festival-name context only; no ritual claim validation.
- Assistant reasoning: The source inserts र between व्रत and पूजा although the Roman has vrata poojaako without ra. The input akaadashee also differs from the conventional Ekadasi name and the source एकादशी. Exclude rather than inserting a word or changing the input vowel.
- Alignment notes: र has no Roman counterpart between vrata and poojaako. akaadashee → एकादशी requires changing the supplied initial vowel. The source changes terminal . to ।.

Consulted evidence:

- [Therottam — Ministry of Tourism, Utsav portal](https://utsav.gov.in/view-event/therottam-arulmigu-kaliyuha-varadharaja-perumal-temple-kallankurichi-1) (search-snippet): The consulted page uses Vaikuntha Ekadasi; it supports name context without resolving akaadashee or adding a conjunction.

<a id="case-092"></a>

### 92. sentence:ne_148

- Mode / source: `text` / `ne_148`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 1 (texts omitted).
- Assistant recommendation: **correct — draft**; confidence: medium.
- Evidence scope: Government encyclopedia name context in Marathi and municipal Nepali compound usage; neither certifies the complete sentence.
- Assistant reasoning: The supplied words support a plausible reading. The municipal reference attests the compound स्रोतअनुसार, so it is one draft rendering of srotanusar. The single Roman token alone does not prove that the spaced source स्रोत अनुसार is invalid; a word-boundary policy still needs confirmation. Preserve the period without rewriting the historical assertion.
- Alignment notes: Both spaced स्रोत अनुसार and joined स्रोतअनुसार require a word-boundary policy; the joined form is externally attested. The source changes terminal . to ।.

Consulted evidence:

- [Chandragupta Maurya — Marathi Vishwakosh](https://vishwakosh.marathi.gov.in/17931/) (full-page): The consulted government encyclopedia page supports identifying the Chandragupta Maurya name; its Marathi spelling is not a Nepali dictionary ruling.
- [2078 census dataset — Tulsipur Sub-metropolitan City](https://dms.tulsipurmun.gov.np/dataset/tulsipur) (full-page): The consulted municipal page uses स्रोतअनुसार as one compound, supporting the target’s token spacing decision.

<a id="case-093"></a>

### 93. sentence:ne_381

- Mode / source: `text` / `ne_381`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 0 (texts omitted).
- Assistant recommendation: **exclude — draft**; confidence: high.
- Evidence scope: Internal added-word comparison and official cultural name context from a consulted search excerpt; no political or historical claim verification.
- Assistant reasoning: The source adds स्वदेशी before राष्ट्रवादी although the Roman includes only rashTravaadi. The Kamaladevi name is identifiable from official cultural material, but that does not justify the added modifier.
- Alignment notes: स्वदेशी has no Roman counterpart. The source changes terminal . to ।.

Consulted evidence:

- [CCRT organization and duties — Ministry of Culture](https://ccrtindia.gov.in/right-to-information/the-particulars-of-its-organization-functions-and-duties/) (search-snippet): The consulted search excerpt identifies Kamaladevi Chattopadhyay; direct retrieval was unavailable and the Nepali sentence is not verified.

<a id="case-094"></a>

### 94. sentence:ne_231

- Mode / source: `text` / `ne_231`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 1 (texts omitted).
- Assistant recommendation: **correct — draft**; confidence: medium.
- Evidence scope: Government meteorological and educational usage for selected terms; the temperature assertion was not evaluated.
- Assistant reasoning: dekhaunchha supports देखाउँछ, not the source’s longer verb देखाउँदछ. Retain only the supplied comma after तापक्रमले and the terminal period. Month-name and selected verb spellings have official usage support, while the complete sentence is still a draft reading.
- Alignment notes: dekhaunchha differs from source देखाउँदछ; a faithful suggested verb is देखाउँछ. The source adds a comma after तथापि. The source changes terminal . to ।.

Consulted evidence:

- [Climate files — Department of Hydrology and Meteorology](https://old.dhm.gov.np/climate/) (search-snippet): The consulted official search excerpt uses फेब्रुअरी; direct retrieval was unavailable. It supports the month spelling only.
- [Energy, work and power lesson — Sikai Chautari, CEHRD](https://learning.cehrd.gov.np/pluginfile.php/40228/mod_folder/content/0/L%203%20Shakti%2C%20Karya%20Ra%20Samarthya.pdf?forcedownload=1) (search-snippet): The consulted government educational excerpt uses तापक्रम and देखाउँछ, supporting those spellings rather than the complete sentence.

<a id="case-095"></a>

### 95. sentence:ne_41

- Mode / source: `text` / `ne_41`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 0 (texts omitted).
- Assistant recommendation: **exclude — draft**; confidence: medium.
- Evidence scope: Excluded on unresolved internal vowel alignment. An official publication supplies only partial lexical usage, not an exact sentence or Roman mapping.
- Assistant reasoning: The initial auTa is not a reliably aligned Roman form of source एउटा; accepting the source would require an unconfirmed euta/auTa alias or input repair. No authoritative mapping for that exact spelling was established. Do not silently correct the Roman.
- Alignment notes: auTa → एउटा requires a vowel or alias decision that remains unresolved. chichchyae → चिच्च्याए still needs spelling confirmation. The source changes terminal . to ।.

Consulted evidence:

- [Police scientific publication, Kartik–Mangsir 2079 — Nepal Police](https://www.nepalpolice.gov.np/media/filer_public/57/ea/57eaef41-fb85-4d28-86d8-091df9eeb936/katik-magsir-anka-2079.pdf) (search-snippet): The consulted official PDF search excerpt uses बेस्सरी; it does not resolve auTa or certify चिच्च्याए.

<a id="case-096"></a>

### 96. sentence:ne_29

- Mode / source: `text` / `ne_29`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 0 (texts omitted).
- Assistant recommendation: **exclude — draft**; confidence: high.
- Evidence scope: No external verification. Excluded on direct internal token alignment; no online source is claimed to repair malformed input or certify the sentence.
- Assistant reasoning: The exact pair contains malformed or unresolved Roman tokens, especially gsrna against गर्न. The vowel sequence in maadhyaambaaT and abbreviation r also require interpretation; a spelling reference cannot decide them automatically. Keep the input unchanged and hold the case pending human source review.
- Alignment notes: gsrna has an extra s where source गर्न requires a vowel. maadhyaambaaT needs a vowel/consonant reading decision; this review does not score deterministic Shift behavior. r → र requires an explicit abbreviation decision. The source inserts spaces around the first hyphen and changes final . to ।.

Consulted evidence:

No external verification recorded. The draft recommendation rests on the stated internal alignment issue.

<a id="case-097"></a>

### 97. sentence:ne_77

- Mode / source: `text` / `ne_77`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 0 (texts omitted).
- Assistant recommendation: **exclude — draft**; confidence: high.
- Evidence scope: No external verification. Excluded on direct internal extra-word and malformed-token alignment. No external source is claimed to certify the uncertain names or historical statement.
- Assistant reasoning: The source inserts एक after मध्ये. Several supplied name/word forms are also unreliable: maarvaajkaa versus मारवारका, trathorekee versus राठौरकी and chheree versus छोरी. Do not correct these strings to match a historical name without first repairing the source record.
- Alignment notes: एक has no Roman counterpart. maarvaajkaa does not cleanly align to मारवारका. trathorekee does not cleanly align to राठौरकी. chheree does not cleanly align to छोरी. The source changes terminal . to ।.

Consulted evidence:

No external verification recorded. The draft recommendation rests on the stated internal alignment issue.

<a id="case-098"></a>

### 98. sentence:ne_389

- Mode / source: `text` / `ne_389`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 0 (texts omitted).
- Assistant recommendation: **exclude — draft**; confidence: high.
- Evidence scope: No external verification. Excluded on direct internal token alignment; no online source is asserted to resolve the malformed Roman words.
- Assistant reasoning: jaktapaat does not align to रक्तपात because its initial consonant differs, and vfchalit contains a malformed vowel/consonant sequence against विचलित. These are input defects, not a reason to alter the historical claim. Exclude pending source repair.
- Alignment notes: jaktapaat → रक्तपात requires replacing initial j with r. vfchalit → विचलित requires replacing the malformed f sequence. The source changes terminal . to ।.

Consulted evidence:

No external verification recorded. The draft recommendation rests on the stated internal alignment issue.

<a id="case-099"></a>

### 99. sentence:ne_210

- Mode / source: `text` / `ne_210`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 0 (texts omitted).
- Assistant recommendation: **exclude — draft**; confidence: medium.
- Evidence scope: Official Nagaland geographic name context from consulted search excerpts; the observation about where an unspecified subject is found was not fact-checked.
- Assistant reasoning: The official place-name context differs from several supplied Roman/source forms. It suggests possible misspellings, but those must not be silently repaired. Leave Jafu/Zhuko/Futsero mappings unresolved and exclude this exact pair until names and source text receive human review.
- Alignment notes: Jafu lacks the p present in official Japfu/Japfü name forms. Zhuko differs from official Dzukou/Dzükou name forms and its Nepali mapping remains unresolved. Futsero differs from official Pfutsero; no alias approval is established. The source inserts multiple spaces after जाफु, removes trailing space and changes . to ।.

Consulted evidence:

- [Dzükou forest fire district survey — DIPR Nagaland](https://ipr.nagaland.gov.in/node/19678) (search-snippet): The consulted official search excerpt uses Dzükou Valley and Mt. Japfü; direct retrieval was unavailable. Those spellings do not certify Jafu or Zhuko.
- [Nagaland Tourism Policy — Tourism Department](https://tourism.nagaland.gov.in/tourism-policy/) (search-snippet): The consulted official search excerpt lists Dzukou, Japfu, Satoi and Pfutsero, providing name context; direct retrieval was unavailable.

<a id="case-100"></a>

### 100. sentence:ne_294

- Mode / source: `text` / `ne_294`
- Complete sentence texts omitted; original pair is available by this ID in the pinned local batch.
- Draft suggested full-output count: 1 (texts omitted).
- Assistant recommendation: **correct — draft**; confidence: medium.
- Evidence scope: Official Nepali anatomical-word usage only; complete sentence is an AI draft, not a human-approved linguistic or sports-rule judgment.
- Assistant reasoning: The full word sequence is a plausible reading of the supplied Roman, including ghunda as the body-part word घुँडा. Keep the final period. The official spelling evidence is partial and does not verify the unspecified game’s rule.
- Alignment notes: The source changes terminal . to ।.

Consulted evidence:

- [Knee injury decision — Nepal Supreme Court, Nepal Kanoon Patrika 10596](https://nkp.gov.np/full_detail/10596) (full-page): The consulted Supreme Court page uses घुँडा, supporting the body-part spelling; it does not certify the full transliteration or game rule.
