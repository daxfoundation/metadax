# Example — teacher interview and year plan (model-generated, unreviewed)

A fictional scenario run with this skill to show the interview flow and curriculum output.
No real names, school names or identifying details. The class is referred to as "the class."

---

## Interview transcript

**Skill:** Let's plan your term. What grade or level is your class?

**Teacher:** Grade 5 — they are ten and eleven mostly.

**Skill:** Subject?

**Teacher:** Fractions. We do a unit in the second term.

**Skill:** Roughly how many learners in the class, how many times do you meet
per week, and how long is each period?

**Teacher:** Twenty-two learners. Three lessons a week, fifty minutes each.

**Skill:** How many weeks does this plan need to cover?

**Teacher:** Six weeks.

**Skill:** How does the class run — print, devices, projected?

**Teacher:** Print only. No devices in the classroom.

**Skill:** Materials budget?

**Teacher:** Nothing beyond photocopying.

**Skill:** What does "the class can do fractions" mean by the end of the unit?

**Teacher:** They can add and subtract fractions with unlike denominators, find
equivalent fractions, and explain why one half is bigger than one third.

---

## Output — Year plan (term plan)

*(The skill calls MP-11 CURRICULUM, mode "design", size "term", on the above answers.
The output below is the plain-text rendering for the teacher. The JSON form is in
`plan.json` in this folder.)*

# Fractions — Grade 5, Term 2

Audience: Grade 5, age band 10–12, 22 learners
Term: 6 weeks
Periods per week: 3 × 50 minutes
Delivery: print only
Outcomes:
- The learner can explain why 1/2 is bigger than 1/3.
- The learner can find and write equivalent fractions.
- The learner can add and subtract fractions with unlike denominators.

---

## Unit 1 — Equal parts and what a fraction means (2 weeks)

> Equal parts must be the same size. This is the idea every later step depends on.
> The class typically arrives knowing the word "fraction" but not this constraint.

### Week 1

**Lesson 1 — What makes parts equal** (50 min)
Objective: The learner can draw a shape split into equal parts and explain why
  the parts must be the same size.
Misconception: Draws any division of the shape and calls each section a fraction
  regardless of whether the parts are equal in size.
Check: Show four shapes — two split correctly, two not. Ask the class to sort them
  and explain one wrong one. Correct sort with an explanation: the idea has landed.

**Lesson 2 — Fractions on the number line** (50 min)
Objective: The learner can place 1/2, 1/4 and 3/4 on a number line between 0 and 1.
Misconception: Places fractions out of order because the bottom number is treated
  as if bigger means further along (puts 1/4 to the right of 1/2 because 4 > 2).
Check: Hand out a blank 0-to-1 strip. Ask the class to place three fractions.
  One wrong placement = the misconception is still active; revisit next lesson.

**Lesson 3 — Bigger bottom number, smaller piece** (50 min)
Objective: The learner can say whether 1/3 or 1/5 is bigger and explain why.
Misconception: Says 1/5 is bigger because 5 is bigger than 3.
Check: "Which is a bigger share of a pizza — 1/3 or 1/6?" Correct answer with
  a plain explanation in the learner's own words: the idea has landed.

### Week 2

**Lesson 4 — Equivalent fractions: same value, different look** (50 min)
Objective: The learner can write two fractions that are equivalent and show
  why using a diagram.
Misconception: Adds the same number to both top and bottom instead of
  multiplying (writes 1/2 = 2/3 by adding 1 to each).
Check: "Show me 2/4 and 1/2 on a strip — are they the same?" A correct strip
  diagram with a plain explanation: the idea has landed.

**Lesson 5 — Simplifying fractions** (50 min)
Objective: The learner can write 4/8 in its simplest form.
Misconception: Divides only the top number, or only the bottom number.
Check: "What is the simplest way to write 6/9?" Ask the class to show the step.
  Both top and bottom divided by the same value: it has landed.

**Lesson 6 — Unit 1 consolidation** (50 min)
Objective: The learner can identify the two main errors from the unit and
  correct them.
Misconception: Applies both errors in the same question without noticing.
Check: One question requiring both skills. Mini-whiteboard show —
  scan for both specific errors.

---

## Unit 2 — Adding and subtracting fractions (4 weeks)

> Building from equal-parts understanding. The key step is the common denominator —
> and the key error comes before it: adding the bottoms.

### Week 3

