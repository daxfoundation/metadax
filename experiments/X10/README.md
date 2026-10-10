# X10 — One record, many years

*Cross-course carry-over into the cognitive companion — and the learner can refuse.*

**Status: designed.**

## Question

Can a learner's **companion** carry what they've learned across courses and across
years — so cell biology from last year informs chemistry this year — while the learner
keeps the right to **refuse** any carry-over? If carry-over helps and refusal is
honoured, the companion becomes a durable, learner-owned record that compounds over a
lifetime. If carry-over misfires or can't be refused, it's surveillance, not learning.

## Question for the architecture

Does the unit of compounding scale up from a thread (X01) and a course (X02/X09) to a
*person over time*? This is the longest-horizon compounding test.

## Method

1. Run a learner through course A; build the companion record.
2. Start course B; let the companion propose carry-overs (prior concepts, techniques,
   misconceptions). Script refusals on some.
3. Measure whether honoured carry-overs help, refused ones vanish, and nothing carries
   without consent.

## Measures

- **Carry-over lift:** learner-advance in course B with vs without companion
  carry-over.
- **Refusal integrity:** a refused carry-over never resurfaces or influences B.
- **Relevance:** proposed carry-overs are on-topic, not noise.
- **Record durability:** the companion survives across sessions/years intact.

## Kill line

If a refused carry-over still influences later sessions, or carry-over doesn't help,
the cross-year companion fails its trust and value tests — stop until refusal is
enforceable.

## What compounds

A learner-owned, multi-year cognitive record: the person-level accumulation the whole
architecture aims at. Refusal is what keeps it the learner's, not the system's.

## Dead ends

- Carrying everything by default — noise and a trust break; carry-over is *offered*,
  like X11's negative space, never imposed.
- Storing the companion centrally — contradicts the scale finding that per-learner
  records stay on the learner's device and never centralise.

## What has to exist

| Need | Where today |
|---|---|
| Companion record | `schemas/companion.schema.json` (exercised in scale run) |
| Progress across courses | `schemas/progress.schema.json` |
| Consent / refusal surface | `docs/guide/share.md`, `docs/guide/next-session.md` |
| Per-learner record stays on-device | scale run conclusion (records never centralise) |
| **Cross-course carry-over logic** | **missing** |
| **Refusal record (durable suppression)** | **missing** |

## Simulation-first

**Can be tested now, labelled simulated.** A deterministic harness runs a model
learner through course A, builds a companion, starts course B, proposes carry-overs,
and scripts refusals. A model judge scores relevance and whether refused items leak
into B's turns. This exposes the bottleneck: **can the companion represent carry-over
+ a durable refusal, and does refusal actually suppress downstream influence?**
Lift/relevance/refusal numbers are *simulated*.

**Only real people can show:** whether year-apart carry-over helps a real learner and
whether they trust the companion enough to keep it.

## Depends on / feeds

Builds on **E03** (session) + companion. Refusal shares machinery with **X11**
(offer-never-push). Feeds **X12**.
