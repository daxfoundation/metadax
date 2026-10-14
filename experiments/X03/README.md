# X03 — The nurse's walkthrough

*A teacher-mode profile: stages owned by the teacher, the teacher with a companion, or the system — with override records.*

**Status: designed.**

## Question

A nurse teaching a clinical procedure wants to own some stages herself, hand some to
the system, and co-run others with a companion. Can a **teacher-mode profile** declare,
per stage, *who is in charge* — teacher / teacher+companion / system — and can the
teacher **override** the system mid-stage with the override recorded (not silently
applied)? If roles are explicit and overrides are logged, human authority and machine
help compose cleanly. If not, the system either steamrolls the teacher or can't help
at all.

## Question it answers for the architecture

Where does control live, and is it legible? This is the governance question the
compounding system needs before anyone trusts it in a real classroom.

## Method

1. Author a teacher-mode profile for a multi-stage walkthrough, each stage tagged with
   an owner.
2. Run the walkthrough with a model-played teacher and learner. At a system-owned
   stage, script a teacher override.
3. Measure whether ownership is honoured each stage and whether the override produces
   a durable override record.

## Measures

- **Role fidelity:** each stage driven by its declared owner.
- **Override capture:** every teacher override produces a record (who, when, what was
  overridden, why) and the system yields.
- **No silent substitution:** the system never quietly takes a teacher-owned stage.

## Kill line

If the system cannot reliably yield a teacher-owned stage, or overrides aren't
recorded, teacher-mode is not trustworthy — stop until authority is enforceable.

## What compounds

Legible, per-stage authority with an audit trail. Overrides become data: patterns in
where teachers override the system are a map of where the system is weakest — feeding
the bottleneck register directly.

## Dead ends

- A single global "teacher mode on/off" flag — too coarse; real sessions mix owners
  stage by stage.
- Overrides applied silently — then you can't learn from them and the teacher can't
  trust the record.

## What has to exist

| Need | Where today |
|---|---|
| Tutor turn / session envelope | `schemas/tutor-turn.schema.json`, `prompts/MP-06` (E04 run 2: intro/feedback/handoff/summary all pass) |
| Companion record | `schemas/companion.schema.json` (used in scale run) |
| Parent-mediated session end-to-end | E03 (ran once, 2026-09-27) |
| **Teacher-mode profile schema (per-stage owner)** | **missing** |
| **Override record schema** | **missing** |

## Simulation-first

**Can be tested now, labelled simulated.** A deterministic script sequences stages
with declared owners; a model-played teacher and system run them; the script injects a
scripted override at a system-owned stage. This exposes the bottleneck: **can the
turn/session envelope even express per-stage ownership and a yielding override, or does
the current single-driver model assume the system is always in charge?** Role-fidelity
and override-capture counts are *simulated*.

**Only real people can show:** whether a real teacher's override points cluster where
the system is genuinely weak, and whether teachers feel in control.

## Depends on / feeds

Rides on **E03** + **E04 MP-06**. Override records feed **BOTTLENECKS.md**. Related to
**X10** (companion carries the record across years).
