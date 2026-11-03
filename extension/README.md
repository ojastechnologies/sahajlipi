# SahajLipi browser extension (prototype)

A Chrome/Edge Manifest V3 extension that runs the published SahajLipi browser adapter in text boxes and rich text boxes on sites you turn it on for. It is a spike, not a release: read [the design note](../docs/extension-design.md) for what it covers and what it cannot.

## Build and load

```bash
npm ci
npm run extension:build
```

The build bundles `sahajlipi/dom` and the extension's content script into `extension/dist/content.js` (MV3 content scripts cannot be ES modules). Then open `chrome://extensions` (or `edge://extensions`), turn on **Developer mode**, choose **Load unpacked** and select this `extension/` folder.

## Use

- Click the toolbar button and switch **Nepali typing** on. The toolbar badge shows ने while it is on. It starts straight away in this tab, with no prompt, and lasts until the tab navigates.
- Click **Remember this site** to keep it across reloads. Chrome asks once for access to that site; declining leaves the current tab as it is.
- **Alt+Shift+N** toggles the current site and shows a brief confirmation on the page. Rebind it at `chrome://extensions/shortcuts`; the popup shows the current binding.
- Ambiguous words show a small list at the caret; click a choice or press **Alt+1**…**Alt+9** (**Option+1**…**Option+9** on macOS). **Escape** closes it.
- In rich text boxes, paste is not converted, undo belongs to the editor, and Google Docs is not supported.
- Typing in a box the extension can't reach, such as one inside a web component, shows a short notice once per page. **Don't show again** stops it on that site.
- **Typing guide** in the popup lists common spellings and links to the full typing reference and the demo.
- **Forget this site** in the popup removes the site's access and its saved choices.

## Check

```bash
npm run extension:check
```

Installs the test editors from `tools/extension-editors/`, loads the unpacked extension in Playwright's Chromium and runs the fixture pages in `fixtures/`. See the design note's test log for what that covers.

## Layout

| Path | Role |
| --- | --- |
| `manifest.json` | MV3 manifest: `activeTab`, `scripting`, `storage`; site access is optional and requested per origin. |
| `src/content.js` | Attaches `attachNepaliInputs(document, { scope: 'all' })` and follows the site's on/off choice. |
| `src/rich-text.js` | Runs the same adapter in `contenteditable` boxes, one line at a time, and replays results as typing. |
| `src/candidates.js` | Candidate list in a closed shadow root, placed at the caret. |
| `src/status-toast.js` | On-page confirmation for the keyboard shortcut. |
| `src/unsupported-notice.js` | Notice shown when typing in a box the adapter cannot attach to. |
| `src/background.js` | Registers the content script for granted sites, injects into the active tab, handles the shortcut. |
| `src/popup.*` | Toolbar popup. |
| `src/typing-guide.js` | Typing guide examples; `extension:check` verifies them against the engine. |
| `icons/` | Toolbar and store icons, rendered from `assets/brand/favicon.svg` (16, 32) and `mark.svg` (48, 128). |
| `fixtures/` | Local pages used by `npm run extension:check`. |
| `dist/` | Build output (not committed). |
