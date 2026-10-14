# X08 — Behind the company wall

*Private deployment, an organisational declaration, an outward gate.*

**Status: designed.**

## Question

Can an organisation run the system **privately** — its own nodes, its own learners,
behind its wall — declare *as an organisation* what it will and won't share, and have
an **outward gate** that lets selected contributions flow to the public library while
keeping everything else in? If the gate holds, private and public knowledge compound
together without the private side leaking. If it leaks, no organisation will adopt it,
and the public library loses their contributions entirely.

## Method

1. Stand up a private registry with a mix of shareable and private-only nodes.
2. Attach an organisational declaration (what may leave the wall).
3. Run learner threads, some touching private nodes; attempt outward share.
4. Measure what crosses the gate vs the declaration, and whether private content ever
   leaks (e.g. via a follow-up that cites a private ancestor).

## Measures

- **Gate fidelity:** only declaration-permitted nodes leave; zero private leaks.
- **Private-branch containment:** a follow-up about a private branch never reveals it
  outward (the MP-05 private-branch case is the seed).
- **Shared value:** permitted contributions compose into the public library (ties to
  X02).

## Kill line

If any private content crosses the gate against the declaration — even once via an
indirect citation — the gate is unsafe; stop until containment is provable.

## What compounds

Trustworthy private↔public boundary: organisations contribute outward without
exposing inward. This is how a decentralised library grows past hobbyists to
institutions.

## Dead ends

- A per-node "private" flag with no org-level declaration — too easy to misset; the
  declaration is the backstop.
- An outward gate that inspects only the node being shared, not its *ancestry* — a
  public node with a private parent can leak the parent via citation.

## What has to exist

| Need | Where today |
|---|---|
| Private-branch question handling | demonstrated — `evals/cases/MP-05/private-branch-question` (E05 run: decision `new`, no registry leak ✅) |
| `parent_id` ancestry (to check what a share exposes) | **v0.3** — `schemas/node.schema.json`, `tools/path.js` |
| Provenance (what came from where) | `schemas/provenance.schema.json` |
| **Organisational declaration schema** | **missing** |
| **Outward gate (ancestry-aware share filter)** | **missing** |

## Simulation-first

**Can be tested now, labelled simulated.** A deterministic harness builds a private
registry with planted private ancestors, runs model learners (including the MP-05
private-branch trap), and attempts outward shares through a prototype gate. This
exposes the bottleneck: **can a gate decide shareability from ancestry + declaration
alone, and do adversarial follow-ups leak a private ancestor?** Leak counts are
*simulated* but a single simulated leak is already a real design signal.

**Only real people can show:** whether a real organisation's declaration matches its
actual policy, and whether staff trust the wall.

## Depends on / feeds

Builds on **E05** (private-branch) and **v0.3**. Feeds **X02** (what crosses the gate
enters federation) and **X09** (declarations are Constraint-Protocol kin).
