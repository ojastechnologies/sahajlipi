# API reference

SahajLipi is an MIT-licensed prototype at version `0.1.0`. It is **not published to npm**: [`package.json`](../../package.json) has `"private": true`. The examples below import files from a checkout of this repository. The code is dependency-free ECMAScript modules; Node.js 18 or later is declared in the package metadata.

The public surface has two entry points:

| Entry point | Source | Purpose |
| --- | --- | --- |
| Core | [`src/index.js`](../../src/index.js), types in [`src/index.d.ts`](../../src/index.d.ts) | Convert Roman input without a DOM. |
| Browser adapter | [`src/dom.js`](../../src/dom.js), types in [`src/dom.d.ts`](../../src/dom.d.ts) | Make a `<textarea>` convert text as someone types. |

## Core engine

The following snippet assumes it runs from the repository root:

```js
import { convertWord, convertText, createEngine } from './src/index.js';

convertWord('paani');
// { text: 'पानी', candidates: ['पानी'], ambiguous: false }

convertWord('kam');
// { text: 'कम', candidates: ['कम', 'काम'], ambiguous: true }

convertText('pani. 3.14|');
// 'पनि. 3.14।'
```

### `convertWord(roman)`

Returns `{ text, candidates, ambiguous }`:

| Field | Meaning |
| --- | --- |
| `text` | The first, displayed reading. |
| `candidates` | Distinct readings in priority order. Usually one item; alternatives appear only when an entry lists them. |
| `ambiguous` | `true` when more than one distinct candidate remains. |

An empty input returns empty text and candidates. The engine checks the starter lexicon first, then interprets explicit marks, then applies deterministic phonetic rules. An unknown spelling still returns a result; it is **not** evidence that the result is linguistically correct. See [architecture](architecture.md) and [benchmarks](benchmarks.md).

### `convertText(text)`

Converts each ASCII Latin-letter run, including the supported `^`, `~`, `/`, and `=` shortcuts, using `convertWord`. It also converts `|` to `।`. Periods, digits, spaces, other punctuation, and existing Devanagari pass through. It does not detect language: English words in a mixed-language paste will also be transliterated. `convertText` returns one string and does not expose word-level candidates.

### `createEngine({ entries })`

Creates an independent engine. An `entries` object replaces a starter entry for the same normalized Roman key in that engine instance. Values must be a non-empty array of non-empty strings, ordered from the preferred reading to alternatives; malformed values throw `TypeError`. The engine does not validate the script or Unicode normalization of those strings. Duplicate outputs are removed when a word is converted.

```js
const engine = createEngine({
  entries: {
    myname: ['मेरोनाम'],
    kam: ['काम', 'कम'],
  },
});

engine.convertWord('myname').text; // 'मेरोनाम'
engine.convertWord('kam').text;    // 'काम'
convertWord('kam').text;           // 'कम' — the default engine is unchanged
```

`createEngine` currently configures dictionary entries only. The phonetic token tables and special-key behavior are fixed in the Nepali implementation; there is no language-profile API yet.

## Browser textarea adapter

[`attachNepaliInput`](../../src/dom.js) takes a textarea and the conversion functions to use. It returns a controller. The separate import lets server-side code use the core without touching `document`.

```js
import { convertWord, convertText } from './src/index.js';
import { attachNepaliInput } from './src/dom.js';

const textarea = document.querySelector('textarea');
const controller = attachNepaliInput(textarea, {
  convertWord,
  convertText,
  onStateChange({ text, enabled, activeRoman, candidates }) {
    // Render a candidate list only when candidates.length > 1.
  },
});

// Call when removing the textarea or your component:
controller.destroy();
```

`onStateChange` is optional. It receives an initial state at attachment and updates after adapter actions. `activeRoman` is the spelling of the word currently being edited at the caret. `candidates` is empty unless that active word has visible alternatives. `enabled` controls conversion of subsequent typing and paste; toggling it does not rewrite existing text.

| Controller method | Behavior |
| --- | --- |
| `getState()` | Read `{ text, enabled, activeRoman, candidates }`. |
| `chooseCandidate(index)` | Replace the active word with the zero-based candidate; does nothing when no choice is available. |
| `setEnabled(boolean)` | Turn future conversion on or off. |
| `setText(string)` | Replace textarea contents with the supplied **literal** text. |
| `insertPunctuation(mark?)` | Insert `।` by default, or `॥`, at the selection. The keyboard shortcut `|` produces only `।`. |
| `insertMark(mark)` | Insert `ं` or `ँ`; invalid marks throw `TypeError`. |
| `undo()` / `redo()` | Move through the adapter's edit snapshots. |
| `destroy()` | Remove listeners installed by this controller. Call it during UI teardown. |

The adapter expects a textarea with `setRangeText`; passing another object or missing conversion functions throws `TypeError`. It uses `beforeinput` where possible, an `input` fallback, paste/cut and composition events, and its own undo history. An active word keeps its Roman spelling so Backspace can edit the spelling even after the visible text changes. Once the word is committed, deletion uses `Intl.Segmenter` for grapheme boundaries when available, with a code-point fallback. See [architecture](architecture.md) for the event flow.

The adapter currently targets `<textarea>`, not `contenteditable` or arbitrary form controls. Automated input tests use a simulated textarea; a cross-browser and real-device compatibility matrix has not been established.

## Typing contract and limits

The [typing reference](typing-reference.md) describes the keys, half forms, punctuation, and alternatives. This API is experimental; avoid treating the starter lexicon or current candidate order as a stable linguistic database.
