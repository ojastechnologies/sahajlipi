# API reference

SahajLipi is an MIT-licensed experimental package. [`package.json`](../../package.json) is prepared for the **`0.1.0-alpha.1` candidate** with public access and the `alpha` tag. It is **not published to npm yet**; candidate metadata does not establish a registry release. Install it from a local tarball or checkout folder using [getting started](getting-started.md); the examples below use its public package exports. The code is dependency-free ECMAScript modules; Node.js 18 or later is declared in the package metadata. See [integration recipes](integration-recipes.md) for complete candidate and component examples.

The public surface has two entry points:

| Entry point | Source | Purpose |
| --- | --- | --- |
| `sahajlipi` | [`src/index.js`](../../src/index.js), types in [`src/index.d.ts`](../../src/index.d.ts) | Convert Roman input without a DOM. |
| `sahajlipi/dom` | [`src/dom.js`](../../src/dom.js), types in [`src/dom.d.ts`](../../src/dom.d.ts) | Add live typing to one field or a configurable set of fields in a document or page region. |

## Core engine

The following snippet assumes SahajLipi is installed in an ESM application:

```js
import { convertWord, convertText, createEngine } from 'sahajlipi';

convertWord('paani');
// { text: 'पानी', candidates: ['पानी'], ambiguous: false }

convertWord('gaunle');
// { text: 'गाउँले', candidates: ['गाउँले'], ambiguous: false }

convertText('halyo nabhani gaunle dindaina.');
// 'हाल्यो नभनी गाउँले दिँदैन.'

convertWord('kam');
// { text: 'कम', candidates: ['कम', 'काम'], ambiguous: true }

convertWord('camera');
// { text: 'क्यामेरा', candidates: ['क्यामेरा'], ambiguous: false }

convertWord('companyharumathi');
// { text: 'कम्पनीहरूमाथि', candidates: ['कम्पनीहरूमाथि'], ambiguous: false }

convertWord('schoolma');
// { text: 'स्कुलमा', candidates: ['स्कुलमा', 'स्कूलमा'], ambiguous: true }

convertWord('mediasanga');
// { text: 'मिडियासँग', candidates: ['मिडियासँग'], ambiguous: false }

convertWord('September');
// { text: 'सेप्टेम्बर', candidates: ['सेप्टेम्बर'], ambiguous: false }

convertWord('cha');
// { text: 'च', candidates: ['च', 'छ'], ambiguous: true }

convertText('pani. 3.14|');
// 'पनि. ३.१४।'

convertText('namaste camera.com name+tag@example.com');
// 'नमस्ते camera.com name+tag@example.com'
```

### `convertWord(roman)`

Returns `{ text, candidates, ambiguous }`:

| Field | Meaning |
| --- | --- |
| `text` | The first, displayed reading. |
| `candidates` | Distinct readings in priority order. Usually one item; listed stem alternatives are inherited by recognized suffix forms. |
| `ambiguous` | `true` when more than one distinct candidate remains. |

`convertWord` is a single-Roman-word API. It does not apply URL or email preservation; use `convertText` for text containing addresses or punctuation. An empty input returns empty text and candidates. The engine checks an exact lexicon entry first, then recognized loanword suffix forms, then interprets explicit marks and applies deterministic phonetic rules. An unknown spelling still returns a result; it is **not** evidence that the result is linguistically correct. See [architecture](architecture.md) and [benchmarks](benchmarks.md).

The four reviewed exact aliases `halyo` → हाल्यो, `nabhani` → नभनी, `gaunle` → गाउँले and `dindaina` → दिँदैन each have one reading. They use whole-word lookup; they do not create a vowel/nasal correction rule or native-word suffix inference. An exact custom entry replaces an alias, as for any starter entry. Reserved Shift keys still select their sounds. See the [dated spelling review](nepali-spelling-2026-10-01.md).

The built-in lexicon includes 51 recognized English-spelling loanword stems, including `camera` → क्यामेरा, `company` → कम्पनी and `media` → मिडिया. `school` returns `['स्कुल', 'स्कूल']`; the first reading remains the existing default. Recognized suffix forms inherit every distinct stem reading in the same order. The [suffix review](loanword-suffixes-2026-10-01.md) records the finite rule, evidence and limits. These are source-assisted project preferences, with independent human linguistic review pending. They spell borrowed words rather than translating their meanings.

It also includes the 12 full English month names, each with one preferred candidate: `january` → जनवरी, `may` → मे and `december` → डिसेम्बर, for example. All normal title-case month names work; `September` and `December` are explicit aliases because their initial capitals otherwise select reserved sounds. The [month reference](month-names.md) lists every mapping and its source scope. These are source-assisted project preferences, with independent human linguistic review pending.

