# The MetaDAX homeschool package format (v1)

One JSON object per package. The player at
`https://daxfoundation.org/metadax/play/` renders it. `tools/check-package.mjs`
(and the identical code in the player) is the gate: a package with errors does
not go out. Reuse this format — do not invent a new one.

`templates/EXAMPLE-package.json` is a complete, valid package to model yours on.

## Shape

```json
{
  "format": "metadax-package",
  "v": 1,
  "ref": "HS-XXXX",
  "session": 1,
  "word": "session",
  "title": "A short, warm title",
  "lang": "en",
  "learners": [ { "nickname": "the big kid", "age_band": "7-9" }, { "nickname": "the little ones", "age_band": "4-6" } ],
  "guide":   { "tab": "For you",      "theme": { "light": PALETTE, "dark": PALETTE }, "sections": [ SECTION, ... ] },
  "learner": { "tab": "For <nickname>","theme": { "light": PALETTE, "dark": PALETTE }, "sections": [ SECTION, ... ] },
  "next":    { "ticks": [ "...", "...", "..." ], "ask": [ "...", "..." ] },
  "build":   { "from": ["intake"], "notes": "free text for the builder, never shown" }
}
```

- `ref`: `HS-` plus four characters from `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (no
  look-alikes). It is the only thing that links sessions; it is not identifying.
- `word`: the iteration word (session, lesson, round…). Pages say "session 1",
  never a date or a duration.
- `lang`: `en`, `fr`, or `en+fr`. For `en+fr` any text field may be
  `{ "en": "...", "fr": "..." }` and the player shows a toggle.
- `learners` (**optional**): for a mixed-age household taught together. An array of
  `{ "nickname", "age_band" }`. `age_band` is one of `4-6`, `4-9`, `7-9`, `10-12`,
  `13-15`, `16-18`. **Omit it entirely for one child** — a single-learner package
  is unchanged and still valid. See "Mixed-age households" below.
- PALETTE: `{ "bg","surface","surface2","text","muted","accent","accent2","good","bad" }`,
  all `#rrggbb`. `text` on `bg` and on `surface` must reach **4.5:1** contrast in
  both light and dark. If unsure, copy the example's palette.
- SECTION: `{ "id", "label", "blocks": [ BLOCK, ... ] }`.

**Guide sections — required ids, in this order:** `upnext`, `learned`, `steps`,
`tricky`, `tellus`. (Labels may vary; session 1 often labels `learned` "What
we're finding out".) The player appends the next-time form to `tellus`.

**Learner sections:** free ids and labels, at least one section, and at least one
**game** block somewhere.

## Blocks

Inline in any string: `**bold**`, `*italic*`. No HTML, no links, no emoji.

| type | fields | notes |
|---|---|---|
| `h` | text | heading in a section |
| `p` | text | paragraph |
| `list` | items[], ordered? | |
| `card` | title?, body, tone: `note`\|`tip`\|`why` | `why` is the one line of why |
| `step` | n, do, say?, why | a guide step: what to do, what to say (a quote), one line of why |
| `so` | text | the "So:" line that closes "What we've learned" |
| `ifthen` | if, then | when it's tricky |
| `human` | title?, items[] | **guide only, required once** — things only a person can do |
| `lead` | title, body, prompt | **required once on each side** — the learner, a step ahead, teaches the guide |
| `faq` | q, a, more?: [ {q, a, more?: [ {q, a} ]} ] | **a two-level one required on each side** |
| `copy` | title, text | copyable text, **guide only** |
| `check` | id, title, items[] | guide tick list; ticks feed the next-time note |
| `quiz` | see below | adaptive game |
| `sort` | id, title, intro?, bins:[{id,label}], items:[{text,bin,why}] | game: put each item in a bin |
| `sequence` | id, title, intro?, steps:[{prompt, choices:[CHOICE]}] | game: decisions in order |
| `build` | id, title, intro?, parts:[{label, options[], best, why}] | game: pick a part per slot, see the why |

CHOICE: `{ "text", "correct": true, "msg" }` **or** `{ "text", "mistake": "m-id", "msg" }`.
Every wrong choice names a defined mistake.

`quiz` (the adaptive game):

```json
{ "type": "quiz", "id": "...", "title": "...", "intro": "...",
  "start": 1, "up_after": 3, "down_after": 1,
  "mistakes": { "m-id": { "name": "short name of the slip", "guide": "one line for the guide" } },
  "levels": [ { "level": 1, "label": "Warm-up", "items": [
    { "q": "...", "visual": "optional plain text / small fixed-width diagram",
      "choices": [ CHOICE, ... ], "hint": "optional", "explain": "shown after any answer" } ] } ] }
```

The player starts at `start`, goes up a level after `up_after` correct in a row,
down after `down_after` misses in a row (never below level 1), and does not repeat
an item until a level runs out. Aim for 3+ levels and 4+ items per level.

## Mixed-age households (optional)

When several children learn together, declare `learners[]` (above) and tag the
who-does-what split in **typed fields** instead of burying it in prose:

- On any `lead` or `step` block, and on any `quiz` **level** or **item** (and
  likewise `sort`/`sequence`/`build` items), add:
  - `who`: a learner nickname from `learners[]`, or `"all"`.
  - `for_age` (optional): an age band, when the step suits a band rather than a
    named learner.
- The player renders these as a small chip ("the big kid · ages 7-9"), so a guide
  sees at a glance that *the 8-year-old reads this part and the 5-year-olds do that
  part* — the split is read-only and never hidden in a paragraph.

```json
{ "type": "lead", "who": "the big kid", "title": "The oldest leads first", "body": "...", "prompt": "..." }
{ "type": "quiz", "id": "...", "levels": [
  { "level": 1, "label": "Point and do", "who": "the little ones", "for_age": "4-6", "items": [ ... ] },
  { "level": 3, "label": "Explain it",   "who": "the big kid",     "for_age": "7-9", "items": [ ... ] } ] }
```

This is fully optional and backward compatible: a package with no `learners[]` and
no `who`/`for_age` is validated and rendered exactly as before.

## The next-time form

`next.ticks` are short things the guide might tick (e.g. "Got it with the
blocks"); `next.ask` are short open prompts (e.g. "Hardest moment", "Where your
child led"). The player turns these into a plain "next time" note the parent can
copy; nothing leaves the device unless they copy it.

## What the checker enforces (errors — package does not go out)

Wrong `format`/`v`; guide sections missing or out of order; no game on the learner
side; a game choice that is neither correct nor tied to a defined mistake; no
`human` on the guide side; no `lead` on either side; no two-level `faq` on either
side; emoji anywhere; links or bare domains anywhere; a title before a name; the
word "role"/"rôle"; an AI word on the learner side; any AI-vendor word anywhere; a
`copy` block on the learner side; text contrast under 4.5:1 in either theme; and,
when present, a malformed `learners[]` (not a non-empty array, a learner missing a
nickname, or an `age_band` outside the band set), or a `who` that matches no
declared learner nickname or `"all"`.

Warnings (you decide): size over 60 KB; something that looks like a date; a
duration in minutes/hours; a brand word; an email or phone pattern; a quiz thinner
than 3 levels or 4 items per level; a `for_age` outside the band set; a `who` set
without any `learners[]` declared.
