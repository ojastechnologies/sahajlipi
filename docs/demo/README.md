# Browser demo

The [live SahajLipi demo](https://ojastechnologies.github.io/sahajlipi/demo/) lets you try the current Nepali typing experience in a browser. This page covers the demo interface and how to run it. For the reusable conversion engine, textarea adapter, API, and typing rules, start with the [package documentation](../package/README.md).

## Run it locally

From the repository root, with Node.js/npm and Python 3 available:

```sh
npm run demo
```

Open <http://127.0.0.1:4173/demo/>. The command serves the repository root, which lets `demo/main.js` import the engine and textarea adapter from `src/`. There is no build step or dependency installation for the demo.

To try the demo on another device on the same local network, bind the server to your computer's current private IPv4 address:

```sh
npm run demo:lan -- YOUR_LAN_IP
```

Replace `YOUR_LAN_IP` with that address, then open `http://YOUR_LAN_IP:4173/demo/` on the other device. The devices must be able to reach each other on the local network. Stop an existing server on port 4173 before starting another one.

## Use the page

- **Type in the editor.** Roman letters turn into Nepali in the same textarea. Space commits the displayed word; Backspace can edit the active Roman spelling. The on-page **How to type** guide shows examples for vowels, half consonants, Shift sounds, marks, punctuation, and alternatives.
- **Choose a reading.** When the active spelling has multiple listed readings, a dropdown appears below the textarea. The first reading is displayed by default. Choose another from the dropdown or press `Alt` + a number from `1` through `9` while the word is active.
- **Switch mode.** **Nepali on/off** controls conversion of subsequent typing and paste. Existing text stays as it is when you switch modes.
- **Copy or clear.** **Copy** writes the current textarea value to the clipboard when the browser permits it. If clipboard access fails, the page selects the text for manual copying. **Clear** empties the editor. The character count updates with the displayed text.

The editor keeps text and its undo snapshots in browser memory while the page is open. The demo does not provide accounts or cloud storage. Its core and adapter do not make network requests to convert text; the browser still requests the static page files from the hosting server.

## How the demo connects to the package

[`demo/index.html`](../../demo/index.html) defines the editor, controls, candidate dropdown, and on-page guide. [`demo/style.css`](../../demo/style.css) styles them. [`demo/main.js`](../../demo/main.js) imports `convertWord`, `convertText`, and `attachNepaliInput` from `src/`, attaches the adapter to the textarea, and renders mode, count, and candidate state. It handles dropdown selection plus the mode, copy, and clear buttons. The editing and conversion behavior lives in the [package code](../package/README.md), so the demo exercises the same functions that developers can embed in their own apps.

## Published version and limits

GitHub Pages serves the files from the root of the `main` branch at [`/demo/`](https://ojastechnologies.github.io/sahajlipi/demo/). Changes appear in the published demo after they merge to `main` and Pages finishes publishing. The automated tests cover engine and simulated textarea behavior, but there is not yet a tested browser and device compatibility matrix. The demo is a prototype, and unknown words can produce an incorrect spelling. The [package documentation](../package/README.md) explains the API, current typing rules, architecture, and evaluation evidence.
