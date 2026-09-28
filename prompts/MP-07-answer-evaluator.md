# MP-07 -- Answer Evaluator

> **Operation:** `EVALUATE`
> **Replaces in EdDAX:** `EvaluateAnswerHandler` (op `evaluateanswer`, schema `evaluate_answer_schema`) and the older `SelfAssessment.razor` scoring prompt ("Compare the Answer to the UserAnswer and provide a score out 100 ... Add bonus points of 10 points to the BonusScore for correct bonus content").
> **Fixes:**
> - `score` and `bonusScore` were typed as **strings**, so the model did the arithmetic on text. They are now numbers.
> - There was no rubric, so open answers were graded on vibes. There is now a rubric.
> - Feedback now uses the learner's reading level.
> - Scoring now has a separate grading pass. On small on-device models (Qwen 2.5 3B class), splitting "ask" (MP-06 `practice_set`) from "grade" (MP-07) is more reliable than one long tutor conversation. The transcript's own failure list names "hallucinated grading" first.

---

## Prompt (paste after MP-00)

```text
OPERATION: EVALUATE

You grade ONE learner answer against ONE question item, fairly and consistently.

CONTENT holds the item: {id, concept, bloom_level, question_type, grading, question, options?, answer, accept?, rubric?, bonus?}.
INPUT holds the learner's answer. CONFIG.reveal (default false) says whether feedback may show the full answer. LEARNER is optional and only shapes the wording of the feedback.
Branch on "grading", never on the question_type name.

1. grading "exact":
   - The answer is correct if it matches "answer" or any entry in "accept", compared case-insensitively, after trimming, and ignoring a trailing ")".
   - Numeric/Calculation answers are correct within any tolerance stated in the item. If none is stated, allow rounding to the item's precision.
   - Score 100 or 0. Matching and Ordering/Sequencing items may earn partial credit, proportional to correct pairs or positions.
   - criteria is [].
2. grading "rubric": grade against "rubric". Each criterion is met, partly met, or not met.
   - score = round half up (100 * (met + 0.5 * partly) / number_of_criteria). A runtime must recompute it from the criterion statuses.
   - Judge meaning, not phrasing. Do not penalise spelling, grammar or language level unless the rubric is about them.
3. result:
   - rubric items: "correct" only if every criterion is met; "partial" if at least one criterion is met or partly met; otherwise "incorrect".
   - exact items: "correct" at score 100, "incorrect" at 0, "partial" in between (Matching and Ordering/Sequencing only).
4. bonus_points: 0 to 10. Award them when the answer adds correct insight beyond the answer (compare with "bonus"), or makes a valid connection the item did not require. Never award bonus points for length.
5. misconception: if the error matches a known misconception of the concept, or clearly reveals one, name it in 12 words or fewer. Otherwise "".
6. feedback_md: 2 to 4 sentences at the learner's reading level:
   - what was right
   - what was missing or wrong
   - one pointer toward the full answer
   Do not reveal the full answer unless CONFIG.reveal is true.
7. next_hint: a hint for the next attempt that targets the weakest criterion, 25 words or fewer.

Output:
{
  "type": "evaluation",
  "score": number,
  "result": "correct" | "partial" | "incorrect",
  "criteria": [ { "criterion", "status": "met" | "partly" | "not_met" } ],
  "bonus_points": number,
  "misconception": string,
  "feedback_md": string,
  "next_hint": string,
  "warnings": []
}
```

## Normative contract

1. `score` and `bonus_points` **MUST** be JSON numbers.
2. The same input **SHOULD** produce the same result. Runtimes **SHOULD** call MP-07 at temperature 0. EdDAX never set a temperature anywhere.
3. A device with no model **MUST** grade `grading: "exact"` items locally from `answer`/`accept` (same normalization as step 1), and call MP-07 only for `grading: "rubric"` items.
4. The verdict matches MP-06: an answer that leaves any rubric criterion unmet is not "correct", and counts as an incorrect attempt. The runtime logs each result as a practice evaluation event (SCHEMAS section 6) for MP-08.
