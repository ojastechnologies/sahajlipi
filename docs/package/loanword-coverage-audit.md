# English loanword coverage audit — 2026-09-28

SahajLipi's English-spelling loanword feature is a small pilot, not a general English-to-Nepali transliterator. This audit was prompted by `company`. It covers **all 34 keys in the project's existing loanword research catalogue**, probes additional source-backed examples, and sets out a review method for expansion. It does **not** claim to enumerate every loanword in Nepali: vocabulary, spelling, sense, and use vary by domain and over time. “Loanword” here means a borrowed form used in Nepali script, rather than translating an arbitrary English sentence or converting a proper name.

This is source-assisted research and a code-behavior audit on `de2cb93` (the main-branch commit at the start of this review), run with Node.js 22.22.3. No human-reviewed labels were admitted, no engine mappings or old benchmark fixtures were changed, and the comparisons below are **not** a language-accuracy score. The [dated 20-word pilot](loanword-review.md), its [34-key source ledger](../../benchmark/reports/loanword-research-2026-09-27.json), and the [historical benchmark](loanword-benchmarks.md) retain their original claims and dates.

## What the engine covers today

| Area | Current behavior | Evidence and limit |
| --- | --- | --- |
| Built-in English-spelling loanwords | 20 exact keys, each with one preferred candidate | The [pilot table](loanword-review.md#accepted-project-defaults) lists every key and source. These are source-assisted project preferences, not independent human labels. |
| Further researched keys | 14 proposals, including `office`, `laptop`, and `ticket`; `train` is deferred | All 14 are in the [existing research queue](loanword-review.md#unshipped-research-queue). None is a built-in loanword default. |
| Month names | 12 full English months in a separate feature | See the [month review](month-names.md); they do not increase the 20-word loanword pilot count. |
| Other vocabulary | Roman Nepali starter entries and a deterministic phonetic fallback | The fallback reads Roman letters as **Nepali typing keys**, not English spelling-to-sound rules. It can return a well-formed but unintended string with no warning. |
| Lookup and forms | Normalized complete-key lookup, followed by phonetic fallback | A base entry does not handle `...ma`, `...ko`, or `...haru` automatically. Reserved Shift sounds constrain capitalization. Recognized links, domains, and email addresses are preserved by `convertText` separately. |

The [starter lexicon](../../src/lexicon.js), [word conversion](../../src/index.js), [phonetic fallback](../../src/phonetic.js), and [mixed-text policy](../../src/text-policy.js) establish these boundaries. Because no reviewed, frequency-defined loanword universe exists here, neither `20/34` nor any count from the seed benchmark is a coverage percentage for Nepali usage. The [85/85 historical loanword contracts](loanword-benchmarks.md#recorded-results) mean that selected literal software expectations passed; they do not measure general loanword correctness.

## The reported `company` gap

The output of `convertWord` and `convertText` for `company` is currently **चोम्पञ्**, with no alternative. The fallback parses the English spelling as Roman Nepali (`c` → च and `ny` → ञ्). It is not a dictionary choice. `Company` and `COMPANY` produce the same unintended output. Examples such as `companyma` → **चोम्पञ्म** and `companyharu` → **चोम्पञ्हरु** show that one exact entry alone will not cover attached Nepali forms. By contrast, `convertText('company.com')` remains literal because the separate technical-text policy recognizes a domain-shaped string; `convertWord` does not make that promise.

**Recommended base-word reading: `company` → कम्पनी.** The [Nepal Law Commission legal dictionary](https://giwmscdntwo.gov.np/media/pdf_upload/%E0%A4%95%E0%A4%BE%E0%A4%A8%E0%A5%82%E0%A4%A8%E0%A5%80%20%E0%A4%B6%E0%A4%AC%E0%A5%8D%E0%A4%A6%E0%A4%95%E0%A5%8B%E0%A4%B6_hsclzr0.pdf) explicitly indexes the bilingual entry “कम्पनी (Company)”; the [Office of the Company Registrar](https://ocr.gov.np/pages/registration/) also uses कम्पनी throughout its registration explanation. The dictionary PDF was too large for this audit's page reader, so its bilingual entry was checked in the publisher's indexed excerpt; the Registrar's Unicode HTML was opened independently. This establishes strong legal and official business usage, but no general ranking of every context. The earlier [assistant-reviewed `companyharumathi` word proposal](assisted-online-review.md) remains an unadmitted, snippet-supported proposal and is **not** a verified inflection rule.

Adding `company` as a source-assisted project preference is justified for review. Attached forms, exact variants, and safe case behavior need separate examples and tests before being generated automatically. A literal-English field or mode must continue to leave the input unchanged.

## Existing research queue: actual output versus proposal

This table covers **every one of the 14** unshipped keys. The middle column is the existing source-assisted **proposal**, not an accepted label. The right column is the current `convertWord` result on `de2cb93`; it shows the fallback gap, not a scored linguistic error. The proposal's source and variant details remain in the [original ledger](loanword-review.md#unshipped-research-queue).

| English key | Existing proposal, pending | Current output |
| --- | --- | --- |
| `bus` | बस | बुस् |
| `cricket` | क्रिकेट | च्रिच्केत् |
| `football` | फुटबल | फूत्बल्ल् |
| `hotel` | होटल | होतेल् |
| `keyboard` | किबोर्ड | केय्बोअर्द् |
| `laptop` | ल्यापटप | लप्तोप् |
| `microphone` | माइक्रोफोन | मिच्रोफोने |
| `office` | अफिस | ओफ्फिचे |
| `password` | पासवर्ड | पस्स्वोर्द् |
| `restaurant` | रेस्टुरेन्ट | रेस्तौरन्त् |
| `speaker` | स्पिकर | स्पेअकेर् |
| `ticket` | टिकट | तिच्केत् |
| `train` | ट्रेन; deferred sense decision | त्रैन् |
| `wifi` | वाइफाइ | विफि |

The prior source research also recorded variant pairs such as होटल/होटेल, स्पिकर/स्पीकर, and वाइफाइ/वाइफाई. A source occurrence does not automatically make either variant the default or a dropdown option. Some keys collide with another meaning: `train` may be a borrowed vehicle noun, an English verb, or a context where a Nepali semantic word is intended.

## New candidate probes beyond the 34-key catalogue

These examples are **review leads, not new built-in defaults**. Official paired English–Nepali labels are stronger evidence of a spelling relationship than a Nepali-only occurrence. Even a paired form does not prove that automatic conversion is right in every sentence.

| Key and current output | Source-backed Nepali form | Evidence and decision needed |
| --- | --- | --- |
| `company` → चोम्पञ् | कम्पनी | [Law Commission dictionary](https://giwmscdntwo.gov.np/media/pdf_upload/%E0%A4%95%E0%A4%BE%E0%A4%A8%E0%A5%82%E0%A4%A8%E0%A5%80%20%E0%A4%B6%E0%A4%AC%E0%A5%8D%E0%A4%A6%E0%A4%95%E0%A5%8B%E0%A4%B6_hsclzr0.pdf) directly pairs the terms; [Registrar](https://ocr.gov.np/pages/registration/) uses कम्पनी. High-priority base-word candidate; forms and capitalization remain separate. |
| `telephone` → तेलेफोने | टेलिफोन | [Inland Revenue Department bilingual form](https://old.ird.gov.np/public/pdf/151338091.pdf) pairs the labels on page 1. Check common input variants and whether users prefer फोन in a given context. |
| `fax` → फx | फ्याक्स | An [Inland Revenue Department registration guide](https://old.ird.gov.np/public/pdf/1844023579.pdf) has an indexed screenshot label pairing फ्याक्स with Fax; the extracted PDF text omits the screenshot. Confirm in a second source before accepting a default, and prioritize by typing demand. |
| `website` → वेब्सिते | वेबसाइट; also वेव साइट/वेबसाईट in sources | The [IRD guide](https://old.ird.gov.np/public/pdf/1844023579.pdf) has an indexed screenshot label for वेबसाइट (Website); a directly readable [IRD form](https://old.ird.gov.np/public/pdf/151338091.pdf) pairs वेव साइट with Website, and another [IRD guide](https://giwmscdntwo.gov.np/media/pdf_upload/bp14_lypvfn4.pdf) uses वेबसाईट in prose. Review whether a joined or spaced form should be the default. |
| `wallet` → वल्लेत् | वालेट in payment context | [Nepal Rastra Bank's payment FAQ](https://www.nrb.org.np/category/faqs/faq_payment-system/faq_psd-others/page/3/) attests the Nepali form; context and English meaning need checking before automatic conversion. |
| `share` → शरे | शेयर/सेयर in finance | The [Company Act](https://repository.lawcommission.gov.np/np/category/documents/prevailing-law/statutes-acts/%E0%A4%95%E0%A4%AE%E0%A5%8D%E0%A4%AA%E0%A4%A8%E0%A5%80-%E0%A4%90%E0%A4%A8-%E0%A5%A8%E0%A5%A6%E0%A5%AC%E0%A5%A9-statutes-acts/) uses शेयर; सेयर appears inside the [Law Commission dictionary](https://giwmscdntwo.gov.np/media/pdf_upload/%E0%A4%95%E0%A4%BE%E0%A4%A8%E0%A5%82%E0%A4%A8%E0%A5%80%20%E0%A4%B6%E0%A4%AC%E0%A5%8D%E0%A4%A6%E0%A4%95%E0%A5%8B%E0%A4%B6_hsclzr0.pdf) definition of कम्पनी, not as a verified separate `share` entry. English `share` is also a verb; do not pick an unconditional default from financial noun usage alone. |

For comparison, the [existing 20-word pilot](loanword-review.md#accepted-project-defaults) already maps `camera`, `computer`, `mobile`, `email`, and `bank`. A [Birtamode municipal notice](https://birtamodmun.gov.np/en/content/%E0%A4%95%E0%A4%AE%E0%A5%8D%E0%A4%AA%E0%A5%8D%E0%A4%AF%E0%A5%81%E0%A4%9F%E0%A4%B0-%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%9F%E0%A4%B0-%E0%A4%95%E0%A5%8D%E0%A4%AF%E0%A4%BE%E0%A4%AE%E0%A5%87%E0%A4%B0%E0%A4%BE-%E0%A4%B0-%E0%A4%85%E0%A4%A8%E0%A5%8D%E0%A4%AF-%E0%A4%B8%E0%A4%BE%E0%A4%AE%E0%A4%BE%E0%A4%97%E0%A5%8D%E0%A4%B0%E0%A5%80-%E0%A4%96%E0%A4%B0%E0%A4%BF%E0%A4%A6-%E0%A4%B8%E0%A4%AE%E0%A5%8D%E0%A4%AC%E0%A4%A8%E0%A5%8D%E0%A4%A7%E0%A5%80-%E0%A4%B6%E0%A4%BF%E0%A4%B2%E0%A4%AC%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80-%E0%A4%A6%E0%A4%B0%E0%A4%AD%E0%A4%BE%E0%A4%89%E0%A4%AA%E0%A4%A4%E0%A5%8D%E0%A4%B0%E0%A4%95%E0%A5%8B-%E0%A4%B8%E0%A5%82%E0%A4%9A%E0%A4%A8%E0%A4%BE) explicitly shows English and Nepali computer/printer/camera forms. The [existing source ledger](loanword-review.md#accepted-project-defaults) records क्यामेरा/क्यामरा and कम्प्युटर/कम्प्यूटर variants. Independent government examples include [क्यामरा](https://www.ciaa.gov.np/pressrelease/3106) and [कम्प्यूटर](https://repository.lawcommission.gov.np/np/documents/prevailing-law/statutes-acts/%E0%A4%B0%E0%A4%BE%E0%A4%B7%E0%A5%8D%E0%A4%9F%E0%A5%8D%E0%A4%B0%E0%A4%AA%E0%A4%A4%E0%A4%BF-%E0%A4%B0-%E0%A4%89%E0%A4%AA%E0%A4%B0%E0%A4%BE%E0%A4%B7%E0%A5%8D%E0%A4%9F%E0%A5%8D%E0%A4%B0%E0%A4%AA%E0%A4%A4%E0%A4%BF/%E0%A5%AB-%E0%A4%B8%E0%A4%9E%E0%A5%8D%E0%A4%9A%E0%A4%BE%E0%A4%B0-%E0%A4%B8%E0%A5%81%E0%A4%B5%E0%A4%BF%E0%A4%A7%E0%A4%BE-2/); an occurrence is evidence of usage, not a universal spelling authority. The [2025 Nepali loanword study](https://www.nepjol.info/index.php/prajna/article/view/86300) describes borrowed forms that are retained, adapted, or coexist. It examines 434 **sampled dictionary pages**, not a list of 434 loanwords or an exhaustive count.

## Why a much larger dictionary cannot just be imported

The [Aksharantar paper](https://aclanthology.org/2023.findings-emnlp.4.pdf) and [dataset card](https://huggingface.co/datasets/ai4bharat/Aksharantar) make its large Nepali Roman/native pairs useful **candidate material**. They are transliteration pairs, not a tagged list of common English-origin loanwords. Mined data can include names, native Nepali words, weak pairs and alternate romanizations; the paper's foreign-named-entity test category is **not** a common-loanword evaluation. Its mining-quality human audit does not establish a Nepali-specific acceptance rate. The project's pinned public Nepali file has 4,101 actual rows although the paper reports 4,133; see the [external evaluation guide](external-evaluation.md#aksharantar-word-benchmark). Neither count supplies a denominator for loanword coverage.

The dataset card distinguishes **CC BY manual data** from **CC0-packaged mined data** and says the creators do not own all underlying source text. Retain the original row/source license and attribution, keep raw data outside the MIT npm package, and check rights before redistribution. The Nepal Academy dictionary and government PDFs are useful for manual attestation; this audit found no grant to copy their complete contents into the package. Source citations and short observations are sufficient for a project ledger. A list of thousands of automatically mined pairs would not be thousands of validated defaults.

## Proposed expansion and acceptance gates

1. **Build a candidate inventory, not a shipping dictionary.** Collect project reports, official bilingual forms and glossaries, and pinned transliteration data with source ID, URL/revision, license, observed Roman form, observed Nepali form, domain and context. Keep personal or unlicensed raw text out of the repository. Prioritize by actual Nepali typing demand, rather than the number of search hits.
2. **Classify each candidate.** Distinguish a widely used loanword from a proper name, native Nepali word, semantic translation, English-only fragment, and unclear case. Record spelling variants, collisions (`share`, `train`), casing/Shift behavior, and attached forms (`companyma`, `fileharu`) explicitly. An English-spelling key and an informal Roman Nepali key may need different handling.
3. **Review independently.** Have two proficient Nepali reviewers decide the preferred output, acceptable alternatives, sense, and tested Roman keys without seeing each other's decisions or engine output. Reconcile disagreements; retain excluded and unresolved rows with reasons. Source-assisted project defaults can be proposed earlier, but must not be labelled independent human corpus labels.
4. **Protect existing typing.** Test exact lookup and candidates, longer-word boundaries, suffixes, capitalized/reserved Shift keys, literal English fields, URLs/email, editing and paste. Never enable a blanket English-word converter because it would change ordinary Roman Nepali typing and technical text. Store source/review metadata separately from the small offline runtime lexicon.
5. **Measure on a separate held-out set.** Freeze independently reviewed common-loanword examples before choosing rules or defaults. Publish exact top choice, accepted-candidate recall, coverage by domain/input form, and false automatic conversions of ordinary English tokens inside Nepali-enabled mixed text and on collision cases, with denominators and exclusions. Check English-only fields separately for literal passthrough. Keep names and general Roman Nepali cases as separate slices. The existing pilot contracts and the public Aksharantar test cannot substitute for this set.

**Decision from this audit:** `company` → कम्पनी has strong source support and should be the first proposed base-word expansion. The 14 existing proposals and new candidates deserve a prioritized review queue, with separate variant and suffix decisions. No claim of exhaustive loanword coverage or improved accuracy is justified yet. The next implementation change should be scoped to reviewed entries and accompanied by before/after behavior, new regression cases, and the source ledger; the current engine is unchanged by this audit.

## Reproduce the code observations

Run at the repository root on this audit's starting commit (`de2cb93`) or compare a later commit explicitly. The historical source and benchmark reports are not rewritten:

```sh
node --input-type=module - <<'JS'
import { convertText, convertWord } from './src/index.js';
import { readFileSync } from 'node:fs';
const ledger = JSON.parse(readFileSync('benchmark/reports/loanword-research-2026-09-27.json', 'utf8'));
console.log({ catalogued: ledger.entries.length, shipped: ledger.entries.filter(row => row.pilotOrder !== null).length });
for (const row of ledger.entries.filter(row => row.pilotOrder === null)) {
  console.log(row.normalizedRomanKey, row.proposedOutput, convertWord(row.normalizedRomanKey).text);
}
for (const key of ['company', 'Company', 'COMPANY', 'companyma', 'companyharu', 'telephone', 'fax', 'website', 'wallet', 'share']) {
  console.log(key, convertWord(key).text);
}
console.log('domain', convertText('company.com'));
JS
```

Run the [existing seed benchmark](benchmarks.md) separately for selected behavior contracts. It does not certify this research list.
