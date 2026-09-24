# API reference

SahajLipi is an MIT-licensed prototype at version `0.1.0`. It is **not published to npm**: [`package.json`](../../package.json) has `"private": true`. The examples below import files from a checkout of this repository. The code is dependency-free ECMAScript modules; Node.js 18 or later is declared in the package metadata.

The public surface has two entry points:

| Entry point | Source | Purpose |
| --- | --- | --- |
| Core | [`src/index.js`](../../src/index.js), types in [`src/index.d.ts`](../../src/index.d.ts) | Convert Roman input without a DOM. |
| Browser adapters | [`src/dom.js`](../../src/dom.js), types in [`src/dom.d.ts`](../../src/dom.d.ts) | Add live typing to one field or a configurable set of fields in a document or page region. |

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

## Browser input adapters

The browser module is optional. It uses the default `convertWord` and `convertText` functions unless you supply your own. The core entry point can still run without a DOM. Supported fields are `<textarea>`, `<input type="text">`, and `<input type="search">`. Password, email, number, other input types, and `contenteditable` are outside this adapter.

### Choose an integration scope

`attachNepaliInputs(root = document, options?)` creates a manager for a document or element. Configure that manager once for the fields it owns:

| Goal | Setup |
| --- | --- |
| Selected fields (default) | Add `data-sahajlipi` to each field, then call `attachNepaliInputs()`. |
| Every supported field in one document | Call `attachNepaliInputs(document, { scope: 'all' })`. |
| Every supported field in one page region | Pass the region element as `root` with `{ scope: 'all' }`. |
| An app-specific group of fields | Pass `{ selector: '[your-selector]' }`; this overrides the scope's field selection. |

A manager covers only supported `<textarea>`, `<input type="text">`, and `<input type="search">` elements. The default scope is `'marked'`, with selector `[data-sahajlipi]`. In any scope, fields matching `[data-sahajlipi-ignore]` are excluded by default. This makes all-fields mode usable in mixed Nepali and English forms; email, password, number, and other unsupported input types are never attached.

#### Selected fields

```html
<textarea id="message" data-sahajlipi></textarea>
<input type="text" name="name" data-sahajlipi>
<input type="text" name="englishName">
<input type="email" name="email">
```

```js
import { attachNepaliInputs } from './src/dom.js';

const manager = attachNepaliInputs(); // Only marked supported fields.
// Later, when the page or containing app is torn down:
// manager.destroy();
```

#### All supported fields in an app or page

```html
<textarea name="message"></textarea>
<input type="text" name="nepaliName">
<input type="text" name="englishName" data-sahajlipi-ignore>
<input type="email" name="email">
```

```js
import { attachNepaliInputs } from './src/dom.js';

const appTyping = attachNepaliInputs(document, { scope: 'all' });
// Nepali typing applies to the textarea and nepaliName.
// englishName and email stay as normal browser inputs.
```

For a page or component region, pass its container instead of `document`:

```js
const page = document.querySelector('#profile-page');
const pageTyping = attachNepaliInputs(page, { scope: 'all' });
```

Keep manager roots from overlapping. A second attachment to a field raises `TypeError`; a page manager and an app manager should target separate regions or use exclusions. A document-wide manager scans that document's ordinary DOM tree; it does not cross into shadow roots or iframe documents.

#### Options and controls

| Option | Default | Behavior |
| --- | --- | --- |
| `scope` | `'marked'` | `'marked'` selects fields with `data-sahajlipi`; `'all'` selects all supported fields under the root. |
| `selector` | Scope selection | A nonempty CSS selector that replaces the scope's selection rule. Unsupported input types remain ignored. |
| `excludeSelector` | `'[data-sahajlipi-ignore]'` | A CSS selector for fields to leave untouched, including in `'all'` mode. |
| `enabled` | `true` | Initial Nepali mode for every field this manager attaches. |
| `convertWord` / `convertText` | Built-in Nepali engine | Shared conversion functions for all fields managed by this call. |
| `onStateChange(state, field)` | No callback | Receives an initial state for each field and later state updates; render candidate choices in your UI if desired. |

