# Browser extension: design note and coverage assessment

Status: **prototype spike, 2026-10-26.** Not published to any store. Code: [`extension/`](../extension/README.md).

**Question:** could a browser extension let people type SahajLipi on any website?

**Short answer:** an extension built on the current adapter works well in plain `<textarea>`, text and search boxes, including React-controlled ones. Most of the places people write Nepali day to day are rich editors (Gmail, Facebook, Messenger, WhatsApp Web, Slack, Notion, X) and Google Docs. The adapter does not support those, so a textarea-only extension reaches a minority of real typing. Broad coverage needs either a `contenteditable` adapter (large, per-site fragile work) or an OS-level input method (a different product). Phased recommendation is at the end.

## What the prototype does

- **Manifest V3** for Chrome and Edge (Chromium 111+). Permissions: `activeTab`, `scripting`, `storage`. Site access is **optional** (`optional_host_permissions`), requested one origin at a time.
- **Content script** ([`src/content.js`](../extension/src/content.js)) calls `attachNepaliInputs(document, { scope: 'all', excludeSelector, enabled, onStateChange })` from the published `sahajlipi/dom` entry point. It does not change the engine, typing rules or adapter.
- **Bundling:** MV3 content scripts are classic scripts and cannot `import`. `src/dom.js` imports `./index.js` and `./text-policy.js`, which import the lexicon, loanwords and phonetic modules. [`tools/build-extension.js`](../tools/build-extension.js) bundles all of it with esbuild (already a dev dependency) into a single IIFE, `extension/dist/content.js` (about 58 KB, unminified). `sahajlipi/dom` resolves through the package's own `exports` map, the same way a consumer's would. The build output is gitignored; run `npm run extension:build` before loading. Dynamic `import()` of `src/` files was rejected because it would expose them as `web_accessible_resources`, which any page can probe to fingerprint the extension.
- **Toggle:** the toolbar popup and the **Alt+Shift+N** command flip a per-site boolean in `chrome.storage.local` (key `site:<origin>`). Every content script on that site, including its frames, listens for the change and calls `manager.setEnabled`. The choice survives reloads and browser restarts.
- **Candidates:** [`src/candidates.js`](../extension/src/candidates.js) renders a small list under the focused field from `onStateChange` candidates. It lives in a closed shadow root so page CSS cannot restyle it. Click calls `controller.chooseCandidate(i)`, and `mousedown` is cancelled so focus and the active word stay in the field. The adapter's own **Alt+1–9** and **Escape** keys keep working.
- **Sensitive fields:** `scope: 'all'` already skips email, password, number and tel inputs, because the adapter only accepts text and search inputs. Plain text inputs are still a risk. With default digits, `4111 1111` typed into a `type="text"` card box becomes `४१११ ११११`, and a Roman username becomes Devanagari. The extension extends the adapter's `excludeSelector` to skip fields that declare `inputmode` numeric/decimal/tel/email/url, or `autocomplete` card, one-time-code, tel, email, username, url or postal-code. It also skips `[data-sahajlipi]` fields (see double conversion). This is a heuristic. A card field with neither attribute is still converted, which is one reason the extension is per-site opt-in.

### Permission model and trade-off

| Option | Install prompt | Remembers a site | Store review |
| --- | --- | --- | --- |
| `host_permissions: ["<all_urls>"]` + static content script | "Read and change all your data on all websites" | Automatic everywhere | In-depth review, slower; highest trust cost |
| **Chosen:** `activeTab` + optional host permission per origin | None at install | Yes, after the user approves that one origin | Light; optional permissions are justified per use |
| `activeTab` only | None | No: every tab and every navigation needs a click or the shortcut | Lightest |

How it plays out: when the user switches a site on in the popup, Chrome asks for that origin only. If they approve, the background worker adds the origin to a dynamic content script registration (`chrome.scripting.registerContentScripts`, `allFrames: true`) and injects into the open tab. If they decline, the popup or shortcut gesture still grants `activeTab`, so the script is injected into the current tab until it navigates. **Forget this site** removes the permission and the saved choice. The cost of opt-in is friction: a new site needs a click and a permission dialog, and the keyboard shortcut cannot ask for a permission, so on an unapproved site it only covers the current page.

## Coverage assessment

### Works

