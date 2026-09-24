# Nepali typing reference

SahajLipi currently converts Roman Nepali to Unicode Devanagari. The core returns a preferred reading and, where listed, alternatives. The optional browser adapters render that preferred reading in opted-in text fields as you type and report alternatives to the host interface. This reference describes the **current prototype**, not a standardized Romanization scheme.

The [starter lexicon](../../src/lexicon.js) takes priority over the [phonetic fallback](../../src/phonetic.js). This matters for words such as `cha`: the fallback token `ch` represents च, but the listed word `cha` defaults to छ and offers च as an alternative. Custom entries can replace a built-in entry in one engine instance. See the [engine source](../../src/index.js) for the lookup order.

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

Capital `S` or `Sh` selects ष (`Sa` or `Sha` → ष), while lowercase `sh` selects श (`sha` → श). Capital `H` **after a vowel** adds visarga ः: `kaH` → कः and `duHkha` → दुःख. Lowercase `h` remains ह (`ha` → ह), and `:` remains a colon. Other capital letters usually behave like lowercase, but an exact custom entry can preserve a distinct Shift spelling. A listed lowercase word can also match title case, for example `Ram` → राम.

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

Type `/=` after a consonant when you need a zero width joiner after its virama: `par/=yo` → पर्‍यो. The lexicon also maps `paryo` to that same Unicode sequence; it is a **word-specific entry**, not a general rule for every `ry`. The inserted sequence is virama U+094D followed by zero width joiner U+200D. Unicode encodes these characters; the exact visible half form or conjunct depends on the browser's text shaping and font. See the [Unicode Indic FAQ on half forms and joiners](https://www.unicode.org/faq/indic.html).

## Nasal marks and punctuation

Type `^` after a syllable for bindu/anusvara ं, or `~` for chandrabindu ँ. These are explicit marks, so `n` and `m` still type consonants.

| Type | Output |
| --- | --- |
| `ka^` | कं |
| `kaa~` | काँ |

The period `.` always stays an English period, including in `3.14`. Type `|` for Nepali पूर्णविराम `।`: `pani|` → पनि। and `3.14|` → 3.14।. The same rule applies to `convertText` and text pasted into an attached field while Nepali mode is on. The DOM controller also exposes `insertPunctuation('।')` and `insertPunctuation('॥')`; `|` types the single danda `।` only.

## Alternatives and field editing

The engine returns candidates in preferred order. For example, `kam` gives कम first and काम second. The field adapter shows the first reading inline and reports alternatives through `onStateChange` only while an ambiguous word is active. An integrating app can show a dropdown and call `chooseCandidate(index)`; the adapter also handles Alt+1, Alt+2, and so on. Press Space to finish the word with the displayed reading. While a word is active, Backspace edits its original Roman sequence and recalculates the Nepali output.

The controller’s `setEnabled(false)` switches subsequent input to literal typing; `setEnabled(true)` resumes conversion. When conversion is disabled, keys such as `^`, `~`, `/`, and `|` remain literal. Switching modes does not rewrite text already in the field. `convertText` always uses the first reading of each converted word and returns plain text without candidate data.

## Current limits

- The starter lexicon is small. Unknown words use deterministic phonetic rules, which can give incorrect Nepali spelling. There is no context-sensitive ranking or language detection.
- `convertText` converts Latin-letter runs regardless of whether they are Nepali or English. Review mixed-language text before using its output.
- The browser adapter attaches to `<textarea>` and text/search inputs, directly or through an opt-in field manager. It handles keyboard input, paste, and composition events, but this reference is not a browser compatibility guarantee.
- The prototype does not offer a dedicated keyboard shortcut for every Devanagari character, mark, or accent. A future language profile would need its own reviewed mappings; current behavior is Nepali-specific.

The implementation and regression examples are in [phonetic rules](../../src/phonetic.js), [lexicon](../../src/lexicon.js), [engine](../../src/index.js), [browser adapters](../../src/dom.js), [engine tests](../../test/engine.test.js), and [adapter tests](../../test/dom.test.js). The [Unicode Indic FAQ](https://www.unicode.org/faq/indic.html) explains why character sequences and rendered Devanagari shapes must be considered separately.
