# Nepali typing reference

SahajLipi currently converts Roman Nepali, 20 listed English-spelling loanwords and 12 full English month names to Unicode Devanagari. The core returns a preferred reading and, where listed, alternatives. The optional browser adapters render that preferred reading in opted-in text fields as you type and report alternatives to the host interface. This reference describes the **current prototype**, not a standardized Romanization scheme.

The [starter lexicon](../../src/lexicon.js) takes priority over the [phonetic fallback](../../src/phonetic.js). The listed word `cha` defaults to च and offers छ as an alternative; `chha` returns only छ. The fallback tokens remain `ch` → च and `chh` → छ. Custom entries can replace a built-in entry in one engine instance. See the [engine source](../../src/index.js) for the lookup order.

## Vowels

A consonant without a following vowel stays half. The vowel `a` completes it without adding a visible vowel sign: `k` → क्, `ka` → क. Longer vowels are typed explicitly, so `pani` → पनि and `paani` → पानी.

The table shows independent vowels and examples after `k`. The `R` row is case-sensitive.

| Roman keys | Independent vowel | After `k` |
| --- | --- | --- |
| `a` | अ | `ka` → क |
| `aa` | आ | `kaa` → का |
| `i` | इ | `ki` → कि |
| `ii` or `ee` | ई | `kii` or `kee` → की |
| `u` | उ | `ku` → कु |
| `uu` or `oo` | ऊ | `kuu` or `koo` → कू |
| `e` | ए | `ke` → के |
| `ai` | ऐ | `kai` → कै |
| `o` | ओ | `ko` → को |
| `au` | औ | `kau` → कौ |
| `R` | ऋ | `kR` → कृ |

Lowercase `ri` → रि and `kri` → क्रि. Use capital `R` when you mean ऋ or the ृ vowel sign.

## Consonants

These are **fallback tokens**, shown as their base letters for readability. When a token is typed without a vowel, the fallback appends virama: `k` → क्, `kh` → ख्. Add `a` to complete the final consonant: `kha` → ख. Longer tokens are matched before shorter ones. A listed word can override the fallback result.

| Roman token | Base letter | Roman token | Base letter |
| --- | --- | --- | --- |
| `k` | क | `kh` | ख |
| `g` | ग | `gh` | घ |
| `ng` | ङ | `c` or `ch` | च |
| `chh` | छ | `j` | ज |
| `jh` | झ | `ny` | ञ |
| `T` | ट | `Th` | ठ |
| `D` | ड | `Dh` | ढ |
| `nn` | ण | `t` | त |
| `th` | थ | `d` | द |
| `dh` | ध | `n` | न |
| `p` | प | `ph` or `f` | फ |
| `b` | ब | `bh` | भ |
| `m` | म | `y` | य |
| `r` | र | `l` | ल |
| `v` or `w` | व | `s` | स |
| `sh` | श | `S` or `Sh` | ष |
| `h` | ह | `ksh` | क्ष |
| `gy` | ज्ञ | | |

### Shift changes a few sounds

Lowercase `t` and `d` produce dental sounds; capital `T` and `D` produce retroflex sounds. Keep `h` lowercase in the aspirated pairs.

| Dental | Retroflex |
| --- | --- |
| `ta` → त | `Ta` → ट |
| `tha` → थ | `Tha` → ठ |
| `da` → द | `Da` → ड |
| `dha` → ध | `Dha` → ढ |

Capital `S` or `Sh` selects ष (`Sa` or `Sha` → ष), while lowercase `sh` selects श (`sha` → श). Capital `H` **after a vowel** adds visarga ः: `kaH` → कः and `duHkha` → दुःख. Lowercase `h` remains ह (`ha` → ह), and `:` remains a colon. Other capitals become lowercase before lookup. The reserved sound keys `T`, `D`, `S`, `R`, and vowel-following `H` bypass lowercase word lookup; an exact cased entry can override them. For example, `Saryo` → षर्यो, `gaRyo` → गऋयो, and `baHini` → बःइनि follow explicit Shift input. The names `Ram` → राम and `Sita` → सीता and the month names `September` → सेप्टेम्बर and `December` → डिसेम्बर are explicit built-in aliases. Replacing their lowercase entries also updates those aliases unless you supply an exact cased override.

## Half consonants and conjuncts

The fallback keeps an unvoweled consonant half, including at the end of an active word. Adjacent consonants form a cluster. Pressing Space commits what is displayed; it does not add an implied `a`.

| Type | Output | Why |
| --- | --- | --- |
| `k` | क् | No vowel yet |
| `ka` | क | `a` completes क |
| `kr` | क्र् | The final र is still half |
| `kra` | क्र | `a` completes the cluster |
| `kri` | क्रि | `i` adds the ि sign |
| `shakti` | शक्ति | Adjacent consonants form the cluster |

Type `/` to request a virama explicitly, especially after a vowel: `ka/` → क्. `k/` also yields क्, which is already the default for a bare `k`. The slash remains literal where no consonant can take a virama, such as `a/` → अ/, and in `3/4`.

