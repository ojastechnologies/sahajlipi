# Release and compatibility policy

SahajLipi is an experimental Nepali typing package. The repository version is `0.1.0`, `private` is `true`, and no npm release has been made. This guide defines the preparation and review steps for a developer alpha; it does not announce one. The [getting-started guide](package/getting-started.md) explains how to install a local tarball today.

## Public package boundary

The package exports `sahajlipi` for the core engine and `sahajlipi/dom` for browser adapters, with TypeScript declarations for both. Source paths such as `sahajlipi/src/phonetic.js` are internal and are not public imports. The distribution contains runtime modules and declarations under `src/`, README, package metadata, MIT license, Unicode license, and NOTICE. Demo, examples, research datasets, benchmark reports, tests, and development tools stay in the repository. It has no runtime, peer, or optional dependencies; React is a development dependency for the example only.

The documentation is maintained on [GitHub](https://github.com/ojastechnologies/sahajlipi/tree/main/docs); it is not bundled into the tarball. MIT covers the code. The CLDR-derived month-name data use Unicode-3.0; both notices must remain in distributed copies. [Month provenance](package/month-names.md) identifies the pinned source and selected data.

## Compatibility scope

| Surface | Current evidence and limit |
| --- | --- |
| Node core | ESM package imports; Node 18, 20, 22, and 24 run the engine checks. No browser globals are needed for core conversion. CommonJS `require` is not the documented entry path. |
| TypeScript | Pinned TypeScript 5.9.3 checks public exports in strict NodeNext and Bundler configurations. A core-only fixture omits DOM declarations. Browser adapters require DOM declarations. This does not establish every older compiler or legacy resolution mode. |
| Browser adapter | Text/search inputs and textareas. Headless Chromium, Firefox, and WebKit regressions cover selected editing flows; [compatibility notes](package/browser-compatibility.md) distinguish keyboard actions from injected events. |
| React example | React/React DOM 19.3.0 with an uncontrolled textarea, effect attachment, state callbacks, candidates, and cleanup under development StrictMode. It is checked in the three headless engines. Controlled values, every React version, framework SSR/hydration, and rich-text editors are not established by this example. |
| Developer tooling | Node 20 or later, npm, and Python 3 for browser/example servers. `npm ci` installs pinned development dependencies. These requirements do not add dependencies to apps importing the core. |
| Language quality | Nepali only. Deterministic fallback, small lexicon, and source-assisted preferences. Seed contracts are regression checks; independent corpus review and held-out evaluation remain pending. No population-wide accuracy claim. |

An ESM import of the DOM module can be evaluated on a server, but attachment needs a browser document and supported field. Attach after a page mounts and call `destroy()` before teardown. The React example is not a Next.js or hydration certification. [Integration recipes](package/integration-recipes.md) describe ownership and cleanup.

## Versioning and changes

Use a prerelease identifier for the first registry alpha, such as `0.1.0-alpha.1`; the maintainer must choose and verify the actual version before release. The checkout's existing `0.1.0` is not a published version. Alpha users should pin an exact version when typing behavior matters.

During `0.x` development:

- Document every externally visible change in [CHANGELOG.md](../CHANGELOG.md), including preferred spelling, candidate order, key mappings, digit defaults, address handling, and supported runtimes.
- Advance the minor version for intentional incompatible API or behavioral changes; include migration instructions. Prerelease iterations may also change experimental behavior, which must be disclosed before users upgrade.
- Use a patch version for compatible fixes, documentation, and packaging corrections. A spelling bug fix may change output; list its affected Roman keys and Unicode readings even when the API signature is unchanged.
- Do not silently replace a published artifact. Publish a new version; retain tagged source and dated benchmark evidence.

A future `1.0` release should define its stable contract and follow semantic versioning for incompatible changes. The current prototype does not promise unchanged candidates for every Roman word. Visual glyph shape can depend on fonts and renderers even when Unicode output is unchanged.

Migration notes must state what changed, who is affected, before/after code or Unicode output, and any available configuration to preserve earlier behavior. For example, the new Devanagari digit default can be overridden with `createEngine({ digits: 'latin' })`, passing both engine functions to an adapter. Existing field contents are not automatically rewritten.

## Alpha release checklist

Complete this on the exact commit and package version being proposed. Passing software checks alone does not complete the language review.

- [ ] Confirm maintainer approval to publish, npm account/package-name availability, and the intended version and `alpha` dist-tag. GitHub access does not establish npm permissions.
- [ ] Review both public entry points, declaration signatures, supported environments, and integration examples.
- [ ] Resolve known release-blocking defects and state remaining limitations in the release notes. Confirm the corpus review status and use dated, reproducible results without an unearned accuracy claim.
- [ ] Update changelog, version, lockfile, installation examples, and any migration notes; remove `private` only in the reviewed release change.
- [ ] Run `npm ci`, `npm test`, `npm run benchmark -- --check`, `npm run verify:package`, and `npm run test:browser`. Inspect every CI job on the proposed commit.
- [ ] Inspect `npm pack --dry-run --json --ignore-scripts`; confirm the file allowlist, entry points, licenses, NOTICE, absence of research data, and absence of runtime dependencies.
- [ ] Install the actual release tarball in a clean app and run the JavaScript, TypeScript, and browser examples. Record the tarball checksum and commit identity.
- [ ] Publish with the chosen prerelease version and `alpha` tag only after the above review. Do not move `latest` to an experimental alpha implicitly.
- [ ] Install the registry version in a fresh consumer, rerun package-import checks, and confirm its metadata, contents, and tag.
- [ ] Create a matching source tag and GitHub release with upgrade notes, the package version/checksum, CI evidence, evaluation status, and known limits.

The current CI adds package-consumer jobs on Node 20, 22, and 24; browser jobs also build the installed-package examples before execution. Repository protection is configured separately from workflow files. There is no npm publishing automation yet; a future workflow should authenticate with the registry's supported trusted-publishing mechanism and be reviewed before use.

## Report integration problems

Open a [GitHub issue](https://github.com/ojastechnologies/sahajlipi/issues) with the package version, runtime/browser, input type, exact Roman keys, expected and actual Unicode, caret or selection, and a small reproduction. For React, include whether the field is controlled and how effects are attached and destroyed. Follow [CONTRIBUTING.md](../CONTRIBUTING.md) for source fixes and [SECURITY.md](../SECURITY.md) for private vulnerability reports.
