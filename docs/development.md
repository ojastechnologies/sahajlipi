# Development and contribution workflow

This guide covers the repository workflow. For the reusable code, start with the [package documentation](package/README.md). For the hosted playground and local server commands, use the [demo guide](demo/README.md).

## Run the checks

Node.js 18 or later runs the tests and engine benchmark. There are no runtime packages to install.

```sh
npm test
npm run benchmark -- --check
```

The benchmark gates only named behavior contracts. Its exploratory proposals are reported separately and do not count as verified Nepali spellings or an accuracy score; see the [benchmark protocol](package/benchmarks.md).

## Where changes belong

| Area | Files | Typical change |
| --- | --- | --- |
| Word readings | [`src/lexicon.js`](../src/lexicon.js) | Add a reviewed Roman spelling or reorder valid candidates. |
| General phonetics | [`src/phonetic.js`](../src/phonetic.js) | Change a rule that should apply to many words. |
| Engine API | [`src/index.js`](../src/index.js), [`src/index.d.ts`](../src/index.d.ts) | Change lookup, explicit marks, or a public type. |
| Reusable textarea adapter | [`src/dom.js`](../src/dom.js), [`src/dom.d.ts`](../src/dom.d.ts) | Change caret, composition, paste, candidates, or undo behavior. |
| Browser demo | [`demo/`](../demo/) | Change the playground UI or its on-page guide. |
| Package tests | [`test/`](../test/) | Lock down engine output or adapter events. |
| Seed benchmark | [`benchmark/`](../benchmark/) | Track named contracts and clearly labeled exploratory cases. |

## Report a typing problem

Include the exact Roman keys, intended Unicode Nepali text, actual text, and whether the problem appears in `convertWord`, `convertText`, or the demo editor. For editor problems, include the caret position, selection, mode, and the action that triggered it (typing, paste, Backspace, undo, or composition). If a hidden joiner matters, paste the Unicode text rather than relying only on a screenshot.

Do not submit a bulk dictionary copied from another tool without its license, provenance, and a way to review its accuracy. See [CONTRIBUTING.md](../CONTRIBUTING.md) for a focused contribution path.

## Make a change

1. Describe one reproducible behavior and the expected Unicode output or UI state.
2. Add a focused regression test. For editor behavior, capture the event sequence and caret or suggestion state.
3. Change the smallest appropriate layer. Use a lexicon entry for a specific spelling; change phonetic rules only when broadly valid.
4. Run `npm test` and `npm run benchmark -- --check`. Try the [demo](demo/README.md) when a typing or UI interaction changes.
5. Update the [package docs](package/README.md) when an API or key behavior changes, or the [demo guide](demo/README.md) when the playground changes. Explain any changed benchmark case in the pull request.

Pull requests to `main` run the [CI workflow](../.github/workflows/ci.yml) on Node 18, 20, 22, and 24. Repository rules require those checks and resolved review threads before merge. GitHub Pages is configured to serve the root of `main`; that publishing source is a repository setting, not a Pages workflow file in this repository.

## Release status

The GitHub repository and demo are public, but there is **no npm release process yet**. [`package.json`](../package.json) has `"private": true`, so `npm publish` is blocked. Before an alpha release, maintainers need to review the public API and TypeScript declarations, package contents, supported runtimes, license and data provenance, evaluation evidence, versioning, and a release checklist.

## Privacy and trust boundaries

The package engine has no network or persistent-storage code. The textarea adapter keeps up to 200 edit snapshots in memory for undo. The [demo guide](demo/README.md) describes its Copy button and static hosting. These source-level observations do not cover browser extensions, hosting access logs, or applications embedding the package; see the [package architecture](package/architecture.md) for its data flow.
