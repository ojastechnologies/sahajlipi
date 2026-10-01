# Browser adapter compatibility

This guide records how SahajLipi checks its reusable browser adapters in desktop browser engines. The adapter supports `<textarea>` and text/search inputs. The [API reference](api.md#browser-input-adapters) covers attachment, configuration, and cleanup; the separate [demo guide](../demo/README.md) describes the playground controls.

The engine's [Unicode behavior contracts](benchmarks.md) and language-review records measure different things. Browser tests check editing and integration behavior. They do not establish Nepali linguistic accuracy.

## Run locally

The core engine and Node test suite run on **Node.js 18 or later** with no runtime dependencies. The browser test tooling requires **Node.js 20 or later**, npm, and Python 3. Playwright is a development dependency pinned to `1.63.0`; the lockfile records the dependency versions.

From the repository root:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run test:browser
```

On Linux, install the browser system dependencies as well:

```sh
npx playwright install --with-deps chromium firefox webkit
```

`npm run test:browser` first builds the installed-package developer examples; a direct `npx playwright test` call requires `npm run examples:build` beforehand. The builder uses pinned React, TypeScript, and esbuild development dependencies without adding runtime dependencies to SahajLipi.

The test configuration starts an isolated Python HTTP server on `127.0.0.1:4180` and stops it when the run finishes. Keep that port available: the configuration refuses to reuse a server already on port 4180, so stop the conflicting server before retrying. It does not depend on an already running demo server or change the demo's local port.

Run one engine while developing a regression:

```sh
npm run test:browser -- --project=chromium
```

Use `--project=firefox` or `--project=webkit` for the other configured engines. The HTML report is written to `playwright-report/`; the JSON report is `test-results/browser-results.json`. Failure screenshots and traces are kept under `test-results/`. These generated outputs are ignored by Git. Open the latest local HTML report with:

```sh
npm run test:browser:report
```

Run the Node checks separately:

```sh
npm test
npm run benchmark -- --check
```

A browser test failure is an editing or integration regression to investigate; changing a linguistic benchmark's expected spelling does not resolve it.

## Test surfaces and scope

[`browser/typing.spec.js`](../../browser/typing.spec.js) exercises the adapters through a dedicated [`browser/fixtures/adapters.html`](../../browser/fixtures/adapters.html) page and the demo. The fixture is a test harness, not a package example or a public editor component. [`playwright.config.js`](../../playwright.config.js) specifies browser projects, the local server, and reporting.

The suite distinguishes normal keyboard actions from injected event contracts:

| Coverage | Evidence and boundary |
| --- | --- |
| Direct typing and word boundaries | Browser keyboard actions assert active half forms, the ra-ya joiner, Shift sounds, bindu/chandrabindu, displayed text, and caret behavior. |
| Digits and configuration | Keyboard actions check Devanagari defaults, unchanged decimal periods, numeric address-cue restoration, editing, Latin engine configuration, English mode and excluded fields; paste contracts use injected events. |
| Early address cues | Incremental keyboard input checks literal rendering after email, HTTP(S), `www.`, and domain cues. |
| Selection, Backspace, undo, and redo | Keyboard and selection actions check the adapter's edit state, including crossing an address cue. |
| Candidates and mode switches | Adapter and demo actions check selection of alternatives and continuation in Nepali or English mode. |
| Managed fields | The fixture checks marked, excluded, and dynamically added supported fields, plus controller cleanup. |
| Paste and completed composition | Injected clipboard/composition events check the adapter event contract. These events do not exercise the operating system clipboard or a real IME. |
| Native-input fallback | Injected `input` events without `beforeinput` check active-vowel and mixed-paste handling and host input-listener notifications. They do not establish mobile keyboard or framework-controlled field behavior. |

Use the test names and attached failure traces to identify exactly which flow failed. Assertions concern the selected software behavior; this is not a general browser support certification.

## Installed-package developer examples

[`browser/developer-examples.spec.js`](../../browser/developer-examples.spec.js) adds three consumer scenarios per engine:

- Vanilla: marked-field conversion, candidate choices, Nepali/English switching, and English exclusions.
- Vanilla: explicit teardown leaves subsequent text literal and removes its controls' behavior.
- React: uncontrolled textarea state callbacks, candidate selection, modes, and effect cleanup/remount under development StrictMode.

[`tools/build-examples.js`](../../tools/build-examples.js) packs and installs the actual tarball in a standalone temporary app, copies the example source there, type-checks the React files, and bundles public package imports. It checks esbuild's module inputs to require the installed package and reject checkout source bypasses. These generated fixtures are ignored by Git. React's pinned version is 19.3.0; this checks the named uncontrolled-field recipe only. Framework-controlled fields, SSR/hydration, physical mobile keyboards, and assistive technology remain unverified. See [integration recipes](integration-recipes.md) and [release compatibility scope](../release.md).

The separate [desktop-003 record](../../browser/reports/desktop-003.json) captures the later 51-check run (17 scenarios per engine), including the nine consumer checks. It records package and test source identities, installed-tarball checksum, environment, and outcomes. The 36- and 42-check records below remain historical and immutable; their totals describe their original runs.

## Loanword suffix follow-up — 2026-10-01

The [desktop-004 record](../../browser/reports/desktop-004.json) captures **57/57 passing checks**: 19 scenarios in each of Chromium, Firefox and WebKit. Two added scenarios per engine check reviewed attached suffixes, the school spelling dropdown, Roman-source Backspace editing, address-cue restoration and English mode. Runtime and test source hashes identify this run; earlier desktop records retain their original scopes and counts.

A selected spelling survives ordinary punctuation and whitespace. A domain cue makes the Roman token literal; deleting that cue resumes its default spelling. This behavior was also confirmed against the pre-suffix adapter. It does not preserve the earlier candidate choice across a technical-token transition.

## Native spelling follow-up — 2026-10-01

The [desktop-005 record](../../browser/reports/desktop-005.json) captures **60/60 passing checks**: 20 scenarios in each of Chromium, Firefox and WebKit. The added native-word scenario checks the four reviewed spellings, Roman-source Backspace editing, undo/redo and English mode. Installed-package JavaScript and TypeScript consumers passed for the `0.1.0-alpha.1` candidate; registry publication requires separate verification.

The record pins tested runtime, integration fixtures, package metadata and installed-tarball identity. The browser and adapter scope limits in this guide still apply. Earlier records retain their original tested sources and totals.

## Desktop engine matrix

| Playwright project | Browser under test | Status evidence |
| --- | --- | --- |
| `chromium` | Playwright's Chromium build | Inspect the recorded local run below or the matching GitHub Actions report. |
| `firefox` | Playwright's Firefox build | Inspect the recorded local run below or the matching GitHub Actions report. |
| `webkit` | Playwright's WebKit build | Inspect the recorded local run below or the matching GitHub Actions report. |

A passing result applies to the named engine build, platform, source revision, and tests in that run. Playwright WebKit is not the installed Safari application. Results from one operating system do not establish results on another, even for the same project name. A skipped case is not a pass.

### Recorded run — 2026-09-27

The committed [desktop-001 record](../../browser/reports/desktop-001.json) contains the dated test outcomes, individual test names, source hashes, environment, and limits. `npm run test:browser` began at **2026-09-27T12:06:12.781Z** on **macOS arm64** (`darwin`, OS release `25.6.0`) with **Node.js 22.22.3**, **Playwright 1.63.0**, headless browsers, two workers, and no retries:

| Project | Engine version | Passed | Failed | Skipped |
| --- | --- | --- | --- | --- |
| `chromium` | `153.0.8010.12` | 12/12 | 0 | 0 |
| `firefox` | `155.0` | 12/12 | 0 | 0 |
| `webkit` | `26.6` | 12/12 | 0 | 0 |
| **Total** | 12 scenarios × 3 projects | **36/36** | **0** | **0** |

The run recorded no flaky outcomes. These are automated desktop-engine results on this platform; Ubuntu CI results belong to their own workflow run. Keyboard actions come from Playwright. The three synthetic-event scenarios cover paste, composition, and the native-input fallback without establishing real clipboard or IME behavior.

The source identity is a modified working tree based on commit `995909554efa84691f5a481a0d27def58e308d2f`, identified by SHA-256 hashes of the production modules, demo, spec, fixture, Playwright configuration, package manifests, lockfile, and browser workflow. Production source and linguistic benchmark files were unchanged from that base. Separate checks of the same source passed 212 Node tests and 125 seed behavior contracts; two existing exploratory cases remain outside the benchmark gate.

A separate negative control removed address preservation in a throwaway copy: the intermediate-address keyboard test failed once as expected. This shows that the named regression test detects that removed behavior; it does not prove that every possible editing defect is detected. The working tree's production code was unchanged by that check.

### Verify the recorded source identity

The immutable merged commit `660d088ed60410feb0c6ad4c43d33214c24296f9` contains the files matching desktop-001. Archive it before reproducing this historical run so later engine, demo, or spec changes cannot silently replace the recorded source. The hash check below covers each recorded file:

```sh
BROWSER_RECORDED_DIR=$(mktemp -d)
git archive 660d088ed60410feb0c6ad4c43d33214c24296f9 | tar -x -C "$BROWSER_RECORDED_DIR"
cd "$BROWSER_RECORDED_DIR"
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const report = JSON.parse(readFileSync('browser/reports/desktop-001.json', 'utf8'));
const mismatches = [];
for (const [path, expected] of Object.entries(report.source.fileSha256)) {
  const actual = createHash('sha256').update(readFileSync(path)).digest('hex');
  if (actual !== expected) mismatches.push(path);
}
if (mismatches.length) throw new Error(`Recorded source differs: ${mismatches.join(', ')}`);
console.log('All recorded source hashes match.');
NODE
```

Then run the local setup commands above from that archived directory and compare project counts, engine versions, and platform with the record. Return to your working checkout afterward. Browser binaries are chosen by the pinned Playwright version and platform. A later source change or a different environment needs its own dated result; do not overwrite this record to match a new outcome.

The full raw JSON/HTML outputs are generated files, not committed records. The compact record preserves their recorded JSON hash and relevant outcomes, while local report files can be replaced by the next test run. GitHub Actions report artifacts have the retention period described below.

## Digit follow-up — 2026-09-27

The separate [desktop-002 record](../../browser/reports/desktop-002.json) measures the digit-default change and retains desktop-001 unchanged. `npm run test:browser` began at **2026-09-27T13:55:31.892Z** on macOS arm64 (`darwin`, OS release `25.6.0`) with Node.js **22.22.3**, Playwright **1.63.0**, headless browsers, two workers, and no retries:

| Project | Engine version | Passed | Failed | Skipped |
| --- | --- | --- | --- | --- |
| `chromium` | `153.0.8010.12` | 14/14 | 0 | 0 |
| `firefox` | `155.0` | 14/14 | 0 | 0 |
| `webkit` | `26.6` | 14/14 | 0 | 0 |
| **Total** | 14 scenarios × 3 projects | **42/42** | **0** | **0** |

There were no flaky outcomes. Two appended scenarios cover digit typing/editing, periods in decimals, restoration of numeric address prefixes, the configured Latin engine, English mode, excluded fields, and injected paste. Existing decimal assertions now use the explicitly chosen Devanagari default; these counts are selected editing regressions under that policy, not an accuracy comparison on unchanged linguistic labels. The [digit benchmark record](digits-benchmarks.md) separately discloses seven revised numeric expectations and historical Latin compatibility.

The source is a modified working tree based on `660d088ed60410feb0c6ad4c43d33214c24296f9`, pinned by source, demo, spec, fixture, configuration, dependency, and workflow hashes. The production changes are `src/index.js` and its type declarations; the DOM adapter, lexicon, phonetic rules, and address scanner are unchanged. Separate checks passed **227/227** Node tests and **133/133** revised seed contracts. The explicit Latin engine also retains **125/125** historical contracts. The desktop and seed records measure separate test surfaces.

A negative control removed digit conversion in a throwaway copy; the named numeric-keyboard test failed once in Chromium as expected. The working source was unchanged. This demonstrates detection of that removed behavior only.

### Verify the digit-run source identity

Use a checkout or archive matching desktop-002, then verify its hashes before reproducing the browser run. A later source or test change needs a separate dated record. From that matching source directory:

```sh
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const report = JSON.parse(readFileSync('browser/reports/desktop-002.json', 'utf8'));
for (const [path, expected] of Object.entries(report.source.fileSha256)) {
  const actual = createHash('sha256').update(readFileSync(path)).digest('hex');
  if (actual !== expected) throw new Error('Recorded source differs: ' + path);
}
console.log('All desktop-002 source hashes match.');
NODE
```

Run the local setup commands at the beginning of this guide from that directory. Compare the resulting individual outcomes, project counts, engine versions, and platform against desktop-002. The original 36-check run remains reproducible through its immutable archive commands above. Both records have the same desktop-engine and injected-event limits; neither establishes OS clipboard, real IME, mobile device, installed Safari, assistive technology, or framework-controlled input support.

## GitHub Actions and reports

The dedicated [browser workflow](../../.github/workflows/browser.yml) runs Chromium, Firefox, and WebKit as separate Ubuntu jobs using Node.js 22. It runs on pull requests and pushes to `main`; each job installs its own browser and Linux dependencies. The existing [Node workflow](../../.github/workflows/ci.yml) keeps the engine and seed-contract checks on Node.js 18, 20, 22, and 24.

Open the workflow run associated with the pull request's exact head commit. Inspect each engine job's test summary; download `browser-results-chromium`, `browser-results-firefox`, or `browser-results-webkit` from the run's **Artifacts** section. Each artifact includes that job's HTML/JSON reports and collected failure traces/screenshots. Uploaded artifacts are retained for **14 days**. CI artifacts are operational evidence with limited retention, not immutable linguistic benchmark records. A permanently documented run must record its source identity and environment separately.

The JSON report is useful for inspecting pass, failure, skip, retry, and duration data. The HTML report shows the tested flows and any collected traces. Browser timings are test diagnostics, not a throughput or transliteration performance benchmark. Automatic retries are disabled so a failing input flow cannot be hidden by an eventually passing retry.

An old green `main` badge does not establish that a new pull request passes. Verify the checks on the intended source commit before merging. The browser workflow defines its checks; repository protection settings determine which checks block a merge.

## Not established by these tests

- Real phone keyboards, Android or iOS devices, or mobile IME behavior.
- Native operating system clipboard permissions and clipboard integration.
- Real composition input from an installed IME; only the injected event contract is automated here.
- Screen readers, other assistive technology, or accessibility conformance.
- Installed Chrome, Firefox, or Safari application support on every operating system.
- Framework-controlled field integration, such as React state reconciliation.
- `contenteditable`, rich-text editors, or input types outside text/search and textarea.

For a browser issue, report the browser/application version, operating system, input surface, exact key or event sequence, expected and actual Unicode text, caret/selection, mode, and whether the reproduction uses a real keyboard, real clipboard, or injected events. Include a minimal reproduction when possible. The [contribution guide](../../CONTRIBUTING.md) explains how to add a focused regression.
