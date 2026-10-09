# The learning record entry (`metadax-record` v1)

A learning record is the thing a companion writes to, every session, for years.
At the end of a session the skill writes **one** entry: a single JSON object, one
dated session, readable by a person *and* by a program. It is **append-only** — a
correction or the next session is a **new** entry, never an edit of an old one.

This is the entry format. The full repo that holds a record — schema, validator,
a rendered `RECORD.md`, and a one-step publish to a public page — is the template
at **https://github.com/daxfoundation/metadax-learner-record** ("Use this
template"). You do not need it to produce an entry; you need it to keep one.

> Private by default. The entry is a file on the guide's machine. Nothing is
> uploaded. Publishing is a separate, explicit choice the guide makes later, in
> their own record repo (turn on GitHub Pages — one step). A way, never the way.

## The shape

One JSON object. Required: `format`, `v`, `entry_id`, `package`, `date`,
`attempted`, `reached`. Everything else is optional.

| field | what it is |
|---|---|
| `format` / `v` | `"metadax-record"` / `1`. |
| `entry_id` | kebab-case; once saved into `record/` it equals the filename stem. Convention: `<ref-lowercased>-s<session>`, e.g. `hs-rdg7-s1`. |
| `package` | `{ ref, session, title?, subject?, age_band? }` — which package this session used. `ref` is the only thing that links one family's sessions, and it is not identifying on its own. |
| `date` | `YYYY-MM-DD`, the day the session happened, as the guide gives it. |
| `attempted` | one object per game played: `{ game, answered?, right? }` — **what was attempted**. |
| `reached` | one object per game: `{ game, level?, of? }` — **what was reached**. |
| `mistakes` | optional `{ name, count? }[]` — the behaviour, as the game names it. **Never a diagnosis.** |
| `learner_words` | optional — **the learner's own words**, as given. Nickname only, never a real name. |
| `guide_note` | optional — **the guide's note**: the hardest moment, what did not work, what you'd like next time, what only you could do. |
| `links` | optional `{ sample?, package?, play? }` — `https` links the guide chooses to add. Empty by default. |
| `generated_by` | set to `"metadax-homeschool skill"`. |

## What it must never carry

The same rule as everything else in Meta DAX: **no real name, no location, no
named condition.** A learner is identified only by the package `ref` and whatever
made-up nickname the guide typed. There is deliberately **no name field** — a
program cannot detect a real name, so the format never asks for one.

`tools/check-record.mjs` is the gate. It runs the moment the entry is written and
blocks, as a hard error: a named condition in any text field; an email, an
`@handle`, or a link in free text (links belong only in the `links` block). A long
run of digits that looks like a phone number is warned. Run it:

```
node ../tools/check-record.mjs record-entry.json
```

(Zero dependencies — plain Node, the same code the record repo runs in CI.)

## What each field is for — and what if it is wrong

| field | what if this field is wrong |
|---|---|
| `entry_id` | if it does not match the filename once saved, the record page and the file decouple and the entry is orphaned. |
| `package.ref` | wrong → sessions of one family stop linking, or link to the wrong package; the thread of progress breaks. |
| `package.session` | wrong → entries sort out of order and "session 2" may read before "session 1". |
| `date` | not `YYYY-MM-DD` → the record cannot be ordered by time; freshness is lost. |
| `attempted` / `reached` | empty or wrong → the entry records that a session happened but says nothing about it; it reads hollow. |
| `mistakes.name` | if it drifts from behaviour into a label it breaks the one rule that matters and the validator blocks it. |
| `learner_words` | if it carries a real name or a place it must never be published; keep it the learner's words, nickname only. |
| `guide_note` | the most valuable field and the easiest to over-share; it is free text, so the privacy pass matters most here. |
| `links` | a wrong or private link published here points a stranger somewhere the guide did not intend; empty is the safe default. |

See `templates/EXAMPLE-record.json` for a complete, valid entry (made up).