Type `/=` after a consonant when you need a zero width joiner after its virama: `par/=yo` → पर्‍यो. The inserted sequence is virama U+094D followed by zero width joiner U+200D. The exact visible half form or conjunct depends on the browser's text shaping and font. See the [Unicode Indic FAQ on half forms and joiners](https://www.unicode.org/faq/indic.html).

### र्य and र्‍य

The ordinary `ry` cluster uses र्य: र U+0930, virama U+094D, then य U+092F. The spelling र्‍य also includes zero width joiner U+200D between the virama and य to request the eyelash form of र. Unicode describes this mechanism in [chapter 12, rule R5a](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-12/). It does not specify which Nepali words should use it.

The starter lexicon supplies र्‍य for these **exact listed words**:

| Roman word | Preferred output |
| --- | --- |
| `paryo` | पर्‍यो |
| `garyo` | गर्‍यो |
| `maryo` | मर्‍यो |
| `maaryo` | मार्‍यो |
| `bharyo` | भर्‍यो |
| `taryo` | तर्‍यो |
| `saryo` | सर्‍यो |
| `puryaunu` or `puryaaunu` | पुर्‍याउनु |
| `bharyang` or `bharyaanga` | भर्‍याङ |

Title case follows the same entries, for example `Garyo` → गर्‍यो. The reserved Shift keys still select their explicit sounds; `Saryo` is therefore षर्यो, while lowercase `saryo` is सर्‍यो. Short and long vowels remain distinct: `maryo` → मर्‍यो and `maaryo` → मार्‍यो, just as `pani` → पनि and `paani` → पानी.

Two informal spellings have additional whole-word exceptions:

- `puryaunu` supplies आ followed by independent उ in पुर्‍याउनु. Its `au` does **not** use the ordinary औ token. `puryaaunu` spells the long vowel explicitly. The fallback still converts `au` to औ, as in `kau` → कौ.
- `bharyang` supplies the long आ and completes the final ङ in भर्‍याङ. `bharyaanga` explicitly includes `aa` and final `a`. Bare consonants in the fallback still remain half.

These entries match whole words; they do not infer stems, suffixes, or compound spellings. Other words keep the ordinary cluster, including `kaarya` → कार्य, `suurya` → सूर्य, `saundarya` → सौन्दर्य, and `aachaarya` → आचार्य. For an unlisted form that needs र्‍य, type `/=` explicitly and supply its vowels: `gar/=yo` → गर्‍यो, `pur/=yaaunu` → पुर्‍याउनु, and `bhar/=yaanga` → भर्‍याङ.

