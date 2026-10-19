# X03 — The nurse's walkthrough

*A guide-mode profile: stages owned by the guide, the guide with the system, or the system alone — with override records.*

**Status: run 2026-10-18 (SIMULATED). See results/2026-10-18-nurses-walkthrough.md.**

## Question

A nurse building a clinical learning module wants to own some stages herself, hand some to the system, and co-run others with the system. Can a **guide-mode profile** declare, per stage, *who is in charge* — guide / guide+system / system — and can the guide **override** the system mid-stage with the override recorded (not silently applied)? If stage ownership is explicit and overrides are logged, human authority and machine help compose cleanly. If not, the system either steamrolls the guide or can't help at all.

## Question it answers for the architecture

Where does control live, and is it legible? This is the governance question the compounding system needs before anyone trusts it in a real setting.

## Method

1. Author a guide-mode profile for a multi-stage walkthrough, each stage tagged with an owner.
2. Run the walkthrough with a model-played guide and learners. At a system-owned stage, the guide reviews system-generated content and exercises overrides.
3. Measure whether ownership is honoured each stage and whether overrides produce durable override records.

## Measures

- **Stage-ownership fidelity:** each stage driven by its declared owner.
- **Override capture:** every guide override produces a record (who, when, what was overridden, why) and the system yields.
- **No silent substitution:** the system never quietly takes a guide-owned stage.
- **Guide minutes estimated:** time the guide spent in the content-review stage.
- **Unsafe items caught / missed:** evaluator compares override records against known safety issues in the raw content.

## Kill line

If the system cannot reliably yield a guide-owned stage, or overrides are not recorded, guide-mode is not trustworthy — stop until authority is enforceable.

## What compounds

Legible, per-stage authority with an audit trail. Overrides become data: patterns in where guides override the system are a map of where the system is weakest — feeding the bottleneck register directly.

## Dead ends

- A single global "guide mode on/off" flag — too coarse; real sessions mix ownership stage by stage.
- Overrides applied silently — then you can't learn from them and the guide can't trust the record.

## What has to exist

| Need | Where today |
|---|---|
| Tutor turn / session envelope | `schemas/tutor-turn.schema.json`, `prompts/MP-06` |
| Companion record | `schemas/companion.schema.json` |
| Guide-mediated session end-to-end | E03 |
| **Guide-mode profile schema (per-stage ownership)** | `proposed/schemas/guide-mode-profile.schema.json` (X03 run 2026-10-18) |
| **Override record schema** | `proposed/schemas/override-record.schema.json` (X03 run 2026-10-18) |

## Simulation-first

**Run 2026-10-18, labelled SIMULATED.** A deterministic script sequences stages with declared owners; a model-played guide reviews system-generated content; the guide exercises overrides; four model-played learners take the reviewed module; an evaluator subagent checks clinical safety against override records. See `run-2026-10-18/` for scripts, fixtures, and trimmed transcripts.

**Only real people can show:** whether a real guide's override points cluster where the system is genuinely weak, and whether guides feel in control.

## Depends on / feeds

Rides on **E03** + **E04 MP-06**. Override records feed **BOTTLENECKS.md**. Related to **X10** (companion carries the record across years).
