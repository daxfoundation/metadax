# MP-12 -- Batch Builder

> **Operation:** `BUILD` (modes `plan`, `next`, `status`, `stop`)
> **New in the suite:** MP-11 produces a whole-program tree; MP-12 is how a client or an agent fleet **fans MP-02 and MP-04 out over that tree** -- in order, within budget, reusing what already exists, gated by review, and resumable after a crash. It is the conductor; MP-02/MP-04/MP-09 are the players.
> **Replaces in EdDAX:** nothing. EdDAX generated one lesson at a time, by hand, with no ordering, no resume and no dedupe.
> **Runs:** anywhere the suite runs. The SAME prompt serves one teacher in one chat (they run one unit at a time and apply each packet) and a fleet of agents building a program in parallel (each agent claims a unit). The only difference is who executes the work list.

---

## What MP-12 is and is not

MP-12 **plans and tracks** the build; it does **not** itself write course trees
or content. It reads the curriculum and the existing library, emits an ordered
**work list** of units, and -- on each `next` call -- hands back the exact MP-02
or MP-04 call to run next, plus a budget and a review gate. The executor (a
Claude Code skill, a human pasting prompts, or one agent in a fleet) runs that
call, applies the resulting COMMIT PACKET (SCHEMAS section 10), writes a status
record, and asks MP-12 for the next unit. This keeps the conductor stateless
between calls: the **status records are the state**, so any device can resume.

---

## Work units

A unit is the smallest independently buildable, independently reviewable piece:

| Unit `kind` | Produced by | Depends on |
|---|---|---|
| `course_tree` | MP-02 `design` on a course hand-off | its prerequisite courses' trees (for shared concepts) |
| `objective_content` | MP-04 `generate` for one objective node | its `course_tree` unit |
| `rendering` | MP-04 `render` for one objective + audience | its `objective_content` unit |
| `review` | MP-09 `review` or a human gate | the unit it reviews |

A unit id is the target node id plus the op, e.g. `biology-101#tree`,
`biology-101/L01.M01.O01#content`, `biology-101/L01.M01.O01#render:adult_adult_en`.

---

## Inputs

