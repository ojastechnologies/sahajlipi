# Browser extension release process

The extension is released separately from the npm package, from this repository. **Nothing has been published to a store yet.** The [design note](extension-design.md) covers what the extension does and its limits; the [package release record](release.md) covers npm.

| | npm package | Browser extension |
| --- | --- | --- |
| Version | `package.json`, such as `0.1.0-alpha.4` | `extension/manifest.json`, one to four numbers, such as `0.1.0` |
| Tag | `v0.1.0-alpha.4` | `extension-v0.1.0` |
| Changelog | [`CHANGELOG.md`](../CHANGELOG.md) | [`extension/CHANGELOG.md`](../extension/CHANGELOG.md) |
| Artifact | npm tarball | `sahajlipi-extension-0.1.0.zip` |
| Updates | Consumers choose when to upgrade | The store updates users automatically after review |

**Engine versions.** The extension bundles `src/` from the tagged commit, not a published npm version. A change to typing rules reaches extension users only in their next extension release, so each release's notes name the commit it bundles.

## Build a package

```bash
npm run extension:package
```

This writes the zip and its SHA-256 to `.extension-dist/`. The zip holds the manifest, the files it reaches at runtime and the license files. Fixtures, tests and modules that only reach the page through the bundle are left out.

The same bytes in give the same zip out when built with the same Node version, so a rebuild can be compared with a released archive.

## Release

1. **Prepare a PR:** raise `version` in `extension/manifest.json` and add a section headed `## <version>` to `extension/CHANGELOG.md`. Store versions can't be reused, so every upload needs a higher number.
2. **Tag the merged commit** on `main`:

   ```bash
   git tag extension-v0.1.0 <merged commit>
   ```

   ```bash
   git push origin extension-v0.1.0
   ```

3. **CI does the rest of the build.** The [release workflow](../.github/workflows/extension-release.yml) refuses the tag unless the commit is on `main`, the tag matches the manifest version, the manifest name no longer says "prototype" and the changelog has an entry. It then runs the unit tests, builds the zip, unpacks it, runs `extension:check` on those unpacked files and creates a GitHub prerelease with the zip and its SHA-256.
4. **Upload by hand.** Download the zip from the prerelease and upload that exact file to the store dashboard. CI never uploads, so a person approves each release.
5. **Check the store build.** After review, install from the store and repeat the manual pass below. Record the result in the [design note's test log](extension-design.md).

A rejected tag can be deleted and pushed again after the fix merges. Nothing leaves the repository until step 4.

## Manual pass

CI can't exercise the real permission prompt, `activeTab` or keyboard commands, so check these by hand on each release:

- Turn on from the popup, then **Remember this site**, with both Allow and Deny.
- **Alt+Shift+N**, the toolbar badge and the on-page confirmation.
- The spelling list, including **Alt+1** on Windows or Linux and **Option+1** on macOS.
- The "can't type here" notice and **Don't show again**.
- The typing guide and its links.
- Every site named on the store listing.

## Rollout

1. **Unlisted on the Chrome Web Store** for testers, who install from a direct link and receive automatic updates.
2. **Public on the Chrome Web Store** after the checks below pass.
3. **Edge Add-ons,** after a manual pass in Edge, where the extension has not yet been loaded.

Firefox and Safari need porting work; see the design note.

## Before the first upload

Owner decisions and content:

- A Chrome Web Store developer account under Ojas Technologies, and a support contact.
- Trader verification, started from the account that should own it, because only that account can finish or change it.
- Screenshots. The rest of the [listing text](../extension/store-listing.md) is ready to paste, and the [privacy policy](extension-privacy.md) is published with the website. Name only the sites that passed a manual check.

Checks still open from the [design note's recommendation](extension-design.md#recommendation):

- A manual pass on real sites, including government forms, comment boxes, search boxes, Gmail and Facebook.
- The macOS Option+digit shortcut.
- A measurement of the page observer's cost.
- Double conversion, where a page already running SahajLipi, such as the project's own demo, also has the extension on.

## Rollback

Stores can't be relied on to restore an earlier upload. To roll back, revert the change on `main`, raise the version and release again. Avoid adding required permissions in an update, because that can disable the extension until each user accepts them.