```js
const form = document.querySelector('#nepali-form');
const manager = attachNepaliInputs(form, {
  selector: '[data-language="ne"]', // Overrides scope selection.
  excludeSelector: '[data-language="en"]',
  enabled: false, // Start in literal English mode.
  onStateChange(state, field) {
    // Render state.candidates near this field when alternatives exist.
  },
});

manager.setEnabled(true); // Switch all current fields and future attachments on.
manager.getEnabled();     // true
const controller = manager.getController(form.querySelector('[data-language="ne"]'));
controller?.setEnabled(false); // Override one field without switching the others.
```

The manager watches additions, removals, marker and exclusion changes, and input-type changes with `MutationObserver` when available. `manager.refresh()` rescans on demand, including in environments without `MutationObserver`. `manager.getController(field)` returns the attached field's controller or `null`. `manager.setEnabled(boolean)` updates all currently managed fields and the initial mode of fields attached later; `manager.getEnabled()` reads that shared mode. `manager.destroy()` stops observation and detaches every controller this manager owns.

The manager's `onStateChange(state, field)` callback receives an initial state after the field's controller is registered, then updates after adapter actions. `getController(field)` is available inside the callback. The adapter provides ordered candidates and keyboard selection; rendering an alternatives dropdown belongs to the host app.

Use one custom engine for every field in a manager by passing its conversion functions:

```js
import { createEngine } from './src/index.js';
import { attachNepaliInputs } from './src/dom.js';

const engine = createEngine({ entries: { myname: ['मेरोनाम'] } });
const manager = attachNepaliInputs(document, {
  scope: 'all',
  convertWord: engine.convertWord,
  convertText: engine.convertText,
});
```

Configuration belongs to the returned manager, not to a mutable module-wide singleton. Separate, nonoverlapping roots can use different scopes, converters, callbacks, and enabled states without changing each other's behavior.

### Attach one field directly

Use `attachNepaliInput` when a component owns one field or needs a custom engine:

```js
import { createEngine } from './src/index.js';
import { attachNepaliInput } from './src/dom.js';

const field = document.querySelector('#message');
const engine = createEngine({ entries: { myname: ['मेरोनाम'] } });
const controller = attachNepaliInput(field, {
  convertWord: engine.convertWord,
  convertText: engine.convertText,
  onStateChange({ text, enabled, activeRoman, candidates }) {
    // Render candidates only when candidates.length > 1.
  },
});

// Call during component teardown:
controller.destroy();
```

`attachNepaliInput(field)` without an options object starts in Nepali mode with the built-in converters and needs no callback. Pass `{ enabled: false }` to start that field in literal English mode; `setEnabled(true)` turns its subsequent conversion on. A custom engine can be passed through the two converter options shown above. A field with an unsupported type or an invalid converter option causes the direct API to throw `TypeError`; the manager simply ignores unsupported fields.

`activeRoman` is the spelling of the word currently being edited at the caret. `candidates` is empty unless that active word has visible alternatives. `enabled` controls conversion of subsequent typing and paste; toggling it does not rewrite existing text.

| Controller method | Behavior |
| --- | --- |
| `getState()` | Read `{ text, enabled, activeRoman, candidates }`. |
| `chooseCandidate(index)` | Replace the active word with the zero-based candidate; does nothing when no choice is available. |
| `setEnabled(boolean)` | Turn future conversion on or off. |
| `setText(string)` | Replace the field contents with the supplied **literal** text. |
| `insertPunctuation(mark?)` | Insert `।` by default, or `॥`, at the selection. The keyboard shortcut `|` produces only `।`. |
| `insertMark(mark)` | Insert `ं` or `ँ`; invalid marks throw `TypeError`. |
| `undo()` / `redo()` | Move through the adapter's edit snapshots. |
| `destroy()` | Remove listeners installed by this controller. Call it during UI teardown. |

The field adapter uses `beforeinput` where possible, an `input` fallback, paste/cut and composition events, and its own undo history. An active word keeps its Roman spelling so Backspace can edit the spelling even after the visible text changes. Once the word is committed, deletion uses `Intl.Segmenter` for grapheme boundaries when available, with a code-point fallback. See [architecture](architecture.md) for the event flow.

Automated input tests use simulated fields; a cross-browser and real-device compatibility matrix has not been established. Framework-controlled fields can re-render their values, so test their event and teardown behavior in the host app.

## Typing contract and limits

The [typing reference](typing-reference.md) describes the keys, half forms, punctuation, and alternatives. This API is experimental; avoid treating the starter lexicon or current candidate order as a stable linguistic database.
