# Changelog

No npm versions have been published. `0.1.0` is the private repository prototype version. Release entries will identify actual published versions and their source tags; [release policy](docs/release.md) defines versioning and migration expectations.

## Unreleased

### Added

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

- Explicit distribution file allowlist and repository/support metadata.
- Distributed MIT and Unicode-3.0 licenses plus a NOTICE for CLDR-derived month-name data.
- Pinned example/compiler and VitePress website development dependencies; no runtime dependencies added.

The existing prototype includes direct phonetic typing, selected word alternatives, configurable field scopes, loanwords, Gregorian month spellings, technical-text preservation, and configurable Devanagari/Latin digits. Their implementation history and dated evidence remain in the package guides. These onboarding and website updates do not change conversion rules or publish a package. GitHub Pages now uses the Actions publishing source for the generated website artifact.
