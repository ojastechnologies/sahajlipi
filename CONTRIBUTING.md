# Contributing to SahajLipi

SahajLipi is an early Nepali typing prototype. Small, reproducible improvements are welcome. Start with the [documentation index](docs/README.md), [typing reference](docs/typing-reference.md), and [development guide](docs/development.md). The project is MIT-licensed; contributions should be suitable for inclusion under that license.

## Report a word or typing problem

Give the exact Roman keys, intended Unicode Nepali text, actual result, and where it occurred: `convertWord`, `convertText`, or the live editor. For editor issues, add the caret position and the action (typing, paste, Backspace, composition, candidate selection, or undo). If a zero width joiner or a visible half form matters, paste the Unicode text rather than relying on a screenshot.

A useful word contribution includes:

1. The Roman spelling people actually type and one or more valid Nepali readings.
2. The preferred reading first, with a reason for that order when ambiguity matters.
3. The source of the example and, for uncertain spellings, a Nepali-language review.
4. A test that would fail without the change.

Use [`src/lexicon.js`](src/lexicon.js) for a specific spelling. Change [`src/phonetic.js`](src/phonetic.js) only when a rule applies broadly; explain what other words it changes. For input behavior, describe the full key or event sequence and expected text, caret position, and suggestion state.

Please do not submit bulk word lists without a clear license, provenance, and review method. Small, checkable examples are more useful at this stage.

## Verify a change

```sh
npm test
npm run benchmark -- --check
```

Try affected behavior in the [live demo](https://ojastechnologies.github.io/sahajlipi/demo/) or a local demo (`npm run demo`). The [seed benchmark](docs/benchmarks.md) tracks named contracts and separately marked exploratory cases; it is not a general accuracy score. Do not change an expected output solely to make a benchmark pass. Explain corrections and their linguistic evidence in the pull request.

Update the [typing reference](docs/typing-reference.md) and the demo guide when keys change, the [API reference](docs/api.md) when exports or controller behavior change, and the [architecture](docs/architecture.md) when module boundaries or event flow change. Pull requests to `main` run CI on Node 18, 20, 22, and 24.
