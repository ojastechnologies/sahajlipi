# SahajLipi browser extension privacy policy

Effective from the extension's first store release. This policy covers the SahajLipi Nepali Typing browser extension, published by Ojas Technologies. The extension converts Roman Nepali into Devanagari as you type, on your own device.

**In short: the extension does not collect, send, sell or share your data.** It has no network code, no analytics and no remote configuration, and Ojas Technologies receives nothing from it.

## What the extension reads

On a site where you turn it on, the extension reads what you type in the text boxes and rich text boxes it supports. It needs this to replace each Roman word with Devanagari.

That text is processed in your browser and goes nowhere else. It stays in the page you are typing in, and whatever happens to it next is up to that website. For example, a site may save or send what you write, as it would without the extension.

While you type, the extension keeps recent edits in memory so that undo and Backspace work. They are discarded when the page closes or reloads, and never saved to disk.

The extension does not run on a site until you turn it on there. Password, email, number and telephone fields are skipped. Text fields that identify themselves as card numbers, one-time codes, usernames and similar values are skipped too, but this relies on how the website labels the field, so a field without those labels may still be converted.

## What the extension stores

The extension saves only these settings, in your browser's local extension storage:

- the sites where you turned Nepali typing on or off;
- the sites where you chose **Don't show again** on the "can't type here" notice.

These settings are not synced by the extension and never leave your device. They do list sites where you write Nepali, so anyone with access to your browser profile could read them.

## Permissions

| Permission | Why it is needed |
| --- | --- |
| `activeTab` | Turns typing on in the current tab when you ask, without access to other tabs. |
| `scripting` | Adds the typing code to a page after you turn it on. |
| `storage` | Saves the settings listed above. |
| Site access, optional | Requested for one site at a time when you choose **Remember this site**, so typing starts by itself on that site. You can decline. |

## Your choices

- Turn typing off for a site from the toolbar popup.
- Choose **Forget this site** in the popup to remove its access and saved settings.
- Uninstall the extension to remove all of its settings.

## Links and third parties

The popup links to the SahajLipi typing reference and demo. They open only when you click them, on a website hosted on GitHub Pages, whose host can see ordinary access details such as your IP address.

The extension is distributed through browser stores. The store's own terms and privacy policy cover your use of the store, such as installing and updating.

## Changes and contact

Any change to this policy will be published on this page, and its history is kept in the [public repository](https://github.com/ojastechnologies/sahajlipi/commits/main/docs/extension-privacy.md). The extension's source code is [public too](https://github.com/ojastechnologies/sahajlipi/tree/main/extension).

For questions, open an [issue on the repository](https://github.com/ojastechnologies/sahajlipi/issues). Report security problems through its [security advisories page](https://github.com/ojastechnologies/sahajlipi/security/advisories).