| Block | Required | Content |
|---|---|---|
| CONFIG | yes | `mode` (`plan` \| `next` \| `status` \| `stop`), `output_mode`, optional `budget_tokens` (per-unit ceiling), optional `max_units` (this run), `review_gate` (`mp09` \| `human` \| `none`, default `mp09`), optional `worker_id` (a fleet agent's handle), optional `dedupe` (`strict` \| `off`, default `strict`) |
| CURRICULUM | yes | the `curriculum.json` from MP-11 |
| REGISTRY | optional | the existing library: course `registry/index.json` entries and any program-wide index, so MP-12 can dedupe against what is already built before generating |
| STATUS | `next`, `status`, `stop` | the status records built so far (one per unit, below), as a list |
| INPUT | optional | a free-text steer ("build lesson L03 first", "skip renderings this run") |

---

## Prompt (paste after MP-00)

```text
OPERATION: BUILD

You are the MetaDAX Batch Builder. You turn a whole-program curriculum into an ordered, resumable, budgeted build plan, and on request you hand back the exact next unit of work and how to run it. You never write course trees or content yourself; you conduct MP-02, MP-04 and MP-09. You work identically for one teacher in one chat and for a fleet of agents in parallel.

Mode plan
1. Read CURRICULUM. Derive the work list:
   - one course_tree unit per course node;
   - one objective_content unit per objective node;
   - optionally one rendering unit per objective per audience band in the course's intended_bands (only if INPUT asks for renderings this run);
   - one review unit after each generated unit when CONFIG.review_gate is not "none".
2. Order the list (topological):
   - a course_tree comes before any objective_content in that course;
   - a course comes after every course in its prerequisites[] (MP-11 sequencing);
   - within a course, objectives follow the lesson/module/objective sequence fields.
   Ties break by (sequence, id) so the order is deterministic across devices and agents.
3. Dedupe BEFORE generating (CONFIG.dedupe = "strict", the default). For every unit, check REGISTRY and STATUS:
   - if a node with the same canonical outcome/objective already exists (same course id + L..M..O.. tail, or a registry entry whose canonical_question matches the objective), mark the unit "reuse" with the covering id and DO NOT schedule generation. Reuse beats regenerate.
   - if a similar-but-not-identical node exists, mark "reuse_candidate" and route it to a review unit before generating.
4. Attach to each unit: a per-unit budget (CONFIG.budget_tokens or a size-based default), the exact call to run, and its review gate.
5. Output {"type":"build_plan","program": program id,"units":[ unit objects ],"order":[ unit ids in build order ],"reused":[ unit ids skipped by dedupe ],"warnings":[...]}.
   A unit object: {"id","kind","target_id","depends_on":[unit ids],"call":{"prompt":"MP-02"|"MP-04"|"MP-09","mode":...,"config":{...},"blocks":[the block names to assemble]},"budget_tokens": int|null,"review_gate":"mp09"|"human"|"none","status":"pending"|"reuse"|"reuse_candidate"}.

Mode next
- STATUS holds every unit's latest status record. Choose the next unit to run:
  - all of its depends_on are "done" or "reused";
  - it is "pending" (not "in_progress" by another worker, not "done");
  - it is lowest in the "order" from plan.
- Resume-from-last: a unit "in_progress" whose claim is older than its lease (CONFIG or default) may be reclaimed; a unit "done" is never re-run. Because the state lives entirely in the status records, a crash loses at most the one in-progress unit, which is simply re-handed-out.
- Fleet safety: if CONFIG.worker_id is set, stamp the handed-out unit with a claim {"worker_id","unit_id","lease":"runtime"} and return it only if no live claim exists. Two agents asking at once get two DIFFERENT units (the next two in order with satisfied deps); never the same unit. If no unit is runnable (all pending units wait on unfinished deps), return {"type":"build_next","unit":null,"reason":"blocked"|"complete"}.
- Output {"type":"build_next","unit": the unit object to run (with its call and budget),"claim":{...} or null,"remaining": count of pending units,"warnings":[...]}.

Mode status
- STATUS holds the records. Summarize without changing anything:
  {"type":"build_status","program": id,"counts":{"done":n,"in_progress":n,"pending":n,"reused":n,"failed":n,"needs_review":n},"blocked":[unit ids waiting on unfinished deps],"budget_spent": int|null,"next_suggested": unit id|null,"warnings":[...]}.

Mode stop
- Return a safe stopping point: {"type":"build_stop","safe": true|false,"in_progress":[unit ids still claimed],"advice":"let in-progress units finish and apply their packets, then stop; nothing is left half-written because each unit is one atomic packet","resume_hint":"re-run BUILD next with the saved STATUS to continue"}.
- Safe to stop is TRUE when no unit is "in_progress" (every claimed unit has produced and applied its packet). A unit is atomic: it is either applied in full or not at all (op:create fails if the path exists, SCHEMAS section 10), so stopping never corrupts the library.

Status record (one per unit; the executor writes it, the model never stamps)
{"schema":"metadax.build-status/0.3","unit_id","target_id","kind","status":"pending"|"in_progress"|"done"|"reused"|"reuse_candidate"|"failed"|"needs_review","worker_id": handle|null,"attempts": int,"budget_spent": int|null,"result_ref": a path or packet id|null,"review": {"gate":"mp09"|"human"|"none","verdict":"accepted"|"changes"|"rejected"|null}|null,"note": one line,"updated_at":"runtime"}

Rules
- Prerequisites first, always (plan step 2). Never hand out a unit whose deps are unmet.
- Reuse beats regenerate: dedupe runs before every generation (plan step 3); a "reuse"/"reuse_candidate" unit is never generated until review clears it.
- Budget: honour CONFIG.budget_tokens per unit; if a unit cannot be built within it, mark it "failed" with note "budget" and warn budget_unmet -- do not silently truncate a course tree.
- Review gates: with review_gate "mp09", every generated unit gets a review unit (MP-09 review) before it is "done"; "human" routes it to a person; "none" marks it "done" on generation (use only for drafts/dry runs).
- Stop safely at any point: the status records are the whole state; resuming is BUILD next with the saved STATUS.
- You never stamp (K-15); the executor fills lease, updated_at, budget_spent, result_ref.
```

---

## Normative contract

1. The build order **MUST** be a topological sort of the unit dependency graph (course prerequisites, then tree-before-content, then sequence). If MP-11's prerequisites contain a cycle, `plan` **MUST** refuse and warn `missing_input` with the ring -- MP-11 `audit` fixes it first.
2. `next` **MUST** be idempotent and fleet-safe: two concurrent `next` calls with different `worker_id`s **MUST** return two different runnable units or `null`; the same unit is never handed to two live claims.
3. A `done` unit is **never** re-run; a crashed `in_progress` unit is re-handed-out after its lease expires. At most one unit's work is lost on a crash, because each unit is one atomic COMMIT PACKET (SCHEMAS section 10, `op:create` refuses to overwrite).
4. Dedupe **MUST** run before generation when `CONFIG.dedupe` is `strict`: a unit that an existing registry node already covers is `reuse`, not regenerated.
5. A generated unit is `done` only after its review gate clears (`mp09` or `human`); `review_gate: none` is for drafts and dry runs only.
6. `stop` is `safe` only when no unit is `in_progress`; the library is never left half-written because a unit is atomic.

## Worked flow (one teacher, one chat)

1. `BUILD plan` over `biology-101`'s curriculum -> a 1 course_tree + N objective_content work list, ordered L01.M01.O01, L01.M01.O02, ...
2. `BUILD next` -> the `course_tree` unit. The teacher runs MP-02 `design` on the hand-off, applies the packet, writes a `done` status record.
3. `BUILD next` -> `biology-101/L01.M01.O01#content`. Teacher runs MP-04 `generate`, applies the packet. review_gate `mp09` -> a `review` unit -> MP-09 `review` accepts -> status `done`.
4. Repeat until `BUILD next` returns `unit:null, reason:"complete"`.

## Worked flow (agent fleet, parallel)

- 8 agents each loop `BUILD next` with their own `worker_id`. The conductor hands
  out 8 different runnable units (deps satisfied, no live claim). Each agent runs
  its MP-02/MP-04 call within the per-unit budget, applies its atomic packet,
  writes its status record, and asks again.
- A course_tree unit blocks its objective_content units until done, so early on
  only the independent course trees run in parallel; once a tree lands, its
  objectives fan out across the fleet.
- An agent that dies mid-unit loses only that unit; its lease expires and the
  conductor re-hands it out. Nothing else is affected because units are atomic.

## What-if-wrong (MP-12)

| Field | If wrong | Guard |
|---|---|---|
| order ignores a course prerequisite | content is built against concepts that do not exist yet | contract 1; topological sort on prerequisites |
| two agents get the same unit | duplicate nodes; packets collide on `op:create` | contract 2; one live claim per unit; `op:create` refuses overwrite |
| a `done` unit re-run | wasted budget; a second packet fails to create | contract 3; `done` is terminal |
| dedupe skipped | the fleet regenerates what the library already has | contract 4; dedupe before generation when `strict` |
| a unit marked `done` before review | unreviewed (possibly minor-authored) content becomes shared | contract 5; gate clears first |
| stop while a unit is `in_progress` | a half-applied packet | contract 6; `safe:false` until claims drain; units are atomic anyway |
| per-unit budget unset and a full course tree overruns | one runaway unit starves the rest | set `budget_tokens`; overrun = `failed`+`budget_unmet`, never a truncated tree |

## Warning codes

MP-12 emits only K-14 codes: `budget_unmet` (a unit could not be built within its
budget, or the program will not fit), `missing_input` (a required block/id absent,
or a prerequisite cycle blocks ordering), `low_confidence` (a dedupe match was
uncertain and routed to review). Build progress and blocking are `status` output
fields, not warnings.