**Lesson 7 — Why you cannot add the bottoms** (50 min)
Objective: The learner can explain why 1/2 + 1/3 ≠ 2/5.
Misconception: Adds the tops together and the bottoms together (the most common
  error in fraction arithmetic — appears in the majority of first attempts).
Check: "Someone said 1/2 + 1/3 = 2/5. What did they do wrong?" Correct
  identification in the learner's own words: the idea has landed.

**Lesson 8 — Finding a common denominator** (50 min)
Objective: The learner can find the lowest common denominator for two fractions.
Misconception: Multiplies the two denominators together every time, producing a
  larger number than needed (works, but misses the "lowest" requirement).
Check: "What is the lowest common denominator of 1/4 and 1/6?" Ask for the step.
  Finding 12 by listing multiples: the idea has landed. Finding 24: revisit.

**Lesson 9 — Adding fractions with unlike denominators** (50 min)
Objective: The learner can add two fractions with unlike denominators.
Misconception: Converts one fraction correctly but forgets to convert the other
  before adding.
Check: Three addition problems, shown step by step. At least two correct with
  both conversions shown: the idea has landed.

### Week 4

**Lesson 10 — Subtracting fractions with unlike denominators** (50 min)
Objective: The learner can subtract two fractions with unlike denominators.
Misconception: Subtracts the smaller denominator from the larger before
  converting (treats the denominators as plain numbers).
Check: "Work out 3/4 − 1/3, showing every step." Both conversions shown and
  the subtraction correct: the idea has landed.

**Lesson 11 — Mixed numbers: adding** (50 min)
Objective: The learner can add two mixed numbers.
Misconception: Adds the whole numbers and the fractions separately but then
  forgets to recombine, or adds them all as one number.
Check: "What is 1 and 1/2 + 2 and 1/3?" Correct answer with clear working
  showing the two parts kept separate then recombined: landed.

**Lesson 12 — Mixed numbers: subtracting (borrowing)** (50 min)
Objective: The learner can subtract a fraction from a mixed number that
  requires borrowing.
Misconception: Subtracts the fraction from the whole number directly (e.g.
  treats 2 and 1/4 − 3/4 as 2 − 3/4 then minus 1/4).
Check: "Work out 3 and 1/4 − 3/4, showing every step." Correct answer with
  borrowing shown: landed. Incorrect borrowing: revisit next lesson.

### Week 5

**Lesson 13 — Word problems: fractions in context** (50 min)
Objective: The learner can solve a one-step word problem involving fraction
  addition or subtraction.
Misconception: Reads the numbers from the problem and applies the wrong
  operation, or applies the right operation to the wrong pair of fractions.
Check: Read the same problem aloud. Ask the learner to say what needs to be
  calculated before writing anything. Correct identification of the operation:
  the comprehension step has landed.

**Lesson 14 — Two-step fraction problems** (50 min)
Objective: The learner can solve a two-step word problem involving fractions.
Misconception: Stops after the first calculation, or conflates the two steps.
Check: "There are two things to work out here — what are they?" If the learner
  can name both steps before starting, the structure is clear.

**Lesson 15 — Unit 2 consolidation** (50 min)
Objective: The learner can add and subtract fractions with unlike denominators
  without scaffolding.
Misconception: Reverts to adding-the-bottoms under time pressure.
Check: Four questions, no worked example shown. Two or more fully correct with
  working: the unit objective has landed.

### Week 6

**Lesson 16 — Review and catch-up** (50 min)
Objective: The learner can identify and correct their own main error from the unit.
Misconception: Varies by learner — the check identifies which type.
Check: Return one marked piece of work. Ask the learner to name their error and
  correct one question. Successful self-correction: metacognitive awareness
  is developing.

**Lesson 17 — Connecting equivalent fractions to addition** (50 min)
Objective: The learner can explain the connection between finding a common
  denominator and finding equivalent fractions.
Misconception: Treats them as two separate procedures with no relation.
Check: "When you found the common denominator for 1/2 + 1/3, what did you
  actually do to 1/2?" If the learner can say "made it equivalent to 2/4" or
  similar: the connection has landed.

**Lesson 18 — End-of-unit assessment** (50 min)
Objective: The learner can demonstrate the three unit outcomes.
Misconception: (Assessment lesson — review the three main errors: adding bottoms,
  single-fraction conversion, and borrowing.)
Check: One question per outcome, completed independently. Record by outcome.
