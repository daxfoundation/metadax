# Walkthrough: MetaDAX on Claude Code (git-native)

A step-by-step for a person, teacher then learner, on the Claude Code client.
Every command is exact. Where a `tools/` command is shown, it is the tool this
client calls; if the tool is not present in your clone yet, run the step's
`run:` line when it lands (the tools are `tools/assemble.js`, `stamp.js`,
`validate.js`, `apply_packet.js`, `path.js`).

## Prerequisites

- `git` and Node >= 18 on your machine.
- Claude Code installed.
- A GitHub account, and two repositories you can push to: a course repo and a
  private learner repo.
- A credential `git` can use to push, held by git, never in any repo file:
  either a fine-grained Personal Access Token with Contents read/write on your
  two repos, stored in git's credential helper, or `gh auth login`. Do not put a
  token in `metadax.config.json` or any tracked file.
- A git identity that is a pseudonym, not a real email. Set it before you commit:

  ```
  run: git config user.name "<pseudonym>"
  run: git config user.email "<pseudonym>@users.noreply.github.com"
  ```

  A `users.noreply.github.com` or `.invalid` address is fine; never put a real
  email address in a course repo (it is public-shareable and cannot be unshared).

## 1. Clone the foundation repo

```
git clone https://github.com/daxfoundation/metadax.git
cd metadax
```

This holds the prompts, schemas, tools and the two skills. Open this folder in
Claude Code so it finds `.claude/skills/`.

## 2. Create a course repo

Create an empty repo on GitHub (private by default; public is a deliberate,
irreversible step). Then, from a template:

```
run: cp -r templates/course-repo/* /path/to/your-course-repo/
cd /path/to/your-course-repo && git init && git add . && \
  git commit -m "metadax: course repo skeleton" && \
  git remote add origin https://github.com/<you>/<course-repo>.git && \
  git push -u origin main
```

If the repo already exists (you created it with a README, or you are adding
MetaDAX to a repo you already have), do not `git init`; copy the template in and
commit on the existing history:

```
run: cp -rn templates/course-repo/* /path/to/your-course-repo/
cd /path/to/your-course-repo && git pull --rebase && git add . && \
  git commit -m "metadax: course repo skeleton" && git push
```

(`cp -rn` will not clobber files the repo already has.)

Or use the fixture course `fixtures/courses/cell-biology-obsidian` as a starting
point.

## 3. Create a private learner repo

```
run: cp -r templates/learner-repo/* /path/to/your-learner-repo/
cd /path/to/your-learner-repo && git init && git add . && \
  git commit -m "metadax: learner repo skeleton" && \
  git remote add origin https://github.com/<you>/<learner-repo>.git && \
  git push -u origin main
```

Keep this repo private. It holds a profile, progress, sessions and private
nodes, and never a name, age, school or any secret.

## 4. Write metadax.config.json

In the working folder where you run Claude Code, create `metadax.config.json`
(it is gitignored; it is the client's only state). No token goes in it.

```json
{
  "course_repo": "/path/to/your-course-repo",
  "learner_repo": "/path/to/your-learner-repo",
  "client": "claude-code",
  "write_mode": "git",
  "author": "your-pseudonym",
  "model_hint": "any model id your client accepts (e.g. the one `claude` reports)"
}
```

The learner skill adds `learner_id` and `device_id` for you on first run.

## 5. Build a course (teacher skill)

In Claude Code, in the metadax clone, ask:

> make me a short course on cell biology

The metadax-teacher skill runs. It reads the config, runs ARCHITECT `design`
(one clarify round at most, `size: short` by default), writes `course.json`,
creates `registry/index.json`, stamps and commits, then generates one node per
depth-1 objective, stamping and validating after every 3 nodes, and pushes. When
it finishes it tells you what to open.

Under the hood each step is: assemble a stack file, execute the meta prompt
(you, the model, read the stack and write one JSON object), check it, write it,
stamp with `tools/stamp.js`, validate with `tools/validate.js`, commit
`metadax: <op> <id>`, push.

## 6. Learn (learner skill)

Ask:

> start learning

The metadax-learner skill runs the age wall first (Phase 1 is adults-only), then
creates your adult profile if you have none, and opens the first node. Then you
type:

- `learn <objective-id>` -- read a node, one section per screen.
- `ask: how does ATP store the energy?` -- a follow-up; a new private or shared
  node, a reuse, or a redirect.
- `quiz` -- a Bloom quiz; each turn and answer is saved.
- `seed` -- follow one of the node's suggested questions.
- `back` -- go up to the parent node.
- `save` or `done` -- write a progress snapshot, save the session, push.

## 7. What files appear where

Course repo (shared and pending nodes only):

```
course.json
registry/index.json
registry/<module-id>.json
nodes/<id>/node.json
nodes/<id>/provenance.json
nodes/<id>/renderings/<audience-key>.md   (non-interest renderings only)
```

Learner repo (private, yours):

```
learners/<id>/profile.json
learners/<id>/progress/<course-id>/<device-id>/<YYYY-MM-DD>.json
learners/<id>/sessions/<sid>/event-0001.json ...
learners/<id>/sessions/<sid>/turn-0001.json ...
learners/<id>/nodes/<id>/node.json          (private follow-ups)
learners/<id>/manifests/<YYYY>-W<WW>.json
```

## 8. Verify

```
run: node tools/validate.js course /path/to/your-course-repo
run: node tools/validate.js learner /path/to/your-learner-repo --course /path/to/your-course-repo
```

Both should report no errors. `validate.js course` also lists any objective with
no node yet, which is how the teacher skill resumes a half-built course.

When your course or learner repo is a separate checkout (outside this `metadax`
tree), it has no `schemas/` of its own, so `validate.js` prints
`WARN: schema validation skipped (no schemas/ found; pass --schemas <dir>)`. To
run the schema checks too, point it at this clone's schemas:

```
run: node tools/validate.js course /path/to/your-course-repo --schemas /path/to/metadax/schemas
```

## 9. Reset

To start over, delete the contents of the two repos (keep the skeletons from the
templates) and delete `metadax.config.json`; nothing else holds state.

---

Status: exercised by the first end-to-end runs of experiments E01 and E03; their results
are in `experiments/E01/results/` and `experiments/E03/results/`.
