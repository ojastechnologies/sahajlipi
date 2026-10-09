# Alpha.4 release preparation

> **For agent workers:** Execute the steps in order and retain evidence for the exact artifact. The maintainer approved this release workflow on 2026-10-09. Review and merge the preparation PR before publication.

**Goal:** Prepare and verify `sahajlipi@0.1.0-alpha.4`, shipping the 34 reviewed native forms already merged in PR #28.

**Architecture:** This is a versioned release of the existing engine. All eight `src/` files remain identical to merged source `9bec98c4ce980d1bc7852d553dab01d15e664834`. The 211 starter keys include the previous 177 unchanged entries and 34 complete native forms. No API, dependency, fallback, digit, address-handling or language-scope changes are planned.

**Tools:** npm pack, the existing Node and seed checks, installed JavaScript and strict TypeScript consumers, Playwright Chromium/Firefox/WebKit and the website checks.

## 1. Prepare metadata and upgrade guidance

- Advance package and root lockfile versions to `0.1.0-alpha.4`; retain dependency pins, public exports, MIT/Unicode notices and all 19 discovery keywords.
- Move the 34-form changelog entry into an explicitly unpublished alpha.4 candidate section. Link the complete changed-output table and explain exact-key precedence, custom overrides and the retained consonant modes.
- Keep packaged README installation guidance useful across publication; distinguish source version from registry availability.
- Keep current npm installation instructions and website publication metadata on verified alpha.3 until alpha.4 is actually published.
- Preserve every historical candidate, publication, research, comparison and browser JSON record byte for byte. Do not publish private corpus sentences or development archives.

## 2. Freeze the distribution and validate

- Commit all files included by npm before packing; retain that source commit.
- Pack to a dedicated archive directory with lifecycle scripts disabled. Verify the 13-file allowlist, licenses, file hashes and equality to committed source.
- Record SHA-256, SHA-1, SHA-512, sizes and the exact artifact filename. Verify the generated consumer/browser archives have the same checksum.
- Run the existing Node suite, `npm run benchmark -- --check`, installed JavaScript/strict TypeScript consumers, desktop browser suite and website build/link/browser checks.
- Verify source, historical evidence, prior lexicon entries and discovery/dependency metadata remain unchanged. Selected development evidence does not establish independent human review or representative accuracy.

## 3. Make the candidate reviewable

- Add a new dated candidate JSON record and concise verification notes outside the tarball. Never edit the frozen distributed files after packing.
- Archive the exact tarball and release notes for the later publication step.
- Independently review the complete release diff, create a preparation PR and inspect its CI checks. Leave the PR open for maintainer review and merge.

## 4. Publish after merge

- Verify the merged distributed bytes, CI and intended npm maintainer account. Check that this version remains unpublished.
- Publish the retained exact tarball publicly with `alpha`; preserve the maintainer-authorized default installation behavior through a verified `latest` update when required.
- Verify official registry metadata, downloaded artifact integrity and fresh installed JavaScript/TypeScript/browser consumers.
- Create the corresponding GitHub prerelease, then update publication status, website version metadata and exact-version installation examples.
- Stop once publication is verified. Resolve the 12 deferred development cases and sentence work as separate subsequent tasks.

## Remaining limits

The 34 preferences are source-assisted project decisions; independent linguistic review remains pending. Twelve development cases remain deferred and the dated complete-sentence comparison remains 0/12. Physical mobile/IME behavior, controlled React values, SSR/hydration and assistive-technology support remain outside the established release scope.
