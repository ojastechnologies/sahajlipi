# Contributing to SahajLipi

SahajLipi is an early Nepali typing prototype. Small, reproducible improvements are welcome. Start with the [documentation index](docs/README.md), [package typing reference](docs/package/typing-reference.md), and [development guide](docs/development.md). The project is MIT-licensed; contributions should be suitable for inclusion under that license.

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

The Node test suite and engine benchmark require Node.js 18 or later:

```sh
npm test
npm run benchmark -- --check
```

For browser adapter or editing changes, use Node.js 20 or later, npm, and Python 3 to run the desktop-engine suite:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run test:browser
```

On Linux, use `npx playwright install --with-deps chromium firefox webkit`. The tests start their own server on port 4180. Use `npm run test:browser -- --project=chromium` for a focused engine run, and `npm run test:browser:report` to inspect the HTML report. The [browser compatibility guide](docs/package/browser-compatibility.md) explains coverage, versions, and CI artifacts. For a browser issue, include the browser version and operating system, and distinguish real keyboard/clipboard/IME input from injected events.

Try affected typing behavior in the [live demo](https://ojastechnologies.github.io/sahajlipi/demo/); the [demo guide](docs/demo/README.md) explains local access. The [seed benchmark](docs/package/benchmarks.md) tracks named contracts and separately marked exploratory cases; it is not a general accuracy score. Do not change an expected output solely to make a benchmark pass. Explain corrections and their linguistic evidence in the pull request.

Update the [package typing reference](docs/package/typing-reference.md) when key behavior changes; update the [demo guide](docs/demo/README.md) and on-page guide when the playground changes. Update the [API reference](docs/package/api.md) for exported behavior and the [package architecture](docs/package/architecture.md) for module boundaries or event flow. Pull requests to `main` run the Node checks on Node 18, 20, 22, and 24 and a separate Chromium/Firefox/WebKit workflow on Ubuntu with Node 22. Check results on the pull request head commit; the desktop suite does not establish mobile, operating system clipboard, assistive-technology, installed Safari, or framework-controlled input support.
