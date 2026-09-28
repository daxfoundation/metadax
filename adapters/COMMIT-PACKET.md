# Commit packets (write_mode: packet)

A commit packet is how a packet client (Claude Desktop, ChatGPT) hands its
output to git without writing files itself. When `write_mode` is `packet`, every
operation output that produces files ends with a fenced block, last in the
message. A human or `tools/apply_packet.js` applies it, then stamps. See spec
S-9; this file is the format and how to land one.

## Format (normative)

```text
<<START COMMIT PACKET>>
{ "schema":"metadax.packet/0.2",
  "repo": "course | learner",
  "message": "<one line>",
  "files": [
    { "path": "nodes/L01.M01.O01/atp-stores-energy/node.json",
      "op": "create | update | append",
      "content": <the JSON object> }
  ] }
<<END COMMIT PACKET>>
```

Rules:

1. One save = one packet block, last in the message, fenced as `text`.
2. `repo` is `course` or `learner`; a packet never mixes the two.
3. `path` is repo-relative, forward slashes, no leading slash, no `..`, and only
   the characters `[A-Za-z0-9._/-]`.
4. `content` is the entire file object, never a diff. Stamped fields
   (`created_at`, `updated_at`, `content_sha256`, `ts`) are the literal
   `"runtime"`; the apply step fills them (K-15).
5. `op: "create"` fails if the path already exists (no overwrite, MP-05
   contract 8). Use `update` for an existing file, `append` for a registry or
   event list.
6. Private learner data (profile, progress, sessions, turns, private nodes)
   goes only in a `learner` packet. A minor-authored node that becomes shared
   has its verbatim `question` stripped and `created_by` set to anonymous first.
7. Never a name, age, school, location, health datum, secret, token or email in
   any packet.

## Landing a packet

Preferred: `tools/apply_packet.js <packet.json> --course <dir> --learner <dir> --stamp`.
It applies each file with its `op` semantics, refuses overwrites on `create`,
stamps every `"runtime"` field and writes `provenance.json`, then you commit and
push. Save the packet block (without the fences) to `<packet.json>` first.

By hand: open the target repo's web editor, create or edit each `path` with its
`content`, then run the stamp and validate steps locally, or open a
`metadax:state` Issue whose body carries the packet for a learner-repo workflow
to ingest under `inbox/`. Either way, stamping (`tools/stamp.js`) and validation
(`tools/validate.js`) run after the files land, never in the model.
