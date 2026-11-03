# Browser extension: design note and coverage assessment

Status: **prototype spike, 2026-10-26; rich text support added 2026-11-03.** Not published to any store. Code: [`extension/`](../extension/README.md).

**Question:** could a browser extension let people type SahajLipi on any website?

**Short answer:** an extension built on the current adapter works in plain `<textarea>`, text and search boxes, including React-controlled ones. Most of the places people write Nepali day to day are rich editors (Gmail, Facebook, Messenger, WhatsApp Web, Slack, Notion, X). The extension now covers `contenteditable` boxes too, and passes against the real Draft.js, Lexical, ProseMirror, Slate and Quill libraries. **That result comes from local test pages. Live sites customise these editors and have not been tested, so it does not yet show that any named site works.** Google Docs stays out of reach because it draws on a canvas. Phased recommendation is at the end.

## What the prototype does

- **Manifest V3** for Chrome and Edge (Chromium 111+). Permissions: `activeTab`, `scripting`, `storage`. Site access is **optional** (`optional_host_permissions`), requested one origin at a time.
- **Content script** ([`src/content.js`](../extension/src/content.js)) calls `attachNepaliInputs(document, { scope: 'all', excludeSelector, enabled, onStateChange })` from the published `sahajlipi/dom` entry point. It does not change the engine, typing rules or adapter.
- **Bundling:** MV3 content scripts are classic scripts and cannot `import`. `src/dom.js` imports `./index.js` and `./text-policy.js`, which import the lexicon, loanwords and phonetic modules. [`tools/build-extension.js`](../tools/build-extension.js) bundles all of it with esbuild (already a dev dependency) into a single IIFE, `extension/dist/content.js` (about 58 KB, unminified). `sahajlipi/dom` resolves through the package's own `exports` map, the same way a consumer's would. The build output is gitignored; run `npm run extension:build` before loading. Dynamic `import()` of `src/` files was rejected because it would expose them as `web_accessible_resources`, which any page can probe to fingerprint the extension.
- **Toggle:** the toolbar popup and the **Alt+Shift+N** command flip a per-site boolean in `chrome.storage.local` (key `site:<origin>`). Every content script on that site, including its frames, listens for the change and calls `manager.setEnabled`. The choice survives reloads and browser restarts.
- **Candidates:** [`src/candidates.js`](../extension/src/candidates.js) renders a small list under the focused field from `onStateChange` candidates. It lives in a closed shadow root so page CSS cannot restyle it. Click calls `controller.chooseCandidate(i)`, and `mousedown` is cancelled so focus and the active word stay in the field. The adapter's own **Alt+1–9** and **Escape** keys keep working.
- **Sensitive fields:** `scope: 'all'` already skips email, password, number and tel inputs, because the adapter only accepts text and search inputs. Plain text inputs are still a risk. With default digits, `4111 1111` typed into a `type="text"` card box becomes `४१११ ११११`, and a Roman username becomes Devanagari. The extension extends the adapter's `excludeSelector` to skip fields that declare `inputmode` numeric/decimal/tel/email/url, or `autocomplete` card, one-time-code, tel, email, username, url or postal-code. It also skips `[data-sahajlipi]` fields (see double conversion). This is a heuristic. A card field with neither attribute is still converted, which is one reason the extension is per-site opt-in.

### Rich text boxes

[`src/rich-text.js`](../extension/src/rich-text.js) adds `contenteditable` support without changing the engine, typing rules or `src/dom.js`. It has two parts:

- **A text box facade.** It gives `attachNepaliInput` an object with the shape of a text input (`value`, `selectionStart`, `setRangeText` and so on), where the "field" is the line holding the caret. Word tracking, candidates and Roman Backspace therefore come from the same adapter code as in a text box, so the typing rules cannot drift. This leans on how the adapter checks its input (it accepts any object of the right shape), so the two should be kept in step; a host interface exported by the package would make that contract explicit.
- **Taking keys before the editor sees them, then replaying the result as typing.** A window capture listener takes `keypress`, plus `keydown` for Backspace and Delete, so the editor never receives the Roman letter. The Nepali text then goes through the same steps as a real key press, each of which an editor may take over: `textInput`, then a synthetic `beforeinput`, then `execCommand('insertText')`.

