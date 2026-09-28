# Adapters

These files are for the **packet clients** -- Claude Desktop and ChatGPT, where
the model cannot be assumed to write files and every file-producing output ends
with a COMMIT PACKET (spec S-9, `write_mode: packet`). The Claude Code client
does not use them: it is git-native (`write_mode: git`) and drives the skills in
`skills/` directly. See `docs/INTERFACE.md` (c) for all client profiles.

An adapter is a short header prepended to the skills for one vendor. It sets
surface mechanics only -- vendor identity, how the repo is attached, whether
writes are possible, and the CONFIG defaults -- and defers all flow and safety
to the skills and the MP-00 kernel.

| File | Use it for |
|---|---|
| `HEADER.claude.md` | Claude Desktop / claude.ai Projects (`client: claude-desktop`, `write_mode: packet`) |
| `HEADER.chatgpt.md` | ChatGPT Projects / plugins / Codex (`client: chatgpt`, `write_mode: packet`) |
| `COMMIT-PACKET.md` | The packet format and how a human or `tools/apply_packet.js` applies one |

Which adapter for which client:

- Claude Code: none. Install the skills (`.claude/skills/`) and run git-native.
- Claude Desktop: `HEADER.claude.md` + `COMMIT-PACKET.md`.
- ChatGPT / Codex: `HEADER.chatgpt.md` + `COMMIT-PACKET.md`.
- API runner: none; see `docs/INTERFACE.md` (c) for the 20-line contract.

No adapter assumes a GitHub connector. A packet-client user applies packets by
hand (web editor, or an Issue that a learner-repo workflow ingests) or with
`tools/apply_packet.js <packet.json> --course <dir> --learner <dir> --stamp`.

Licence: Apache-2.0.
