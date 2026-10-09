# The next-time note (`metadax-next`, v1)

At the end of a session the learner page leaves a short plain-text note. The
guide copies it from the player — **nothing leaves the device unless they copy
it** — and pastes it back into the skill (or saves it as a file) to build the
next session. This file is the shape of that note and how the skill reads it.

The note is built from the package's next-time form: `next.ticks` are short
things the guide ticks ("Got it with the blocks"); `next.ask` are short open
prompts ("Hardest moment", "Where your child led"). It carries nothing
identifying — the nickname only, the same one the package uses.

## The shape

```
MetaDAX next v1
Ref: HS-DEMO
Session: 1
-- Games
Equal Parts: 11 answered, 7 right, reached level 2 of 3
Mistakes: added the tops and the bottoms separately x3; left one bottom number unchanged x1
-- Ticked
The equal-parts idea landed
Pip tried the quiz
Pip went quiet after a wrong answer
-- In your words
Hardest moment: the first question with different bottom numbers
Where Pip led: showed me how the block game splits things into equal groups
What didn't work: the printed page, too much text before the game
What you'd like next time: more questions like the block one, fewer words first
What only you could do: noticed Pip go quiet and moved on without a fuss
-- Permissions
Keep this note: Yes
```

| line | meaning |
|---|---|
| `MetaDAX next v1` | the header — identifies the note and its version |
| `Ref` | the family ref from the package, so the note matches the right family |
| `Session` | the session number the note is *about* (the one just run) |
| `-- Games` | one line per game: answered / right / level reached, then a `Mistakes:` line of the slips that came up, each with a rough count |
| `-- Ticked` | the ticks the guide chose from `next.ticks` |
| `-- In your words` | the guide's answers to the `next.ask` prompts, in plain words |
| `-- Permissions` | whether the guide keeps the note; it is theirs either way |

## How the skill reads it (to build the next session)

Given this note — pasted, or as a file the guide points at — the skill builds
the **next** session for the same learner and subject:

- **Keep what worked.** Everything under `Ticked` and the "what landed" lines
  stay; the next session opens with a callback to them, not a reset.
- **Move one step on the stuck spot.** The `Mistakes` lines and "what didn't
  work" say where it broke. Change that on purpose — one step on, not a leap —
  and never repeat a thing the note says already failed.
- **Swap the game theme if they tired of it.** If the note says the learner got
  bored of the theme (the thing the games were built through), pick a fresh
  anchor for the next session and rebuild the examples through it. If the note
  doesn't say so, keep the theme that was landing.
- **Pace it to how it ended.** "What only you could do" and any "we stopped
  early" cue set the length and the tone of the next session.

Then record the session in the family progress file and build session N+1 — see
`FAMILY-PROGRESS.md`. The next-time note is kept **verbatim** in that file as the
source of truth; the structured fields are the skill's reading of it.

## Rules

- Nickname only, never a real name. Behaviour, never a diagnosis — the note
  describes what the guide saw, not a label. The same rules as every page.
- The note is the guide's. It is not uploaded by this skill; it is plain text
  the guide chooses to paste back or keep.