Lookup keeps the existing normalization and reserved `T`, `D`, `S`, `R` and contextual `H` sound keys. `Camera` matches `camera`; `Doctor`, `School` and all-capital spellings that retain a reserved key are not automatic English aliases. Recognized attached forms such as `camerako` inherit the loanword stem. Only the 19 suffix keys in the [typing reference](typing-reference.md#attached-loanword-forms) are recognized: the rule adds a supported suffix directly to a recognized stem reading, without predicting grammar or correcting typos. `cameramaa`, unsupported suffix chains and unrecognized stems keep the fallback. `cha` now returns `['च', 'छ']`; `chha` returns only `['छ']`.

The month entries use the same whole-word lookup. Abbreviations such as `jan` and attached forms such as `januaryma` are unlisted. Both `May` and `may` give मे; the engine does not detect whether “may” is a month or an English modal verb. Native Roman input such as `maya` keeps its existing behavior. The entries convert month names, not calendar dates; there is no Gregorian-to-Bikram-Sambat conversion or new API option.

### `convertText(text)`

Preserves recognizable technical spans first, then converts ASCII Latin-letter runs outside them using `convertWord`, including the supported `^`, `~`, `/`, and `=` shortcuts. Outside protected spans, ASCII digits `0–9` become Devanagari `०–९` by default and `|` becomes `।`; periods, whitespace, other punctuation, and existing Devanagari pass through. The engine-level `digits` option can retain ASCII digits instead. It returns one string without word-level candidates.

#### Links, domains, and email addresses

The default policy preserves recognizable HTTP(S) links, `www.` addresses, ASCII domain-shaped hosts such as `camera.com` and `nepal.gov.np`, and ordinary ASCII email addresses such as `name+tag@mail.example.com`. `mailto:` addresses and their query strings are also recognized. Matching spans retain their original spelling and case, including URL paths, query strings, and fragments. No network request, DNS lookup, public-suffix validation, or language detection is involved. A domain-shaped spelling such as `pani.paani`, or its unfinished form `pani.p`, is preserved even if it was intended as Nepali words separated by a period.

| Recognized shape | Scope |
| --- | --- |
| HTTP(S) link or unfinished prefix | Preservation begins at `http:` or `https:`, before a host is complete. The scheme and recognizable slash/authority text stay literal, including a single slash while typing. Complete links can have ASCII hosts, including localhost or IP-shaped hosts, user information, numeric ports, and `/`, `?`, or `#` suffixes. |
| `www.` address or unfinished prefix | Preservation begins at the exact `www.` prefix, before the following host has been typed. |
| Bare domain or unfinished domain | Dot-separated ASCII labels; preservation begins with the first ASCII letter after a dot, as in `camera.c`. A final ASCII `xn--` form is also recognized. No public-suffix or DNS check. |
| Email or unfinished mailbox | An ordinary ASCII local part containing letters, digits, `_`, `%`, `+`, or `-`, with dots between its parts, followed by `@`. Preservation begins at `@`, before the host is complete, so `name@` and `name@example` stay literal. Optional `mailto:` prefix and its query string. Quoted or Unicode local parts are outside this scope. |

These cues use the same policy for bulk conversion, pasted text, and live typing. An unfinished address is preserved because the text supplies an address cue; preservation does not mean the address is valid. Host/domain recognition uses ASCII characters; a recognized URL's suffix is copied literally and can include Unicode. The policy does not perform IDNA conversion.

```js
convertText('camera camera.com may may.com');
// 'क्यामेरा camera.com मे may.com'

convertText('namaste https://Example.com/a|b?q=camera#may pani|');
// 'नमस्ते https://Example.com/a|b?q=camera#may पनि।'

convertText('(camera.com), name+tag@example.com!');
// '(camera.com), name+tag@example.com!'

convertText('https: www. name@ camera.c');
// 'https: www. name@ camera.c'

convertText('camera. pani.');
// 'क्यामेरा. पनि.'
```

Sentence-ending punctuation and enclosing wrappers remain outside the recognized span. Balanced parentheses within a URL path can remain part of it. A pipe immediately after a bare domain stays outside: `camera.com|` → `camera.com।`. Once a URL has a `/`, `?`, or `#` suffix, shortcut characters within that suffix stay literal, including a final pipe: `camera.com/a|` stays `camera.com/a|`. To add Nepali danda after such a URL, separate it with whitespace, for example `camera.com/a |` → `camera.com/a ।`.

Digits inside protected spans also retain their original spelling: `name123@example.com` and `https://example.com:8080/a2?q=2026` stay literal. Before an address cue appears, ordinary digits use the configured style; continuously typing `name123@` restores that current token to its original ASCII address spelling.

Before an address cue appears, ordinary letters still convert: `camera` becomes `क्यामेरा` and `camera.` remains `क्यामेरा.` Once `camera.c` or `camera@` is typed continuously, the adapter restores the current token to Roman text and preserves its following address characters. A trailing period alone is not an address cue, so sentence periods keep their existing behavior. Use English mode before the first key when an entire fragment must stay literal from its beginning.

Unusual credential punctuation in an unfinished URL authority can be ambiguous with sentence punctuation. For example, `!` before a later `@` may be treated as a boundary until the credential context is clear. Use English mode before the first key when every intermediate character must remain literal.

This is an ASCII pattern policy, not a full URL or email parser. Unicode hostnames/mailboxes, bare localhost names or IP addresses, other URL schemes, arbitrary code, filenames, acronyms, and ordinary English phrases have no general preservation guarantee. The converter can still match `camera` within `camera_file` and `camera123`. Hyphenated `e-mail` is split and does not become the `email` alias. Use the literal-text controls below when the text must remain unchanged.

<a id="createengine-entries"></a>

### `createEngine({ entries, preserveTechnicalText, digits })`

Creates an independent engine. `digits` accepts only `'devanagari'` (the default) or `'latin'`; another value throws `TypeError`. It chooses the rendering of ASCII digits in returned word candidates and in whole-text conversion outside protected spans. Existing Devanagari digits remain unchanged in either style. Candidate digit rendering happens before deduplication, so custom outputs `1` and `१` become one candidate under the default style. Neither style parses numbers, changes their value, or converts calendars.

`preserveTechnicalText` defaults to `true` and controls technical-span preservation in that engine’s `convertText`. Set it to `false` to convert throughout the input, including inside addresses. Digit rendering is independent: use both `digits: 'latin'` and `preserveTechnicalText: false` to recover the earlier ASCII-digit, unprotected-text behavior. It must be a boolean; other values throw `TypeError`. It does not change `convertWord` or disable Nepali conversion. An `entries` object replaces a starter entry for the same normalized Roman key in that engine instance. Values must be a non-empty array of non-empty strings, ordered from the preferred reading to alternatives; malformed values throw `TypeError`. The engine does not validate the script or Unicode normalization of those strings. Duplicate outputs are removed when a word is converted.

This replacement also applies to built-in loanwords: `createEngine({ entries: { camera: ['क्यामरा'] } })` replaces the entire `camera` candidate list in that instance. Recognized attached forms use that engine’s stem readings unless an exact compound entry overrides them. Customizing an arbitrary new key does not make it a recognized suffix stem.

A recognized stem reading containing only ASCII Latin letters keeps the Roman suffix: `createEngine({ entries: { company: ['company'] } }).convertWord('companyma').text` is `companyma`. Other custom strings receive the native suffix verbatim, without automatic vowel or virama changes. Use an exact compound entry when a custom spelling needs different joining. Such choices are instance-specific; they do not become built-in candidates or reviewed labels.

```js
const loanwords = createEngine({
  entries: {
    school: ['स्कूल', 'स्कुल'],
    schoolma: ['विद्यालयमा'],
  },
});

loanwords.convertWord('schoolko').candidates; // ['स्कूलको', 'स्कुलको']
loanwords.convertWord('schoolma').candidates; // ['विद्यालयमा'] — exact entry wins
convertWord('schoolma').candidates;          // ['स्कुलमा', 'स्कूलमा']
```

Month entries use the same API. A lowercase replacement for `september` or `december` also updates its built-in title-case alias; supplying an exact `September` or `December` entry overrides that alias separately. The existing `Ram` and `Sita` aliases follow the same rule. For example:

```js
const months = createEngine({ entries: { september: ['सेप्टेम्वर'] } });
months.convertWord('september').text; // 'सेप्टेम्वर'
months.convertWord('September').text; // 'सेप्टेम्वर'

const casedMonths = createEngine({
  entries: { september: ['सेप्टेम्वर'], September: ['सेप्टेम्बर'] },
});
casedMonths.convertWord('September').text; // 'सेप्टेम्बर'
```

The alternate spelling in this example is an instance-specific choice, not a built-in linguistic recommendation.

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

```js
const legacy = createEngine({ preserveTechnicalText: false });
legacy.convertText('camera.com'); // 'क्यामेरा.चोम्'
```

#### Digits and shared field configuration

```js
convertWord('123');
// { text: '१२३', candidates: ['१२३'], ambiguous: false }

convertText('September 27, 2026 3.14|');
// 'सेप्टेम्बर २७, २०२६ ३.१४।'

const latin = createEngine({ digits: 'latin' });
latin.convertText('pani 123 3.14|'); // 'पनि 123 3.14।'
latin.convertText('१२३');          // '१२३' — existing Devanagari is unchanged
```

Configure one engine for the fields managed by an app, page, or selector. Pass **both** converters so live words, digits, paste, and completed composition use the same style:

```js
import { createEngine } from 'sahajlipi';
import { attachNepaliInputs } from 'sahajlipi/dom';

const engine = createEngine({ digits: 'latin' });
const appTyping = attachNepaliInputs(document, {
  scope: 'all',
  convertWord: engine.convertWord,
  convertText: engine.convertText,
});
```

Use a page element instead of `document`, or a `selector`, to limit these defaults to that region or set of fields. English fields can keep `data-sahajlipi-ignore`. For one field, pass the same pair to `attachNepaliInput`. `digits` is a **core engine option**, not an adapter option or mutable module-wide setting. The adapter's English mode bypasses conversion and keeps ASCII digits literal. Mode or engine choices do not rewrite existing field text.

If `preserveTechnicalText: false` is also selected, address text is no longer protected and its digits follow the configured style too. `digits: 'latin'` changes digits only; it still converts Roman letters to Nepali.

#### Keeping English literal

For a fixed name or acronym, supply a literal custom output. This retains the configured letters whenever that normalized key matches; digits still use the engine’s selected style. It is not arbitrary English detection:

```js
const names = createEngine({ entries: { github: ['GitHub'] } });
names.convertText('namaste github'); // 'नमस्ते GitHub'
```

For arbitrary English phrases, choose the spans in the host app and convert only the Nepali chunks:

```js
const result = 'Project SahajLipi: ' + convertText('namaste camera|');
// 'Project SahajLipi: नमस्ते क्यामेरा।'
```

Browser integrations can use the existing mode controls described below to type or paste English spans. There are no new delimiters or keyboard shortcuts for literal fragments.

`createEngine` configures entries, digit rendering, and the text-preservation policy. The phonetic token tables and special-key behavior remain fixed in the Nepali implementation; there is no language-profile API yet.

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
import { attachNepaliInputs } from 'sahajlipi/dom';

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
import { attachNepaliInputs } from 'sahajlipi/dom';

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
import { createEngine } from 'sahajlipi';
import { attachNepaliInputs } from 'sahajlipi/dom';

const engine = createEngine({ entries: { myname: ['मेरोनाम'] } });
const manager = attachNepaliInputs(document, {
  scope: 'all',
  convertWord: engine.convertWord,
  convertText: engine.convertText,
});
```

Configuration belongs to the returned manager, not to a mutable module-wide singleton. Separate, nonoverlapping roots can use different scopes, converters, callbacks, and enabled states without changing each other's behavior.

The built-in loanword entries convert automatically while Nepali mode is on; recognized links and email addresses stay literal with the default text policy. Keep a whole English field literal with exclusions, or switch a controller to `setEnabled(false)` while typing or pasting an English fragment, then resume with `setEnabled(true)`. These switches affect subsequent input without rewriting existing text. `manager.setEnabled(false)` changes all its fields together. Ordinary English phrases and code are not detected automatically.

To use custom entries or opt out of technical-text preservation, pass both conversion functions from a custom engine as above. There is no `engine` adapter option, `loanwords` option or module-global configuration API.

### Attach one field directly

Use `attachNepaliInput` when a component owns one field or needs a custom engine:

```js
import { createEngine } from 'sahajlipi';
import { attachNepaliInput } from 'sahajlipi/dom';

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

The field adapter uses `beforeinput` where possible, an `input` fallback, paste/cut and composition events, and its own undo history. An active word keeps its Roman spelling so Backspace can edit the spelling even after the visible text changes. During uninterrupted typing, the adapter also keeps the current whitespace-delimited token’s original input: letters before an address cue still convert, but the token returns to its original spelling as soon as `http:`, `https:`, `www.`, an ordinary ASCII local part followed by `@`, or the first letter after a domain dot appears. It does not wait for a complete host or email address. Typing, native input, paste, and completed composition use the shared text policy. This does not recover the Roman spelling of text already committed or supplied as literal text. Once the word is committed, deletion uses `Intl.Segmenter` for grapheme boundaries when available, with a code-point fallback. See [architecture](architecture.md) for the event flow.

The Node tests use simulated fields. A separate [browser compatibility suite](browser-compatibility.md) checks selected editing flows in headless Chromium, Firefox, and WebKit and records its versions and environment. Real device keyboards, operating system clipboard behavior, and installed IMEs remain unverified. Framework-controlled fields can re-render their values, so test their event and teardown behavior in the host app.

## Typing contract and limits

The [typing reference](typing-reference.md) describes the keys, half forms, punctuation, and alternatives. This API is experimental; avoid treating the starter lexicon or current candidate order as a stable linguistic database.
