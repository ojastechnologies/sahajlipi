# Extension changelog

Store releases of the browser extension. The npm package has [its own changelog](../CHANGELOG.md). A release needs a section here headed `## <manifest version>`, and that section becomes its release notes. See the [release process](../docs/extension-release.md).

## 0.1.0

First store release, for desktop Chrome.

- Converts Roman Nepali to Unicode Devanagari as you type, in text boxes and most rich text boxes, on sites you turn it on for.
- Turn it on for one visit from the toolbar button, or choose **Remember this site** to keep it on. Site access is requested per site, and **Forget this site** removes it.
- **Alt+Shift+N** turns typing on or off for the current site.
- Words with more than one common spelling show a short list at the caret.
- A notice appears when typing in a box the extension can't reach, and the popup includes a typing guide.
- Not supported: Google Docs, phones and browsers other than desktop Chrome.

The extension sends nothing anywhere. See the [privacy policy](../docs/extension-privacy.md).
