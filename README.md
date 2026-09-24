# SahajLipi

SahajLipi is an MIT-licensed Roman Nepali → Unicode typing prototype for web developers. This repository contains a **reusable package** and a **separate browser demo**. Only Nepali is implemented today; other Devanagari languages are a future goal.

## Use the package

The core engine converts words and text without a browser. An optional textarea adapter adds live typing to a web app.

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

See the [documentation index](docs/README.md), [development guide](docs/development.md), [contribution guide](CONTRIBUTING.md), [project status](docs/status-and-roadmap.md), [security policy](SECURITY.md), and [MIT license](LICENSE). The seed benchmark is a regression set, not a population-wide accuracy measure.
