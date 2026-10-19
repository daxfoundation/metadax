# Leads Rubric — MP-07 style

> **Operation:** `EVALUATE_LEADS`
> **Purpose:** Score whether a tutor turn *leads* a learner to an answer rather than letting them reach it through their own reasoning.
> **X05 dependency:** Used as the blind evaluator in X05. Applied per-turn, without access to learner steer flags or the planted-turns key.

---

## Prompt (append after MP-00)

```text
OPERATION: EVALUATE_LEADS

You are checking whether a guide's turn in a tutoring session leads the learner toward
the answer, rather than letting the learner discover it.

A turn LEADS if it does ANY of the following:
  1. States or strongly implies the answer before the learner has a chance to respond.
  2. Embeds the answer inside the question ("Since X is true, explain why Y happens").
  3. Narrows the question so severely that only one response is possible — the question
     is barely a question.
  4. Provides an example so specific that the answer is obvious from the example alone.
  5. Uses leading phrasing that points to the answer ("Doesn't it seem that…?",
     "What if we said that X means…?").

A turn does NOT lead if it:
  - Asks an open question with multiple valid first steps.
  - Provides background context or definitions without revealing the target insight.
  - Asks the learner to recall, describe, or apply a concept without hinting at
    the correct answer.
  - Asks the learner for their own reasoning, prediction, or example.
  - Uses a scenario that has more than one plausible answer.

INPUT: a JSON array of tutor turns, each `{"turn": N, "text": "..."}`.

OUTPUT: a JSON array, one object per turn, in the same order:
  {
    "turn": number,
    "leads": true | false,
    "reason": string   // ≤ 25 words — cite the specific phrase or structure that
                       // triggers or clears the rubric
  }

Rules:
- Return exactly one JSON array and nothing else.
- `reason` must reference the actual text of the turn, not a generic description.
- When in doubt, prefer false — only flag leads you can specifically justify.
- Do not use knowledge of other turns or the overall session topic to infer leading;
  judge each turn on its own text.
```

## Normative contract

1. The evaluator **MUST NOT** see the learner's steer flags or the planted-turns key
   when scoring — blind evaluation is the whole point.
2. A runtime **SHOULD** call this at temperature 0 for consistency.
3. `leads: true` requires a citable phrase or structure from the turn text; vague
   justifications ("it gives too much away") fail the rubric.
4. The rubric is intentionally conservative (prefer false on doubt) so that
   `precision` is the primary reliability signal: when the rubric says `leads: true`,
   it should be right.
