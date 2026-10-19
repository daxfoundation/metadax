# MP-05 Output Section — Enum Enforcement Patch

**Why:** E05 run (2026-10-18, SIMULATED) found 10/60 sonnet responses used non-standard
`decision` values (`"match"`, `"route"`, `"create"`) and 8/60 used non-numeric `confidence`
values (`"high"`). These pass JSON.parse but fail schema validation and would be silently
dropped by a strict runtime. See bottleneck B31.

**Change to apply:** In the Output block of MP-05 (the block starting "Output (json mode):"),
replace the decision field line:

```
  "decision": "new" | "extend" | "reuse" | "ancestor" | "redirect" | null,
```

with:

```
  "decision": "new" | "extend" | "reuse" | "ancestor" | "redirect" | null,
```
(unchanged enum) AND add immediately after the closing `}` of the output schema, before the
bullet-point notes, this enforcement reminder:

---
**Output contract — enforced at parse time:**
- `decision` MUST be exactly one of the five strings listed (`new`, `extend`, `reuse`,
  `ancestor`, `redirect`) or `null`. Never use synonyms: `"create"` is invalid, `"route"` is
  invalid, `"match"` is invalid.
- `confidence` MUST be a decimal number between 0.0 and 1.0 inclusive. Never use strings
  such as `"high"` or `"low"`.
- A response that uses any other value for `decision` or a non-number for `confidence`
  will be rejected by the runtime stamping step and the node will not be persisted.
---

**File to change:** `prompts/MP-05-followup-engine.md` in the metadax repo.
The change is additive (one enforcement paragraph) and does not alter the decision logic.
