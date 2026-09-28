# E01 -- teacher run 1 (self-hosting Claude Code client)

- Run: experiment E01, run 1, first cut, the teacher path.
- Date: 2026-09-27.
- Subject: "Newton's laws of motion, for an adult returning to physics" (language en).
- Course id: newtons-laws-motion. Author pseudonym: author-sbx01. License CC-BY-4.0.
- Output repo: a private sandbox course repository, final commit fd27fa7.
- Client: claude-code, write_mode git, device_id dev-rr570z. Model: Claude (Anthropic).
- Reviewer role: I (the Claude Code session) was the client; I assembled each
  stack, executed the meta prompt myself, wrote the record, stamped, validated,
  committed and pushed. This is the self-hosting path.

## Result in one line

The self-hosting client works end to end: an empty course repo went to a
7-objective course (course.json + 7 objective nodes + registry) with every
`validate.js course` printing OK, all commits pushed. First saved node at about
8 minutes, whole short course at about 15 minutes. One tool error, worked
around; several doc/skill/schema defects listed below.

## Timeline (step, seconds)

Tool commands are all sub-second; wall clock is dominated by the model executing
the meta prompts (reading each stack, writing one JSON object). Seconds below are
`date +%s` deltas around each shell step; the model-generation gaps are the
remainder of the 908 s total.

| Step | Command / action | seconds |
|------|------------------|---------|
| clone metadax | `git clone .../daxfoundation/metadax.git metadax` | 1 |
| clone sandbox | `git clone .../<your-course-repo>.git sandbox` | 1 |
| read docs | CLAUDE.md, LAYOUT.md, INTERFACE.md, tools/README.md, walkthrough, SKILL.md | (read) |
| device id | `node tools/stamp.js id device` -> dev-rr570z | 0 |
| seed course repo | `cp -r metadax/templates/course-repo/. sandbox/` | 0 |
| commit+push skeleton | `git commit -m "metadax: course repo skeleton"; push` | 3 |
| write config | metadax.config.json | 0 |
| assemble MP-02 | `node tools/assemble.js --op MP-02 ...` | 0 |
| execute ARCHITECT | read stack-1 in full, write out-1.json (course) | (model) |
| write+stamp course | write course.json; `stamp.js course .../course.json` | <1 |
| commit+push course | `git commit -m "metadax: MP-02 course"; push` (1908307) | <1 |
| per node x7 | assemble MP-04, execute, apply, stamp node+registry, validate, commit | (model) |
| first node saved | fede280 pushed | +479 s from start |
| push all | final push to fd27fa7 | <1 |
| whole course done | end epoch | +908 s (~15.1 min) from start |

Start epoch 1790539212, first-node-committed epoch 1790539691 (479 s ~= 8.0 min),
end epoch 1790540120 (908 s ~= 15.1 min).

## Exact commands (representative)

```
git clone https://github.com/daxfoundation/metadax.git metadax
git clone https://github.com/<you>/<your-course-repo>.git sandbox
node tools/stamp.js id device                       # -> dev-rr570z
cp -r metadax/templates/course-repo/. sandbox/      # keep .metadax/bootstrap.txt
# (git user.name / user.email had to be set here -- see WALKTHROUGH DEFECT 1)
git commit -m "metadax: course repo skeleton" && git push origin main

node tools/assemble.js --op MP-02 --course ../sandbox \
  --input "Newton's laws of motion, for an adult returning to physics" \
  --config mode=design --config size=short --config output_mode=json \
  --config language=en --config clarify_round=1 \
  --config client=claude-code --config write_mode=git \
  --prompts prompts --out workspace/stack-1.txt
# read stack-1.txt in full, wrote workspace/out-1.json (one metadax.course/0.2 object)
node tools/stamp.js course ../sandbox/course.json    # NB: file path, not dir (SKILL DEFECT 2)
git commit -m "metadax: MP-02 course" && git push origin main

node tools/assemble.js --op MP-04 --course ../sandbox --node L01.M01.O01 \
  --config mode=generate --config output_mode=json --config math_mode=plain \
  --config author_id=author-sbx01 --config client=claude-code --config write_mode=git \
  --prompts prompts --out workspace/stack-2.txt
# read stack in full, wrote workspace/out-2.json (one metadax.node/0.2 object),
# checked write to nodes/<id>/node.json, appended registry/<module>.json, bumped index
node tools/stamp.js node ../sandbox/nodes/L01.M01.O01/node.json --by author-sbx01 --role author
node tools/stamp.js registry ../sandbox --module L01.M01
node tools/validate.js course ../sandbox              # -> OK
git commit -m "metadax: MP-04 L01.M01.O01" && git push origin main
```

## Stack sizes reported by assemble.js

From `assemble.js`'s own stdout summary `{bytes, tokens_estimate, blocks}`:

