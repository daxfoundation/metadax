# The family progress file (`metadax-progress`, v1)

The state the skill keeps between sessions, so a guide can keep going **without
sending anything**. One JSON file per family on the guide's own machine —
`family-progress.json` — **never uploaded, never published, never part of a
sample**. It holds nothing identifying: nicknames and rough ages only, the same
details the pages already carry.

It does two jobs:

- **The next session.** It stores what each session did and the next-time note it
  left, so the skill builds session N+1 from it (see `NEXT-TIME-NOTE.md`).
- **More learners, no re-interview.** It keeps the intake answers in nested
  scopes, so a second learner or a new subject reuses the answers already given
  and the skill asks only what is genuinely new.

The package format (`metadax-package` v1) does **not** change. A package built
with no progress file is still valid. This file is additive and private.

## The shape

Three nested scopes, matching the three ways a family grows:
`house` → `learners[]` → `tracks[]` (one per subject) → `sessions[]`.

```json
{
  "format": "metadax-progress",
  "v": 1,
  "ref": "HS-DEMO",
  "house": {
    "lang": "en",
    "region": "",
    "explain": ["Short and plain", "Step by step", "With everyday examples"]
  },
  "learners": [
    {
      "called": "Pip",
      "age": 7,
      "loves": "dinosaurs, especially the ones with the longest names",
      "ahead": "telling one dinosaur from another",
      "learns": ["Likes games", "Needs to move", "Short bursts", "Goes quiet when wrong"],
      "learns_more": "covers the page after about two tries",
      "session_length": "about 10 to 15 minutes",
      "device": ["Tablet", "Printed on paper"],
      "tracks": [
        {
          "subject": "Reading",
          "comfort": "I'm comfortable",
          "stuck": "blending separate letter sounds into a word",
          "wrong": "sounded out s-u-n then said snake",
          "tried": "flashcards, a phonics app, sounding out together",
          "next_session": 2,
          "sessions": [
            {
              "session": 1,
              "title": "Sounds That Stick",
              "built_from": ["intake"],
              "did": "blending through dinosaur names; a 3-level game; a lead moment",
              "worked": ["the dinosaur lead landed", "short names blended cleanly"],
              "didnt_work": ["the printed page — too much text before the game"],
              "mistakes": ["sounds stayed apart x3", "guessed from the first sound x1"],
              "stopped": "covered the page after a miss; we stopped early",
              "next_note": "MetaDAX next v1\nRef: HS-DEMO\nSession: 1\n...verbatim...",
              "open_questions": ["which blend length is the real ceiling?"]
            }
          ]
        }
      ]
    }
  ]
}
```

## Scopes and reuse (this is the whole point)

| scope | fields | reused by | re-asked when |
|---|---|---|---|
| `house` | `lang`, `region`, `explain` | every new learner and subject | never, within one family |
| learner | `called`, `age`, `loves`, `ahead`, `learns`, `learns_more`, `session_length`, `device` | same learner, another subject | another learner, same house |
| track | `subject`, `comfort`, `stuck`, `wrong`, `tried` | — | every new subject |
| session | the loop record (below) | — | produced each session |

A new learner in the same family reuses the whole `house` block and the skill
asks only the learner-specific questions. The same learner on a new subject
reuses the `house` block and the learner block; only the subject block is new.

## The session record

Captures what the next session needs to build on: what was done, what landed,
what didn't, the slips the game surfaced, how it ended, the next-time note
(verbatim — the source of truth), and what the session could not answer.

| field | meaning |
|---|---|
| `session` | the session number this record is for |
| `title` | the package title that shipped |
| `built_from` | what the build read: `["intake"]`, then `["intake","s1"]`, … |
| `did` | one line: what the session asked the learner to do |
| `worked` | what the guide reported landing |
| `didnt_work` | what the guide reported not landing |
| `mistakes` | the slips the game surfaced, each with a rough count |
| `stopped` | how and why the session ended |
| `next_note` | the raw `metadax-next` text, verbatim |
| `open_questions` | what this session could not answer; seeds the next build |

## Rules

- **Private by default.** Never uploaded, never published, never part of a
  sample. Delete it with the family's files when they are done with it.
- **Nothing identifying.** Nicknames and rough ages only — the same as the
  pages. No real names, schools, towns, dates, emails, phones or links.
- **Behaviour, never a diagnosis.** `stuck`, `learns_more`, `worked`,
  `didnt_work` describe what the guide saw, not a label.
- **A way, never the way.** No field asserts a single correct path.
- **Forward compatible.** Carries `format` + `v`; readers ignore unknown fields.
