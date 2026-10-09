# Integration recipes

These recipes use the public `sahajlipi` and `sahajlipi/dom` entry points from the published experimental Nepali version `0.1.0-alpha.4`. General attachment and lifecycle recipes also apply to alpha.1; the consonant compatibility option below requires alpha.2 or later. See [getting started](getting-started.md) for exact-version npm installation and local tarballs, and the [release record](../release.md) for distribution status and verification. The core is ESM, and the adapters require real browser fields.

## Runnable examples

| Example | Shows |
| --- | --- |
| [Vanilla HTML](../../examples/vanilla/index.html) and [JavaScript](../../examples/vanilla/main.js) | Marked fields, candidate choices, shared digit configuration, an English field, and cleanup. |
| [Core TypeScript](../../examples/typescript/core.mts) | Public exports and types used from a Node ESM consumer. |
| [Browser TypeScript](../../examples/typescript/browser.ts) | Typed fields, browser options, and typed controllers. |
| [React textarea](../../examples/react/NepaliInput.tsx) and [mounting code](../../examples/react/main.tsx) | An uncontrolled field, effect setup, candidate UI, and effect cleanup. |

Run `npm ci`, `npm run verify:package`, and `npm run examples:build` from the checkout using Node.js 20 or later. The integration checks use the packed package, so the example imports are checked through its exports rather than through direct source imports. Run `npm run examples:serve` to view the built vanilla and React examples on port 4177. See the [getting started example commands](getting-started.md#run-the-repository-examples) and [development guide](../development.md) for the setup and scope of those checks.

## Candidate dropdown for one field

Direct typing always displays the first candidate. An alternatives UI is optional; show it only while `state.candidates` contains multiple choices. A native select provides an accessible starting point:

```html
<label for="message">Nepali message</label>
<textarea id="message" name="message" aria-describedby="typing-help"></textarea>
<p id="typing-help">Type Roman Nepali. Use Alt+1–9 for available alternatives.</p>

<div id="alternatives" hidden>
  <label for="candidate">Alternative spelling</label>
  <select id="candidate"></select>
</div>
```

```js
import { attachNepaliInput } from 'sahajlipi/dom';

const field = document.querySelector('#message');
const panel = document.querySelector('#alternatives');
const select = document.querySelector('#candidate');
if (!(field instanceof HTMLTextAreaElement) ||
    !(panel instanceof HTMLElement) ||
    !(select instanceof HTMLSelectElement)) {
  throw new Error('The typing UI must exist before setup');
}

const controller = attachNepaliInput(field, {
  onStateChange(state) {
    panel.hidden = state.candidates.length < 2;
    select.replaceChildren();
    state.candidates.forEach((candidate, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = candidate;
      select.append(option);
    });
  },
});

function choose() {
  controller.chooseCandidate(Number(select.value));
}
select.addEventListener('change', choose);

function destroyTyping() {
  select.removeEventListener('change', choose);
  controller.destroy();
}
// Call destroyTyping() during page/component teardown.
```

Type `kam` to see `कम` and `काम`. `chooseCandidate(index)` selects the zero-based choice, returns focus to the field, and hides the current alternatives after the choice. The adapter also supports Alt+1–9 and Escape to dismiss alternatives. Moving the caret or committing the word can clear active candidates; do not cache a candidate list and apply it to a later word.

Use `textContent` for candidate labels. The callback also exposes `text`, `enabled`, and `activeRoman`; see [controller state](api.md#attach-one-field-directly). `onStateChange` runs once during direct attachment, so the UI must already exist before calling the adapter. Rendering a dropdown does not turn an unreviewed spelling into a verified linguistic label.

For one shared candidate UI across a manager, its callback receives `(state, field)`. Track the field that owns the displayed choices, then select through `manager.getController(field)?.chooseCandidate(index)`. The [vanilla example](../../examples/vanilla/main.js) shows a manager that associates its candidate choices with the field passed to the callback.

## App or page configuration

Use one engine and one manager for fields with the same policy:

```js
import { createEngine } from 'sahajlipi';
import { attachNepaliInputs } from 'sahajlipi/dom';

const engine = createEngine({ digits: 'latin' });
const page = document.querySelector('#profile-page');
if (!page) throw new Error('The profile page must exist before setup');

const manager = attachNepaliInputs(page, {
  scope: 'all',
  convertWord: engine.convertWord,
  convertText: engine.convertText,
});
```

Put `data-sahajlipi-ignore` on English text fields. Native email, number, telephone, and password fields are unsupported and stay unattached. Use `selector` to select only your Nepali fields; it overrides the scope selection. A custom `excludeSelector` replaces the default exclusion selector. These selectors match fields, not exclusion regions.

Do not combine a document-wide manager with another manager targeting the same fields. Use separate roots, selectors, or field exclusions to keep ownership distinct. For dynamic fields, the manager observes eligible additions and removals; `manager.refresh()` scans immediately. Call `manager.destroy()` when the page region is removed. The [API reference](api.md#choose-an-integration-scope) defines scope, observation, and manager controls.

<span id="keep-alpha1-consonant-behavior"></span>

## Keep alpha.1 consonant behavior

Alpha.2 changes fallback endings: `k` → क and `kr` → क्र by default, where alpha.1 yields क् and क्र्. Internal conjuncts still form automatically, and vowel signs keep their existing rules. Exact lexicon readings, including custom entries, keep priority and are not rewritten.

When adopting alpha.2 or later, select `'half'` on a shared engine to retain alpha.1 fallback endings. Pass **both** converters to the manager so live words, paste, and completed composition use the same configuration:

```js
import { createEngine } from 'sahajlipi';
import { attachNepaliInputs } from 'sahajlipi/dom';

const engine = createEngine({ consonantMode: 'half' });
engine.convertWord('k').text; // 'क्'
engine.convertWord('kr').text; // 'क्र्'

const manager = attachNepaliInputs(document, {
  scope: 'all',
  convertWord: engine.convertWord,
  convertText: engine.convertText,
});

// Call manager.destroy() during page teardown.
```

For a single field, pass the same pair to `attachNepaliInput(field, { convertWord: engine.convertWord, convertText: engine.convertText })`. `consonantMode` is a core option; putting it directly in adapter options does not configure conversion. Attachment and configuration do not rewrite existing field text.

Use the default `'full'` mode when you want full bare and final fallback consonants. Either mode supports explicit backtick and `/` half forms, which persist across spaces and punctuation; `` k`i `` and `k/i` keep the following vowel independent. The [typing reference](typing-reference.md#half-consonants-and-conjuncts) lists these rules. The published alpha.1 artifact retains its original `/` behavior and does not expose `consonantMode` or the backtick shortcut.

## TypeScript field attachment

Use DOM narrowing to handle absent or incorrect markup:

```ts
import { attachNepaliInput } from 'sahajlipi/dom';
import type { InputState, NepaliInputController } from 'sahajlipi/dom';

const field = document.querySelector('#message');
if (!(field instanceof HTMLTextAreaElement)) {
  throw new Error('Expected the message textarea');
}

const controller: NepaliInputController = attachNepaliInput(field, {
  onStateChange(state: InputState) {
    console.log(state.text);
  },
});

// Call during teardown:
// controller.destroy();
```

Use `import type` for interfaces. Compile browser code with the TypeScript `DOM` library and a resolver that supports package exports. The repository includes [Node ESM](../../examples/typescript/core.mts) and [browser](../../examples/typescript/browser.ts) consumers so declarations can be checked against the packed package.

## React uncontrolled textarea

The [React example](../../examples/react/NepaliInput.tsx) uses a ref to an uncontrolled textarea, attaches the controller in an effect, and destroys it in that effect's cleanup. It uses React state to render candidate UI while the adapter owns the textarea's edits. The [mounting example](../../examples/react/main.tsx) demonstrates use in a client app.

Follow these ownership rules:

- Use `defaultValue` for the initial field text. Attaching does not convert that existing text; call `convertText(initialRoman)` first if conversion is intended.
- Attach after mount, and call `destroy()` during effect cleanup. This also allows React development Strict Mode to run setup, cleanup, and setup again.
- Keep candidate presentation in React state, and call the current controller's `chooseCandidate(index)` for a selection.
- Read `controller.getState().text` or the textarea's current value when submitting. If the parent needs change notifications, forward `onStateChange` text through your own callback.
- Use `controller.setText(value)` for an explicit external replacement; it inserts literal text and updates adapter state.

The example is deliberately uncontrolled. A controlled textarea with a React `value` prop can overwrite the adapter's DOM changes or disrupt its selection and undo state. Framework-controlled fields are still unverified; no controlled-input hook or component is provided by the package. The example's focused checks establish its documented lifecycle and candidate flow, not compatibility with every React form library. See React's official [textarea reference](https://react.dev/reference/react-dom/components/textarea) for controlled and uncontrolled fields, and [effect reference](https://react.dev/reference/react/useEffect) for setup and cleanup.

The string-conversion core may be used on the server. Browser attachment belongs in the client effect; do not call it during rendering or server execution.

## Integration checklist

Before enabling an adapter in your app:

1. Choose the manager or component that owns each field.
2. Exclude English fields and use an explicit English mode for mixed fragments that must stay literal.
3. Pass both functions when using a custom engine.
4. Provide candidate choices if your users need alternatives.
5. Keep the adapter's field ownership compatible with your framework, and destroy it during teardown.
6. Try your actual device keyboards, clipboard flows, and IMEs; the [compatibility guide](browser-compatibility.md) lists what the repository has tested.