- `<textarea>`, `<input type="text">` and `<input type="search">`, including fields added after load (the manager's `MutationObserver`).
- React controlled inputs (`value` + `onChange`). The adapter dispatches a bubbling `input` event after each replacement, so React state follows the converted text, survives a re-render, and receives candidate choices. This was verified with React 19.3 in development mode. Other frameworks that listen to `input` (Vue `v-model`, Svelte `bind:value`, Angular forms) should behave the same but were **not tested**.
- Same-origin iframes (`allFrames: true`). A frame follows the **tab's** site choice through `location.ancestorOrigins`.

### Does not work

- **`contenteditable` and rich editors.** The adapter rejects anything that is not a textarea or text/search input. That excludes the composers in Gmail, Facebook and Messenger, WhatsApp Web, Slack, Notion, X, LinkedIn, Discord and most CMS editors. They are built on `contenteditable` with editor frameworks (Draft.js, Lexical, ProseMirror, Slate, Quill) that keep their own document model and fight outside DOM edits.
- **Google Docs** draws text on a canvas and takes input through a hidden, offscreen iframe. Nothing an extension can attach to looks like a text field. (Google's own Input Tools for Docs is built into Docs.)
- **Shadow DOM.** The manager's `root.querySelectorAll` and `MutationObserver` do not cross shadow roots, so inputs inside web components are never attached. Workarounds: walk open shadow roots and run one manager per root, or track `composedPath()[0]` on `focusin` and attach lazily. Neither reaches closed shadow roots without `chrome.dom.openOrClosedShadowRoot`.
- **Cross-origin iframes** (embedded comment widgets, payment frames, chat widgets). `allFrames` only injects where the extension has host access. Those frames need their own origin approved, and the popup only asks for the top site. `about:blank` and `srcdoc` frames would need `matchOriginAsFallback`, which this prototype does not set.
- **Pages that already run SahajLipi.** The adapter stops double attachment with a module-level `attachedFields` WeakSet. The extension's isolated world loads its own copy of the module, so it cannot see the page's WeakSet. Both adapters cancel the same `beforeinput` and both insert. Measured on a fixture page: typing `namaste` into a field the page had attached produced `ननअअममअअससततएए`. The prototype skips `[data-sahajlipi]` fields, which covers pages using the default `'marked'` scope. A page that attaches with `scope: 'all'` or by calling `attachNepaliInput` directly is not detected. A reliable fix belongs in the package (see recommendation).

### Known risks, not verified

- **Observer cost.** With the default exclude selector, the manager filters its `MutationObserver` to three attributes. A custom `excludeSelector` turns that filter off, so the extension observes every attribute change on the page. Each one can run `querySelectorAll` under the changed node. On pages that animate attributes constantly this could add measurable main-thread work. **Not measured.**
- **Alt+digit on macOS.** The adapter matches `event.key` against `1`–`9`. On macOS, Option+1 normally reports `¡`, so the shortcut hinted in the dropdown may not fire there. Synthetic Playwright key presses cannot show this. Needs a manual check on a Mac keyboard.
- **Site keyboard shortcuts and Alt+Shift+N.** Pages with their own Alt shortcuts may conflict. Chrome lets the user rebind the command.
- **Edge.** The manifest uses only APIs Edge shares with Chrome, but it was not loaded in Edge. Firefox would need `browser_specific_settings` and a different background declaration; Safari needs an Xcode wrapper. Neither was attempted.

## Privacy and store review

- **What the extension sees:** the content script sees every keystroke in text fields on sites the user enabled. It sends nothing anywhere. There is no network code, no analytics and no remote configuration. Storage holds only `site:<origin> → true/false` in `chrome.storage.local`, which is still a local list of sites the user writes Nepali on. Use `local`, not `sync`, unless the user opts in.
- **Chrome Web Store:** a listing needs a single-purpose description, a justification for each permission (`scripting`, `activeTab`, optional hosts), and a privacy policy. The data disclosure form asks about "website content" and "user activity" (keystrokes) even when nothing is transmitted. Answer it truthfully as handled locally and not collected. MV3 forbids remotely hosted code, which the bundled build satisfies. Avoiding `<all_urls>` at install keeps the extension out of the broad-host-permission review queue.
- **Edge Add-ons** has an equivalent review. Publishing needs a privacy policy URL and support contact under Ojas Technologies' name. Code signing and update channels are the store's.
- **Password fields** are never touched (the adapter rejects `type="password"`). Card and code fields are excluded only by the heuristic above.

## Recommendation

1. **Phase 1: ship a "plain text boxes" extension only if that audience is worth it.** This prototype is close. It still needs icons, a store listing, a privacy policy, a manual pass on real sites (government forms, news comment boxes, search boxes), the macOS Alt+digit check, and an observer cost measurement. Set expectations on the listing: no Gmail, Facebook, WhatsApp or Docs.
2. **Phase 2: small package changes that make any second host safe**, each its own PR with tests:
   - the adapter ignores `beforeinput` events that are already `defaultPrevented`, or marks attached fields (for example `data-sahajlipi-attached`), so two copies of SahajLipi never double-convert;
   - an option to keep the observer's attribute filter with a custom `excludeSelector`;
   - optional shadow-root traversal in the manager.
3. **Broad coverage: prefer an OS-level input method over a `contenteditable` adapter.**
   - A `contenteditable` adapter is not one adapter. Each editor framework (Lexical, ProseMirror, Draft.js, Slate, Quill, Google's closure editors) reconciles DOM changes differently. The robust technique is to synthesize `beforeinput`/`insertText` or drive `execCommand('insertText')` and let the editor update its own model. That breaks as sites ship editor updates, needs a per-site test matrix, and still cannot reach Google Docs, native apps, or the browser's address bar.
   - An OS input method (macOS Input Method Kit, Windows Text Services Framework, Linux IBus/Fcitx, Android/iOS keyboards) works in every text surface, including canvas editors, native apps and messengers. That is where people actually type Nepali, and Romanized Nepali IMEs already exist there. The engine is dependency-free JavaScript with deterministic rules, so it can be embedded in a small JS runtime or ported per platform. The cost is a separate product per OS with its own signing and distribution.
   - **Suggested path:** treat the extension as a cheap Phase 1 for web form users. Invest in an OS IME (starting with the platform the target users use most, likely Windows or Android) for broad coverage. Do not build a `contenteditable` adapter unless one specific high-value editor justifies it.

## Test log

Run: `npm run extension:check` ([`tools/check-extension.js`](../tools/check-extension.js)), 2026-10-26. Playwright 1.63.0, Chromium 153.0.8010.12 (Playwright's `chromium` channel, headless), macOS 27.0.1, Node 22.22.3. The unpacked extension was copied to a temp directory with `host_permissions` for `http://127.0.0.1:4181/*` added, standing in for an approved permission prompt. Fixtures are served from the repository by `python3 -m http.server`. Result: **31 passed, 0 failed.**

| Area | Check | Result |
| --- | --- | --- |
| Load | MV3 manifest loads; service worker starts; dynamic content script registers for the granted origin | Pass |
| Fields | textarea `namaste ` → `नमस्ते `; search `nepal ` → `नेपाल `; textarea added 50 ms after load converts | Pass |
| Exclusions | `data-sahajlipi-ignore` field, `type="email"`, `autocomplete="cc-number"`, `one-time-code`, `section-login username` all stay literal | Pass |
| Unsupported (expected) | `contenteditable` div and an input in an open shadow root stay literal | Pass (documents the gap) |
| Frames | same-origin iframe input converts; it follows the top site's off switch | Pass |
| Candidates | `ma` → `म`; dropdown 4 px under the field; clicking `मा` replaces the word, keeps focus, closes the list; Escape closes it | Pass |
| Re-injection | `executeScript` on a tab that already has the script does not attach twice | Pass |
| Toggle | popup's `set-site` message turns the site off (typing literal) and on; off survives a reload | Pass |
| Opt-in | `http://localhost:4181` (not granted) gets no script | Pass |
| Double conversion | field marked `data-sahajlipi` and attached by the page converts once (without the exclusion: `ननअअममअअससततएए`) | Pass |
| React | controlled input converts; state matches; survives re-render; candidate choice reaches state | Pass |
| `npm test` | unit suite unchanged | 389 / 389 pass |

**Not verified:**

- the real permission prompt and the decline → activeTab fallback (these need a human click);
- the popup UI on a real toolbar (it was only driven by the message it sends);
- the Alt+Shift+N command;
- headed Chrome or Edge stable;
- real third-party sites;
- macOS Option+digit candidate keys;
- observer performance on heavy pages;
- Firefox and Safari.
