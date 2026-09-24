# Contributing to SahajLipi

This is an early prototype. Small, verifiable improvements to Nepali typing are welcome.

## A useful word contribution

1. Describe the Roman spelling people actually type and the expected Unicode Nepali word.
2. Add the spelling to `src/lexicon.js`. If the Roman spelling has two valid readings, put the preferred output first and the other reading second.
3. Add an example to `test/engine.test.js` that would fail without your change.
4. Run `npm test` and try the word in the browser demo.

Please avoid bulk word lists without a clear license and a way to check their accuracy. A small set of real typing examples is more useful at this stage.

For input behavior changes, describe the exact key sequence and expected text, caret position, and suggestion state. The project aims to keep ordinary typing uninterrupted and show alternatives only when they help.