- MP-02 (design): bytes 13167, tokens_estimate 3291, blocks [CONFIG, COURSE, INPUT].
- MP-04 (generate, L01.M01.O01): bytes 14452, tokens_estimate 3613,
  blocks [CONFIG, COURSE, LESSON, MODULE, OBJECTIVE, CONCEPTS, LEARNER].
- (Other MP-04 stacks ranged 14130-14613 bytes, 3532-3653 tokens; LEARNER block was
  the literal `none` for this author-only run.)

## Final state of the sandbox repo

`git log --oneline`:

```
fd27fa7 metadax: MP-04 L02.M02.O01
f51c45c metadax: MP-04 L02.M01.O02
b6d9c73 metadax: MP-04 L02.M01.O01
e3a2b50 metadax: MP-04 L01.M02.O02
bca55a3 metadax: MP-04 L01.M02.O01
9a00fa4 metadax: MP-04 L01.M01.O02
fede280 metadax: MP-04 L01.M01.O01
1908307 metadax: MP-02 course
f6ef21f metadax: course repo skeleton
89f0c5c chore: bootstrap access proof
a741fe5 Initial commit
```

`git ls-tree -r --name-only HEAD | wc -l` -> 26.

Final `node tools/validate.js course ../sandbox` -> `OK`. Every per-node validate
(7 of them) printed OK; validate never printed FAIL, so no early stop was
triggered.

## Quality note (read as a returning adult)

I read two nodes end to end: L01.M01.O01 ("Explain net force and inertia") and
L02.M01.O02 ("Calculate acceleration from net force"). Both copied verbatim into
`2026-09-27-sample-nodes.md`.

- Physics correctness: sound. Net force defined as the vector sum; inertia framed
  as resistance to change, not a force; the cup-on-dashboard case correctly says
  no force throws the cup forward -- its inertia carries it while a force slows the
  car. The calculation node's two worked examples are numerically right
  (20 N / 4 kg = 5 m/s^2; net 12 N / 4 kg = 3 m/s^2) and it correctly insists on
  resolving to the net force before dividing. The third-law node (read while
  authoring) correctly warns that weight and the normal force are not an
  action-reaction pair, a genuinely common trap.
- Maths tagging per K-9: CONFIG.math_mode was `plain`, so K-9 requires plain-text
  maths and no LaTeX tags. The nodes use plain text ("a = F / m", "1 N = 1 kg m/s^2",
  "m/s^2") with zero `<!--LATEX-->` markers -- correct for plain mode. (This run did
  not exercise the latex_tags path or the K-9 backslash-doubling rule.)
- Seeds: real, answerable follow-up questions, each pointing a different way
  (deeper / example / connection), e.g. "If the forces are equal, why does the
  bullet fly but the gun barely move?" and "How does the third law relate to
  conservation of momentum?". They read like questions a curious adult would
  actually ask, which is what the seeds are meant to be.
- Fit for the audience: pitched at an adult returning to physics -- algebra but no
  calculus, everyday examples (cars, buses, walking, recoil), misconceptions named
  and corrected. The course steer's exclusions (calculus, torque, relativity) were
  respected.

## Defects found

Note on the Node.js switch: `git log --oneline -3 -- skills docs` showed the sweep
commits (and the S-12 ruling), and I met no leftover `python3 tools/*.py`
lines anywhere in the walkthrough or the skill -- every command was already
`node tools/*.js`. So no Python-vs-Node defect is recorded.

### WALKTHROUGH DEFECT

1. `docs/WALKTHROUGH-CLAUDE-CODE.md` Prerequisites (lines 9-18) and steps 2-3:
   the walkthrough never says the user's `git` identity (`user.name`,
   `user.email`) must be set. The very first commit failed with
   "Author identity unknown ... unable to auto-detect email address". A stranger
   on a fresh machine hits this immediately. Fix: add a prerequisite line to run
   `git config user.name`/`user.email` (a pseudonym; a reserved `.invalid`
   address is fine and keeps no real email in history). Workaround used: set a
   local pseudonymous identity (author-sbx01 @ a .invalid address).
2. Walkthrough steps 2-3 assume a brand-new empty repo (`git init; git remote
   add; push -u`). The sandbox repo already existed as a clone with an initial
   commit (the normal case once a repository has been bootstrapped). The `git init/remote add`
   commands do not apply. Fix: add an "if the repo already exists, just copy the
   template in and commit" branch. Workaround: copied `templates/course-repo/.`
   into the existing clone (preserving `.metadax/bootstrap.txt`) and committed.
3. Walkthrough step 4 and SKILL.md config both show `"model_hint":
   <a model id>"` that is not a real model id. Minor. Fix: say "any model id your
   client accepts". (Fixed since: the walkthrough and the skill now say so.)

### SKILL DEFECT

