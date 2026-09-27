# Browser demo

The [live SahajLipi demo](https://ojastechnologies.github.io/sahajlipi/demo/) lets you try the current Nepali typing experience in a browser. This page covers the demo interface and how to run it. The [package website](https://ojastechnologies.github.io/sahajlipi/) introduces the library and provides developer documentation. For the reusable conversion engine, browser adapter, API, and typing rules, start with the [package documentation](../package/README.md).

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

- **Type in the editor.** Roman letters turn into Nepali in the same textarea. Space commits the displayed word; Backspace can edit the active Roman spelling. The on-page **How to type** guide shows examples for vowels, half consonants, `cha`/`chha`, the two र्य/र्‍य forms, listed word shortcuts, English loanwords, full English month names, Shift sounds, marks, digits, punctuation, mixed text, and alternatives. The [package typing reference](../package/typing-reference.md) documents the complete rules and the scope of those word entries.
- **Choose a reading.** When the active spelling has multiple listed readings, a dropdown appears below the textarea. The first reading is displayed by default. Choose another from the dropdown or press `Alt` + a number from `1` through `9` while the word is active.
- **Switch mode.** The button shows **Nepali mode** when conversion is on and **English mode** when input is literal. It controls subsequent typing and paste in every marked field on this page: the main editor and the three form examples. Existing text stays as it is when you switch modes.
- **Try form fields.** The two marked text fields and marked search field below the editor use the same conversion setup. The mixed-text field lets you try Nepali beside a link or email address. The unmarked text and email fields stay in English. The alternatives dropdown and character count belong to the main editor; in the form fields, `Alt` + a number can select an available alternative.
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

### English month names

All 12 full English month names work automatically in Nepali mode, in the editor and all three marked form fields. Each has one preferred spelling, so no readings dropdown appears for these entries. The normal title-case forms also work, including `September` and `December`.

| English keys | Nepali spelling |
| --- | --- |
| `january` | जनवरी |
| `february` | फेब्रुअरी |
| `march` | मार्च |
| `april` | अप्रिल |
| `may` | मे |
| `june` | जुन |
| `july` | जुलाई |
| `august` | अगस्ट |
| `september` | सेप्टेम्बर |
| `october` | अक्टोबर |
| `november` | नोभेम्बर |
| `december` | डिसेम्बर |

Try `January February March` → **जनवरी फेब्रुअरी मार्च** or `September December` → **सेप्टेम्बर डिसेम्बर**. These source-assisted project spellings are documented with their evidence in the [month reference](../package/month-names.md); independent human linguistic review remains pending.

`May` and `may` both give **मे**. The engine cannot recognize English modal-verb uses of “may”; use English mode or an English field for them. Native Roman input such as `maya` keeps its existing behavior. The month entries match full words only: abbreviations such as `jan`, `feb` and `sep`, and attached forms such as `januaryma`, keep ordinary conversion. There is no general all-capital or mixed-case English matching; reserved Shift keys still select sounds. The feature spells month names and does not convert dates to the Bikram Sambat calendar.

### Numbers and decimals

In **Nepali mode**, number keys display Devanagari digits automatically: `0123456789` → **०१२३४५६७८९**. Try `3.14|` → **३.१४।** or `September 27, 2026` → **सेप्टेम्बर २७, २०२६**. The period remains a period; the converter changes digit characters without changing the number, year, or calendar. Typed and pasted numbers follow the same policy in every marked field.

Numbers within recognized links and emails keep their original characters: `name123@example.com` and `https://example.com:8080/a2?q=2026` stay as typed. Before an address cue appears, digits convert normally; uninterrupted typing restores the current token when the cue appears. **English mode** preserves ASCII digits from the first key and leaves earlier text unchanged. The unmarked English and email fields remain literal.

The demo uses the package default. Developers can choose ASCII digits for their own integration with the [engine's `digits: 'latin'` configuration](../package/api.md#digits-and-shared-field-configuration); there is no separate demo digit control.

### Nepali beside links and email

In **Nepali mode**, recognizable HTTP(S) links, `www.` addresses, ASCII domain-shaped hosts, and ordinary ASCII email addresses stay literal automatically. Original case, paths, query strings, and fragments stay intact. Try these by typing continuously or pasting them into the editor or mixed-text form field:

```text
namaste camera.com name+tag@example.com
→ नमस्ते camera.com name+tag@example.com

namaste https://Example.com/a|b?q=camera#may pani|
→ नमस्ते https://Example.com/a|b?q=camera#may पनि।
```

The converter switches the current token back to Roman text as soon as an early address cue appears: `http:`, `https:`, `www.`, an ordinary ASCII local part followed by `@`, or the first letter after a domain dot. It preserves `https:`, `www.`, `name@`, `name@example`, and `camera.c` before they are complete addresses. The same examples stay literal when pasted.

Before a cue, letters and digits still follow Nepali conversion: `camera` becomes `क्यामेरा` and `camera.` remains `क्यामेरा.` A trailing period alone is sentence punctuation. The current token can be restored while you type continuously; previously committed text cannot be reconstructed into Roman input. Switch to **English mode before the first key** if you want a fragment to stay literal from its beginning.

The policy checks a shape, not whether the address exists: `pani.paani` and its unfinished form `pani.p` also stay literal. It accepts unfinished addresses without validating them and has ASCII scope; internationalized addresses and arbitrary English, code, or filenames are outside the automatic handling. A pipe after a bare domain gives danda (`camera.com|` → `camera.com।`), but inside a URL suffix it stays literal (`camera.com/a|` stays as typed). Add a space before the pipe for sentence punctuation after a path: `camera.com/a |` → `camera.com/a ।`. The [package API guide](../package/api.md#links-domains-and-email-addresses) defines the full policy.

### Keep an English phrase literal

Switch to **English mode** before typing or pasting an English phrase, acronym, or code fragment; switch back to **Nepali mode** when ready to continue Nepali. The button controls all marked fields together, and it leaves existing text as it is. In English mode, digits and shortcut characters such as `^`, `~`, `/`, and `|` stay literal too. The unmarked English notes and email-only fields always preserve what you type.

## How the demo connects to the package

[`demo/index.html`](../../demo/index.html) defines the editor, controls, candidate dropdown, three marked form fields, and on-page guide. [`demo/style.css`](../../demo/style.css) styles them. [`demo/main.js`](../../demo/main.js) imports `attachNepaliInputs` from `src/dom.js` and calls it once for all fields marked `data-sahajlipi`. The manager supplies the main editor's controller for its candidate dropdown and clear control; its `setEnabled()` method switches Nepali typing for every marked field. Copy reads the main editor's value. The unmarked English text and email fields have no adapter. Editing and conversion behavior lives in the [package code](../package/README.md), so the demo exercises the same functions that developers can embed in their own apps.

## Brand assets

The demo header uses SahajLipi's vector [mark](../../assets/brand/mark.svg) beside the visible project name. Favicons and an Apple touch icon use the same mark; page metadata uses the shared [social preview](../../assets/brand/social-preview.png) when the demo is linked. The [brand guide](../brand.md) covers the logo variants, colors, and asset usage. The current demo supports Nepali typing.

## Published version and limits

The generated package website keeps the interactive demo at [`/demo/`](https://ojastechnologies.github.io/sahajlipi/demo/). Its Pages artifact includes the demo, engine modules, and brand assets. Demo changes appear after they merge to `main` and the website deployment finishes. The source-only local server remains available without a website build; the [website guide](../website-and-seo.md) explains the production build and publishing source. The separate [browser adapter compatibility guide](../package/browser-compatibility.md) records automated desktop-engine editing checks and selected demo flows, with reproducible commands and CI reports. Injected paste/composition contracts do not test a real clipboard or IME. Real mobile keyboards, assistive technology, installed Safari, and framework-controlled fields remain unverified. The demo is a prototype, and unknown words can produce an incorrect spelling. The [package documentation](../package/README.md) explains the API, current typing rules, architecture, and evaluation evidence.
