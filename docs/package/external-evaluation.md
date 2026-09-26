# External Nepali evaluation data

SahajLipi keeps its handpicked [behavior benchmark](benchmarks.md) separate from external language data. The external commands below run against downloaded source files. They do not add those files to the package, CI, or the demo. Run them from the repository root with Node.js 18 or later.

## Aksharantar word benchmark

[AI4Bharat's Aksharantar](https://huggingface.co/datasets/ai4bharat/Aksharantar) supplies Roman and native-script word pairs. The [paper](https://aclanthology.org/2023.findings-emnlp.4.pdf) describes its collection and categories. We pin the Nepali archive to revision `e418c1fc928d9f5393af33268472cf20c1891be8` so a rerun uses the same bytes.

```sh
mkdir -p benchmark/data
curl -fL 'https://huggingface.co/datasets/ai4bharat/Aksharantar/resolve/e418c1fc928d9f5393af33268472cf20c1891be8/nep.zip' -o benchmark/data/aksharantar-nep.zip
shasum -a 256 benchmark/data/aksharantar-nep.zip
unzip -p benchmark/data/aksharantar-nep.zip nep_test.json > benchmark/data/nep_test.json
npm run benchmark:aksharantar -- --data benchmark/data/nep_test.json
```

The expected archive SHA-256 is `8bdcc5957d701ea36b63c00c713b43bc30902774b70736737d480e77929de92c`. The runner checks the extracted `nep_test.json` SHA-256, `172c759fcbb9faeda0a23765ccd12ad0520fb535a05dca42dd9c9923ee5f554e`, and its category counts. It refuses a different file rather than silently scoring a training split. `--examples 0` hides the capped mismatch sample; the default shows ten, and the maximum is 100. The command reports counts by category and exits successfully regardless of score. It is an observational benchmark, not a CI gate.

**Source discrepancy:** The Aksharantar paper and dataset card report **4,133** Nepali test pairs across AK-Freq, AK-Uni, AK-NEF, and AK-NEI. The pinned downloadable archive actually contains **4,101** JSONL test rows: AK-Freq 2,108, AK-NEF 817, AK-NEI 1,176, and no AK-Uni rows. We also checked the first official Nepali archive upload, which has the same row and category counts. The cause of this difference is unknown. Every SahajLipi score on this page uses the pinned **4,101-row file**, with no invented or excluded rows.

Each pair is scored independently, including pairs that share a Roman spelling but have different native words. The runner passes the original Roman spelling to `convertWord`, preserving case because uppercase keys have meaning in SahajLipi. All 4,101 Roman strings in this pinned test file are lowercase, while 1,035 reference words contain ट, ठ, ड, ढ, or ष. This baseline cannot exercise SahajLipi’s Shift shortcuts for those sounds, so part of the strict mismatch reflects a different typing convention; the seed benchmark covers the Shift keys. The runner compares raw Unicode strings exactly; it does not lowercase, normalize, correct, or silently accept another spelling. **Top** counts pairs whose reference equals the default output. **Reference in candidates** counts pairs whose reference appears anywhere in the returned list. A reference is one annotated answer, so a different valid output can still be scored as a mismatch. The output includes a small sample for diagnosis, not a complete error review.

### Initial baseline

This run used the unchanged engine from commit `02d967b`, Node.js v22.22.3, and the pinned file above on 2026-09-24. The benchmark runner was added on the working branch; its output reported that the working tree had changes.

| Set | Top | Reference in candidates |
| --- | ---: | ---: |
| All pinned test pairs | 279/4,101 (6.80%) | 279/4,101 (6.80%) |
| AK-Freq | 245/2,108 (11.62%) | 245/2,108 (11.62%) |
| AK-NEF | 9/817 (1.10%) | 9/817 (1.10%) |
| AK-NEI | 25/1,176 (2.13%) | 25/1,176 (2.13%) |

This low strict agreement shows a substantial mismatch between the current prototype and the reference spellings in this corpus. The test contains selected, mostly clean words and names; it does not measure spontaneous typing, editing speed, browser behavior, or overall Nepali-user accuracy. The [paper's limitations](https://aclanthology.org/2023.findings-emnlp.4.pdf) make the same distinction between word tests and sentence input. Keep this public test for descriptive comparisons; use separate development data to change rules or rankings and a separately held-out, reviewed set for future accuracy claims.

The manually created Aksharantar benchmark is published under **CC BY** according to its [dataset card](https://huggingface.co/datasets/ai4bharat/Aksharantar) and paper. Attribute AI4Bharat and the paper when publishing results. The dataset's terms remain separate from SahajLipi's MIT code license. The ZIP and extracted data are ignored by Git and are not distributed with the package.

## Nepali sentence review queue

[AI4Bharat's Bhasha-Abhijnaanam](https://huggingface.co/datasets/ai4bharat/Bhasha-Abhijnaanam) was built for language identification. Its [paper](https://aclanthology.org/2023.acl-short.71.pdf) says annotators romanized sampled sentences without a fixed spelling scheme. The pinned release has 423 Nepali records with both Roman and native sentences. Some inspected pairs have missing or changed words, so we treat all 423 as **review candidates**, never as verified transliteration labels.

```sh
curl -fL 'https://huggingface.co/datasets/ai4bharat/Bhasha-Abhijnaanam/resolve/c54a95d9b9d62c891a03bd5da60715df7176b097/bhasha-abhijnaanam.zip' -o benchmark/data/bhasha-abhijnaanam.zip
shasum -a 256 benchmark/data/bhasha-abhijnaanam.zip
unzip -p benchmark/data/bhasha-abhijnaanam.zip bhasha-abhijnaanam.json > benchmark/data/bhasha-abhijnaanam.json
npm run benchmark:sentence-queue -- --data benchmark/data/bhasha-abhijnaanam.json --output benchmark/data/nepali-sentence-review.jsonl
```

The archive SHA-256 is `be4bd82c5b9b54528393bcbf4542a4f7f2ac9ee4fc1a3609f0ed685a1d252c19`; the extracted JSON SHA-256 is `7f3290c418c00306b3ba9d5abf41bb6dfec827b4ccc4438651b70fab1787b787`. The export command checks the latter and the 423-pair count. It refuses to overwrite an existing review file; choose a new `--output` path for a repeat export so earlier review edits remain intact. The output preserves case, punctuation, and spacing, gives every item its source ID and pinned revision, and sets `reviewStatus` to `unreviewed`, `reviews` to `[]`, and `acceptedOutputs` to `[]`. It does not compute an accuracy score.

Two proficient Nepali reviewers should inspect each Roman input and proposed Unicode output independently, using separate copies so neither reviewer sees the other decision. Each `reviews` entry should record a stable reviewer ID, review date, a decision (`accept`, `correct`, or `exclude`), suggested outputs, and a reason. After reconciliation, set `reviewStatus` to `accepted`, `corrected`, or `excluded` and fill `acceptedOutputs` only for admitted items. Resolve disagreements before an item is admitted to a scored corpus. Record the review date, reviewers, source ID, final accepted outputs, and any edit to the source pair. Split accepted items into development and held-out sets before using them to change the engine. Keep naturally typed, consented examples as a separate collection with their own provenance; this prompted sentence data does not stand in for them. Publish category counts, exclusions, and review decisions with any future sentence score.

The [dataset card](https://huggingface.co/datasets/ai4bharat/Bhasha-Abhijnaanam) labels its manually collected packaging CC0 and notes that AI4Bharat does not own all underlying extracted text. Keep the raw archive and review queue outside the distributed MIT package, and preserve source attribution and provenance when using examples.

## Development review batch

The [first development review batch](review-batch.md) selects 80 words from the pinned Aksharantar development file and 20 unreviewed sentence proposals from this queue. Its selection is reproducible and independent of the engine, and it excludes word overlap with the pinned Aksharantar test file. Separate reviewer sheets omit engine output. The diagnostic breakdown compares against unreviewed proposals; it is not a Nepali accuracy score. Reconcile independent Nepali-language reviews before using the cases to change mappings or rankings.