4. `skills/metadax-teacher/SKILL.md` line 79 (`tools/stamp.js course <course-dir>`)
   and line 98/the node stamp phrasing say to pass a directory, but `stamp.js
   course` requires the `course.json` FILE path. `node tools/stamp.js course
   ../sandbox` failed with `error: EISDIR: illegal operation on a directory,
   read`. The same "<course-dir>"/"<node-dir>" phrasing is echoed in
   `docs/INTERFACE.md` (STAMP section, lines 141 and 228-229). Fix: document the
   file paths, e.g. `tools/stamp.js course <course-dir>/course.json` and
   `tools/stamp.js node <course-dir>/nodes/<id>/node.json`. Workaround: passed the
   file paths; stamping then succeeded and wrote provenance.json. This was the one
   tool error of the run.
5. SKILL.md step 3 says "Create the registry: registry/index.json ... empty
   modules[] to start", but the course-repo template already ships
   `registry/index.json` with a placeholder `course_id: "my-course"`. Nothing
   tells you to correct it to the real course id, and no tool rewrites it. Fix:
   step 3 should say to set `registry/index.json.course_id` to the course's id
   (or have `stamp.js`/`assemble` do it). Workaround: edited course_id to
   newtons-laws-motion before the first module landed.

### TOOL DEFECT

6. There is no `stamp.js` subcommand to stamp a bare `registry/index.json`. The
   usage line is `node|course|profile|snapshot|event|turn|manifest|registry|id`;
   `registry` needs `<course-dir> --module <id>` and stamps a module file (it
   does also re-stamp index.json as a side effect). Before any module exists --
   i.e. at the "metadax: MP-02 course" commit -- `registry/index.json.updated_at`
   is still the literal `"runtime"` (as shipped by the template), yet
   `validate.js course` prints OK. So a committed record carries `"runtime"`,
   which is contrary to K-15's intent. Fix: add `stamp.js index`, or stamp the
   index during the course commit, or ship the template index without
   `updated_at`. Workaround: none needed; the first node's `registry --module`
   stamp bumped the index.
7. `assemble.js` serialises numeric CONFIG values as JSON strings, e.g.
   `"clarify_round":"1"`. The MP-02 prompt treats clarify_round numerically
   ("while CONFIG.clarify_round < 2"). It works by loose comparison here (subject
   and audience were clear, so no clarify round was needed), but the typing is
   wrong. Fix: assemble.js should emit known-numeric config keys as numbers.

### PROMPT / SCHEMA DEFECT

8. Bloom casing mismatch. `schemas/node.schema.json` `bloom` enum is capitalised
   (`Remember`, `Understand`, `Apply`, ...). MP-04 (prompts/MP-04-node-content.md,
   mode generate) says `bloom_level = OBJECTIVE.bloom_target`, and MP-02 objectives
   carry lowercase Bloom verbs (`understand`, `apply`). Following MP-04 literally
   would emit a lowercase `bloom_level` and FAIL node validation. Also inconsistent:
   `validate.js course` accepted the lowercase `bloom_target` inside course.json
   (course schema is lenient) while the node schema is strict. Fix: normalise --
   either MP-02 emits the capitalised enum values, or the schemas accept lowercase,
   or MP-04 says to Title-case the value. Workaround: per K-1 (fix violations before
   output), I wrote the capitalised enum form in each node's `bloom_level`.

## E01 metrics (from the card)

- Steps completed / needed off-script help: all 8 walkthrough steps completed;
  off-script help needed at 4 points -- set git identity (defect 1), repo already
  existed (defect 2), stamp.js course file-vs-dir (defect 4), registry index
  course_id (defect 5); plus the bloom-casing schema fix (defect 8) during CHECK.
- Minutes to first saved node (card: "first saved lesson"): ~8 minutes (479 s).
  Under the 15-minute stop rule.
- Approval dialogs / seconds to first screen: not applicable to this headless
  self-hosting run (no interactive approval dialogs; 0 dialogs).
- HTTP errors (403 / 404 / 422): none. Pushes to the (already-initialised)
  sandbox succeeded; the empty-repo-first-commit case was not exercised because
  the repository already had an initial commit.
- Whether file writes work: yes -- course.json, 7 node.json + provenance.json,
  4 module registries and index.json all written, stamped, validated and pushed.
- Number of tool errors: 1 (stamp.js course EISDIR, defect 4), worked around.
- Whether validate stayed OK: yes -- OK after every node and at the end; never FAIL.
- Content quality: see the quality note above; correct physics, plain-text maths
  per K-9, real seed questions. Not scored on Oak's rubric (not available in this run).

## Honesty / completeness

The run completed: all 7 objectives of the short course were generated, stamped,
validated OK and pushed to fd27fa7. The course was capped at 7 objectives (2
lessons x 2 modules) per the run's short-size instruction. The learner path, the
latex_tags maths path, ARCHITECT `suggest`/`clarify`, and MP-05 follow-ups were
not exercised by this teacher run.
