# Meta DAX Repository Layout

| Path | What it holds |
|------|---------------|
| `prompts/` | Meta DAX Prompt Suite v0.2 -- MP-00 kernel and MP-01 to MP-10, `SCHEMAS.md` (the normative data model), `00-README.md`, the changelogs |
| `schemas/` | JSON Schema 2020-12 for every Meta DAX record, plus a zero-dependency fixture check |
| `tools/` | Node.js tools, zero dependencies: canonical hashing, stamping, id and slug rules, context-stack assembly, packet application, validation, tests |
| `templates/course-repo/` | Starter layout for a new course repo |
| `templates/learner-repo/` | Starter layout for a new learner repo |
| `.github/workflows/` | Validation workflow, and a dispatch-only certification workflow |
| `skills/` | Agent Skills -- metadax-teacher, metadax-learner |
| `.claude/` | The same skills, where Claude Code looks for them |
| `.agents/` | The same skills, for other agent clients |
| `adapters/` | Client adapter headers for packet clients (Claude Desktop, ChatGPT) |
| `CLAUDE.md` | Claude Code client entry point |
| `docs/INTERFACE.md` | The operation contract every client implements |
| `docs/WALKTHROUGH-CLAUDE-CODE.md` | Step-by-step Claude Code walkthrough |
| `docs/` (other) | Concepts, architecture, experiments, decisions, glossary, privacy, licensing, accuracy, the frozen v0.2 spec |
| `fixtures/` | The reference course (the mitochondria chain) and a fixture learner, fully stamped |
| `experiments/` | One card per experiment (E01-E14), each with a `results/` folder that only holds real runs |
| `evals/` | Eval cases, grader, runners and the planted-registry set for E05 |
| `README.md` | The public README |
