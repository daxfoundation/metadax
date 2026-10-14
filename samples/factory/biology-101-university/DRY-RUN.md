> **model-generated, unreviewed, for illustration**

# Dry run (a): Biology 101, university

A worked pass of the curriculum factory on a real-shaped brief, following
**MP-11 CURRICULUM** → **MP-02 ARCHITECT** → **MP-04 CONTENT**. Every artifact
here is model-generated and unreviewed; it exists to show how the layers chain,
not as course material.

## The brief

> "We run a 13-week first-year university Biology 101. Design the whole course —
> every lesson — for students with no college chemistry. Lectures are 50 minutes,
> twice a week."

Context profile: `higher-education`. Size: `strand` (one course). No modifiers.

## 1. MP-11 → the program tree (`curriculum.json`)

MP-11 `design` produces `curriculum.json` (`metadax.curriculum/0.3`): one
`program` node, one `course` node, and **13 `lesson` nodes** — the full tree *to
lesson level*, which is MP-11's planning floor. Each lesson carries its sequence,
its one-week time budget, and a prerequisite on the week before it. The program's
13-week budget equals the sum of the 13 lesson-weeks.

MP-11 stops at the lesson and hands the **inside** of the course to MP-02 through
the course node's `handoff` record. The hand-off's `input` is a *self-contained*
brief — MP-02 can run `design` on that string alone, with no other block — which
is what "consumable unchanged" means. The hand-off also fixes `size: "full"`,
the audience bands, the source policy, and the `higher-education` profile.

## 2. The hand-off → MP-02 → the course tree (`course.json`)

Feed `curriculum.json`'s `biology-101` hand-off to MP-02 as its `INPUT`/`CONFIG`.
MP-02 `design` expands the course into the suite's own tree —
**course → lesson → module → objective** — exactly as SCHEMAS section 2 defines.
`course.json` here shows that expansion **scoped to one lesson**, week 6
(*Cellular respiration*): two modules (*Glycolysis overview*, *The mitochondrion
and ATP*) and their objectives, plus the course-wide `concepts` with Bloom
targets and misconceptions that MP-06 will quiz against. The other 12 lessons
expand the same way; only L06 is shown to keep the file small.

Note the id continuity: the curriculum's `biology-101/L06` becomes MP-02's `L06`
inside `course.json` — strip the `biology-101/` prefix and the ids already match,
so nothing has to be renamed on the way down.

## 3. One objective → MP-04 → node content (`node.json`)

Take objective `L06.M02.O01` (*Explain how the mitochondrion makes ATP*) and run
MP-04 `generate`. `node.json` (`metadax.node/0.3`) is the shared, audience-neutral
`core`: three sections with stable `s1..s3` ids and per-section checks, key
points, a bridge to the parent, and three follow-up `seeds`. A learner's reading
level and interests would be applied later by MP-04 `render`, never baked into
this shared core (design law 2).

## The chain, end to end

```
program brief
   │  MP-11 CURRICULUM (profile: higher-education)
   ▼
curriculum.json  ──handoff──►  MP-02 ARCHITECT  ──►  course.json
                                                        │ one objective
                                                        ▼  MP-04 CONTENT
                                                     node.json
```

MP-12 BUILD is what would drive steps 2 and 3 across all 13 lessons in order
(prerequisites first), reusing anything already in the library and gating each
new node through MP-09 before it is marked done.
