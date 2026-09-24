# Development and contribution workflow

This page describes the workflow that exists today. SahajLipi is an MIT-licensed prototype, and the npm package is still marked private. For the public API, see the [API reference](api.md); for current behavior, see the [typing reference](typing-reference.md).

## Run the project

- Node.js 18 or later runs the tests and benchmark. There are no runtime packages to install.
- Python 3 is needed only to serve the static demo locally.

```sh
npm test
npm run benchmark -- --check
npm run demo
```

Open `http://127.0.0.1:4173/demo/` after starting the demo server. The [published demo](https://ojastechnologies.github.io/sahajlipi/demo/) comes from `main`. To test from another device on the same network, run `npm run demo:lan -- YOUR_LAN_IP` after substituting your computer's private IPv4 address. Only one server can use port 4173 at a time.

## Where changes belong

| Area | Files | Typical change |
| --- | --- | --- |
| Word readings | [`src/lexicon.js`](../src/lexicon.js) | Add a reviewed Roman spelling or reorder valid candidates. |
| General phonetics | [`src/phonetic.js`](../src/phonetic.js) | Change a rule that should apply to many words. |
| Engine API and precedence | [`src/index.js`](../src/index.js), [`src/index.d.ts`](../src/index.d.ts) | Change lookup, explicit marks, or an exported type. |
| Textarea editing | [`src/dom.js`](../src/dom.js), [`src/dom.d.ts`](../src/dom.d.ts) | Change caret, composition, paste, candidates, or undo behavior. |
| Demo | [`demo/`](../demo/) | Explain or show the existing typing behavior. |
| Regression tests | [`test/engine.test.js`](../test/engine.test.js), [`demo/input-adapter.test.js`](../demo/input-adapter.test.js) | Lock down an observed output or key-event sequence. |
| Seed benchmark | [`benchmark/`](../benchmark/) | Track named behavior contracts and separately labeled exploratory cases. |

## Report a typing problem

Include the exact Roman keys, the intended Nepali text, the actual text, and whether the problem appeared in `convertWord`, `convertText`, or the live editor. For editor problems, include the caret position, selection, mode, and the action that triggered it (typing, paste, Backspace, undo, or mobile composition). A short example is more useful than a large word list.

Unicode shape matters. For a spelling such as `पर्‍यो`, include the text itself rather than only a screenshot. If a hidden joiner is involved, the code points can help:

```js
Array.from('पर्‍यो', ch => `U+${ch.codePointAt(0).toString(16).toUpperCase()}`);
```

Do not submit a bulk dictionary copied from another tool without its license, provenance, and a way to review its accuracy. See [CONTRIBUTING.md](../CONTRIBUTING.md) for the short word-contribution path and [benchmark guidance](benchmarks.md) for evaluation-case provenance.

## Make a change

1. Open an issue or describe one concrete behavior: Roman input, intended output, and any valid alternatives.
2. Add a focused regression test that fails for the reported case. For editor behavior, test the event sequence and caret or suggestion state.
3. Change the smallest appropriate layer. Use a lexicon entry for a specific spelling; change phonetic rules only when the rule is broadly valid.
4. Run `npm test` and `npm run benchmark -- --check`, then try the affected behavior in the demo.
5. Update the [typing reference](typing-reference.md), [API reference](api.md), or [architecture](architecture.md) when a documented contract changes. Explain any changed benchmark case in the pull request.

Pull requests to `main` run the [CI workflow](../.github/workflows/ci.yml) on Node 18, 20, 22, and 24. The repository rules require the four checks and resolved review threads before merge. GitHub Pages publishes the demo from the root of `main` after changes merge. The CI and Pages jobs establish that code runs and deploys; they are not a linguistic accuracy certification.

## Release status

The GitHub repository and demo are public, but there is **no npm release process yet**. [`package.json`](../package.json) has `"private": true`, so `npm publish` is blocked. Before a first alpha release, the maintainers need to review the public API and TypeScript declarations, package contents, supported runtimes, license and provenance of data, benchmark evidence, versioning, and a release checklist. Removing `private` alone would not complete those tasks.

## Privacy and trust boundaries

The current engine does not make network requests or persist typed text. The textarea adapter keeps up to 200 edit snapshots in memory for undo; the demo's Copy button writes to the clipboard only when clicked. GitHub Pages serves the static files; this statement does not cover browser extensions, hosting access logs, or applications that embed the library. The [architecture](architecture.md) lists the components and data flow so these claims can be checked against source.