Online usage supports the listed Nepali spellings: [नेपाल कानून पत्रिका uses गर्‍यो](https://nkp.gov.np/full_detail/9337) and [मर्‍यो and मार्‍यो](https://nkp.gov.np/full_detail/9028); [Nagarik uses भर्‍यो](https://nagariknews.nagariknetwork.com/opinion/171387-1550462880.html), [Nepal magazine uses तर्‍यो](https://nepalmag.com.np/feeling/2017/01/23/20170123180759), and [Gorkhapatra uses सर्‍यो](https://gorkhapatraonline.com/news/64479). The [District Administration Office, Parsa uses पुर्‍याउनु in a notice heading](https://daoparsa.moha.gov.np/en/post/saraka-ra-jaga-ga-pa-ra-pa-ta-gara-tha-pa-ra-ya-una-para-na-va-thha-pa-raka-ya), and [नेपाल कानून पत्रिका uses भर्‍याङ](https://nkp.gov.np/full_detail/9853). These are assisted checks of published spellings, not independent human verification of the Roman mappings; that review remains pending. The [dated review and benchmark report](ry-review.md) records these decisions, checks, remaining ambiguities, and limitations.

## English-spelling loanwords

These 20 exact keys automatically use the listed Nepali loanword forms. The browser adapters apply them while Nepali mode is on, and the core conversion functions use them directly. Each new entry has **one candidate**; observed variants remain pending review. The defaults are source-assisted project preferences authorized for implementation, with independent human linguistic review still pending. The [loanword review](loanword-review.md) records source URLs, access scopes, pending variants and the remaining 14 unshipped research proposals.

| English key | Preferred output | English key | Preferred output |
| --- | --- | --- | --- |
| `camera` | क्यामेरा | `computer` | कम्प्युटर |
| `mobile` | मोबाइल | `phone` | फोन |
| `charger` | चार्जर | `printer` | प्रिन्टर |
| `mouse` | माउस | `internet` | इन्टरनेट |
| `email` | इमेल | `software` | सफ्टवेयर |
| `scanner` | स्क्यानर | `video` | भिडियो |
| `taxi` | ट्याक्सी | `bank` | बैंक |
| `cheque` | चेक | `file` | फाइल |
| `school` | स्कुल | `college` | कलेज |
| `doctor` | डाक्टर | `nurse` | नर्स |

This spells a borrowed word rather than translating its meaning: `school` produces स्कुल rather than विद्यालय. `mouse` uses the computer-device reading. A developer can replace a key's full candidate list with the existing `createEngine({ entries })` API.

`Camera` and `Computer` match their lowercase entries. Reserved Shift keys still apply, so `Doctor`, `School`, `CAMERA` and `COMPUTER` are not blanket-lowercased aliases. Attached forms such as `camerako`, `cameramaa`, `mobilema` and `schoolma` are unlisted and keep the fallback; this pilot does not infer suffixes. Hyphenated `e-mail` is split by text conversion and is not the `email` alias.

Keep an entire English field literal by leaving it unattached, marking it `data-sahajlipi-ignore` or disabling conversion. URLs, email addresses, code and English spans **inside** a Nepali-enabled field are not automatically protected. The tokenizer can match `camera` inside `camera.com`, `camera_file` and `camera123`; review mixed text before using the result.

## English month names

These 12 full English month names automatically use the listed Nepali spellings. Each has one candidate and works in core conversion and in attached fields while Nepali mode is on. Normal title case also works, including the exact aliases `September` and `December`. The [month reference](month-names.md) records the spelling evidence and scope; these are authorized source-assisted project preferences, with independent human linguistic review pending.

| English key | Preferred output | English key | Preferred output |
| --- | --- | --- | --- |
| `january` | जनवरी | `february` | फेब्रुअरी |
| `march` | मार्च | `april` | अप्रिल |
| `may` | मे | `june` | जुन |
| `july` | जुलाई | `august` | अगस्ट |
| `september` | सेप्टेम्बर | `october` | अक्टोबर |
| `november` | नोभेम्बर | `december` | डिसेम्बर |

Try `January February March` → जनवरी फेब्रुअरी मार्च and `September December` → सेप्टेम्बर डिसेम्बर. Other uses of reserved Shift keys still select sounds; there is no general folding of all-capital or mixed-case English. For example, `SEPTEMBER` and `DECEMBER` are not month aliases.

`May` and `may` both select the month spelling मे. The engine cannot distinguish the English modal verb “may” from the month name. Native Roman Nepali such as `maya` keeps its existing behavior. Unlisted abbreviations such as `jan`, `feb` and `sep` and attached forms such as `januaryma` do not inherit month entries. This feature spells Gregorian month names; it does not translate an English sentence or convert dates to Bikram Sambat. English spans and URLs inside Nepali-enabled fields still have no automatic protection.

## Nasal marks and punctuation

Type `^` after a syllable for bindu/anusvara ं, or `~` for chandrabindu ँ. These are explicit marks, so `n` and `m` still type consonants.

| Type | Output |
| --- | --- |
| `ka^` | कं |
| `kaa~` | काँ |

The period `.` always stays an English period, including in `3.14`. Type `|` for Nepali पूर्णविराम `।`: `pani|` → पनि। and `3.14|` → 3.14।. The same rule applies to `convertText` and text pasted into an attached field while Nepali mode is on. The DOM controller also exposes `insertPunctuation('।')` and `insertPunctuation('॥')`; `|` types the single danda `।` only.

## Alternatives and field editing

The engine returns candidates in preferred order. For example, `kam` gives कम first and काम second; `cha` gives च first and छ second. Use `chha` for the single छ reading. The field adapter shows the first reading inline and reports alternatives through `onStateChange` only while an ambiguous word is active. An integrating app can show a dropdown and call `chooseCandidate(index)`; the adapter also handles Alt+1, Alt+2, and so on. Press Space to finish the word with the displayed reading. While a word is active, Backspace edits its original Roman sequence and recalculates the Nepali output.

The controller’s `setEnabled(false)` switches subsequent input to literal typing; `setEnabled(true)` resumes conversion. When conversion is disabled, keys such as `^`, `~`, `/`, and `|` remain literal. Switching modes does not rewrite text already in the field. `convertText` always uses the first reading of each converted word and returns plain text without candidate data.

## Current limits

- The starter lexicon is small. Unknown words use deterministic phonetic rules, which can give incorrect Nepali spelling. There is no context-sensitive ranking or language detection.
- `convertText` converts Latin-letter runs regardless of whether they are Nepali or English. The 20 loanword entries and 12 month names cover their listed keys and aliases; they add no language detection, attached-form inference or automatic URL/code protection.
- The browser adapter attaches to `<textarea>` and text/search inputs, directly or through an opt-in field manager. It handles keyboard input, paste, and composition events, but this reference is not a browser compatibility guarantee.
- The prototype does not offer a dedicated keyboard shortcut for every Devanagari character, mark, or accent. A future language profile would need its own reviewed mappings; current behavior is Nepali-specific.

The implementation and regression examples are in [phonetic rules](../../src/phonetic.js), [lexicon](../../src/lexicon.js), [engine](../../src/index.js), [browser adapters](../../src/dom.js), [engine tests](../../test/engine.test.js), and [adapter tests](../../test/dom.test.js). The [Unicode Indic FAQ](https://www.unicode.org/faq/indic.html) explains why character sequences and rendered Devanagari shapes must be considered separately.
