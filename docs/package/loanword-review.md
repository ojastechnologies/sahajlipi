# English loanword preferences and review — 2026-09-27

The package automatically converts the 20 English spellings below to their listed Nepali loanword forms. Live input uses them while Nepali mode is enabled; `convertWord` and `convertText` also use them. The user authorized these **source-assisted project preferences for implementation**. They are not independently human-reviewed corpus labels or a claim of universally correct spelling.

The research catalogue contains 34 keys. Only pilot order 1–20 is shipped as new built-in loanword entries; the remaining 14 keys stay pending or deferred. Selection provides useful coverage and directly opened evidence, not a measured word-frequency ranking. The [source ledger](../../benchmark/reports/loanword-research-2026-09-27.json) records all 34 entries, Unicode code points, exact spelling evidence, variant evidence, source URLs, access dates and scopes.

## Accepted project defaults

Each new loanword has exactly one candidate: its preferred output. The observed variants in the final column are **pending review**, so the built-in engine does not offer them in the alternatives dropdown. A dash means that no variant was recorded in this research; it does not assert that none exists.

| Pilot order | English key | Preferred output | Preferred-spelling evidence | Observed variants, pending |
| --- | --- | --- | --- | --- |
| 1 | `camera` | क्यामेरा | [S01](#s01), [S02](#s02) | क्यामरा ([S08](#s08)) |
| 2 | `computer` | कम्प्युटर | [S01](#s01), [S02](#s02) | कम्प्यूटर ([S02](#s02)) |
| 3 | `mobile` | मोबाइल | [S01](#s01), [S03](#s03) | मोबाईल ([S03](#s03)) |
| 4 | `phone` | फोन | [S01](#s01), [S02](#s02) | — |
| 5 | `charger` | चार्जर | [S03](#s03) | — |
| 6 | `printer` | प्रिन्टर | [S02](#s02), [S01](#s01) | — |
| 7 | `mouse` | माउस | [S02](#s02) | — |
| 8 | `internet` | इन्टरनेट | [S01](#s01), [S04](#s04) | — |
| 9 | `email` | इमेल | [S02](#s02), [S04](#s04), [S28](#s28) | ई-मेल ([S09](#s09)) |
| 10 | `software` | सफ्टवेयर | [S01](#s01), [S04](#s04) | — |
| 11 | `scanner` | स्क्यानर | [S02](#s02) | — |
| 12 | `video` | भिडियो | [S01](#s01), [S04](#s04), [S28](#s28) | — |
| 13 | `taxi` | ट्याक्सी | [S10](#s10) | — |
| 14 | `bank` | बैंक | [S13](#s13) | बैङ्क ([S14](#s14)) |
| 15 | `cheque` | चेक | [S13](#s13) | — |
| 16 | `file` | फाइल | [S15](#s15) | — |
| 17 | `school` | स्कुल | [S01](#s01) | स्कूल ([S21](#s21)) |
| 18 | `college` | कलेज | [S01](#s01), [S21](#s21) | — |
| 19 | `doctor` | डाक्टर | [S22](#s22) | — |
| 20 | `nurse` | नर्स | [S22](#s22) | — |

Source occurrences support spelling usage within their stated context. For example, `mouse` uses a computer-device reading, `charger` uses device charging and `cheque` uses the banking noun. This feature spells borrowed words; it does not translate `school` to विद्यालय, `doctor` to चिकित्सक or `mouse` to an animal name. NSO evidence for `video` is within a compound; the independently opened CEHRD page supplies educational usage of भिडियो. The source ledger keeps these scopes and provisional corroboration separate.

## Matching, choices and developer control

- Matching uses the existing normalized whole-word dictionary. `Camera` and `Computer` match their lowercase keys. Reserved `T`, `D`, `S`, `R` and vowel-following `H` remain sound instructions: `Doctor`, `School`, `CAMERA` and `COMPUTER` are not blanket-lowercased English aliases.
- Unlisted keys keep the existing phonetic fallback. Attached forms such as `camerako`, `cameramaa`, `mobilema` and `schoolma` are not added or inferred by this pilot. `file` does not authorize `phail` or `fail`, and `cheque` does not authorize `check`.
- A developer can replace a key’s entire ordered candidate list with `createEngine({ entries })`, then pass that engine’s `convertWord` and `convertText` functions to a browser adapter. The [API reference](api.md#core-engine) shows the existing interface.
- An alternate requires separate acceptance as a suitable project spelling. Observing it on a source page or obtaining it from the fallback does not make it a built-in candidate.
- The companion `cha` preference now returns `च` first and `छ` second. `chha` returns only `छ`; use it for the unambiguous छ reading. This changes candidate order without changing `ch` → च् and `chh` → छ् when typed without a vowel.

Explicit `^`, `~`, `/`, `=` and contextual `H` retain their existing behavior. The lexical output does not change fallback consonants, short/long vowel rules or final half consonants. A complete key can supply its own Unicode spelling, as other starter entries do. See the [typing reference](typing-reference.md) for those rules.

### Literal English and mixed text

Leave an entire English field unattached, exclude it with `data-sahajlipi-ignore`, or disable conversion with the existing controller/manager `setEnabled(false)`. Supported all-fields setup still excludes password, email, number and URL input types. Disabling conversion affects subsequent typing and paste without rewriting existing text.

Inside a Nepali-enabled field, URLs, email addresses, code and arbitrary English spans are not automatically protected. The current tokenizer can recognize `camera` within `camera.com`, `camera_file` or `camera123`; adding a dictionary entry does not preserve those larger strings. Hyphenated input such as `e-mail` is split by `convertText` and is not an alias for `email`. A shared token/span policy and attached-form review remain separate work.

## Unshipped research queue

None of these 14 research proposals is added as a new loanword entry by this pilot. Their proposed spellings and variants remain review material. `train` is deferred because choosing the borrowed ट्रेन versus the semantic equivalent रेल requires a lexical decision.

| English key | Proposed output | Status | Proposal evidence | Observed variants, pending |
| --- | --- | --- | --- | --- |
| `bus` | बस | Pending project review | [S11](#s11) | — |
| `cricket` | क्रिकेट | Pending project review | [S23](#s23) | — |
| `football` | फुटबल | Pending project review | [S23](#s23) | फूटबल ([S24](#s24)) |
| `hotel` | होटल | Pending project review | [S20](#s20), [S18](#s18) | होटेल ([S18](#s18), [S19](#s19)) |
| `keyboard` | किबोर्ड | Pending project review | [S02](#s02) | कि-बोर्ड ([S02](#s02)); कि बोर्ड ([S02](#s02)) |
| `laptop` | ल्यापटप | Pending project review | [S04](#s04), [S03](#s03) | — |
| `microphone` | माइक्रोफोन | Pending project review | [S02](#s02), [S04](#s04) | — |
| `office` | अफिस | Pending project review | [S16](#s16), [S17](#s17) | — |
| `password` | पासवर्ड | Pending project review | [S04](#s04) | — |
| `restaurant` | रेस्टुरेन्ट | Pending project review | [S18](#s18), [S19](#s19) | रेष्टुरेन्ट ([S20](#s20)) |
| `speaker` | स्पिकर | Pending project review | [S02](#s02) | स्पीकर ([S05](#s05)) |
| `ticket` | टिकट | Pending project review | [S12](#s12), [S11](#s11), [S26](#s26) | — |
| `train` | ट्रेन | Deferred: lexical choice | [S25](#s25) | — |
| `wifi` | वाइफाइ | Pending project review | [S04](#s04) | वाइफाई ([S27](#s27)) |

## Verification and review boundaries

The [benchmark guide](benchmarks.md) records the reproducible pilot regression comparison. Its accepted outputs check the authorized behavior, including the `cha` order, rather than population typing accuracy. Original seed-case IDs, older dated reports, external datasets and unreviewed development labels retain their provenance and recorded denominators. No independent human review is admitted by this spelling update.

The relevant implementation is the [starter lexicon](../../src/lexicon.js). The package keeps its current public API and offline dictionary. For integration details, use the [API reference](api.md); demo controls and hosting are documented in the [separate demo guide](../demo/README.md).

## Source ledger

All sources below were accessed for the supplied research on **2026-09-27**. They establish attested usage within the stated access scope. None is an exhaustive dictionary, exclusive spelling standard, independent review of this project, or word-frequency ranking. Snippet-only observations remain provisional; a fetched PDF does not establish Unicode spelling when the target string was observed only in its search-indexed excerpt. Official foreign Nepali translations are corroboration, with their jurisdiction recorded.

### S01

[National Statistics Office, Nepal — Nepal Living Standards Survey 2022-2023, Fourth round — s06a_desc variable](https://microdata.nsonepal.gov.np/index.php/catalog/149/variable/F47/V716?name=s06a_desc)

Access scope: `full_page_unicode_html`. Access date: `2026-09-27`. The counts beside category labels are survey-file counts, not word-frequency measurements; they must not be used to rank everyday loanword usage.

### S02

[नेपाल राष्ट्रिय आधारभुत विद्यालय घारिवन,सुर्खेत — पाठ २ हार्डवयर (Hardware) | कम्प्युटर शिक्षा कक्षा ६](https://www.nrasg.edu.np/2022/02/hardware.html)

Access scope: `full_page_unicode_html`. Access date: `2026-09-27`. Institutional classroom usage rather than a normative spelling dictionary. The page itself uses multiple keyboard variants.

### S03

[Nepal Police — लुटपाटमा संलग्न रहेको अभियोगमा चार जना पक्राउ](https://www.nepalpolice.gov.np/news/3008/)

Access scope: `full_page_unicode_html`. Access date: `2026-09-27`. The same article uses both मोबाइल and मोबाईल; this is evidence of variation, not proof that both are equally preferred.

### S04

[Australian Government, Act Now. Stay Secure. — नेपाली / Nepali | Act Now. Stay Secure.](https://www.actnowstaysecure.gov.au/translated/nepali)

Access scope: `full_page_unicode_html`. Access date: `2026-09-27`. Official Nepali-language usage from a foreign government; corroboration only for Nepal-specific lexical decisions, not a Nepal normative source.

### S05

[Ministry of Social Development, Bagamati Province, career guidance system — कम्प्युटर अपरेटर (Computer Operator) — CareerDetail](https://cgs.mosd.bagamati.gov.np/Home/CareerDetail?CareerId=92)

Access scope: `search_result_snippet_only`. Access date: `2026-09-27`. Use only as provisional corroboration, not as independently opened full-page evidence.

### S06

[Nepal Telecommunications Authority — Cyber Security Public Advisory — सार्वजनिक वाइफाइ (Free/Public WiFi) प्रयोग गरेर इन्टरनेट चलाउँदा कसरी सुरक्षित रहने ?](https://nta.gov.np/uploads/contents/NTA%27s%20Cyber%20Security%20Public%20Advisory.pdf)

Access scope: `search_result_snippet_only`. Access date: `2026-09-27`. Provisional Nepal-specific corroboration for wifi, password, laptop and other internet terms.

### S07

[Electricity Regulatory Commission, Nepal — खरिद सम्बन्धि सूचना / Procurement Notice](https://www.erc.gov.np/procurement-notice)

Access scope: `search_result_snippet_only`. Access date: `2026-09-27`. Provisional corroboration only.

### S08

[Kathmandu Metropolitan City, Metro News — काठमाडौँमा एआइ (आर्टिफिसियल इन्टेलिजेन्ट) फिचरका सीसीटिभी क्यामरा जडान](https://metronews.kathmandu.gov.np/news/detail/733)

Access scope: `search_result_snippet_only`. Access date: `2026-09-27`. Attests an alternative spelling; no frequency or normative conclusion.

### S09

[Film Development Board, Nepal — ड्रोन (Drone) क्यामेरा प्रशिक्षण सम्बन्धी १० (दश) दिने निःशुल्क कार्यशालामा सहभागिता सम्बन्धी सूचना](https://www.film.gov.np/notices/125/?page=33)

Access scope: `search_result_snippet_only`. Access date: `2026-09-27`. Variant corroboration only.

### S10

[Bagmati Province Ministry of Industry, Tourism, Labour and Transport — प्रदेश भित्र सञ्‍चालन हुने (ट्याक्सी बाहेकका) साना यात्रु वाहक सार्वजनिक सवारी साधनको गुणस्तर, सञ्‍चालन तथा व्यवस्थापन सम्बन्धी मापदण्ड, २०७९](https://molet.bagamati.gov.np/content/4/small-passengers-of-small-passengers--operations--operations-/)

Access scope: `full_page_title`. Access date: `2026-09-27`. Usage evidence, not a normative spelling decision.

### S11

[Transport Management Office Siraha — सवारी तथा यातायात व्यवस्था नियमावली excerpt (descriptive title)](https://sirahatmo.dotm.gov.np/Files/NoticePDF/yenad91fcd9-0782-447f-bdbe-e6f790c723e4_12025-09-08_12-45-27-944.pdf)

Access scope: `search_snippet`. Access date: `2026-09-27`. Official indexed PDF, not fetched.

### S12

[Transport Management Office Baglung, Gandaki Province — निर्देशिका र कार्यविधि](https://tmobaglung.gandaki.gov.np/page/directive-working-procedure)

Access scope: `search_snippet`. Access date: `2026-09-27`. Full page fetch timed out.

### S13

[Nepal Rastra Bank — वितिय ग्राहक संरक्षण Archives](https://www.nrb.org.np/category/faqs/faq_bfr/faq_bfr-grahak-sanrakchyan/)

Access scope: `full_page_text`. Access date: `2026-09-27`. Actual financial cheque noun usage.

### S14

[Ministry of Finance Nepal — भूमिका/कार्य/जिम्मेवारी](https://mof.gov.np/pages/responsibility-17/)

Access scope: `search_snippet`. Access date: `2026-09-27`. Full fetch timed out.

### S15

[Film Development Board Nepal — सूचनाको हक विवरण, २०८२ माघ–चैत्र (descriptive title)](https://film.gov.np/notices/310/?page=16)

Access scope: `full_page_text`. Access date: `2026-09-27`. Usage evidence, not a normative spelling decision.

### S16

[Kathmandu Valley Crime Investigation Office Nepal Police — अनलाईन मार्फत ठगी गर्ने नेपाली तथा चिनियाँ नागरिकहरु पक्राउ](https://kvcio.nepalpolice.gov.np/news/401/)

Access scope: `search_snippet`. Access date: `2026-09-27`. Not fetched full page.

### S17

[Office of the Nepal Trust — स्वागतम् | नेपाल ट्रष्टको कार्यालय](https://www.nepaltrust.gov.np/)

Access scope: `search_snippet`. Access date: `2026-09-27`. Official gallery label; full fetch timed out.

### S18

[National Statistics Office Government of Nepal — Report of the National Hotel and Restaurant Survey 2023/24](https://giwmscdnone.gov.np/media/pdf_upload/Hotel%20and%20restaurant%20final%20report_vyvvh6g.pdf)

Access scope: `search_snippet_for_devanagari`. Access date: `2026-09-27`. Full 150-page PDF fetched; cover confirms NSO, December 2024. Extracted text did not locate these Devanagari strings, so exact spelling evidence remains indexed snippet.

### S19

[Office of Food Technology and Quality Control Janakpur — खाद्य स्वच्छताको आधारमा होटेल रेस्टुरेन्ट स्तरीकरण गर्ने निर्देशिका २०७४](https://ftqcojanakpur.gov.np/content/7/guidelines-for-classifying-hotels-and-restaurants-on/)

Access scope: `search_snippet_title`. Access date: `2026-09-27`. Full fetch failed.

### S20

[Kathmandu Metropolitan City Metro News — रेष्टुरेन्ट र मिठाई पसलको भान्छामा सरसफाईको समस्या](https://metronews.kathmandu.gov.np/news/detail/201)

Access scope: `full_page_text`. Access date: `2026-09-27`. Usage evidence, not a normative spelling decision.

### S21

[National Assembly Federal Parliament Nepal — University bill amendment text, schools and colleges (descriptive title)](https://na.parliament.gov.np/uploads/attachments/nls0lydfk67nspo5.pdf)

Access scope: `search_snippet`. Access date: `2026-09-27`. Not fetched full PDF.

### S22

[Department of Health Services Government of Nepal — दायरा](https://dohs.gov.np/pages/scopes/)

Access scope: `full_page_text`. Access date: `2026-09-27`. Usage evidence, not a normative spelling decision.

### S23

[Nepal Police — खेलकुद क्षेत्रमा विशिष्ट योगदान दिँदै नेपाल प्रहरी](https://nepalpolice.gov.np/news/5436/)

Access scope: `full_page_text`. Access date: `2026-09-27`. Usage evidence, not a normative spelling decision.

### S24

[Office of the President Nepal — Address at the eighth national President Running Shield and school sports competition २०७२ (descriptive title)](https://president.gov.np/%E0%A4%B0%E0%A4%BE%E0%A4%B7%E0%A5%8D%E0%A4%9F%E0%A5%8D%E0%A4%B0%E0%A4%BF%E0%A4%AF-%E0%A4%96%E0%A5%87%E0%A4%B2%E0%A4%95%E0%A5%82%E0%A4%A6-%E0%A4%AA%E0%A4%B0%E0%A4%BF%E0%A4%B7%E0%A4%A6%E0%A5%8D%E0%A4%B5/)

Access scope: `search_snippet`. Access date: `2026-09-27`. Not fetched full page.

### S25

[Nepal Insurance Authority — सम्पत्ति बीमा निर्देशन, २०८०](https://nia.gov.np/Admin/images/Law/Directive/65fd164964b9e_1711085129.pdf)

Access scope: `search_snippet`. Access date: `2026-09-27`. Exact bilingual gloss; full fetch failed.

### S26

[House of Representatives Federal Parliament Nepal — Railway bill text (descriptive title)](https://hr.parliament.gov.np/uploads/attachments/ebfbuw1xahvo14fn.pdf)

Access scope: `search_snippet`. Access date: `2026-09-27`. Official passenger-transport use of रेल; not fetched full PDF.

### S27

[Barahathawa Municipality — बरहथवा न.पा. वार्ड नं. - २ मा FREE WIFI सेवा संचालन मा रहेको सम्बन्धि जानकारी गराईन्छ !!](https://barhathwamun.gov.np/ne/node/181)

Access scope: `snippet_only`. Access date: `2026-09-27`. Usage evidence, not a normative spelling decision.

### S28

[Centre for Education and Human Resource Development, Nepal — Generative AI, chatbots and how they differ from search / Nepali lesson](https://learning.cehrd.gov.np/mod/page/view.php?id=1132)

Access scope: `full_page_unicode_html`. Access date: `2026-09-27`. Official educational usage; does not establish a unique normative spelling.

### S29

[Kamal Kumar Poudel and Netra Prasad Sharma, The Researcher (NepJOL) — Major Tendencies of Lexical Borrowing from English to Oral Business Nepali: Implications for Translators and Language Teacher](https://www.nepjol.info/index.php/RESEARCHER/article/view/34611)

Access scope: `full_article_and_pdf`. Access date: `2026-09-27`. A study of oral business Nepali, not a population word-frequency ranking or normative dictionary.

Only source metadata and short observation descriptions are included. Raw corpora, bulk source text and source-page excerpts are not redistributed. The [lexical borrowing study](https://www.nepjol.info/index.php/RESEARCHER/article/view/34611) motivates investigation of oral business Nepali; its sample does not rank these pilot words.
