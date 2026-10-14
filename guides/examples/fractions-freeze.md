# Worked example: "She freezes on fraction word problems"

Meta DAX guides > Examples > Fractions freeze

> **model-generated, unreviewed, for illustration.** This is one run of
> MP-13 Guide Coach on a made-up problem. It has not been checked by a teacher or
> an editor. It carries no real person, no name, no place. Treat it as a sample of
> the shape MP-13 returns, not as advice to copy wholesale.

---

## What the guide typed

A private tutor, using `CONFIG.guide_type: private-tutor`, pasted:

> "The learner is 11. She totally freezes on fraction word problems. She can do
> 3/4 + 1/8 on a worksheet no problem, but the moment it's 'a recipe needs three
> quarters of a cup and you halve it...' she just stops and says she can't do it.
> It's only the word ones. I don't know if it's a reading thing or a maths thing."

No profile, no prior notes, course node = a fractions lesson. `mode: coach`.

---

## What MP-13 returned (markdown view)

**Restated.** The learner can do bare fraction arithmetic on its own, but stops
when a fraction is wrapped inside a worded, real-life problem. The stop happens at
the word problems specifically, not at the arithmetic.

**What might be going on (hypotheses -- each with a quick check):**

1. *The arithmetic is secure; the hard step is turning the story into a number
   sentence.* **Check:** read the problem aloud and ask her to tell you, in her own
   words, what is happening before any maths -- then ask what calculation it needs.
   See whether she can set up `3/4 / 2` even if you then do the sum together.
2. *The reading load crowds out the maths -- holding the story in mind leaves no
   room for the numbers.* **Check:** give her the exact same problem with the
   numbers already pulled out and written as a sum. If she can now do it, the stop
   was the reading/extraction, not the fractions.
3. *A "show me now" setting makes her freeze -- the maths is fine, but being
   watched on an unfamiliar-looking problem triggers "I can't".* **Check:** hand her
   the problem, say "take your time, think out loud, I'm just going to listen," and
   look away slightly. See whether the freeze eases when the pressure drops.

**Strategies (with the why):**

- **Story-first, numbers-second.** Before any calculation, she retells the problem
  as a little story and says what is being asked. *Why:* it separates "do I
  understand the situation?" from "can I do the sum?" so a wobble in one does not
  look like failure at the other.
- **Underline-and-label.** She underlines the numbers and writes next to each what
  it is ("3/4 = one cup amount", "halve = divide by 2"). *Why:* it turns an
  invisible extraction step into a small, concrete, do-able move.
- **Think-aloud, low stakes.** Frame the word problems as "let's just talk through
  what it's asking -- no need to get an answer yet." *Why:* if freezing is about
  being watched, lowering the stakes lets the existing skill show.

**A 12-minute next session (plan):**

1. (2 min) Warm up with one bare sum she can already do, to start on a win.
2. (3 min) Read one word problem aloud together; she retells the story, no maths yet.
3. (3 min) She underlines the numbers and labels each one.
4. (3 min) Together, turn the labels into a number sentence -- then she does the sum.
5. (1 min) She narrates one whole problem back, start to finish, in her own words.

**What to watch, and record:**

- Where exactly the stop happens -> record as: "stop point: reading / extraction /
  number sentence / arithmetic."
- Whether retelling the story first removes the freeze -> record as: "story-first
  helped: yes/no."
- Whether she freezes when watched vs. left to think aloud -> record as: "freeze
  eased when stakes lowered: yes/no."

**When it might help to involve someone else.** Nothing here suggests that yet --
this looks like a specific, workable sticking point in one topic. If, over several
sessions and across subjects, you see the same freeze on anything with a lot of
reading -- not just maths -- it could be worth mentioning to the parent so more
than one person is paying attention and can decide whether to ask a learning
professional. That is about having more eyes on it, not a cause for worry, and not
something this toolkit can assess.

**Note for next time** (this is the part that carries forward to MP-08 and a report):

- *what happened:* to fill in after the session.
- *what worked:* to fill in after the session.
- *watch items:* where the stop happens; did story-first help; did lower stakes help.
- *next step:* if story-first helped, do two more word problems the same way and
  start fading the scaffold; if the stop was pure extraction, practise pulling
  numbers out of three short problems before doing any sums.

