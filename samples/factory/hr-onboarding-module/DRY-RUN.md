> **model-generated, unreviewed, for illustration**

# Dry run (b): HR onboarding, small organisation

The same factory on a very different context: a workplace onboarding path for a
~20-person organisation. Following **MP-11 → MP-02 → MP-04**. All artifacts are
model-generated and unreviewed.

## The brief

> "Design a short onboarding module for a new hire at a small organisation.
> Cover who we are, where to find things and who to ask, the day-one policies
> everyone must know, and how to set up accounts and tools. Keep it short and
> resumable; each lesson should stand alone."

Context profile: `workplace-hr-training`. Size: `strand`. Modifier:
`low-bandwidth` (the module may be opened on a weak connection in a first week).

## 1. MP-11 → the program tree (`curriculum.json`)

MP-11 `design` produces one `program`, one `course` (`onboarding`), and **three
`lesson` nodes** — *Welcome*, *Finding things and finding people*, and *Day-one
policies* — to lesson level. The `workplace-hr-training` profile sets the short
session length and the "respectful of a busy first week" tone; the
`low-bandwidth` modifier rides along on the program and every hand-off. Privacy:
adults, so no minor floor, but completion records stay out of the course repo.

The `onboarding` course node's `handoff` is a stand-alone brief MP-02 can run
unchanged, with `size: "short"` and `source_policy: "source_first"` (the real
policies are the source of truth).

## 2. The hand-off → MP-02 → the course tree (`course.json`)

MP-02 `design` expands the course, shown scoped to the *Day-one policies* lesson
(`L03`): modules *Code of conduct* and *Handling data safely*, their objectives,
and course-wide `concepts` (`data-handling`, `incident-reporting`,
`code-of-conduct`) grounded in `src:data-policy` and `src:conduct-policy`. Scope
policy is `strict` — a compliance-flavoured course does not wander.

## 3. One objective → MP-04 → node content (`node.json`)

Objective `L03.M02.O01` (*Apply the day-one data-handling rules*) through MP-04
`generate` gives `node.json`: three sections — store it, share it, dispose of it —
each with a concrete everyday situation and a check, grounded in the data policy.
Bloom level `Apply`, because the new hire must *decide what to do*, not just
recall a rule.

## The chain, end to end

```
onboarding brief
   │  MP-11 CURRICULUM (profile: workplace-hr-training, modifier: low-bandwidth)
   ▼
curriculum.json  ──handoff──►  MP-02 ARCHITECT  ──►  course.json
                                                        │ one objective
                                                        ▼  MP-04 CONTENT
                                                     node.json
```

Same four files, same chain as the Biology dry run — only the brief and the
context profile changed. That is the point of the factory: one generic set of
engines, retargeted by a profile, builds a curriculum for anybody in any context.
