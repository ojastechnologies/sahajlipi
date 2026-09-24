# SahajLipi

A small, dependency-free prototype for direct Roman Nepali → Unicode typing in web apps. SahajLipi currently supports Nepali; the project name leaves room for other languages written in Devanagari. The default result appears inline; the engine returns alternatives only for spellings explicitly marked as ambiguous.

## Documentation

[Browse all documentation](docs/README.md), including the [security policy](SECURITY.md).

- [Typing reference](docs/typing-reference.md)
- [API reference](docs/api.md)
- [Architecture](docs/architecture.md)
- [Benchmarks and evaluation](docs/benchmarks.md)
- [Development and contributing](docs/development.md)
- [Project status and roadmap](docs/status-and-roadmap.md)

## Try it

Try the [live demo](https://ojastechnologies.github.io/sahajlipi/demo/) in your browser.

Node.js 18+ runs the tests and benchmark; Python 3 serves the local demo. No package install is needed.

```sh
npm test
npm run benchmark -- --check
npm run demo
```

Open [http://localhost:4173/demo/](http://localhost:4173/demo/). Try `k` → `क्`, `ka` → `क`, `kr` → `क्र्`, `kra` → `क्र`, `R` → `ऋ`, `Sha` → `ष`, `kaH` → `कः`, and `kam` to see an alternative in the dropdown.

To open the demo from another device on your local network, bind it to your computer's private IPv4 address:

```sh
npm run demo:lan -- 192.168.1.70
```

Replace `192.168.1.70` with your current LAN address, then open `http://<that-address>:4173/demo/` on the other device. Only one demo server can use port 4173 at a time.

## Use the engine

```js
import { convertWord, convertText, createEngine } from './src/index.js';

convertWord('nepal');
// { text: 'नेपाल', candidates: ['नेपाल'], ambiguous: false }

convertWord('pani');
// { text: 'पनि', candidates: ['पनि'], ambiguous: false }

convertWord('paani');
// { text: 'पानी', candidates: ['पानी'], ambiguous: false }

convertWord('k');
// { text: 'क्', candidates: ['क्'], ambiguous: false }

convertWord('ka');
// { text: 'क', candidates: ['क'], ambiguous: false }

convertWord('kr');
// { text: 'क्र्', candidates: ['क्र्'], ambiguous: false }

convertWord('kra');
// { text: 'क्र', candidates: ['क्र'], ambiguous: false }

convertWord('kri');
// { text: 'क्रि', candidates: ['क्रि'], ambiguous: false }

convertWord('R');
// { text: 'ऋ', candidates: ['ऋ'], ambiguous: false }

convertWord('kR');
// { text: 'कृ', candidates: ['कृ'], ambiguous: false }

convertWord('Sha');
// { text: 'ष', candidates: ['ष'], ambiguous: false }

convertWord('kaH');
// { text: 'कः', candidates: ['कः'], ambiguous: false }

convertWord('kam');
// { text: 'कम', candidates: ['कम', 'काम'], ambiguous: true }

convertWord('paryo');
// { text: 'पर्‍यो', candidates: ['पर्‍यो'], ambiguous: false }

convertWord('ka^');
// { text: 'कं', candidates: ['कं'], ambiguous: false }

convertWord('kaa~');
// { text: 'काँ', candidates: ['काँ'], ambiguous: false }

convertWord('k/');
// { text: 'क्', candidates: ['क्'], ambiguous: false }

convertWord('par/=yo');
// { text: 'पर्‍यो', candidates: ['पर्‍यो'], ambiguous: false }

convertText('namaste, nepal!');
// 'नमस्ते, नेपाल!'

convertText('pani. 3.14');
// 'पनि. 3.14'

convertText('pani|');
// 'पनि।'

convertText('3.14|');
// '3.14।'

const engine = createEngine({
  entries: { myname: ['मेरोनाम'], kam: ['काम', 'कम'] },
});
engine.convertWord('myname');
// { text: 'मेरोनाम', candidates: ['मेरोनाम'], ambiguous: false }
```

Custom entries replace the built-in entry for the same spelling in that engine instance. The package also ships TypeScript declarations.

`paryo` maps to `पर्‍यो`. This is a word-level entry rather than a global rule for every `ry` combination.

### Dental and retroflex sounds

Lowercase `t` and `d` type the dental sounds; hold Shift for the retroflex sounds:

| Type | Output | Type | Output |
| --- | --- | --- | --- |
| `ta` | त | `Ta` | ट |
| `da` | द | `Da` | ड |
| `tha` | थ | `Tha` | ठ |
| `dha` | ध | `Dha` | ढ |

Capital `R`, `S`, and `H` have distinct behavior too; most other capital letters are treated like lowercase. Custom dictionary entries may use these shifted letters to define spellings separately.

### Other Shift shortcuts

Capital `R` types the independent vowel `ऋ`, or the `ृ` sign after a consonant. The ordinary lowercase sequence stays phonetic: `ri` → `रि` and `kri` → `क्रि`, while `R` → `ऋ` and `kR` → `कृ`.

Capital `S` or `Sh` selects `ष`, while lowercase `sh` selects `श`. Add a vowel to complete the consonant: `Sa` or `Sha` → `ष`, but `sha` → `श`. A bare `S` or `Sh` remains half, following the same rule as other consonants.

Capital `H` after a vowel adds visarga `ः`: `kaH` → `कः` and `duHkha` → `दुःख`. Lowercase `h` still types `ह` (`ha` → `ह`), and the ASCII colon stays literal (`ka:` → `क:`).

Known dictionary words can keep their familiar spelling when capitalized: `Ram` → `राम` and `Sita` → `सीता`. An exact custom Shift spelling takes priority over that fallback.

### Bindu and chandrabindu

Type `^` after a syllable for bindu (anusvara) `ं`, or `~` for chandrabindu `ँ`. For example, `ka^` → `कं` and `kaa~` → `काँ`. On a common US keyboard these are Shift+6 and Shift+backtick. The marks are explicit so `n` and `m` continue to type consonants. With Nepali mode off, `^` and `~` remain literal.

### Half consonants and conjuncts

In the phonetic fallback, a consonant stays half until a vowel is attached: `k` → `क्`, then `ka` → `क`. Adjacent consonants form a cluster, and the final consonant also remains half if it has no vowel: `kr` → `क्र्`, `kra` → `क्र`, `kri` → `क्रि`. A complete word such as `shakti` still gives `शक्ति`. Pressing Space commits the displayed form; it does not silently add an `a`. Known words can have their own spellings in the starter lexicon, such as `kam` → `कम` (with `काम` as an alternative).

The `/` key remains available to request an explicit halant, especially after a vowel: `k/` or `ka/` → `क्`, and `tha/` → `थ्`. The slash stays literal in dates such as `3/4` and after an independent vowel such as `a/` → `अ/`.

When the visible shape matters, add `=` immediately after `/` to insert a zero width joiner: `par/=yo` → `पर्‍यो`. This matches the spelling of the built-in `paryo` entry. The explicit sequence follows the Unicode virama plus joiner mechanism; it is mainly for words where the ordinary conjunct has the wrong appearance.

## Add direct typing to a textarea

```js
import { convertWord, convertText } from './src/index.js';
import { attachNepaliInput } from './src/dom.js';

const controller = attachNepaliInput(document.querySelector('textarea'), {
  convertWord,
  convertText,
  onStateChange({ candidates }) {
    // Show choices only when candidates has more than one item.
  },
});

controller.insertPunctuation('।'); // Insert पूर्णविराम at the caret.
controller.insertMark('ं'); // Insert bindu at the caret.
controller.insertMark('ँ'); // Insert chandrabindu at the caret.
// Later: controller.destroy();
```

The adapter is exported separately from the core, so server-side code can import the engine without a DOM. The playground uses the same adapter.

The `.` key always types an English period, including in Nepali mode and in decimals such as `3.14`. Type `|` for पूर्णविराम `।`: `pani|` → `पनि।` and `3.14|` → `3.14।`. With Nepali mode off, `|` remains literal. The core `convertText` function and pasted text follow the same rules. Developers can also call `insertPunctuation('।')` at the caret.

## How this prototype works

- A small [starter lexicon](src/lexicon.js) covers common Roman spellings and a few ambiguous words.
- Other words use deterministic [phonetic rules](src/phonetic.js). These rules are a fallback, not a claim of correct spelling for every Nepali word.
- `convertText` converts Latin-letter runs with half consonants by default, explicit nasal and joiner shortcuts, and `|` to पूर्णविराम while preserving periods, decimals, other punctuation, whitespace, numerals, and existing Devanagari.
- The [demo](demo/) provides a browser input experience; the core engine has no DOM dependency or network calls.

The lexicon is intentionally small. Unknown words, names, English words, and informal spellings can convert incorrectly. There is no statistical ranking or context-sensitive disambiguation yet. This is a prototype to test the interaction model, not a production Nepali IME.

## Contributing direction

A useful contribution is a Roman spelling, the expected Unicode result, and a test that demonstrates the behavior. Ambiguous words should include both valid outputs in preferred order. Broader lexicon changes need validation with Nepali speakers before release.
