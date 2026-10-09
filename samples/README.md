# MetaDAX homeschool samples

Generic, shareable homeschool samples — made-up names, nothing identifying. Each
sample is one markdown file here, and one entry in `index.json`. The library page
at [daxfoundation.org/metadax/samples/](https://daxfoundation.org/metadax/samples/)
reads `index.json` at build time and lists them with subject and age-band filters.

Samples are offered through the **"Share a sample"** GitHub issue template, which
the `metadax-homeschool` skill pre-fills for a parent. A human reviews and
publishes; there is no upload system and no accounts.

## `index.json` schema (v1)

```json
{ "format": "metadax-samples", "v": 1, "samples": [ ENTRY, ... ] }
```

Each `ENTRY` has exactly these nine fields:

| field | what it is |
|---|---|
| `id` | kebab-case, unique; also the filename (`samples/<id>.md`) |
| `subject` | one of: Math, Reading, Writing, Spelling, Science, French, Language, History, Other |
| `age_band` | one of: `4-6`, `4-9`, `7-9`, `10-12`, `13-15`, `16-18` |
| `stuck` | the stuck point as **behaviour**, short — never a diagnosis |
| `loves` | what the page is built through |
| `approach` | one line: how the page tackles the stuck point |
| `date` | `YYYY-MM-DD` |
| `licence` | `CC BY 4.0` (default), `CC BY-SA 4.0`, or `CC0 1.0` |
| `path` | `samples/<id>.md` |

Validate with:

```
node samples/validate-samples.mjs
```

It checks every field, the enums, that each `path` exists and matches its `id`,
that every `samples/*.md` has an entry, and that **no diagnosis or condition** is
named in any field or sample file (behaviour, never a diagnosis).
