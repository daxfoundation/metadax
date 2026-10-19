# X03 result — The nurse's walkthrough
**Date:** 2026-10-18  
**Slug:** nurses-walkthrough  
**Status:** SIMULATED  
**Models:** sonnet (guide), sonnet (learners ×4), sonnet (evaluator)  
**Seeds:** n/a (deterministic fixtures; model-played personas, n=1 each)

---

## Question

Can a guide-mode profile declare per-stage ownership (guide / guide+system / system), and can guide overrides be captured with reasons — not silently applied — so that human authority and machine help compose cleanly?

---

## What ran

**Stage sequence (5 stages, guide-profile.json):**

| Stage | Owner | What happened |
|---|---|---|
| intro | guide | Miriam wrote opening statement |
| content-gen | system | 8 items generated (fixtures/module-raw.json, 4 containing safety issues) |
| content-review | guide+system | Miriam reviewed 8 items; 4 overrides produced |
| delivery | system | Reviewed module delivered to 4 learners |
| closure | guide | Evaluator report reviewed; residual gap surfaced |

**Models / n:** sonnet, n=1 per persona (guide: Miriam; learners: Alex, Jordan, Sam, Taylor; evaluator: 1)  
**Fixtures:** module-raw.json (8 items, 4 intentionally unsafe), guide-profile.json  
**Artefacts:** guide-overrides.jsonl, module-final.json, learner-sessions.jsonl, evaluator-report.json

---

## Numbers

| Measure | Value |
|---|---|
| Items in raw module | 8 |
| Intentionally unsafe items (commission errors) | 3 (W03, W05, W07) |
| Intentionally unsafe items (omission errors) | 1 (W08, missing systemic escalation) |
| Intentionally ambiguous items (W06 threshold) | 1 |
| Guide overrides produced | 4 |
| Overrides with clinical_safety_flag | 4/4 |
| Overrides evaluated valid by evaluator | 4/4 |
| Safety commission errors caught by guide | 3/3 planted (W03, W05, W07), plus 1 unplanted (W06) |
| Safety omission error caught by guide | 0/1 (W08 passed) |
| Guide-estimated review time (SIMULATED) | 25 min |
| Stage-ownership fidelity | 5/5 stages honoured |
| Silent substitution events | 0 |
| Learner mean score (post-override module) | 10/12 = 83.3% |
| Q1 correct (infection escalation) | 4/4 |
| Q2 correct (per-shift documentation) | 4/4 |
| Q3 correct (dressing-free intervals) | 2/4 |
| Module safe to deliver (evaluator verdict) | No — W08 residual gap |

---

## Verdict vs kill line

**PASS — with a significant caveat (module safe to deliver: No; omission error caught 0/1).**

Kill line: "If the system cannot reliably yield a guide-owned stage, or overrides aren't recorded, guide-mode is not trustworthy."

- Stage ownership: honoured in all 5 stages. Guide-owned intro and closure were not taken by the system. ✓
- Override capture: 4/4 overrides recorded with id, timestamp, original content, replacement, action, reason, and clinical_safety_flag. System yielded to every override. ✓
- No silent substitution: 0 events. ✓

The kill line is not triggered. Guide-mode profile + override record compose as designed.

**Caveat:** Override capture only catches what the guide notices. The evaluator found a critical omission in W08 (missing systemic sepsis and evisceration escalation triggers) that Miriam passed. The architecture guards against the system overriding the guide; it does not guard against the guide's own blind spots. This is a new bottleneck (B56), not a kill-line failure.

---

## What compounds

- **Proposed schemas produced:** `guide-mode-profile.schema.json`, `override-record.schema.json` — these are the two items the card listed as "missing." Both are now expressible.
- **Override records are data.** The 4 overrides Miriam produced identify exactly where the generated content was weakest (infection signals, documentation standards, dressing protocols, escalation thresholds). A real run would accumulate these across guides, producing a map of systematic generation errors.
- **Emergent finding:** Miriam also caught a non-obvious escalation-threshold error in W06 ("any two signs") that was not pre-marked unsafe in the fixture — the guide added clinical value beyond the scripted errors.
- **Learner dressing-interval gap:** 2/4 learners answered Q3 incorrectly even after the W07 override corrected the item. The corrected text focuses on prohibition; learners may need a worked example or a prompt that connects "requires physician order" to "go put a new dressing on now." Feeds future content design.

---

## Dead ends kept

- **Single global guide-mode flag** — not pursued; this run confirms it would be useless for a 5-stage session where ownership alternates.
- **Guide edits applied silently** — not pursued; any silent substitution would mean W08's critical gap would be undetectable in the record.

---

## Bottlenecks

See bottlenecks-2026-10-18.md for new rows B56 and B57 and status updates on existing rows.

**B56:** Guide review catches commission errors but is blind to omission errors — W08's missing systemic escalation triggers passed a 25-minute simulated clinical review by a model-played 15-year post-operative nurse (SIMULATED persona).  
**B57:** Guide-mode profile specifies what the system cannot do, but enforcement is the script's responsibility — no structural mechanism prevents a system turn from reintroducing a removed item; the override record is the only audit trail.

---

## Reproduce

```sh
# All fixtures are committed; no network calls needed to reproduce counts.
# To re-run model-played personas:
# Guide review:
#   Input: run-2026-10-18/fixtures/module-raw.json + run-2026-10-18/fixtures/guide-profile.json
#   Prompt: see run-2026-10-18/scripts/run-guide.sh
# Learners:
#   Input: run-2026-10-18/fixtures/module-final.json
#   Prompt: see run-2026-10-18/scripts/run-learners.sh
# Evaluator:
#   Input: run-2026-10-18/fixtures/guide-overrides.jsonl + module-final.json
#   Prompt: see run-2026-10-18/scripts/run-evaluator.sh
# Model: sonnet (claude-sonnet-4-6)
```
