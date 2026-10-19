Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# X10 — proposed changes

New and changed artifacts that X10 (one record, many years) needs. Paths mirror the
metadax repo. Nothing here is pushed to that repo; it is a proposal exercised by the
X10 simulation run (`../run-2026-10-18/`).

| File | New/changed | Why |
|---|---|---|
| `schemas/companion.schema.json` | **new** | The learner-owned record that spans courses/years. Modelled as an **append log** (read-only source) plus a derived **compacted view** — the B03 fix ("append log that is compacted the way PATH is compacted; shrink the view, keep the source"). Refusals are a protected section of both. The card listed the companion record as existing in the scale run but there was no schema file; this is it. |
| `schemas/refusal.schema.json` | **new** | The durable refusal set — the standing "never show me X / stop suggesting Y" directives, as a protected projection of the companion log. A separate file because every engine (not just the companion) must read and honour it. Directives: `never_show`, `stop_suggesting`, `never_carry`; scopes: concept/course/technique/topic/modality/example-style. Fills the card's "Refusal record (durable suppression) — missing". |
| `prompts/MP-14-carry-over.md` | **new** | The `CARRY` operation: at a course seam, read the compacted companion view (already refusal-filtered by the runtime) and the new course, and **offer** on-topic carry-overs. Fills the card's "Cross-course carry-over logic — missing". Next free MP number after MP-13. |
| `tools/compact-record.js` | **new** | Zero-dependency reference compactor for B03: folds each (year, course)'s many sessions into one bounded summary, builds the person-level competency map and carry-over ledger, and **carries every active refusal forward verbatim** (asserts the invariant; refuses to drop a refusal). Records a `dropped` list so lost context is traceable. The harness uses this exact file. |
| `docs/guide/carry-over.md` | **new** | Learner-facing explanation: what carries over, that it is offered-never-imposed and on-topic-only, and how to issue a durable refusal that survives new years and new guides. Sits beside `docs/guide/next-session.md` and `share.md` as the consent/refusal surface the card points to. |

## Design decisions worth flagging

- **Suppression is the runtime's job, relevance is the model's.** MP-14 never sees a
  refused item; the runtime filters the view against the refusal set before assembling
  the prompt. MP-14 re-checks as a belt-and-braces safety net (helps manual clients).
  This is the same offer-never-push split X11 uses.
- **Refusals never auto-expire and are never inferred.** Only an explicit withdrawal
  (same `refusal_id`, `status: withdrawn`) removes one. Compaction asserts every active
  refusal is still present in the view, and throws rather than drop one.
- **The record never centralises.** Companion carries `device_id`; the schema `$id`s are
  under the public schema host for validation only — the instance lives on-device.