---

## The same record as JSON (metadax.guide-coach/0.3)

```json
{
  "type": "coach",
  "mode": "coach",
  "guide_type": "private-tutor",
  "restated": "The learner can do bare fraction arithmetic on its own, but stops when a fraction is wrapped inside a worded, real-life problem. The stop is specific to the word problems, not the arithmetic.",
  "hypotheses": [
    {
      "situation": "The arithmetic is secure; the hard step is turning the story into a number sentence.",
      "check": "Read the problem aloud and ask her to retell it in her own words, then ask what calculation it needs; see if she can set up 3/4 divided by 2 even if you do the sum together."
    },
    {
      "situation": "The reading load crowds out the maths -- holding the story in mind leaves no room for the numbers.",
      "check": "Give the same problem with the numbers already pulled out as a sum. If she can now do it, the stop was the reading/extraction."
    },
    {
      "situation": "Being watched on an unfamiliar-looking problem triggers 'I can't', though the maths is fine.",
      "check": "Say 'take your time, think out loud, I'm just listening' and look away slightly; see whether the freeze eases when the pressure drops."
    }
  ],
  "strategies": [
    {
      "strategy": "Story-first, numbers-second: she retells the problem and says what is asked before any calculation.",
      "why": "Separates understanding the situation from doing the sum, so a wobble in one does not read as failing the other.",
      "addresses": "turning the story into a number sentence"
    },
    {
      "strategy": "Underline-and-label: underline each number and write what it stands for.",
      "why": "Turns the invisible extraction step into a small, concrete, do-able move.",
      "addresses": "the reading load crowds out the maths"
    },
    {
      "strategy": "Think-aloud, low stakes: 'let's just talk through what it's asking, no answer needed yet.'",
      "why": "If freezing is about being watched, lowering the stakes lets the existing skill show.",
      "addresses": "being watched triggers 'I can't'"
    }
  ],
  "next_session_plan": {
    "minutes": 12,
    "steps": [
      { "minutes": 2, "do": "Warm up with one bare fraction sum she can already do, to start on a win." },
      { "minutes": 3, "do": "Read one word problem aloud together; she retells the story, no maths yet." },
      { "minutes": 3, "do": "She underlines the numbers and labels what each one is." },
      { "minutes": 3, "do": "Together turn the labels into a number sentence, then she does the sum." },
      { "minutes": 1, "do": "She narrates one whole problem back, start to finish, in her own words." }
    ]
  },
  "watch_for": [
    { "signal": "Where exactly the stop happens.", "record_as": "stop point: reading / extraction / number sentence / arithmetic" },
    { "signal": "Whether retelling the story first removes the freeze.", "record_as": "story-first helped: yes/no" },
    { "signal": "Whether she freezes when watched vs left to think aloud.", "record_as": "freeze eased when stakes lowered: yes/no" }
  ],
  "involve_others": "Nothing here suggests that yet. If, over several sessions and across subjects, you see the same freeze on anything reading-heavy -- not just maths -- it could be worth mentioning to the parent so more than one person is paying attention. That is about more eyes on it, not a cause for worry, and not something this toolkit can assess.",
  "note_for_next_time": {
    "what_happened": "to fill in after the session",
    "what_worked": "to fill in after the session",
    "watch_items": ["where the stop happens", "did story-first help", "did lower stakes help"],
    "next_step": "If story-first helped, do two more word problems the same way and begin fading the scaffold; if the stop was pure extraction, practise pulling numbers out of three short problems before doing any sums."
  },
  "safeguarding": null,
  "assumptions": ["No learner profile or prior notes were provided; advice assumes an 11-year-old working on a fractions lesson, as stated."],
  "warnings": []
}
```

---

Notice what the record never does: it never says the learner "has" anything. Every
hypothesis is a situation you could watch happen. The "involve others" line names
more-eyes, never a condition. That is the whole discipline of MP-13.

*Pair with the situation card [can-do-cant-apply](../situations/can-do-cant-apply.md)
and the guide-type card [private-tutor](../guide-types/private-tutor.md).*
