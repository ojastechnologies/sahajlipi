# Getting started

SahajLipi converts Roman Nepali to Unicode Nepali. Use the core functions for strings, or the optional browser adapter for live typing in text inputs and textareas. Start here, then use the [API reference](api.md) for every option and the [integration recipes](integration-recipes.md) for candidates and component cleanup.

The current published npm version is **`0.1.0-alpha.2`**. It changes the phonetic fallback to full bare and final consonants and adds backtick as an explicit half marker. The examples below target alpha.2; `consonantMode` and backtick are unavailable in alpha.1. See [alpha.2 behavior](#alpha2-consonant-behavior) and the [migration recipe](integration-recipes.md#keep-alpha1-consonant-behavior) before changing versions.

**Prepared source candidate:** this checkout identifies `0.1.0-alpha.3` and includes the [2026-10-09 native spellings](nepali-spelling-2026-10-09.md). Alpha.3 is unpublished; use the local tarball instructions below and review the [candidate migration notes](../release.md#alpha3-release-candidate). The published installation in this guide continues to select alpha.2.

## 1. Install the published alpha

**[`sahajlipi@0.1.0-alpha.2`](https://www.npmjs.com/package/sahajlipi/v/0.1.0-alpha.2)** was published on 2026-10-03 as an experimental Nepali developer alpha. Its registry tarball matches the archived candidate and reviewed release source. Pin the exact version:

```sh
npm install --save-exact sahajlipi@0.1.0-alpha.2
```

`npm install sahajlipi@alpha` follows the alpha tag and may select a later prerelease. The verified `alpha` and `latest` tags both point to `0.1.0-alpha.2`; `npm install sahajlipi` now selects alpha.2. Npm assigned `latest` on the first publication despite `--tag alpha`, and a removal attempt was rejected. Both versions remain experimental. Use the exact version when reproducible typing behavior matters; the [release record](../release.md) documents the registry result, artifact identity, and consumer checks, as well as [npm's reported tag behavior](https://github.com/npm/cli/issues/8490).

### Local development installation

To test a checkout, clone the repository and pack the version in that checkout:

```sh
git clone https://github.com/ojastechnologies/sahajlipi.git
cd sahajlipi
npm pack --ignore-scripts
```

Check the checkout's version with `npm pkg get version` before packing. The prepared `0.1.0-alpha.3` checkout produces `sahajlipi-0.1.0-alpha.3.tgz`; an older checkout produces a filename matching its own version. A locally packed file captures that checkout and is separate from a verified registry artifact. In your application directory, install the alpha.3 candidate using its absolute path:

```sh
npm install --save-exact /absolute/path/to/sahajlipi/sahajlipi-0.1.0-alpha.3.tgz
```

This tests the candidate locally and does not install alpha.3 from npm. Review the [complete changed-output table](nepali-spelling-2026-10-09.md#exact-preferences-and-evidence) before replacing an alpha.2 installation; the candidate's exact preferences take priority in both consonant modes.

Alternatively, install the local folder directly:

```sh
npm install /absolute/path/to/sahajlipi
```

A folder installation can link to the checkout; checkout changes can then affect your application. A tarball captures the files from the time it was packed. Repack and reinstall it after updating SahajLipi. Alpha users should review the [typing reference](typing-reference.md), [evaluation evidence](nepali-spelling-2026-10-01.md) and [compatibility scope](../release.md#compatibility-scope) before adopting it.

<span id="source-candidate-consonant-behavior"></span>

### Alpha.2 consonant behavior

Alpha.2 uses full bare and final consonants immediately: `k` and `ka` → क, `kr` and `kra` → क्र, `kri` → क्रि, `kar` → कर, and `shakti` → शक्ति. Type backtick or `/` for a half form: `` k` `` and `k/` → क्, including after a space or punctuation commits the word. A following vowel is independent: `` k`i `` and `k/i` → क्इ; use `ki` → कि for the attached sign. Both `` `= `` and `/=` insert a joiner after the explicit virama.

In alpha.2, `createEngine({ consonantMode: 'half' })` preserves the alpha.1 phonetic fallback. Exact built-in/custom readings retain their supplied Unicode in either mode. Pass both engine functions to browser fields as shown in the [migration recipe](integration-recipes.md#keep-alpha1-consonant-behavior). The npm alpha.1 artifact is unchanged and does not expose this option or the backtick shortcut.

## 2. Convert strings

The package is ESM and has no runtime dependencies. Node.js 18 or later can use the core without a browser or DOM. In Node, put this in a `.mjs` file, or use a project with `"type": "module"`:

```js
import { convertWord, convertText, createEngine } from 'sahajlipi';

console.log(convertWord('kam'));
// { text: 'कम', candidates: ['कम', 'काम'], ambiguous: true }

console.log(convertText('namaste camera 123|'));
// नमस्ते क्यामेरा १२३।

const engine = createEngine({ digits: 'latin' });
console.log(engine.convertText('pani 3.14|'));
// पनि 3.14।
```

Run a Node example with `node example.mjs`. Use `convertWord` when you need candidates for one Roman word; use `convertText` for complete text, punctuation, and recognizable URL or email preservation. A returned spelling is not a guarantee of linguistic correctness. The [typing reference](typing-reference.md) explains explicit sound keys, vowel lengths, nasal marks, and half forms.

The two supported imports are:

| Import | Use |
| --- | --- |
| `sahajlipi` | String conversion, independent engines, and core types. |
| `sahajlipi/dom` | Live typing adapters, controllers, and browser types. |

Import from these entry points rather than package-internal `src/` files. There is no CommonJS `require` entry point.

## 3. Enable live typing

In an application with an ESM bundler, import the browser adapter from `sahajlipi/dom`. Call it after the fields exist. A `<script type="module">` in ordinary HTML runs after the document has been parsed.

```html
<label for="message">Message in Nepali</label>
<textarea id="message" name="message" data-sahajlipi></textarea>

<label for="english-name">English name</label>
<input id="english-name" name="englishName" type="text">
```

```js
import { attachNepaliInputs } from 'sahajlipi/dom';

const typing = attachNepaliInputs();

// Call when the owning page or application is removed:
// typing.destroy();
```

The default manager attaches only marked fields. The English field above remains a normal browser input. Supported fields are `<textarea>`, `<input type="text">`, and `<input type="search">`. `contenteditable`, password, email, telephone, number, and other input types are unsupported by the browser adapter.

### Choose the scope

Use one setup for the region your application owns:

| Goal | Setup |
| --- | --- |
| Mark selected fields | `attachNepaliInputs()` with `data-sahajlipi` on those fields. |
| Enable every supported field in the app | `attachNepaliInputs(document, { scope: 'all' })`. |
| Enable a page or component region | `attachNepaliInputs(pageElement, { scope: 'all' })`. |
| Use your own field selector | `attachNepaliInputs(pageElement, { selector: '[data-language="ne"]' })`. |
| Attach one field directly | `attachNepaliInput(field)` imported from `sahajlipi/dom`. |

These are alternative setups. Avoid attaching a field twice: overlapping managers or a direct attachment inside an existing manager raise `TypeError`. A document manager does not enter iframe documents or shadow roots.

For all-fields scope, explicitly exclude English text fields:

```html
<section id="profile-page">
  <label for="nepali-name">Nepali name</label>
  <input id="nepali-name" type="text">

  <label for="english-name">English name</label>
  <input id="english-name" type="text" data-sahajlipi-ignore>
</section>
```

```js
import { attachNepaliInputs } from 'sahajlipi/dom';

const page = document.querySelector('#profile-page');
if (!page) throw new Error('The profile page must exist before setup');
const typing = attachNepaliInputs(page, { scope: 'all' });
```

`data-sahajlipi-ignore` excludes the field itself; putting it on a parent container does not exclude its descendants. A custom `excludeSelector` replaces this default selector, so include `[data-sahajlipi-ignore]` in your selector if you still need that marker.

### Share an engine configuration

Create one engine and pass **both** conversion functions. This keeps live words, paste, and completed composition on the same configuration:

```js
import { createEngine } from 'sahajlipi';
import { attachNepaliInputs } from 'sahajlipi/dom';

const engine = createEngine({
  digits: 'latin',
  entries: { myname: ['मेरोनाम'] },
});

const typing = attachNepaliInputs(document, {
  scope: 'all',
  convertWord: engine.convertWord,
  convertText: engine.convertText,
});
```

Configuration belongs to that engine and manager. There is no mutable module-wide defaults API. Separate, nonoverlapping page regions can use different engines.

### English mode, dynamic fields, and cleanup

```js
typing.setEnabled(false); // Subsequent typing/paste stays literal.
typing.setEnabled(true);  // Resume Nepali conversion.

const field = document.querySelector('#message');
const controller = field ? typing.getController(field) : null;
controller?.setEnabled(false); // Switch just this managed field.

typing.refresh(); // Rescan immediately when your app needs it.
// During page/component teardown:
// typing.destroy();
```

Mode changes affect subsequent input and do not rewrite existing text. `controller.setText(text)` also inserts literal text; convert it explicitly first when that is your intention. The manager observes eligible fields being added, removed, or re-marked when `MutationObserver` is available. Use `refresh()` for an immediate scan or an environment without that observer. `destroy()` stops observation and removes the listeners owned by the manager.

Recognizable addresses stay literal in Nepali mode, and ordinary digits use Devanagari by default. General English sentences, acronyms, and code are not automatically detected; use excluded fields or English mode for text that must stay literal. The [API reference](api.md#links-domains-and-email-addresses) defines the address cues and limits.

## 4. Use TypeScript

Declarations ship with both entry points. Import types with `import type`; they are not JavaScript exports:

```ts
import { createEngine } from 'sahajlipi';
import type { Conversion, EngineOptions } from 'sahajlipi';

const options: EngineOptions = { digits: 'latin' };
const engine = createEngine(options);
const result: Conversion = engine.convertWord('kam');
console.log(result.text);
```

For Node TypeScript projects, use ESM-compatible resolution such as `module: 'NodeNext'` with `moduleResolution: 'NodeNext'`. A `.mts` file is explicitly ESM; `.ts` files in this mode follow the nearest `package.json` module type. For browser projects, use your bundler's ESM configuration and include the TypeScript `DOM` library. Browser controllers operate on actual DOM fields, so narrow a queried element and check for `null` before attaching it. See TypeScript's [module resolution reference](https://www.typescriptlang.org/tsconfig/moduleResolution).

See the runnable [core TypeScript example](../../examples/typescript/core.mts) and [browser TypeScript example](../../examples/typescript/browser.ts). TypeScript does not change runtime support: importing a type does not provide a DOM on the server.

## Plain browsers and server rendering

Native browsers do not resolve bare names such as `sahajlipi/dom` automatically. Supply an import map pointing to files you serve, or use an ESM bundler. The [vanilla example](../../examples/vanilla/index.html) includes an import map for this checkout and uses the same public import names as a packaged application. Serve it over HTTP; opening it as a `file:` URL is not the supported setup.

The core can run during server rendering. Call browser attachment functions only on the client, after the component has mounted or its fields exist, and destroy controllers during teardown. The [React recipe](integration-recipes.md#react-uncontrolled-textarea) demonstrates this lifecycle for an uncontrolled textarea. Framework-controlled inputs remain unverified.

## Run the repository examples

Use Node.js 20 or later, npm, and Python 3 for the repository validation tools:

```sh
npm ci
npm run verify:package
npm run examples:build
npm run examples:serve
```

Open [the packed-package vanilla example](http://127.0.0.1:4177/browser/.generated/vanilla/) or [the React example](http://127.0.0.1:4177/browser/.generated/react/). The build installs a local tarball into an isolated consumer and bundles those examples from the package exports. Package verification checks JavaScript imports and TypeScript resolution; it does not publish anything.

To run the source-only vanilla example without a build, run `npm run examples:serve` and open [the vanilla example on port 4177](http://127.0.0.1:4177/examples/vanilla/). That import map resolves to the checkout source. See the [development guide](../development.md) for browser checks and tooling requirements.

## Continue

- [Integration recipes](integration-recipes.md): complete candidate dropdown, shared configuration, TypeScript fields, and React cleanup.
- [API reference](api.md): signatures, options, controllers, and conversion boundaries.
- [Browser compatibility](browser-compatibility.md): tested desktop behavior and remaining device/IME limits.
- [Release checklist](../release.md): release requirements and current publication status.
