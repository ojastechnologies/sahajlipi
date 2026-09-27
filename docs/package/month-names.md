# English month names

The 2026-09-27 month-name extension accepts all 12 full English Gregorian month names in Nepali mode. Each entry has one preferred spelling and no built-in alternatives. These are authorized source-assisted project preferences; independent human linguistic review remains pending. They are separate from the [20-word English loanword pilot and its 34-entry research catalogue](loanword-review.md).

## Mappings

Both lowercase and normal title case are accepted:

| English key | Title case | Preferred output |
| --- | --- | --- |
| `january` | `January` | जनवरी |
| `february` | `February` | फेब्रुअरी |
| `march` | `March` | मार्च |
| `april` | `April` | अप्रिल |
| `may` | `May` | मे |
| `june` | `June` | जुन |
| `july` | `July` | जुलाई |
| `august` | `August` | अगस्ट |
| `september` | `September` | सेप्टेम्बर |
| `october` | `October` | अक्टोबर |
| `november` | `November` | नोभेम्बर |
| `december` | `December` | डिसेम्बर |

Try `January February March` → जनवरी फेब्रुअरी मार्च or `September December` → सेप्टेम्बर डिसेम्बर. The core `convertWord` and `convertText` functions use these entries directly. Browser adapters use them in attached fields while Nepali mode is on; the demo requires no additional setting. The [typing reference](typing-reference.md#english-month-names) and [API reference](api.md) describe integration.

## Case and custom entries

Ordinary capitalization follows the existing lookup normalization. `September` and `December` are explicit built-in aliases because initial `S` and `D` otherwise select reserved Shift sounds. Other uses of `T`, `D`, `S`, `R` and vowel-following `H` still select their sounds; there is no general all-capital or mixed-case English folding. For example, `SEPTEMBER` and `DECEMBER` are not month aliases.

The existing `createEngine({ entries })` API can replace any month entry's full candidate list in one engine instance. Replacing lowercase `september` or `december` also updates its title-case alias unless an exact `September` or `December` override is supplied. The existing `Ram` and `Sita` aliases follow the same inheritance rule. See the [custom-entry examples](api.md#createengine-entries).

## Meaning and boundaries

- `May` and `may` both give मे. The engine cannot distinguish the English modal verb “may” from the month name; disable Nepali conversion or use an English field for literal English. Native Roman input such as `maya` keeps its existing behavior.
- Only full month names are listed. Abbreviations such as `jan`, `feb`, `mar` and `sep` do not inherit these entries. `may` is already the full name of a month.
- Attached forms such as `januaryma` and `decemberko` use the existing phonetic fallback. Entries do not infer stems or suffixes.
- Month names do not convert Gregorian dates to Bikram Sambat or substitute Bikram Sambat month names. The later [digit rendering policy](typing-reference.md#digits) now displays ASCII digits as Devanagari by default (`September 27, 2026` → सेप्टेम्बर २७, २०२६), with punctuation unchanged. The dated month benchmark retains its original ASCII-digit outputs and source identities.
- The later [shared mixed-text policy](api.md#links-domains-and-email-addresses) preserves recognizable links, ASCII domain-shaped hosts, and ordinary ASCII email addresses. `convertText('may.com')` now stays `may.com` by default, while the standalone month `may` still gives मे. This policy is separate from the month-name extension and its dated evidence. Arbitrary English or code remains convertible: leave whole English fields unattached, mark them `data-sahajlipi-ignore`, or disable conversion while typing or pasting literal fragments.

## Source evidence

Accessed 2026-09-27. The preferred outputs match the Nepali Gregorian month data in the official [Unicode CLDR JSON 48.2.1 source](https://github.com/unicode-org/cldr-json/blob/26a79cb42bfcc90def764102aa2af126d9ef3108/cldr-json/cldr-dates-full/main/ne/ca-gregorian.json), pinned to commit `26a79cb42bfcc90def764102aa2af126d9ef3108`. The full JSON was downloaded and parsed. The selected path is `main.ne.dates.calendars.gregorian.months.format.wide`; the resolved `stand-alone.wide` values are byte-identical for all 12 months. Its SHA-256 is `cb31c68c4b999191d8eaee6262d8d205f68a7b0a99df6b0cda94e422963e5d9b`.

This uses the stable [48.2.1 JSON package release](https://github.com/unicode-org/cldr-json/releases/tag/48.2.1), whose release note describes a time-zone patch over CLDR 48.2. The pinned [repository README](https://github.com/unicode-org/cldr-json/blob/26a79cb42bfcc90def764102aa2af126d9ef3108/README.md) describes generated JSON with a contributed-or-approved draft threshold. These are locale data used for the project's defaults, not independent human labels for SahajLipi or a claim that every other observed spelling is incorrect.

Government pages provide narrower corroboration: the [Ministry of Foreign Affairs disclosure body](https://mofa.gov.np/content/664/information-of-automatically-publishing-2081/) contains अगस्ट, सेप्टेम्बर and अक्टोबर in dates, and the [Department of Postal Service homepage notice title](https://www.nepalpost.gov.np/) contains नोभेम्बर and डिसेम्बर. The postal notice's linked page was inaccessible, so the claim is limited to its homepage title. The ministry page also contains `जुलार्इ`; this observed alternate encoding/spelling is recorded for review and is not adopted as an output or candidate.

The [machine-readable evidence ledger](../../benchmark/reports/month-research-2026-09-27.json) preserves source URLs, access scopes, context checks, the observed variant and limitations. The month data are available under [Unicode License V3](https://github.com/unicode-org/cldr-json/blob/26a79cb42bfcc90def764102aa2af126d9ef3108/LICENSE); the exact copyright and permission notice is retained in [LICENSES/Unicode-3.0.txt](../../LICENSES/Unicode-3.0.txt). The project code remains MIT licensed.

## Verification scope

The [dated month benchmark](month-benchmarks.md) and [benchmark guide](benchmarks.md) record the separate month fixture, baseline, post-change checks and provenance. The tests cover lowercase and title case, one-candidate results, custom-entry alias inheritance, reserved Shift controls, text conversion and live field behavior. These verify the intended implementation contracts; they do not establish population-wide typing accuracy or independent linguistic review. Historical loanword research and unrelated dataset metrics retain their original scope.