Each step exists because a real editor needed it. All of this was measured on the test pages:

| Finding | Consequence |
| --- | --- |
| Draft.js takes text from `textInput`. A bare `execCommand` on an empty line made React throw `removeChild` and the editor vanished. | `textInput` is dispatched first. |
| Chromium fires no `beforeinput` for `execCommand`, so Slate's model stayed empty while the page showed text, which would post nothing. | A synthetic `beforeinput` with target ranges is offered. |
| A synthetic `textInput` inserts nothing by itself, so the page lagged behind Draft.js's model. | The command runs unless an editor cancelled an earlier step. |
| A selection starting inside a cluster such as `ना` gets widened by the browser. | Replacements start on a grapheme edge. |
| Editors learn of selection changes asynchronously, so Draft.js would edit at its old caret. | `selectionchange` is dispatched synchronously after selecting. |
| Lexical and others render after the event, and a trailing space may be stored as U+00A0. | The caret check waits for the text to catch up, and U+00A0 compares equal to a space. |

**Deliberate differences from a text box:** undo stays with the editor, whose history holds every edit, so it can step differently from a text box. Paste is left to the editor and is **not converted**, because replacing it would lose its formatting. An IME composition stays as composed.

**Limits:** only editable boxes in the top DOM. A `contenteditable` in a shadow root or inside an injected `about:blank` or `srcdoc` iframe (TinyMCE's classic mode, for example) is not reached. Code editors built on `contenteditable` are converted as well on a site the user turned on. `docs.google.com` is explicitly skipped. These replayed events are heuristics against each editor's internals, so a site's editor upgrade could break them.

### Permission model and trade-off

| Option | Install prompt | Remembers a site | Store review |
| --- | --- | --- | --- |
| `host_permissions: ["<all_urls>"]` + static content script | "Read and change all your data on all websites" | Automatic everywhere | In-depth review, slower; highest trust cost |
| **Chosen:** `activeTab` + optional host permission per origin | None at install | Yes, after the user approves that one origin | Light; optional permissions are justified per use |
| `activeTab` only | None | No: every tab and every navigation needs a click or the shortcut | Lightest |

How it plays out: the popup switch never asks for anything. Clicking it grants `activeTab`, so the script is injected into the open tab straight away and typing lasts until that tab navigates. Once typing is on, a separate **Remember this site** button makes the one request, for that origin only. If the user approves, the background worker adds the origin to a dynamic content script registration (`chrome.scripting.registerContentScripts`, `allFrames: true`) from `permissions.onAdded`, which also works if the dialog closed the popup, so later page loads get the script too. If they decline, the current tab is unchanged and the site is not remembered. This split means Deny can never look ignored: the switch only ever speaks for this tab. **Forget this site** removes the permission and the saved choice. The cost of opt-in is friction: until a site is remembered, each page load needs a click or the shortcut, and remembering it takes one more click and a permission dialog. The shortcut cannot ask for a permission, so on an unapproved site it only covers the current page.

## Coverage assessment

### Works

- `<textarea>`, `<input type="text">` and `<input type="search">`, including fields added after load (the manager's `MutationObserver`).
- React controlled inputs (`value` + `onChange`). The adapter dispatches a bubbling `input` event after each replacement, so React state follows the converted text, survives a re-render, and receives candidate choices. This was verified with React 19.3 in development mode. Other frameworks that listen to `input` (Vue `v-model`, Svelte `bind:value`, Angular forms) should behave the same but were **not tested**.
- `contenteditable` boxes on the five editor libraries above, on local test pages only. See [Rich text boxes](#rich-text-boxes) and the test log.
- Same-origin iframes (`allFrames: true`). A frame follows the **tab's** site choice through `location.ancestorOrigins`.

### Does not work

- **Google Docs** draws text on a canvas and takes input through a hidden, offscreen iframe. Nothing an extension can attach to looks like a text field. (Google's own Input Tools for Docs is built into Docs.)
- **Shadow DOM.** The manager's `root.querySelectorAll` and `MutationObserver` do not cross shadow roots, so inputs inside web components are never attached. Workarounds: walk open shadow roots and run one manager per root, or track `composedPath()[0]` on `focusin` and attach lazily. Neither reaches closed shadow roots without `chrome.dom.openOrClosedShadowRoot`.
- **Cross-origin iframes** (embedded comment widgets, payment frames, chat widgets). `allFrames` only injects where the extension has host access. Those frames need their own origin approved, and the popup only asks for the top site. `about:blank` and `srcdoc` frames would need `matchOriginAsFallback`, which this prototype does not set.
- **Pages that already run SahajLipi.** The adapter stops double attachment with a module-level `attachedFields` WeakSet. The extension's isolated world loads its own copy of the module, so it cannot see the page's WeakSet. Both adapters cancel the same `beforeinput` and both insert. Measured on a fixture page: typing `namaste` into a field the page had attached produced `ननअअममअअससततएए`. The prototype skips `[data-sahajlipi]` fields, which covers pages using the default `'marked'` scope. A page that attaches with `scope: 'all'` or by calling `attachNepaliInput` directly is not detected. A reliable fix belongs in the package (see recommendation).

### Known risks, not verified

- **Observer cost.** With the default exclude selector, the manager filters its `MutationObserver` to three attributes. A custom `excludeSelector` turns that filter off, so the extension observes every attribute change on the page. Each one can run `querySelectorAll` under the changed node. On pages that animate attributes constantly this could add measurable main-thread work. **Not measured.**
- **Live rich text sites.** Sites wrap these libraries in their own handlers, such as mention menus and draft saving. Only a manual pass can show how they behave.
- **Alt+digit on macOS.** The adapter matches `event.key` against `1`–`9`. On macOS, Option+1 normally reports `¡`, so the shortcut hinted in the dropdown may not fire there. Synthetic Playwright key presses cannot show this. Needs a manual check on a Mac keyboard.
- **Site keyboard shortcuts and Alt+Shift+N.** Pages with their own Alt shortcuts may conflict. Chrome lets the user rebind the command.
- **Edge.** The manifest uses only APIs Edge shares with Chrome, but it was not loaded in Edge. Firefox would need `browser_specific_settings` and a different background declaration; Safari needs an Xcode wrapper. Neither was attempted.

## Privacy and store review

- **What the extension sees:** the content script sees every keystroke in text fields on sites the user enabled. It sends nothing anywhere. There is no network code, no analytics and no remote configuration. Storage holds only `site:<origin> → true/false` in `chrome.storage.local`, which is still a local list of sites the user writes Nepali on. Use `local`, not `sync`, unless the user opts in.
- **Chrome Web Store:** a listing needs a single-purpose description, a justification for each permission (`scripting`, `activeTab`, optional hosts), and a privacy policy. The data disclosure form asks about "website content" and "user activity" (keystrokes) even when nothing is transmitted. Answer it truthfully as handled locally and not collected. MV3 forbids remotely hosted code, which the bundled build satisfies. Avoiding `<all_urls>` at install keeps the extension out of the broad-host-permission review queue.
- **Edge Add-ons** has an equivalent review. Publishing needs a privacy policy URL and support contact under Ojas Technologies' name. Code signing and update channels are the store's.
- **Password fields** are never touched (the adapter rejects `type="password"`). Card and code fields are excluded only by the heuristic above.

## Recommendation

1. **Phase 1: ship a "plain text boxes" extension only if that audience is worth it.** This prototype is close. It still needs icons, a store listing, a privacy policy, a manual pass on real sites (government forms, news comment boxes, search boxes), the macOS Alt+digit check, and an observer cost measurement. Set expectations on the listing: no Google Docs, and list only the rich text sites that have passed a manual check.
2. **Phase 2: small package changes that make any second host safe**, each its own PR with tests:
   - the adapter ignores `beforeinput` events that are already `defaultPrevented`, or marks attached fields (for example `data-sahajlipi-attached`), so two copies of SahajLipi never double-convert;
   - an option to keep the observer's attribute filter with a custom `excludeSelector`;
   - optional shadow-root traversal in the manager.
3. **Broad coverage: test the rich text path on live sites first, and keep an OS-level input method as the fallback.**
   - The earlier advice here was not to build a `contenteditable` adapter. One now exists and passes on the five libraries, at a cost of about 400 lines, which is less than expected. Its open risk is the one predicted: it depends on editor internals and breaks if sites change them, so it needs a per-site test list and a way to switch off per site.
   - An OS input method (macOS Input Method Kit, Windows Text Services Framework, Linux IBus/Fcitx, Android/iOS keyboards) remains the only route to canvas editors, native apps and phones. The engine is dependency-free JavaScript with deterministic rules, so it can be embedded in a small JS runtime or ported per platform. The cost is a separate product per OS with its own signing and distribution.
   - **Decide after the manual pass:** if X, Gmail and Facebook hold up, the extension is worth shipping for desktop web users. If they need per-site patches, prefer the OS input method for broad coverage.

## Test log

Run: `npm run extension:check` ([`tools/check-extension.js`](../tools/check-extension.js)), 2026-11-03. Playwright 1.63.0, Chromium 153.0.8010.12 (Playwright's `chromium` channel, headless), macOS 27.0.1, Node 22.22.3. The unpacked extension was copied to a temp directory with `host_permissions` for `http://127.0.0.1:4181/*` added, standing in for an approved permission prompt. Fixtures are served from the repository by `python3 -m http.server`. Result: **179 passed, 0 failed.**

| Area | Check | Result |
| --- | --- | --- |
| Load | MV3 manifest loads; service worker starts; dynamic content script registers for the granted origin | Pass |
| Fields | textarea `namaste ` → `नमस्ते `; search `nepal ` → `नेपाल `; textarea added 50 ms after load converts | Pass |
| Exclusions | `data-sahajlipi-ignore` field, `type="email"`, `autocomplete="cc-number"`, `one-time-code`, `section-login username` all stay literal | Pass |
| Unsupported (expected) | an input in an open shadow root stays literal | Pass (documents the gap) |
| Rich text | Draft.js 0.11.7, Lexical 0.21, ProseMirror, Slate 0.112, Quill 2 and a plain `contenteditable`, each checked in its own model and on screen: words, Roman Backspace, Enter, merging lines, candidate click, typing over a selection within and across lines, mid-line typing, a literal web address; undo goes to the editor; literal while off; no page errors. A box marked `data-sahajlipi-ignore` stays literal. | Pass |
| Frames | same-origin iframe input converts; it follows the top site's off switch | Pass |
| Candidates | `ma` → `म`; dropdown 4 px under the field; clicking `मा` replaces the word, keeps focus, closes the list; Escape closes it | Pass |
| Re-injection | `executeScript` on a tab that already has the script does not attach twice | Pass |
| Toggle | popup's `set-site` message turns the site off (typing literal) and on; off survives a reload | Pass |
| First enable | switching on from the popup on an open page converts without a reload and requests no permission | Pass |
| Remember | hidden until typing is on; asks for this origin only; a refusal (stubbed) leaves the switch and typing on; an approved site offers Forget instead | Pass |
| Opt-in | `http://localhost:4181` (not granted) gets no script | Pass |
| Double conversion | field marked `data-sahajlipi` and attached by the page converts once (without the exclusion: `ननअअममअअससततएए`) | Pass |
| React | controlled input converts; state matches; survives re-render; candidate choice reaches state | Pass |
| `npm test` | unit suite | 394 / 394 pass |

**Manual retest, 2026-11-02, before the permission request moved to its own button:** the maintainer loaded the unpacked extension in their own browser and reported that first enable worked without a reload through the real permission prompt, that the logo showed, and that the switch stayed on after clicking Deny, which led to this split.

**Not verified:**

- the current popup flow with a real toolbar click and `activeTab`, and the real **Remember this site** prompt, both Allow and Deny (these need a human click);
- the Alt+Shift+N command;
- headed Chrome or Edge stable;
- real third-party sites, including any live rich text box (X, Gmail, Facebook, Slack and others), mention menus and hashtag handling there;
- the candidate list's position in rich text boxes (clicking it is checked, its placement is not), and Alt+digit and Escape there;
- macOS Option+digit candidate keys;
- observer performance on heavy pages;
- Firefox and Safari.
