# Developer integration examples

These examples consume the public `sahajlipi` and `sahajlipi/dom` entry points. The package is still unpublished; the repository's verification command installs a local packed tarball in a temporary consumer project instead of downloading SahajLipi from npm.

| Example | What it demonstrates |
| --- | --- |
| [Vanilla JavaScript](vanilla/main.js) | One initializer for marked fields, shared engine options, candidate buttons, Nepali/English mode, an excluded English field, and explicit cleanup. |
| [TypeScript core](typescript/core.mts) | Public engine options, conversion return types, custom entries, and both digit styles. |
| [TypeScript browser](typescript/browser.ts) | Typed form and single-field attachment functions; the caller destroys the returned controller during teardown. |
| [React component](react/NepaliInput.tsx) | An uncontrolled textarea, adapter state rendered in React, candidate selection, mode switching, and effect cleanup. |
| [React app](react/main.tsx) | Development StrictMode plus editor unmount/remount, with a separate English field. |

## Verify the installed package

From the repository root, using the Node version required by the development tooling:

```sh
npm ci
npm run verify:package
```

The verification command checks a standalone consumer of the packed package. The TypeScript examples are checked through its public package entry points. See the [developer documentation](../docs/package/api.md) for the APIs and [development guide](../docs/development.md) for tooling requirements.

## Run the bundled examples

```sh
npm run examples:build
npm run examples:serve
```

Open either page while the server is running:

- [Vanilla JavaScript](http://127.0.0.1:4177/browser/.generated/vanilla/index.html)
- [React](http://127.0.0.1:4177/browser/.generated/react/index.html)

Try `paani`, `kam`, and `123`. Choose काम from the `kam` alternatives. Switch to English mode before typing an English fragment; the separate English field stays literal. The vanilla example also has a button that destroys its adapters. The React app can unmount and remount its editor.

The React build uses development mode so StrictMode exercises effect setup, cleanup, and setup again. This detects missing adapter cleanup. The component uses `defaultValue` and never supplies a React `value` prop to the textarea. It demonstrates an uncontrolled field; controlled React fields are not covered by this example.

## Run vanilla JavaScript directly from the checkout

```sh
npm run demo
```

Open [the source vanilla example](http://127.0.0.1:4173/examples/vanilla/). Its HTML import map resolves the public package names to the checkout's source modules. This path is convenient for reading and trying the example; the packed-consumer verification and generated browser examples separately exercise installed package exports.

## Browser integration checks

After installing the browser engines described in the [compatibility guide](../docs/package/browser-compatibility.md), run:

```sh
npm run test:browser -- browser/developer-examples.spec.js
```

The three named scenarios run in Chromium, Firefox, and WebKit. They check the generated installed-package examples with real keyboard input: conversion, candidate selection, mode controls, English fields, vanilla teardown, and the React effect lifecycle. They do not establish support for controlled framework inputs, physical mobile keyboards, operating-system clipboard behavior, or assistive technology.
