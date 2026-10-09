# Reviewed native forms implementation plan

> **For agentic workers:** use the executing-plans workflow to implement these dependent steps; obtain a separate whole-branch review after verification.

**Goal:** Improve source-supported native inflections and compounds from the 46 remaining development word mismatches.

**Architecture:** Add reviewed exact whole-key entries to the starter lexicon. Keep phonetic rules, key shortcuts, public APIs and existing reading arrays intact. Research validates Devanagari usage; the Roman aliases are project typing preferences.

**Tech stack:** ESM JavaScript, Node tests, existing source-review evaluator, Playwright and VitePress.

**Spec:** [Roadmap priority 1](../../status-and-roadmap.md#priorities) and [frozen development review](../../package/source-review-2026-10-01.md).

## Constraints and review focus

- Preserve the exact archived alpha.3 artifact. The native-form measurements start at merged source `5baaad071a5a673c756eb48e2f7523a05c3295fd`; PR #28 is subsequently rebased onto the merged alpha.3 preparation metadata without changing its engine, fixtures or frozen measurements.
- Preserve the 74-word / 79-reference and 12-sentence / 13-reference denominators, all historical reports and the original review ledger. No licensed complete source sentences in public files.
- Add only attested complete readings; identify indexed excerpts, PDF extraction and visual checks separately. Source occurrence establishes neither frequency nor an isolated person's identity.
- Preserve reserved Shift sound keys and inherited incidental capitals.
- Preserve strict-half mode, host overrides and isolation, literal addresses, English mode, digits and punctuation. Matching complete keys does not infer every native suffix.
- Resolve `mahila` and `shanta` ordering with the maintainer; leave uncertain name readings and weak evidence deferred with reasons.

## Tasks

### 1. Research and freeze the scope

- [x] Verify a clean baseline: `npm test` passes 345 tests.
- [x] Review all 46 remaining word cases using primary online material and record complete-form evidence or a specific deferral.
- [x] Save `benchmark/reports/native-forms-research-2026-10-09.json` with `implementationEntries: [{ input, outputs }]`, 46 case decisions, frozen-reference identities, source URLs, access limits and nonhuman provenance.

### 2. Add reviewed exact preferences

- [x] Create `test/native-forms.test.js` with literal `convertWord` outputs selected in the frozen scope. Include a constructed mixed-text case; full/half mode; host overrides; incidental capitals and reserved Shift keys; and unsupported attached-form controls.
- [x] Run `node --test test/native-forms.test.js`; new exact-output assertions must fail against the unchanged baseline.
- [x] Add precisely the accepted entries to `src/lexicon.js`; preserve all 177 prior keys and candidate arrays.
- [x] Run the focused file and `npm test`; all checks must pass.
- [x] Append seed contracts to `benchmark/cases.jsonl`, retaining all 176 previous rows byte for byte. Run `npm run benchmark -- --check`.

### 3. Measure and document

- [x] Score unchanged development cases before and after with the source-review evaluator; include all eight runtime/declaration hashes and tool/fixture/ledger identities. Publish new records without replacing old ones.
- [x] Document every selected input, before/after output, evidence scope, deferred cases and remaining mismatches in `docs/package/native-forms-2026-10-09.md`; add documentation index, typing guide, demo guide and site metadata links.
- [x] Mark the update as unreleased. Package distribution remains a separate release action.

### 4. Verify and submit

- [x] Run installed-package consumers and the desktop browser suite for exact aliases, editing and custom-engine behavior. Run the website build/link checks and relevant navigation checks.
- [x] Review source/data boundaries, archived measurements, installed-package scope and full-sentence privacy with a separate reviewer.
- [x] Commit the branch, open a separate PR, attach it to the chat and inspect all CI checks. Do not merge or publish the next changes without the maintainer's review.

## Review handoff

Submitted as [PR #28](https://github.com/ojastechnologies/sahajlipi/pull/28). Its current Actions checks are the authoritative CI status. Maintainer review and merge remain the next action. The separate [alpha.3 preparation PR #27](https://github.com/ojastechnologies/sahajlipi/pull/27) merged as `4df0ebcc174e379ca345752228aceddf14e25d43`. PR #28 retains that version, lockfile, npm keywords and version-neutral README links. The separately archived alpha.3 artifact excludes these later 34 native forms; its publication status is recorded separately in the [release record](../../release.md).
