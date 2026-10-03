# Nepali typing reference

SahajLipi currently converts Roman Nepali, 51 listed English-spelling loanword stems with finite attached suffix forms and 12 full English month names to Unicode Devanagari. The core returns a preferred reading and, where listed, alternatives. The optional browser adapters render that preferred reading in opted-in text fields as you type and report alternatives to the host interface. This reference describes the **unpublished `0.1.0-alpha.2` source candidate**, not a standardized Romanization scheme. The published `0.1.0-alpha.1` keeps its earlier half-consonant default; see the [migration recipe](integration-recipes.md#keep-alpha1-consonant-behavior).

The [starter lexicon](../../src/lexicon.js) takes priority over the [phonetic fallback](../../src/phonetic.js). The listed word `cha` defaults to च and offers छ as an alternative; `chha` returns only छ. The fallback tokens remain `ch` → च and `chh` → छ. Custom entries can replace a built-in entry in one engine instance. See the [engine source](../../src/index.js) for the lookup order.

## Vowels

A bare or final consonant is full by default: both `k` and `ka` → क. The vowel `a` supplies no visible vowel sign and separates consonants where needed: `kar` → कर, while `kr` → क्र. Longer vowels are typed explicitly, so `pani` → पनि and `paani` → पानी.

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

These are **fallback tokens**, shown as their base letters. A bare or final token is full by default: `k` → क and `kh` → ख; `ka` and `kha` give the same letters. Adjacent consonants form internal conjuncts automatically. Longer tokens are matched before shorter ones. A listed word can override the fallback result.

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

The default fallback displays full bare and final consonants immediately, while adjacent consonants form an internal cluster. Pressing Space or typing punctuation commits the displayed reading. Use backtick or `/` when the final consonant must remain half.

| Type | Output | Why |
| --- | --- | --- |
| `k` or `ka` | क | A bare final consonant is full |
| `kr` or `kra` | क्र | Internal क् joins full final र |
| `kri` | क्रि | `i` adds the ि sign |
| `kar` | कर | `a` separates क and र |
| `shakti` | शक्ति | Adjacent consonants form the cluster |

Type backtick (`` ` ``) or `/` to request a virama explicitly: `` k` `` or `k/` → क्, and `` ka` `` or `ka/` → क्. The explicit half form persists when you finish the word with a space or punctuation: `` k` `` followed by Space keeps क्. Each marker remains literal where no consonant can take a virama, such as `` a` `` → `` अ` `` or `a/` → अ/, and the slash in `3/4` stays literal.

A vowel after either explicit half marker is independent: `` k`i `` and `k/i` → क्इ. Use `ki` → कि for the attached vowel sign.

Type backtick followed by `=` (`` `= ``) or `/=` after a consonant when you need a zero width joiner after its virama: `` par`=yo `` and `par/=yo` → पर्‍यो. The inserted sequence is virama U+094D followed by zero width joiner U+200D. The exact visible half form or conjunct depends on the browser's text shaping and font. See the [Unicode Indic FAQ on half forms and joiners](https://www.unicode.org/faq/indic.html).

Developers can select `createEngine({ consonantMode: 'half' })` for the published alpha.1 phonetic fallback: `k` → क्, `kr` → क्र्, while `ka` → क and `kra` → क्र. The default is `consonantMode: 'full'`. This option changes fallback endings only; exact built-in and custom readings keep their priority and supplied Unicode. See the [API option](api.md#consonant-mode), [browser migration recipe](integration-recipes.md#keep-alpha1-consonant-behavior), and [dated software-contract record](consonant-defaults-2026-10-03.md).

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
- `bharyang` supplies the long आ in भर्‍याङ. `bharyaanga` explicitly includes `aa` and final `a`. Bare final consonants in the default fallback are full.

These entries match whole words; they do not infer stems, suffixes, or compound spellings. Other words keep the ordinary cluster, including `kaarya` → कार्य, `suurya` → सूर्य, `saundarya` → सौन्दर्य, and `aachaarya` → आचार्य. For an unlisted form that needs र्‍य, type `/=` explicitly and supply its vowels: `gar/=yo` → गर्‍यो, `pur/=yaaunu` → पुर्‍याउनु, and `bhar/=yaanga` → भर्‍याङ.

Online usage supports the listed Nepali spellings: [नेपाल कानून पत्रिका uses गर्‍यो](https://nkp.gov.np/full_detail/9337) and [मर्‍यो and मार्‍यो](https://nkp.gov.np/full_detail/9028); [Nagarik uses भर्‍यो](https://nagariknews.nagariknetwork.com/opinion/171387-1550462880.html), [Nepal magazine uses तर्‍यो](https://nepalmag.com.np/feeling/2017/01/23/20170123180759), and [Gorkhapatra uses सर्‍यो](https://gorkhapatraonline.com/news/64479). The [District Administration Office, Parsa uses पुर्‍याउनु in a notice heading](https://daoparsa.moha.gov.np/en/post/saraka-ra-jaga-ga-pa-ra-pa-ta-gara-tha-pa-ra-ya-una-para-na-va-thha-pa-raka-ya), and [नेपाल कानून पत्रिका uses भर्‍याङ](https://nkp.gov.np/full_detail/9853). These are assisted checks of published spellings, not independent human verification of the Roman mappings; that review remains pending. The [dated review and benchmark report](ry-review.md) records these decisions, checks, remaining ambiguities, and limitations.

## Reviewed native-word spellings

Four common informal spellings have exact starter entries:

| Roman key | Preferred output |
| --- | --- |
| `halyo` | हाल्यो |
| `nabhani` | नभनी |
| `gaunle` | गाउँले |
| `dindaina` | दिँदैन |

Each currently has one reading. These completed keys supply the source-reviewed vowel or nasal spelling. They preserve the vowel distinctions in the fallback: `pani` and `paani` remain distinct, and `ki` and `kii` retain their vowel lengths. The default fallback now makes bare and final consonants full; explicit backtick or `/` keeps a consonant half. Explicit `^` / `~` still choose bindu / chandrabindu; Shift keys keep their explicit sounds.

Only the complete normalized key matches. Incidental title case such as `Halyo` works; reserved sound capitals inside an input keep their phonetic meaning unless an exact custom entry exists. Attached native forms and misspellings are not inferred from these aliases. Developers can replace a complete key’s readings with `createEngine({ entries })`. The [dated spelling review](nepali-spelling-2026-10-01.md) explains sources, choices, validation and limits.

## English-spelling loanwords

These 51 listed stems automatically use the Nepali loanword forms below. The browser adapters apply them in Nepali mode, and the core conversion functions use them directly. `school` keeps **स्कुल** first and adds **स्कूल** as an alternative; other built-in loanword stems currently have one reading. The [suffix review](loanword-suffixes-2026-10-01.md) records the new `media` key, school alternatives and finite attached forms. These are source-assisted project preferences, with independent human linguistic review pending. The [original pilot](loanword-review.md) and [earlier expansion](loanword-expansion-2026-09-28.md) retain their dated counts and evidence.

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
| `school` | स्कुल; alternative स्कूल | `college` | कलेज |
| `doctor` | डाक्टर | `nurse` | नर्स |

The original pilot above has 20 keys. The table below lists the 30 expansion entries plus the latest `media` stem:

| English key | Preferred output |
| --- | --- |
| `ambulance` | एम्बुलेन्स |
| `battery` | ब्याट्री |
| `bus` | बस |
| `car` | कार |
| `carpet` | कार्पेट |
| `company` | कम्पनी |
| `connector` | कनेक्टर |
| `courier` | कुरियर |
| `cricket` | क्रिकेट |
| `digital` | डिजिटल |
| `drone` | ड्रोन |
| `football` | फुटबल |
| `furniture` | फर्निचर |
| `hotel` | होटल |
| `inverter` | इन्भर्टर |
| `keyboard` | किबोर्ड |
| `laptop` | ल्यापटप |
| `microphone` | माइक्रोफोन |
| `motorcycle` | मोटरसाइकल |
| `office` | अफिस |
| `password` | पासवर्ड |
| `radio` | रेडियो |
| `restaurant` | रेस्टुरेन्ट |
| `router` | राउटर |
| `sofa` | सोफा |
| `telephone` | टेलिफोन |
| `ticket` | टिकट |
| `van` | भ्यान |
| `website` | वेबसाइट |
| `wifi` | वाइफाइ |
| `media` | मिडिया |

The `media` row is the latest addition after the 20-key pilot and 30-key expansion.

This spells a borrowed word rather than translating its meaning: `school` produces स्कुल rather than विद्यालय. `mouse` uses the computer-device reading. A developer can replace a key's full candidate list with the existing `createEngine({ entries })` API.

`Camera`, `Computer` and `Company` match their lowercase entries. Reserved Shift keys still apply, so `Doctor`, `School`, `CAMERA` and `COMPUTER` are not blanket-lowercased aliases. The finite attached forms below inherit the stem reading; unsupported spellings such as `cameramaa` keep the fallback. Hyphenated `e-mail` is split by text conversion and is not the `email` alias.

Keep an entire English field literal by leaving it unattached, marking it `data-sahajlipi-ignore`, or disabling conversion. Text conversion and attached fields preserve recognized links, ASCII domain-shaped hosts, and ordinary ASCII email addresses by default: `camera` becomes क्यामेरा, while `camera.com` stays literal. Ordinary English phrases, code, and filenames still need explicit literal handling; `camera_file` and `camera123` can still be converted. See [mixed text](#mixed-text-and-literal-english).

### Attached loanword forms

Append one of these lowercase keys directly to a listed English loanword stem:

| Suffix key | Appended Nepali form | Example |
| --- | --- | --- |
| `ma` | मा | `schoolma` → स्कुलमा / स्कूलमा |
| `ko` | को | `camerako` → क्यामेराको |
| `ka` | का | `companyka` → कम्पनीका |
| `ki` | की | `companyki` → कम्पनीकी |
| `le` | ले | `companyle` → कम्पनीले |
| `lai` | लाई | `companylai` → कम्पनीलाई |
| `bata` | बाट | `companybata` → कम्पनीबाट |
| `sanga` | सँग | `mediasanga` → मिडियासँग |
| `mathi` | माथि | `companymathi` → कम्पनीमाथि |
| `haru` | हरू | `companyharu` → कम्पनीहरू |

`haru` may be followed by **one** of `ma`, `ko`, `ka`, `ki`, `le`, `lai`, `bata`, `sanga` or `mathi`: `companyharumathi` → कम्पनीहरूमाथि and `schoolharuma` → स्कुलहरूमा / स्कूलहरूमा. That makes **19 recognized suffix keys**, not arbitrary repeated suffixes. Candidate order follows the stem; choose the school alternative through the existing dropdown or candidate API.

Only the 51 listed loanword stems participate. Months, native Nepali entries and arbitrary custom stem names do not gain suffix handling. Exact whole-word custom entries win; customizing a recognized stem changes its derived readings. Unsupported suffixes, `cameramaa` and unrecognized stems use ordinary conversion. Capitals reserved for Shift sounds and explicit marks keep their existing rules. The rule joins spelling components; it does not decide whether the form is grammatical in a sentence.

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

`May` and `may` both select the month spelling मे. The engine cannot distinguish the English modal verb “may” from the month name. Native Roman Nepali such as `maya` keeps its existing behavior. Unlisted abbreviations such as `jan`, `feb` and `sep` and attached forms such as `januaryma` do not inherit month entries. This feature spells Gregorian month names; it does not translate an English sentence or convert dates to Bikram Sambat. Recognized links and email addresses stay literal under the shared text policy; ordinary English phrases still require explicit literal handling.

## Digits

In Nepali mode, ASCII number keys produce Devanagari digits by default:

| Type | Output |
| --- | --- |
| `0123456789` | ०१२३४५६७८९ |
| `3.14` | ३.१४ |
| `September 27, 2026` | सेप्टेम्बर २७, २०२६ |
| `name123@example.com` | name123@example.com |
| `https://example.com:8080/a2?q=2026` | https://example.com:8080/a2?q=2026 |

The decimal point, commas, signs, slashes, and spaces keep their existing punctuation behavior; only digit characters change. The converter does not parse a number or change its value, date, or calendar. Recognized links and email addresses keep their original digits. Before an address cue appears, digits use the normal Nepali style; uninterrupted typing of the cue restores the current token to its original address spelling.

Existing Devanagari digits remain unchanged. Developers can choose ASCII digits with `createEngine({ digits: 'latin' })`, then pass that engine's `convertWord` and `convertText` functions to the browser adapter. This still converts Roman letters to Nepali. See [digit configuration](api.md#digits-and-shared-field-configuration) for app, page, and field setup. English mode keeps all input literal, including `0–9`, and does not rewrite earlier text.

## Nasal marks and punctuation

Type `^` after a syllable for bindu/anusvara ं, or `~` for chandrabindu ँ. These are explicit marks, so `n` and `m` still type consonants.

| Type | Output |
| --- | --- |
| `ka^` | कं |
| `kaa~` | काँ |

The period `.` always stays an English period, including in `3.14`. Type `|` for Nepali पूर्णविराम `।`: `pani|` → पनि। and `3.14|` → ३.१४।. The same rule applies to `convertText` and text pasted into an attached field while Nepali mode is on, outside recognized technical spans. A pipe after a bare domain converts (`camera.com|` → `camera.com।`), but a pipe inside a URL path, query, or fragment stays literal (`camera.com/a|` stays as typed). Separate a URL suffix and sentence danda with whitespace: `camera.com/a |` → `camera.com/a ।`. The DOM controller also exposes `insertPunctuation('।')` and `insertPunctuation('॥')`; `|` types the single danda `।` only.

## Alternatives and field editing

The engine returns candidates in preferred order. For example, `kam` gives कम first and काम second; `cha` gives च first and छ second. Use `chha` for the single छ reading. The field adapter shows the first reading inline and reports alternatives through `onStateChange` only while an ambiguous word is active. An integrating app can show a dropdown and call `chooseCandidate(index)`; the adapter also handles Alt+1, Alt+2, and so on. Press Space to finish the word with the displayed reading. While a word is active, Backspace edits its original Roman sequence and recalculates the Nepali output.

The controller’s `setEnabled(false)` switches subsequent input to literal typing; `setEnabled(true)` resumes conversion. When conversion is disabled, ASCII digits and keys such as `^`, `~`, backtick, `/`, and `|` remain literal. Switching modes does not rewrite text already in the field. `convertText` always uses the first reading of each converted word and returns plain text without candidate data.

## Mixed text and literal English

The default `convertText` and browser adapters preserve recognizable HTTP(S) links, `www.` links, ASCII domain-shaped hosts, and ordinary ASCII email addresses, including plus tags and subdomains. Their original spelling and case stay intact, while Nepali around them converts normally:

```text
namaste camera.com name+tag@example.com
→ नमस्ते camera.com name+tag@example.com

namaste https://Example.com/a|b?q=camera#may pani|
→ नमस्ते https://Example.com/a|b?q=camera#may पनि।
```

Preservation starts at an early address cue: `http:`, `https:`, `www.`, an ordinary ASCII local part followed by `@`, or the first letter after a domain dot. These incomplete examples already stay literal in live typing, paste, and whole-text conversion:

| Type | Output |
| --- | --- |
| `https:` | `https:` |
| `www.` | `www.` |
| `name@` | `name@` |
| `name@example` | `name@example` |
| `camera.c` | `camera.c` |

Before a cue appears, ordinary words still convert: `camera` → `क्यामेरा` and `camera.` → `क्यामेरा.` A trailing period alone does not select an address. During uninterrupted typing, the current token returns to Roman text as soon as the cue appears; it does not wait for a complete address. A space finishes the token. The adapter cannot recover Roman spellings for previously committed text. Switch to English mode before the first key for text that must stay literal from its beginning.

Address recognition is a pattern heuristic: no DNS or public-suffix check is performed, and preserved unfinished addresses are not validated. `pani.paani` and the unfinished `pani.p` stay literal because they look like domains. This policy has ASCII scope and does not provide full Unicode/internationalized address parsing or general English, code, or filename detection. `convertWord` remains a single-Roman-word converter; use `convertText` for mixed strings. A custom engine can disable preservation with `createEngine({ preserveTechnicalText: false })`.

For an English phrase or code fragment, switch the field’s controller to `setEnabled(false)` before typing or pasting it, then use `setEnabled(true)` to resume Nepali. A manager’s `setEnabled()` switches every field it owns. No existing text is rewritten. For fixed literal names, custom entries such as `{ github: ['GitHub'] }` provide a configured spelling; for arbitrary English in bulk text, let the host app convert only its chosen Nepali chunks. See [API examples](api.md#keeping-english-literal).

## Current limits

- The starter lexicon is small. Unknown words use deterministic phonetic rules, which can give incorrect Nepali spelling. There is no context-sensitive ranking or language detection.
- `convertText` preserves recognized technical spans, then converts Latin-letter runs outside them regardless of whether they are Nepali or English. The 51 loanword stems cover their listed keys and 19 finite attached suffix keys; the 12 month names keep exact lookup. These rules add no language detection or general inflection. Arbitrary English and code remain outside automatic preservation.
- The browser adapter attaches to `<textarea>` and text/search inputs, directly or through an opt-in field manager. It handles keyboard input, paste, and composition events, but this reference is not a browser compatibility guarantee.
- The prototype does not offer a dedicated keyboard shortcut for every Devanagari character, mark, or accent. A future language profile would need its own reviewed mappings; current behavior is Nepali-specific.

The implementation and regression examples are in [phonetic rules](../../src/phonetic.js), [lexicon](../../src/lexicon.js), [engine](../../src/index.js), [browser adapters](../../src/dom.js), [engine tests](../../test/engine.test.js), and [adapter tests](../../test/dom.test.js). The [Unicode Indic FAQ](https://www.unicode.org/faq/indic.html) explains why character sequences and rendered Devanagari shapes must be considered separately.
