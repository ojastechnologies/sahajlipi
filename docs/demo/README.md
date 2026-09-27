# Browser demo

The [live SahajLipi demo](https://ojastechnologies.github.io/sahajlipi/demo/) lets you try the current Nepali typing experience in a browser. This page covers the demo interface and how to run it. For the reusable conversion engine, browser adapter, API, and typing rules, start with the [package documentation](../package/README.md).

## Run it locally

From the repository root, with Node.js/npm and Python 3 available:

```sh
npm run demo
```

Open <http://127.0.0.1:4173/demo/>. The command serves the repository root, which lets `demo/main.js` import the browser adapter from `src/`. There is no build step or dependency installation for the demo.

To try the demo on another device on the same local network, bind the server to your computer's current private IPv4 address:

```sh
npm run demo:lan -- YOUR_LAN_IP
```

Replace `YOUR_LAN_IP` with that address, then open `http://YOUR_LAN_IP:4173/demo/` on the other device. The devices must be able to reach each other on the local network. Stop an existing server on port 4173 before starting another one.

## Use the page

- **Type in the editor.** Roman letters turn into Nepali in the same textarea. Space commits the displayed word; Backspace can edit the active Roman spelling. The on-page **How to type** guide shows examples for vowels, half consonants, `cha`/`chha`, the two र्य/र्‍य forms, listed word shortcuts, English loanwords, Shift sounds, marks, punctuation, and alternatives. The [package typing reference](../package/typing-reference.md) documents the complete rules and the scope of those word entries.
- **Choose a reading.** When the active spelling has multiple listed readings, a dropdown appears below the textarea. The first reading is displayed by default. Choose another from the dropdown or press `Alt` + a number from `1` through `9` while the word is active.
- **Switch mode.** **Nepali on/off** controls conversion of subsequent typing and paste in every marked field on this page: the main editor and the two form examples. Existing text stays as it is when you switch modes.
- **Try form fields.** The text and search examples below the editor use the same conversion setup. The unmarked text and email fields stay in English. The alternatives dropdown and character count belong to the main editor; in the form fields, `Alt` + a number can select an available alternative.
- **Copy or clear.** **Copy** writes the main editor value to the clipboard when the browser permits it. If clipboard access fails, the page selects the text for manual copying. **Clear** empties the main editor. The character count updates with its displayed text.

The fields keep text and their undo snapshots in browser memory while the page is open. The demo does not provide accounts or cloud storage. Its core and adapter do not make network requests to convert text; the browser still requests the static page files from the hosting server.

## Words and sounds to try

### च and छ

`cha` displays **च** first and offers **छ** in the readings dropdown. Use `chha` for **छ** directly. Without a vowel, `ch` stays **च्** and `chh` stays **छ्**. Listed complete words can keep their own spelling: `huncha` still gives **हुन्छ**. The other consonants, vowel lengths, and Shift sound keys keep their existing behavior.

### English loanwords

The checkout's default engine includes these 20 exact English keys. They work automatically in the editor and marked text/search fields while Nepali mode is on; the demo needs no separate loanword setting. Each pilot entry has one preferred project spelling, so these keys do not open the readings dropdown. Additional spellings remain pending review.

| English keys | Nepali spelling |
| --- | --- |
| `camera` | क्यामेरा |
| `computer` | कम्प्युटर |
| `mobile` | मोबाइल |
| `phone` | फोन |
| `charger` | चार्जर |
| `printer` | प्रिन्टर |
| `mouse` | माउस |
| `internet` | इन्टरनेट |
| `email` | इमेल |
| `software` | सफ्टवेयर |
| `scanner` | स्क्यानर |
| `video` | भिडियो |
| `taxi` | ट्याक्सी |
| `bank` | बैंक |
| `cheque` | चेक |
| `file` | फाइल |
| `school` | स्कुल |
| `college` | कलेज |
| `doctor` | डाक्टर |
| `nurse` | नर्स |

Try `camera computer mobile phone` to get **क्यामेरा कम्प्युटर मोबाइल फोन**, or `school college doctor nurse` to get **स्कुल कलेज डाक्टर नर्स**. These entries spell English loanwords in Nepali; they do not translate English sentences or choose a word's meaning.

The entry matches only the complete key. Appending letters or a suffix, as in `cameraa`, `camerako`, or `mobilema`, recomputes the active word using ordinary phonetic conversion. Attached Nepali forms are not part of this pilot. Space keeps the currently displayed spelling and starts a new word; Backspace can return a longer active spelling to a listed key.

Use the lowercase spellings in the table. Incidental capitals such as `Camera` and `Computer` match too, but `T`, `D`, `S`, `R`, and contextual `H` still select sounds. `Doctor`, `School`, `CAMERA`, and `COMPUTER` do not automatically match the lowercase loanword entries. Existing explicit name aliases, such as `Ram` and `Sita`, keep their listed readings.

### Keep English text literal

Use **Nepali off** or the unmarked English notes field for text that must stay literal. The demo's unmarked email field also preserves what you type. URLs, email addresses, code, acronyms, and arbitrary English spans are not automatically protected inside a Nepali-enabled field; a string such as `camera.com` can still be converted. Switching modes affects subsequent typing and paste without rewriting existing text.

## How the demo connects to the package

[`demo/index.html`](../../demo/index.html) defines the editor, controls, candidate dropdown, marked form fields, and on-page guide. [`demo/style.css`](../../demo/style.css) styles them. [`demo/main.js`](../../demo/main.js) imports `attachNepaliInputs` from `src/dom.js` and calls it once for all fields marked `data-sahajlipi`. The manager supplies the main editor's controller for its candidate dropdown and clear control; its `setEnabled()` method switches Nepali typing for every marked field. Copy reads the main editor's value. The unmarked English text and email fields have no adapter. Editing and conversion behavior lives in the [package code](../package/README.md), so the demo exercises the same functions that developers can embed in their own apps.

## Published version and limits

GitHub Pages serves the files from the root of the `main` branch at [`/demo/`](https://ojastechnologies.github.io/sahajlipi/demo/). Changes appear in the published demo after they merge to `main` and Pages finishes publishing. The automated tests cover engine and simulated field behavior, but there is not yet a tested browser and device compatibility matrix. The demo is a prototype, and unknown words can produce an incorrect spelling. The [package documentation](../package/README.md) explains the API, current typing rules, architecture, and evaluation evidence.
