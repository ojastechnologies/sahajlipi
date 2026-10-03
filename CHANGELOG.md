# Changelog

Published versions and their changes are recorded here. The [release record](docs/release.md) identifies the verified artifact, source, consumer checks, and experimental limits; the same page defines versioning and migration expectations.

## 0.1.0-alpha.1 — 2026-10-03

First experimental developer alpha, [published on npm](https://www.npmjs.com/package/sahajlipi/v/0.1.0-alpha.1) from source [`314a1b4`](https://github.com/ojastechnologies/sahajlipi/commit/314a1b4cf312bcb727dcb7cb2a5f86a926eb4b72). Install the exact version with `npm install --save-exact sahajlipi@0.1.0-alpha.1`. Npm assigned both `alpha` and `latest` on first publication; authenticated removal of `latest` was rejected with HTTP 400. This remains an alpha with no stable-release promise.

### Added

- Four reviewed exact spelling aliases: `halyo` → हाल्यो, `nabhani` → नभनी, `gaunle` → गाउँले and `dindaina` → दिँदैन. Unlisted vowel, Shift, nasal-mark and half-consonant behavior remains unchanged.
- Dated spelling evidence, frozen source-assisted validation and reproducible before/after measurements.

- Finite Nepali suffix handling for the 51 recognized English loanword stems, including `companyharumathi` → कम्पनीहरूमाथि and `mediasanga` → मिडियासँग.
- `media` → मिडिया and the स्कूल alternative for `school`, inherited by recognized attached forms while keeping स्कुल first.
- Dated source review and benchmark comparison for loanword suffixes, plus updated package and demo guides.

- Completed source-assisted review of all 100 development cases, with 86 frozen project references, 14 exclusions, preserved maintainer notes and original evidence dates.
- Reproducible exact-output measurement command, per-case public evidence ledger, protected sentence publication and dated development baseline.

- Added `company` → कम्पनी and 29 source-assisted exact English-spelling loanwords, with a dated expansion review and refreshed demo and package guides.

- Dated English loanword coverage audit for `company`, the complete pending pilot queue, source-backed research leads, and expansion criteria.

- Developer getting-started guide for local tarball installation, public package imports, TypeScript, and integration scopes.
- Runnable vanilla JavaScript, TypeScript, and React uncontrolled-field examples with candidates, English mode, and cleanup.
- Isolated tarball-consumer checks for JavaScript exports, strict TypeScript resolution, tutorial execution, and package contents.
- Browser checks for installed-package vanilla and React integrations, including development StrictMode cleanup and remounting.
- Release checklist, compatibility scope, versioning, and migration policy.
- Package website with static developer documentation generated from the existing Markdown, local search, and the preserved interactive demo route.
- Unique page titles and descriptions, canonical URLs, social preview metadata, sitemap, and documented discoverability limits.
- GitHub Pages artifact workflow with pull-request checks and main-only deployment, plus eleven dedicated Chromium website scenarios.

### Fixed

- Gold focus rings on the demo editor, form fields, homepage preview, and documentation search, matching the existing brand gold in both themes.
- Restored gold highlights on typing surfaces, selected text, active navigation, and keyboard examples across the website and demo.
- Local demo startup now builds and serves the complete package website, keeping Home, logo, and documentation navigation available.
- Legacy local `/` and `/demo/` entry paths redirect to the project homepage and demo under `/sahajlipi/`.
- Documentation-body demo links load the static demo rather than passing it through the documentation router.
- Source-only vanilla example instructions use the separate repository example server on port 4177.

### Packaging

- Public distribution of `0.1.0-alpha.1`, with the explicit `alpha` tag, a verified registry tarball, and fresh installed-package JavaScript and strict TypeScript consumers.

- Explicit distribution file allowlist and repository/support metadata.
- Distributed MIT and Unicode-3.0 licenses plus a NOTICE for CLDR-derived month-name data.
- Pinned example/compiler and VitePress website development dependencies; no runtime dependencies added.

The alpha includes direct phonetic typing, selected word alternatives, configurable field scopes, loanwords, Gregorian month spellings, technical-text preservation, and configurable Devanagari/Latin digits. Their implementation history and dated evidence remain in the package guides. The suffix update changes only the documented recognized loanword forms. GitHub Pages uses the Actions publishing source for the generated website artifact.
