# SahajLipi

[![CI](https://github.com/ojastechnologies/sahajlipi/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ojastechnologies/sahajlipi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

SahajLipi is an MIT-licensed Roman Nepali → Unicode typing prototype for web developers. This repository contains a **reusable package** and a **separate browser demo**. Only Nepali is implemented today; other Devanagari languages are a future goal.

[Live demo](https://ojastechnologies.github.io/sahajlipi/demo/) · [Documentation](docs/README.md) · [Evaluation](#evaluation-status) · [Contributing](CONTRIBUTING.md)

## Evaluation status

The CI badge shows the current `main` branch status. CI runs automated tests and the seed contract benchmark on pull requests and pushes to `main`, across Node.js 18, 20, 22, and 24. The table below contains **dated baselines**, with methods and provenance linked from each row.

| Evaluation | Recorded result | Run date | Interpretation |
| --- | --- | --- | --- |
| [Seed behavior contracts](docs/package/benchmarks.md#initial-seed-baseline) | 28/28 full contract cases | 2026-09-24 | Regression coverage for selected project behaviors. Two unreviewed exploratory cases are excluded from the gate. |
| [External word baseline](docs/package/external-evaluation.md#initial-baseline) | 279/4,101 default matches; 279/4,101 references in candidates (6.80% each) | 2026-09-24 | Exact Unicode agreement with the pinned Aksharantar word test. |
| [Development review batch](docs/package/review-batch-baseline.md) | Default matches: 7/80 words, 0/20 sentences; 7/80 word proposals in candidates | 2026-09-26 | 100 unreviewed development source proposals; no accepted labels yet. |

These results do not establish population-wide Nepali typing accuracy. The external word set uses lowercase Roman inputs and does not exercise Shift shortcuts. The development batch needs independent Nepali-language review before its proposals can guide engine fixes. Full reports record source revisions, engine commits, exclusions, and review status; the [review guide](docs/package/review-batch.md) explains how to contribute language review.

## Use the package

The core engine converts words and text without a browser. For live typing, mark the fields that should accept Roman Nepali, then initialize the browser adapter once:

```html
<textarea data-sahajlipi></textarea>
<input type="text" data-sahajlipi>
<input type="search" data-sahajlipi>

<script type="module">
  import { attachNepaliInputs } from './src/dom.js';

  const nepali = attachNepaliInputs();
  // Call nepali.destroy() when the page or app is torn down.
</script>
```

The manager also picks up marked fields added later. For one field, call `attachNepaliInput(field)`; pass a custom engine or state callback only when needed. See the [browser API](docs/package/api.md#browser-input-adapters) for options and cleanup details.

As an alternative to the marked-field setup above, enable Nepali typing across an app's document with `{ scope: 'all' }`. This covers supported textareas and text/search inputs; mark any English field with `data-sahajlipi-ignore`. Pass a page container as the first argument to limit the scope, or use `selector` to target particular fields. Each initializer has its own configuration and `setEnabled()` control.

```js
import { attachNepaliInputs } from './src/dom.js';

const appTyping = attachNepaliInputs(document, { scope: 'all' });
// appTyping.setEnabled(false) switches its fields to literal English typing.
```

```js
import { convertWord, convertText } from './src/index.js';

convertWord('paani');
// { text: 'पानी', candidates: ['पानी'], ambiguous: false }

convertText('pani. paani|');
// 'पनि. पानी।'
```

Start with the [package documentation](docs/package/README.md) for the [API](docs/package/api.md), [typing rules](docs/package/typing-reference.md), [architecture](docs/package/architecture.md), and [benchmark protocol](docs/package/benchmarks.md). The package is still marked `private` and is **not published to npm**; these examples import from a repository checkout.

## Try the demo

Use the [live typing demo](https://ojastechnologies.github.io/sahajlipi/demo/) to try the current interaction. Its editor, candidate dropdown, controls, local setup, and Pages hosting are described in the [demo guide](docs/demo/README.md). The demo consumes the package; it is not a separate conversion engine.

## Work on the project

Node.js 18 or later runs the automated checks from the repository root:

```sh
npm test
npm run benchmark -- --check
```

See the [documentation index](docs/README.md), [development guide](docs/development.md), [contribution guide](CONTRIBUTING.md), [project status](docs/status-and-roadmap.md), [security policy](SECURITY.md), and [MIT license](LICENSE). The seed benchmark is a regression set, not a population-wide accuracy measure. See the [external evaluation guide](docs/package/external-evaluation.md) for the pinned Nepali word baseline and sentence review process.
