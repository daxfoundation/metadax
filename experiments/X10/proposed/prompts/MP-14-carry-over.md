# MP-14 -- Carry-Over

> **Operation:** `CARRY` (mode `propose`)
> **New in the suite:** MP-13 serves the guide inside one course. MP-14 serves the
> guide *at the seam between courses* -- the first session of a new course, often a
> new year and a new guide. It reads the learner's **companion record** (the
> compacted view, `metadax.companion/0.2`) and proposes what from earlier courses is
> worth carrying in: prior concepts the new course builds on, techniques that worked,
> and misconceptions to watch for again.
> **Replaces in EdDAX:** nothing. EdDAX forgot everything at a course boundary.
> **Feeds:** the guide's opening (MP-13 `prepare`) and the first MP-05/MP-06 turns.
> **Shares machinery with X11:** carry-over is **offered, never imposed**. The learner
> can refuse any of it, and a refusal is durable (`metadax.refusals/0.2`).

---

## The line this prompt holds

A record that carries everything by default is surveillance, not learning. Carry-over
is an **offer**. Three rules make it the learner's, not the system's:

1. **Refusals are enforced before the model runs, not by it.** The runtime filters the
   companion view against the active refusal set (`metadax.refusals/0.2`) *before*
   assembling this prompt. A concept, course, technique, modality, example-style or
   topic under an `active` refusal with directive `never_carry` or `stop_suggesting`
   **is removed from the input MP-14 ever sees.** The model cannot propose what it was
   never shown. MP-14's job is relevance; suppression is the runtime's job (K-12,
   offer-never-push). This is belt-and-braces: step C restates the rule so a
   manually-driven client that forgot to filter still does no harm.
2. **Offer, never assume taken.** Output is a list of *offers* with a one-line reason
   each. Nothing is marked carried until the learner (or guide on their behalf)
   accepts. The carry-over ledger records `offered` / `accepted` / `declined`.
3. **On-topic only.** An offer must name the concept in the *new* course it bridges to.
   If a prior concept has no bridge, it is not offered -- carrying noise breaks trust
   as surely as carrying a refused item.

---

## Inputs

| Block | Required | Content |
|---|---|---|
| CONFIG | yes | `mode` (`propose`), `output_mode`, `language` |
| COMPANION | yes | the learner's compacted companion view (`metadax.companion/0.2` `view`), **already filtered** by the runtime against the active refusal set. Carries: prior `courses` (concepts + competency + misconceptions), the person-level `competency` map, the `carry_over_ledger`, and `lapses`. |
| REFUSALS | yes | the active refusal set (`metadax.refusals/0.2`), passed in so MP-14 can double-check and so it never re-proposes a `declined`/`suppressed_by_refusal` bridge it sees in the ledger |
| COURSE | yes | the new course being started: its objectives and concepts (so bridges resolve to real targets) |

**Lapse handling.** If COMPANION shows a `lapse` of 90+ days before this course, MP-14
adds a gentle `review` flag to each offered carry-over rather than `advance` -- a
long gap means prior competency is re-checked, not assumed.

---

## Steps

A. **List candidates.** From COMPANION `competency` and each course's `concepts`, take
   every concept with competency >= 50. These are what the learner actually holds.

B. **Bridge to the new course.** For each candidate, decide whether a concept in COURSE
   genuinely builds on it (prerequisite, same technique, or a misconception that will
   recur). Keep only candidates with a real bridge. Name both ends.

C. **Re-check refusals (belt-and-braces).** For each surviving bridge, confirm neither
   end, nor its course, technique, modality or example-style, matches any `active`
   refusal in REFUSALS, and that the `carry_over_ledger` does not already show this
   bridge as `declined` or `suppressed_by_refusal`. Drop any that do. (The runtime
   should already have removed these; this step is the safety net.)

D. **Rank and bound.** Order by bridge strength (prerequisite > shared-technique >
   watch-misconception). Offer at most 6.

E. **Write offers.** Each offer: the prior concept, the new concept it bridges to, the
   bridge kind, a one-line reason in the learner's language, and `review` vs `advance`
   per the lapse rule.

---

## Output

Return exactly one JSON object and nothing after it:

```json
{
  "type": "carry_over_offers",
  "into_course": "<course_id>",
  "offers": [
    {
      "from_course": "<course_id>",
      "from_concept": "<concept-slug>",
      "to_concept": "<concept-slug in the new course>",
      "bridge": "prerequisite | shared-technique | watch-misconception",
      "stance": "advance | review",
      "why": "<one line, in the learner's language>"
    }
  ],
  "not_offered": [
    { "concept": "<concept-slug>", "reason": "no bridge to this course | low competency" }
  ],
  "refused_seen": [ "<refusal_id> ...", "any active refusal relevant to this course, acknowledged and NOT proposed" ],
  "warnings": []
}
```

## Normative contract

1. MP-14 **MUST NOT** output any offer whose `from_concept`, `to_concept`, course,
   technique, modality or example-style matches an `active` refusal in REFUSALS, nor
   any bridge already `declined`/`suppressed_by_refusal` in the ledger.
2. Every offer **MUST** name a `to_concept` that exists in COURSE. No bridge, no offer.
3. Output is **offers**, not actions. The runtime records them in the carry-over ledger
   as `offered`; only the learner's acceptance moves one to `accepted`.
4. If a protected refusal relevant to this course exists, MP-14 **MUST** list its id in
   `refused_seen` so the guide knows the boundary and does not route around it by hand.
