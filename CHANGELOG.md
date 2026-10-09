# Changelog

Published versions and prepared candidates are recorded here. The [release record](docs/release.md) identifies the verified artifacts, sources, consumer checks, and experimental limits; the same page defines versioning and migration expectations.

## 0.1.0-alpha.3 — prepared candidate, unpublished

Prepared on 2026-10-09 from the merged native spelling update. Package metadata identifies alpha.3; the current published npm artifact and verified registry tags remain `0.1.0-alpha.2`. Use a [local candidate tarball](docs/package/getting-started.md#local-development-installation) for review. The [candidate release notes](docs/release.md#alpha3-release-candidate) describe migration, the dated source evidence and pending fresh candidate verification. No alpha.3 npm publication or registry-consumer verification is recorded yet.

### Added

- Twelve exact reviewed native-word preferences: `imandar`, `sarasar`, `sakos`, `kathanak`, `arambha`, `ekadhik`, `jaghanya`, `pukar`, `niskanda`, `bora`, `utthan` and `samanjasya`.
- The भाग्न candidate for `bhagna`, keeping its existing भग्न default and preserving both distinct valid readings.
- A [dated source review and comparison](docs/package/nepali-spelling-2026-10-09.md), frozen-reference measurement command, 14 appended seed contracts, and updated repository demo guidance.

The selected development comparison improves word defaults **16/74 → 28/74** and listed reference coverage **17/79 → 30/79**. Complete reviewed sentences remain **0/12**. The 174-contract fixture preserves all 162 historical rows; these results do not establish general accuracy.

### Packaging

- Candidate version and lockfile advanced to `0.1.0-alpha.3`, with version-neutral packaged README guidance and additional npm keywords for Nepali typing and Devanagari discoverability, including `devnagari`.
- Release preparation documents the current `maheshnepal` npm account and `ojastech` organization; the published alpha.1 and alpha.2 records retain their historic publisher identities.

## 0.1.0-alpha.2 — 2026-10-03

Experimental developer alpha, [published on npm](https://www.npmjs.com/package/sahajlipi/v/0.1.0-alpha.2) from source [`48a0321`](https://github.com/ojastechnologies/sahajlipi/commit/48a0321bed417b1e995f66adbcbf9ade2c82f1cf). Install the exact version with `npm install --save-exact sahajlipi@0.1.0-alpha.2`. The verified `alpha` and `latest` tags both point to `0.1.0-alpha.2`; `npm install sahajlipi` now selects alpha.2. The npm `0.1.0-alpha.1` artifact and its recorded verification remain unchanged. See the [release record](docs/release.md) for artifact identity and verification.

### Changed

- Phonetic fallback uses full bare and final consonants by default: `k` and `ka` → क, `kr` and `kra` → क्र, `kri` → क्रि, `kar` → कर. Internal conjuncts remain automatic, including `shakti` → शक्ति. Exact built-in and custom lexicon readings retain priority and supplied Unicode.
- Backtick now requests an explicit half consonant like `/`; both persist across spaces and punctuation. A vowel after either marker remains independent: `` k`i `` and `k/i` → क्इ; use `ki` → कि for the attached sign. Backtick followed by `=` supports the same explicit joiner behavior as `/=`.

### Added

- `createEngine({ consonantMode: 'full' | 'half' })`, defaulting to `'full'`. Select `'half'` for alpha.1 phonetic fallback endings and pass both converters to DOM fields. The [migration recipe](docs/package/integration-recipes.md#keep-alpha1-consonant-behavior) covers this configuration.
- Updated package documentation for alpha.2 installation, full-consonant defaults, and alpha.1 fallback migration; historical dated reports retain their original measurements and scope.

### Packaging

- Public distribution of the exact reviewed alpha.2 tarball under the `alpha` tag. The registry artifact's checksum and all 13 distributed files match the archived candidate and release source.

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
