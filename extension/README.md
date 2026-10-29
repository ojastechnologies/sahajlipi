# SahajLipi browser extension (prototype)

A Chrome/Edge Manifest V3 extension that runs the published SahajLipi browser adapter in ordinary text boxes on sites you turn it on for. It is a spike, not a release: read [the design note](../docs/extension-design.md) for what it covers and what it cannot.

## Build and load

```bash
npm ci
npm run extension:build
```

The build bundles `sahajlipi/dom` and the extension's content script into `extension/dist/content.js` (MV3 content scripts cannot be ES modules). Then open `chrome://extensions` (or `edge://extensions`), turn on **Developer mode**, choose **Load unpacked** and select this `extension/` folder.

## Use

- Click the toolbar button on a site and switch **Nepali typing on this site** on. Chrome asks once for access to that site; allowing it remembers the site, and declining still turns typing on for the current tab until it navigates.
- **Alt+Shift+N** toggles the current site. Rebind it at `chrome://extensions/shortcuts`.
- Ambiguous words show a small list under the field; click a choice or press **Alt+1**…**Alt+9**. **Escape** closes it.
- **Forget this site** in the popup removes the site's access and its saved choice.

## Check

```bash
npm run extension:check
```

Loads the unpacked extension in Playwright's Chromium and runs the fixture pages in `fixtures/`. See the design note's test log for what that covers.

## Layout

| Path | Role |
| --- | --- |
| `manifest.json` | MV3 manifest: `activeTab`, `scripting`, `storage`; site access is optional and requested per origin. |
| `src/content.js` | Attaches `attachNepaliInputs(document, { scope: 'all' })` and follows the site's on/off choice. |
| `src/candidates.js` | Candidate list in a closed shadow root next to the focused field. |
| `src/background.js` | Registers the content script for granted sites, injects into the active tab, handles the shortcut. |
| `src/popup.*` | Toolbar popup. |
| `fixtures/` | Local pages used by `npm run extension:check`. |
| `dist/` | Build output (not committed). |
