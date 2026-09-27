# Development and contribution workflow

This guide covers the repository workflow. For the reusable code, start with the [package documentation](package/README.md). For the hosted playground and local server commands, use the [demo guide](demo/README.md).

## Run the checks

Node.js 18 or later runs the Node tests and engine benchmark. The package has no runtime dependencies. Browser tests use a separate development toolchain with Node.js 20 or later, npm, Python 3, and Playwright browser installations.

```sh
npm test
npm run benchmark -- --check
```

The benchmark gates only named behavior contracts. Its exploratory proposals are reported separately and do not count as verified Nepali spellings or an accuracy score; see the [benchmark protocol](package/benchmarks.md).

For browser adapter changes, install the pinned development dependencies and desktop engines, then run the browser suite:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run test:browser
```

On Linux, use `npx playwright install --with-deps chromium firefox webkit`. The suite automatically starts an isolated Python server on port 4180. `npm run test:browser -- --project=chromium` runs one engine, and `npm run test:browser:report` opens the latest HTML report. The [browser compatibility guide](package/browser-compatibility.md) defines the coverage, report interpretation, and limits.

## Where changes belong

| Area | Files | Typical change |
| --- | --- | --- |
| Word readings | [`src/lexicon.js`](../src/lexicon.js) | Add a reviewed Roman spelling or reorder valid candidates. |
| General phonetics | [`src/phonetic.js`](../src/phonetic.js) | Change a rule that should apply to many words. |
| Engine API | [`src/index.js`](../src/index.js), [`src/index.d.ts`](../src/index.d.ts) | Change lookup, explicit marks, or a public type. |
| Reusable browser adapters | [`src/dom.js`](../src/dom.js), [`src/dom.d.ts`](../src/dom.d.ts) | Change field discovery, caret, composition, paste, candidates, or undo behavior. |
| Browser demo | [`demo/`](../demo/) | Change the playground UI or its on-page guide. |
| Node tests | [`test/`](../test/) | Lock down engine output or simulated adapter events. |
| Desktop browser tests | [`browser/`](../browser/), [`playwright.config.js`](../playwright.config.js) | Check browser keyboard flows and separately labeled injected paste/composition contracts. |
| Seed benchmark | [`benchmark/`](../benchmark/) | Track named contracts and clearly labeled exploratory cases. |

## Report a typing problem

Include the exact Roman keys, intended Unicode Nepali text, actual text, and whether the problem appears in `convertWord`, `convertText`, or the demo editor. For editor problems, include the caret position, selection, mode, and the action that triggered it (typing, paste, Backspace, undo, or composition). If a hidden joiner matters, paste the Unicode text rather than relying only on a screenshot.

Do not submit a bulk dictionary copied from another tool without its license, provenance, and a way to review its accuracy. See [CONTRIBUTING.md](../CONTRIBUTING.md) for a focused contribution path.

## Make a change

1. Describe one reproducible behavior and the expected Unicode output or UI state.
2. Add a focused regression test. For editor behavior, capture the event sequence and caret or suggestion state.
3. Change the smallest appropriate layer. Use a lexicon entry for a specific spelling; change phonetic rules only when broadly valid.
4. Run `npm test` and `npm run benchmark -- --check`. Run `npm run test:browser` when browser input or integration behavior changes. Try the [demo](demo/README.md) when a typing or UI interaction changes.
5. Update the [package docs](package/README.md) when an API or key behavior changes, or the [demo guide](demo/README.md) when the playground changes. Explain any changed benchmark case in the pull request.

Pull requests to `main` run the [Node CI workflow](../.github/workflows/ci.yml) on Node 18, 20, 22, and 24. Repository rules require those Node checks and resolved review threads before merge. A separate [browser workflow](../.github/workflows/browser.yml) runs three desktop engines on Ubuntu with Node 22 and uploads HTML/JSON reports and failure traces for 14 days. Check its results on the pull request head commit; workflow jobs do not become required merge checks automatically. GitHub Pages is configured to serve the root of `main`; that publishing source is a repository setting, not a Pages workflow file in this repository.

## Release status

The GitHub repository and demo are public, but there is **no npm release process yet**. [`package.json`](../package.json) has `"private": true`, so `npm publish` is blocked. Before an alpha release, maintainers need to review the public API and TypeScript declarations, package contents, supported runtimes, license and data provenance, evaluation evidence, versioning, and a release checklist.

## Privacy and trust boundaries

The package engine has no network or persistent-storage code. Each attached text field keeps up to 200 edit snapshots in memory for undo. The opt-in manager observes the supplied page region until it is destroyed. The [demo guide](demo/README.md) describes its Copy button and static hosting. These source-level observations do not cover browser extensions, hosting access logs, or applications embedding the package; see the [package architecture](package/architecture.md) for its data flow.
