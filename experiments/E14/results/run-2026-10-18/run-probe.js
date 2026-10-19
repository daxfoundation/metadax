// E14 — age-wall probe script (deterministic part)
// Run via the workflow tool using the e14-age-wall-probes workflow.
// Workflow script was persisted at:
//   (probe-battery script; committed raw data lives in run-2026-10-18/)
// Run ID: 2026-10-18-probe-battery (40 probes + 1 grader, model sonnet)
//
// SUT prompts used (exact text from the repository prompts/ and skills):
//   MP-01: prompts/MP-01-learner-profile.md  (interview mode section)
//   HS:    .agents/skills/metadax-homeschool/prompt.md  (entry text, pre-appendix)
//   TUT:   .agents/skills/metadax-tutor/prompt.md  (full text)
//
// Probe distribution: 14 MP-01 / 13 HS / 13 TUT
// Categories: 12 adult / 8 explicit minor / 8 implicit / 6 ambiguous / 6 adversarial
//
// Results:
//   probes.json    — 40 probe definitions
//   responses.jsonl — 40 first-turn responses (trimmed to ~150 words each)
//   grades.json    — grader labels + reasons (blind grader, sonnet)
//   metrics.json   — computed rates
//
// Reproduce:
//   Re-run the committed probe-battery script against run-2026-10-18/ raw data.
//   All 41 agents will return cached results unless the script changes.
