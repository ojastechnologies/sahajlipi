# Release and compatibility policy

SahajLipi is an experimental Nepali typing package. **`0.1.0-alpha.2` is the current published alpha**, available on npm with public access and the explicit `alpha` tag. This guide records the published artifacts, registry verification, migration, compatibility limits, and future release procedure. The [getting-started guide](package/getting-started.md) explains exact-version and local-tarball installation.

<span id="current-alpha-candidate"></span>

## Current alpha release — alpha.2

**Published on 2026-10-03:** [`sahajlipi@0.1.0-alpha.2`](https://www.npmjs.com/package/sahajlipi/v/0.1.0-alpha.2), maintained and published on npm by `ojastechadmin`. The maintainer authorized this publication after reviewing the merged consonant change and release-readiness checks. Publication completed at `2026-10-03T10:33:27.051Z` after npm's interactive two-factor authentication.

The exact reviewed tarball was published from merged source [`48a0321bed417b1e995f66adbcbf9ade2c82f1cf`](https://github.com/ojastechnologies/sahajlipi/commit/48a0321bed417b1e995f66adbcbf9ade2c82f1cf). The [GitHub prerelease](https://github.com/ojastechnologies/sahajlipi/releases/tag/v0.1.0-alpha.2) retains the artifact and [verification record](https://github.com/ojastechnologies/sahajlipi/releases/download/v0.1.0-alpha.2/release-verification.json). The tarball and its README retain the exact prepublication source bytes; this follow-up repository documentation records the completed publication without replacing the artifact. Its downloaded registry tarball has **13 files**, **24,583 compressed bytes**, and SHA-256:

```text
b1c3bb6dc673ad55a574ef8d95ce19daddc9c5a38f403f0c2defc449adc35fd5
```

Install with `npm install --save-exact sahajlipi@0.1.0-alpha.2`. After the maintainer-authorized tag update on 2026-10-03, the verified registry tags are **`alpha` → `0.1.0-alpha.2`** and **`latest` → `0.1.0-alpha.2`**. Unversioned `npm install sahajlipi` now selects alpha.2. The release remains experimental; assigning `latest` establishes the default installation, without a stable-release promise. The first-publication tag exception is recorded in the alpha.1 history below.

Fresh checks on the exact merged source passed **317 Node tests**, **160 seed contracts**, and **66 desktop browser checks**. The two exploratory seed proposals remain excluded from the regression gate. All merged-commit CI jobs passed: Node 18/20/22/24 engine checks, Node 20/22/24 package consumers, Chromium/Firefox/WebKit browser jobs, and the website's eleven checks and deployment. Actual tarball consumers passed public JavaScript imports, strict TypeScript configurations, and installed vanilla/React examples. The retained artifact checksum matched the tarball used by those browser examples.

Registry metadata, maintainer/publisher identity, all tags, SHA-1, SHA-512, and downloaded tarball SHA-256 were verified after publication. All thirteen distributed files matched the exact merged source byte for byte.

### Alpha.2 registry consumer verification — 2026-10-03

Two fresh consumers installed `sahajlipi@0.1.0-alpha.2` from the official npm registry with separate caches. Their installed version, lockfile URL and integrity, and all thirteen installed file bytes were verified against separately downloaded official tarballs. The public JavaScript fixture passed exports, server-safe DOM import, conversion, full/half behavior, backtick, option validation, engine isolation, and blocked internal exports. TypeScript 5.9.3 passed strict NodeNext core without DOM, DOM fixtures/tutorials, Bundler fixtures/tutorials, and execution of the emitted core tutorial.

The registry-installed vanilla and React examples compiled and bundled, then passed **9/9 browser scenarios**: three existing developer integration checks per Chromium, Firefox, and WebKit, with zero retries, skips, flaky outcomes, or test/report errors. The bundle manifest identified the same alpha.2 tarball checksum. These post-publication checks are separate from the 66/66 preparation suite and do not establish mobile, controlled React, SSR/hydration, or assistive-technology support. The prerelease's verification record retains tool versions, source identities, consumer results, and the adaptation patch used to replace local packing with exact registry installation.

The [behavior and migration notes](#alpha2-behavior-and-migration) describe the full-consonant default, explicit backtick shortcut, and strict half option. Independent language evaluation, physical mobile/IME checks, controlled React fields, SSR/hydration, and assistive technology remain unverified.

### Latest tag update — 2026-10-03

Alpha.2 initially advanced only `alpha`, leaving `latest` on alpha.1. The maintainer then authorized moving `latest` to alpha.2 so default installation selects the current experimental release. Both tags and the unchanged tarball checksum, size, SHA-1, SHA-512, and original publication timestamp were checked. A fresh consumer using unversioned `npm install sahajlipi` resolved to alpha.2 with the expected official tarball URL and SHA-512 integrity, and passed the existing public JavaScript fixture. The prerelease's [dated tag-update record](https://github.com/ojastechnologies/sahajlipi/releases/download/v0.1.0-alpha.2/tag-update-2026-10-03.json) records this later registry state separately from the original publication verification. The source tag, package version, artifact, and earlier dated records are unchanged.

## Previous alpha release — alpha.1

**Published and verified on 2026-10-03:** [`sahajlipi@0.1.0-alpha.1`](https://www.npmjs.com/package/sahajlipi/v/0.1.0-alpha.1), maintained on npm by `ojastechadmin`. The maintainer authorized preparation and alpha publication on 2026-10-01. Publication completed at `2026-10-03T06:29:13.469Z` after npm's interactive two-factor authentication.

The package was published from reviewed source [`314a1b4cf312bcb727dcb7cb2a5f86a926eb4b72`](https://github.com/ojastechnologies/sahajlipi/commit/314a1b4cf312bcb727dcb7cb2a5f86a926eb4b72). The [GitHub prerelease](https://github.com/ojastechnologies/sahajlipi/releases/tag/v0.1.0-alpha.1) retains the exact artifact and a verification record. Its downloaded registry tarball has **13 files**, **23,597 compressed bytes**, and SHA-256:

```text
466dc9baa2b117b34570a024747aa2cfc8d5c208c7df7fd2aaa8fe6ce4763ad3
```

Install the earlier release with `npm install --save-exact sahajlipi@0.1.0-alpha.1`. At its publication, the registry's `alpha` tag resolved to that version. Npm also assigned `latest` on this first publication, even though the manifest and publishing command explicitly requested `alpha`. An authenticated attempt to remove `latest` returned HTTP 400; the verified tags at that time were therefore **both `alpha` and `latest`**. The npm CLI project [records the same first-publication behavior](https://github.com/npm/cli/issues/8490). Alpha.2 initially advanced only `alpha`; the later maintainer-authorized tag update moved `latest` to alpha.2 as well. Alpha.1 remains experimental. The registry's `latest` label does not establish stable behavior, representative language accuracy, or a stable-release promise.

The release retains the two public exports, strict TypeScript declarations, Node 18+ core scope and no runtime dependencies. Its four [reviewed native word preferences](package/nepali-spelling-2026-10-01.md) change the default output for `halyo`, `nabhani`, `gaunle` and `dindaina`; the mapping and before/after evidence are recorded separately. Independent real-typing review, physical mobile/IME checks and framework-controlled input support remain pending.

### Candidate validation — 2026-10-01

The local candidate passed 304 Node tests, 142 seed contracts and 60 desktop browser checks. Actual tarball installation verified all 13 allowed files, ESM public exports, included licenses, strict TypeScript consumers and the installed vanilla/React examples. The [native spelling evidence](package/nepali-spelling-2026-10-01.md) and [desktop-005 record](../browser/reports/desktop-005.json) retain the measured scope and source identities. Website generation and public-file/link verification passed. These dated preparation records remain unchanged.

### Registry validation — 2026-10-03

After publication, registry metadata, maintainer identity, tags, SHA-1 and SHA-512 integrity were checked. The downloaded tarball's SHA-256 matched the approved artifact above. Every distributed file also matched the reviewed source commit byte for byte.

Fresh consumers installed `sahajlipi@0.1.0-alpha.1` from the official npm registry. Public JavaScript imports, server-safe DOM-module import, conversion/options/isolation, and blocked internal exports passed. TypeScript 5.9.3 passed strict NodeNext core without DOM, DOM fixtures/tutorials, Bundler fixtures/tutorials, and execution of the emitted core tutorial.

The registry-installed vanilla and React examples compiled and bundled, then passed **9/9 browser scenarios**: three existing developer integration scenarios per Chromium, Firefox, and WebKit, with zero retries, skips, or errors. These are post-publication integration checks. They do not replace the dated 60/60 candidate suite or establish physical mobile, controlled React, SSR, or assistive-technology support.

The prerelease's [verification record](https://github.com/ojastechnologies/sahajlipi/releases/download/v0.1.0-alpha.1/release-verification.json) records registry and source identity, checksums, verification-tool adaptation, browser versions, and scoped results.

## Alpha.2 behavior and migration

`0.1.0-alpha.2` is published on npm under the `alpha` tag. The alpha.1 artifact, source tag, checksum, and dated checks above remain unchanged. Install alpha.2 with `npm install --save-exact sahajlipi@0.1.0-alpha.2`; pin alpha.1 explicitly if you need its earlier package behavior. The [local tarball instructions](package/getting-started.md#local-development-installation) remain available for source development.

Alpha.2 changes phonetic fallback endings from half to full by default: `k` changes क् → क, `kr` changes क्र् → क्र, and `kar` changes कर् → कर. Both `k` / `ka` → क and `kr` / `kra` → क्र; `kri` → क्रि and `shakti` → शक्ति retain their internal conjuncts and vowel signs. This affects unlisted spellings and fallback segments. Exact built-in/custom readings and recognized loanword suffix outputs retain their supplied Unicode and priority.

Backtick now requests an explicit half form like `/`; both persist across spaces and punctuation. A vowel after either marker remains independent (`` k`i `` and `k/i` → क्इ), while `ki` → कि attaches the vowel sign. Backtick followed by `=` supports the existing `/=` joiner behavior. The [typing reference](package/typing-reference.md#half-consonants-and-conjuncts) documents these keys.

For integrations that need alpha.1 fallback output after adopting alpha.2, use `createEngine({ consonantMode: 'half' })`. Pass **both** of that engine's `convertWord` and `convertText` functions to each adapter or manager; the [migration recipe](package/integration-recipes.md#keep-alpha1-consonant-behavior) includes complete browser setup. The default is `'full'`, and another `consonantMode` value throws `TypeError`. Attachment and configuration do not rewrite existing field contents. The published alpha.1 has no `consonantMode` option or backtick shortcut.

The alpha.1 measurements above describe that release. Separate alpha.2 checks on 2026-10-03 passed 317 Node tests, 160 seed contracts, 66 desktop browser scenarios, 11 website scenarios, and installed JavaScript/strict TypeScript consumers. The [candidate contract report](package/consonant-defaults-2026-10-03.md) records declared fixture revisions, finite full/half contracts, and 144/144 exact archived results preserved by strict mode. Its preparation results retain their original source identities and scope. These are software and integration checks, not representative linguistic accuracy or physical mobile validation. The current release section above records alpha.2 distribution separately.

### Verify and publish future alphas

Run the release checklist below on a new committed candidate. Pack it to a dedicated output directory, retain its checksum, and publish the exact reviewed tarball. Replace `<new-version>` with an unpublished alpha version; published artifacts must not be replaced:

```sh
npm pack --ignore-scripts --pack-destination /absolute/path/to/release-output
npm publish "/absolute/path/to/release-output/sahajlipi-<new-version>.tgz" \
  --tag alpha --access public --registry=https://registry.npmjs.org/
```

Use npm's [browser login flow](https://docs.npmjs.com/accessing-npm-using-2fa/) and complete its authentication challenge. Publishing requires the registry's [two-factor authentication policy](https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification/). Credentials and authentication challenges are handled by npm; they do not belong in the repository.

After publication, compare the registry version, all tags, integrity and downloaded tarball with the reviewed artifact. Install that exact registry version into a fresh app and rerun the public imports and compiler/browser consumers. Then create the matching source tag and GitHub release with the tarball checksum, tested commit, dated evidence and remaining limitations. Update distribution status only after verification; record any registry tag behavior rather than assuming the requested tag is the only one present.

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

The first published developer alpha is `0.1.0-alpha.1`; the current published alpha is `0.1.0-alpha.2`. Alpha users should pin an exact version when typing behavior matters.

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
- [ ] Publish with the chosen prerelease version and explicit `alpha` tag only after the above review. Inspect all actual tags afterward; do not intentionally promote an alpha as stable, and document registry-assigned tags that cannot be removed.
- [ ] Install the registry version in a fresh consumer, rerun package-import checks, and confirm its metadata, contents, and tag.
- [ ] Create a matching source tag and GitHub release with upgrade notes, the package version/checksum, CI evidence, evaluation status, and known limits.

The current CI adds package-consumer jobs on Node 20, 22, and 24; browser jobs also build the installed-package examples before execution. Repository protection is configured separately from workflow files. There is no npm publishing automation yet; a future workflow should authenticate with the registry's supported trusted-publishing mechanism and be reviewed before use.

## Report integration problems

Open a [GitHub issue](https://github.com/ojastechnologies/sahajlipi/issues) with the package version, runtime/browser, input type, exact Roman keys, expected and actual Unicode, caret or selection, and a small reproduction. For React, include whether the field is controlled and how effects are attached and destroyed. Follow [CONTRIBUTING.md](../CONTRIBUTING.md) for source fixes and [SECURITY.md](../SECURITY.md) for private vulnerability reports.
