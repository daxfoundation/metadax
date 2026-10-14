# Meta DAX Agent Skills

Three Agent Skills. Two turn a model client into a git-native Meta DAX client
with nothing but `git`, `node` and the user's existing GitHub credential; the
third is a parent-run homeschool client that needs no repo at all.

- **metadax-teacher** -- an adult creates or extends a course into a GitHub
  course repo (ARCHITECT + CONTENT). See `metadax-teacher/SKILL.md`.
- **metadax-learner** -- an adult learner reads a node, asks recursive
  follow-ups, quizzes, and saves progress to a private learner repo (FOLLOWUP,
  TUTOR, EVALUATE, STEWARD). See `metadax-learner/SKILL.md`.
- **metadax-homeschool** -- a parent builds a homeschool lesson package for a
  child on their own AI subscription: it interviews them, builds the package (a
  guide page and a learner page) from the shared homeschool format, validates it
  with a bundled zero-dependency checker, and offers a generic shareable sample.
  Carries its own templates, validator and an equivalent plain prompt. See
  `metadax-homeschool/SKILL.md`.

Each skill is one `SKILL.md` in the Agent Skills format: YAML frontmatter
(`name`, `description`) then a Markdown body. The `description` says when to use
the skill so a client can pick it.

## How clients find them

- **Claude Code** reads skills from `.claude/skills/`. This repo carries
  byte-identical copies of both skills there.
- **Other agents** (Codex and any agent on the same `SKILL.md` standard) read
  from `.agents/skills/`. Byte-identical copies live there too.

The canonical source is this `skills/` tree. The `.claude/skills/` and
`.agents/skills/` copies are plain files, not symlinks, and must stay
byte-identical to the source. The tests assert this with:

```
diff -r skills .claude/skills
diff -r skills .agents/skills
```

When you change a skill, change `skills/` and re-copy into both mirrors.

## The pipeline these skills implement

Both skills are one path each through the generic client pipeline in
`docs/INTERFACE.md`: PREPARE -> ASSEMBLE -> RUN -> CHECK -> PERSIST -> STAMP ->
VALIDATE -> COMMIT/PUSH. They run as the Claude Code (git-native, self-hosting)
profile: the model running the skill also executes the meta prompt. For the
packet clients (Claude Desktop, ChatGPT) see `adapters/`.

## Licence

Apache-2.0 (see `LICENSE-APACHE.txt` and `LICENSES.md`).
