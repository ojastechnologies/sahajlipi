# Chrome Web Store listing text

Text to paste into the [developer dashboard](https://chrome.google.com/webstore/devconsole). The dashboard's own wording takes priority if a field differs. The name, version and short description come from `manifest.json` and can't be edited there.

Before submitting, add to "Where it works" only the sites that passed the [manual pass](../docs/extension-release.md#manual-pass).

## Store listing tab

**Category:** Productivity, or the closest tools category offered.

**Language:** English.

**Description:**

```text
Type Nepali with your ordinary keyboard. Spell a word in Roman letters and SahajLipi replaces it with Unicode Devanagari as you type: "namaste" becomes "नमस्ते".

You stay in control of where it runs. It does nothing on a site until you turn it on from the toolbar button. Turn it on for one visit, or choose Remember this site to keep it on there.

WHAT IT DOES
• Converts as you type in text boxes, search boxes and most rich text boxes
• Shows a short list when a word has more than one common spelling
• Alt+Shift+N turns it on or off for the current site, and you can change the shortcut
• A built-in typing guide lists common spellings

WHERE IT WORKS
Most ordinary text boxes on desktop websites, and most rich text boxes. Websites build their editors differently, so some may not work. If it can't type in a box, it tells you.

It also works in Google Docs and Sheets. It does not work in other Google editors such as Slides, on Chrome's own pages, or in apps outside the browser.

PRIVACY
Everything happens on your device. SahajLipi reads what you type only to convert it. It has no network code and no analytics, and sends nothing anywhere. It only saves your per-site choices, in your browser. Password, email, number and telephone fields are skipped.

The source code is public: https://github.com/ojastechnologies/sahajlipi

This is an early release. Spellings may not always match what you expect, and a word you type may need correcting. Please report problems on GitHub.
```

**Store icon** (128 x 128): `store-assets/store-icon-128.png`, with 96 x 96 artwork and transparent padding.

**Global promo video:** leave blank.

**Screenshots** (1280 x 800 or 640 x 400, no alpha), in this order:

1. `store-assets/screenshot-1-typing.png`: a Devanagari sentence typed into a text box.
2. `store-assets/screenshot-2-spelling.png`: the spelling list open under a word.
3. `store-assets/screenshot-3-popup.png`: the toolbar popup, with typing on and the typing guide open.

**Small promo tile** (440 x 280, no alpha): `store-assets/promo-tile-440x280.png`.

**Marquee promo tile:** leave blank. It is optional.

**Official URL:** leave as None. It only offers sites verified with Google, and it is optional.

**Homepage URL:** `https://ojastechnologies.github.io/sahajlipi/`

**Support URL:** `https://github.com/ojastechnologies/sahajlipi/issues`

**Mature content:** off.

## Privacy tab

**Single purpose:**

```text
Lets people type Nepali in Devanagari by converting Roman letters as they type in text boxes on websites they turn it on for.
```

**activeTab justification:**

```text
When the user turns typing on from the toolbar button or shortcut, activeTab gives access to that tab only, so typing starts immediately without requesting access to any site.
```

**scripting justification:**

```text
Injects the extension's own bundled typing script into a page after the user turns it on, and registers that script for sites the user chooses to remember. No remote code is loaded.
```

**storage justification:**

```text
Saves the user's per-site choices locally: where typing is on or off, and where the "can't type here" notice was dismissed. No typed text is stored.
```

**Host permission justification,** if the form shows this field for `optional_host_permissions`:

```text
Site access is optional and requested for one site at a time, only when the user chooses Remember this site, so typing can start by itself on that site. The extension requests no site access at install.
```

**Are you using remote code?** Choose "No, I am not using remote code". The justification box only appears for "Yes". All code is in the package, and the extension makes no network requests.

**Data usage:** tick "User activity" and "Website content", and leave the other types unticked. The extension reads typed text only to convert it in the page and sends nothing anywhere, but Google's [user data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq) requires disclosure even when data is only processed or stored on the device. These disclosures must match the privacy policy.

**Certifications:** tick all three: no selling or transferring data to third parties outside the approved use cases, no use or transfer unrelated to the single purpose, and no use or transfer for creditworthiness or lending.

**Privacy policy URL:** `https://ojastechnologies.github.io/sahajlipi/docs/extension-privacy.html`

## Test instructions tab

```text
No account or login is needed.
1. Open any page with a text box, such as https://www.wikipedia.org/.
2. Click the SahajLipi toolbar button and switch Nepali typing on.
3. Click the search box and type: namaste
4. It becomes: नमस्ते
The demo page at https://ojastechnologies.github.io/sahajlipi/demo/ runs its own copy of SahajLipi, so test on another site.
```
