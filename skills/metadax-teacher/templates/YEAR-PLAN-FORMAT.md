# Year-plan format — the designed tree as a readable contract

A year plan (or term plan) is the output of the MetaDAX curriculum engine applied
to one teacher's class. It is structured as a tree: program → course → module →
lesson. Each lesson carries exactly three things — an objective, a misconception and
a check — because those three things are the minimum a lesson needs to be designed
around what actually goes wrong, not just what needs to be covered.

This format is a way to write it, never the only way. MetaDAX is free.

---

## Structure

```
Program
  title: <subject and span, e.g. "Fractions — Grade 5, Term 2">
  outcomes: what a learner can do by the end

  Course (one per term or major unit)
    title: <e.g. "Introduction to fractions">
    weeks: <how many>
    outcomes: what a learner can do at the end of the course

    Module (one per theme, 2–4 lessons)
      title: <e.g. "Equal parts and the number line">
      outcomes: what a learner can do after this theme

      Lesson (one per class period)
        title: <e.g. "Adding fractions with unlike denominators">
        minutes: <one period>
        objective: "The learner can …"
        misconception: <the common wrong step, as behaviour — never a label>
        check: <one thing the teacher does to tell if the objective landed>
```

---

## The human-readable form

Use this when writing the plan for a teacher to read and keep.

```
# <Program title>

Audience: <grade/level, age band, class size>
Term: <how many weeks>
Periods per week: <number × minutes>
Delivery: <print / devices / projected>
Outcomes: <what a learner can do by the end, 2–4 bullets>

---

## Unit 1 — <title> (<weeks> weeks)

> <one-line summary of what this unit is about>

### Week 1

**Lesson 1 — <title>** (<minutes> min)
Objective: The learner can <one measurable thing>.
Misconception: <what the class typically does wrong here, as observable behaviour>.
Check: <one quick thing to test whether the objective landed>.

**Lesson 2 — <title>** (<minutes> min)
Objective: The learner can <one measurable thing>.
Misconception: <...>.
Check: <...>.

...

---

## Unit 2 — <title> (<weeks> weeks)
...
```

---

## Worked example (Grade 5, Fractions, 6 weeks)

```
# Fractions — Grade 5, Term 2

Audience: Grade 5, age band 10–12, 22 learners
Term: 6 weeks
Periods per week: 3 × 50 minutes
Delivery: print only
Outcomes:
- The learner can explain why 1/2 is bigger than 1/3.
- The learner can find equivalent fractions.
- The learner can add and subtract fractions with unlike denominators.

---

## Unit 1 — Equal parts and what a fraction means (2 weeks)

> Before any arithmetic, the class needs a reliable picture of what a fraction is —
> equal parts of a whole, not just a top number and a bottom number.

### Week 1

**Lesson 1 — What makes parts equal** (50 min)
Objective: The learner can draw a shape split into equal parts and explain why
  the parts must be the same size.
Misconception: Draws any division of the shape and calls each section a half or
  a quarter regardless of whether the parts match.
Check: Show four shapes — two divided correctly, two not. Ask the learner to
  sort them. If they sort correctly and can explain one wrong one, the idea is there.

**Lesson 2 — Fractions on the number line** (50 min)
Objective: The learner can place 1/2, 1/4 and 3/4 on a number line between 0 and 1.
Misconception: Places fractions in the wrong order (puts 1/4 to the right of 1/2
  because 4 is bigger than 2).
Check: Hand out a blank 0-to-1 line. Ask the learner to place three fractions.
  One wrong placement = the misconception is still active; revisit next lesson.

**Lesson 3 — Bigger bottom, smaller piece** (50 min)
Objective: The learner can say whether 1/3 or 1/5 is bigger and explain why.
Misconception: Says 1/5 is bigger because 5 is bigger than 3.
Check: "Which is a bigger share of a pizza — 1/3 or 1/6?" If the learner can
  answer and explain in words, the idea has landed.

### Week 2

**Lesson 4 — Equivalent fractions: same value, different look** (50 min)
Objective: The learner can write two fractions that are equivalent using a diagram.
Misconception: Adds the same number to both top and bottom instead of multiplying
  (e.g. says 1/2 = 2/3 by adding 1 to each).
Check: "Show me 2/4 and 1/2 on a strip — are they the same?" A correct diagram
  with an explanation counts as landed.

**Lesson 5 — Simplifying fractions** (50 min)
Objective: The learner can write 4/8 in its simplest form.
Misconception: Divides only the top (or only the bottom) to simplify.
Check: "What is the simplest way to write 6/9?" Ask them to show the step.
  If both numbers are divided by the same value, it has landed.

**Lesson 6 — Unit 1 consolidation** (50 min)
Objective: The learner can identify and correct the two main errors from the unit
  (wrong-order and wrong-simplification).
Misconception: Combines both errors in the same question.
Check: Give one question that requires both skills. Whole-class show of
  mini-whiteboards — scan for the two specific errors.

---

## Unit 2 — Adding and subtracting fractions (4 weeks)

...
```

---

## JSON form (for check-plan.mjs)

The checker works on a JSON file with a `nodes` array. Each lesson node looks like:

```json
{
  "id": "fractions-g5/L01.M01.O01",
  "level": "lesson",
  "title": "What makes parts equal",
  "minutes": 50,
  "objective": "The learner can draw a shape split into equal parts and explain why the parts must be the same size.",
  "misconception": "Draws any division of the shape and calls each section a fraction regardless of whether the parts match.",
  "check": "Show four shapes — two divided correctly, two not. Ask the learner to sort them."
}
```

Run `node tools/check-plan.mjs <plan.json>` to verify every lesson has all three fields.
