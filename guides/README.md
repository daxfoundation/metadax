# Guides -- the coaching matrix

These are the human-facing companion to **MP-13 Guide Coach** (`prompts/MP-13-guide-coach.md`).
MP-13 takes a guide's plain-language problem and returns observable hypotheses,
checks, strategies and a short next-session plan. The cards here are the reference
behind it: short, practical, printable pages a guide can read on their own, and
the shared vocabulary MP-13 draws on.

Nothing here is a diagnosis. Every situation is described as **something you can
observe** -- what the learner does, and when -- never as a type of learner or a
condition. That is the one rule the whole toolkit holds (MP-00 K-12; MP-01).

## The two axes

A coaching problem sits at the crossing of two things:

- **Who is guiding** -- `guide-types/`. A parent at the kitchen table, a private
  tutor on a video call, a classroom teacher with thirty learners, a workplace
  trainer with adults who want the point up front. Same situation, different
  levers. Eight types.
- **What you observe in the learner** -- `situations/`. "Stuck on one concept",
  "finishes fast and gets bored", "rushes and makes careless errors". Eleven
  situations, each written as behaviour you can watch for. **Not labels.**

The **situation** card tells you what to do; the **guide-type** card tells you how
to pitch it to your role. MP-13 combines them for you from a sentence of plain
description -- but you can also just read the two cards.

## How to use the matrix with MP-13

1. **Say the problem in your own words.** "She freezes on word problems." "He
   finishes in half the time and then disrupts." No jargon needed.
2. **Pick your guide type** (optional) -- `CONFIG.guide_type`, e.g.
   `private-tutor`, `parent-caregiver`, `classroom-teacher`, `workplace-trainer`.
   MP-13 pitches its tone and moves to that role.
3. **Add what you have** (all optional): the learner's privacy-safe profile
   (MP-01), recent session notes, the course node you are teaching.
4. **Run MP-13** in any AI chat (paste MP-00, then MP-13, then your blocks) or via
   the teacher skill. It returns one record:
   (a) your problem restated as behaviour; (b) 2-4 hypotheses; (c) a quick check
   for each; (d) 2-3 strategies with the why; (e) a 10-15 minute next-session
   plan; (f) what to watch and how to record it; (g) when it might help to involve
   someone else; (h) a note for next time.
5. **The note (h) carries forward.** It is the exact shape MP-08 STEWARD and the
   session-report service read -- what happened, what worked, what to watch, the
   one next step. Keep it; feed it back next session (`CONFIG.mode: prepare`), or
   gather several and run `CONFIG.mode: review` to spot a pattern.

### Modes

- `coach` -- one problem, right now. The default.
- `prepare` -- plan a specific upcoming session for one learner, using last time's note.
- `review` -- look back over several notes and find the pattern.

## Reading a situation card

Each `situations/<slug>.md` has the same shape, so you can scan it fast:

- **What you might see** -- the observable signs (behaviour, never a label).
- **First moves** -- what to try before anything else.
- **By guide type** -- how the move changes for a parent / tutor / teacher / trainer / peer / elder / volunteer.
- **A 10-minute activity** -- one concrete thing to run next session.
- **What not to do** -- the common well-meant mistakes.
- **What to watch, and record** -- signals to carry into the note (feeds MP-08).

## The situations (observable, not labels)

| Card | You might describe it as |
|---|---|
| `stuck-on-concept` | "she just can't get this one thing" |
| `anxious-or-avoids` | "he freezes, or finds a reason not to start" |
| `finishes-fast-bored` | "she's done in half the time and then bored" |
| `attention-drifts` | "he can't stay with it for long" |
| `second-language` | "she's learning in a language that isn't her first" |
| `gaps-missed-schooling` | "there are holes from school he missed" |
| `rushes-careless-errors` | "she races and makes silly mistakes" |
| `can-do-cant-apply` | "he can do the exercise but not the real thing" |
| `low-confidence-after-failure` | "she's convinced she's bad at it" |
| `not-motivated` | "he just doesn't care about the subject" |
| `adult-returning` | "I'm coming back to learning after years away" |

## The guide types

| Card | Who |
|---|---|
| `parent-caregiver` | a parent or caregiver teaching at home |
| `private-tutor` | a 1:1 tutor, usually paid, often on video |
| `classroom-teacher` | one teacher, many learners, little 1:1 time |
| `peer-sibling` | an older sibling or a classmate helping |
| `coach-mentor` | a coach or mentor over a longer arc |
| `elder-grandparent` | a grandparent or elder, warmth and patience, less formal training |
| `workplace-trainer` | training adults at work on required material |
| `volunteer-teacher` | a volunteer in an under-resourced setting, mixed levels, few materials |

## The hard lines (same as the rest of MetaDAX)

- No diagnosis, ever. Observable situations only.
- No identifying or medical data about a learner. Minors are handled as minors.
- A safety or wellbeing concern gets one fixed, careful line pointing to local
  professionals -- the toolkit is for learning only.
- MetaDAX is free and open. The done-for-you session-report service is a separate,
  clearly labelled offer (see [the MetaDAX site](https://daxfoundation.org/metadax/)).

## Worked example

`examples/fractions-freeze.md` -- a tutor's problem about an 11-year-old who
freezes on fraction word problems, run through MP-13. Labelled
*model-generated, unreviewed*.
