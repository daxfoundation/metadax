# MetaDAX Node ID Format v0.3

Status: **normative draft** for schema version `0.3`. Supersedes the v0.2 id
rules in `prompts/SCHEMAS.md` section 1 and `docs/SPEC-v0.2.md` point 3.

Goal: support recursive questioning to **any depth** while keeping the context
carried from one turn to the next **bounded** — independent of how deep the
thread has gone.

---

## 1. Why v0.2 had to change

In v0.2 a follow-up node id *was* its breadcrumb: `parent_id + "/" + slug`, so a
depth-5 id looked like
`L03.M02.O01/proteins-essential-atp-synthesis/cytochrome-c-structure-role/electron-donation-complex-iv/plant-animal-mitochondria`.
Two consequences fell out of that one decision (measured in
`state/metadax/SCALE-EXP-20261009.md`):

1. **Depth was physically capped near 8.** The id carried a 200-char cap
   (`tools/path.js` `MAX_ID`); `childId` dropped trailing slug words to fit and
   *threw* once even a one-word slug would not fit. With realistic multi-word
   slugs the id saturates at depth ~8. "Recursion lives in the data" (design
   law 1) was false: recursion was capped by a string length.
2. **Carried context grew with depth even after compression.** The PATH trail
   contract kept **every** covered id in `covers[]`, so compressed PATH still
   grew ~51 tokens per level (~204 KB / ~51K tokens at depth 1000). Compression
   halved the slope; it never flattened it.

v0.3 breaks the coupling: identity becomes a short **opaque id**, the breadcrumb
becomes **derived display data**, depth becomes a **stored field**, and the
carried trail becomes **O(1)** in depth.

---

## 2. The id

### 2.1 Objective nodes (depth 1) — unchanged

Objective nodes keep their structured curriculum id `L<ll>.M<mm>.O<oo>`
(e.g. `L03.M02.O01`). This id names a position in the curriculum (lesson,
module, objective), not a questioning breadcrumb, so it is already bounded and
is the stable root of every chain. Lesson/module/objective ids are unchanged.

### 2.2 Follow-up nodes (depth ≥ 2) — opaque id

A follow-up id is:

```
n_<26 lowercase Crockford-base32 characters>
```

- `n_` is a fixed prefix marking a node id (and letting a parser tell a v0.3 id
  from a v0.2 breadcrumb or a concept slug at a glance).
- The 26 characters encode **128 bits of randomness** in Crockford base32
  (alphabet `0-9 a-z` minus `i l o u`; 5 bits/char, 26 chars carry 130 bits,
  the top 125–128 bits are the id and the rest is zero-padded).
- Example: `n_0a1b2c3d4e5f6g7h8j9k0mnp q` (28 chars total, fixed length).

The id is **context-free**: it is minted from randomness by the client's
stamping step (`tools/stamp.js` / `tools/path.js`), never by the model
(design law 8 — "the model never stamps"), and it reveals nothing about the
node's parent, depth, content, author, or creation time.

### 2.3 Chosen: random opaque id, not ULID

The brief allowed "prefix + base32 of a hash" or a ULID. We chose a **random
128-bit opaque id** (equivalently base32 of a 128-bit hash of a fresh nonce):

**Collision math at 10⁹ nodes.** With a space of `N = 2^128 ≈ 3.40e38` and
`k = 10^9` ids, the expected number of collisions is `k²/(2N) = 1e18/6.8e38 ≈
1.5e-21`, and `P(any collision) ≈ 1 - e^(-k²/2N) ≈ 1.5e-21` — about one chance
in `10^21`. The 50%-collision point is at `k ≈ 1.177·√N ≈ 2.2e19` ids (~22
billion billion), so a billion nodes sits ~10¹⁰× below the birthday knee. Even
at a **trillion** nodes `P(any) ≈ 1.5e-15`. This is many orders of magnitude
below the probability of an undetected disk or cosmic-ray bit flip over the same
data, so no coordination is needed to keep ids unique across a billion offline
devices. And a collision is still **locally detectable** (sibling / registry
check), so the generator simply re-mints on the astronomical clash — the same
fallback shape as the v0.2 `-2`/`-3` slug suffix, just never exercised.

**Why not ULID.** A ULID is a 48-bit millisecond timestamp + 80 bits of
randomness. Two problems for MetaDAX:
- It **embeds and leaks creation time and a global sort order**. Records can be
  private; a time-ordered id discloses when a learner asked a question across
  every device that ever sees the id. We want identity to disclose nothing.
- It needs a **wall clock** at mint time, which fights design law 8 (the model
  never stamps) and the runtime rule that id generation be reproducible without
  a clock. A context-free random id needs no clock and no ordering.
We do not need time-sortability: `depth` + the `parent_id` chain already order
the tree. So the timestamp half of a ULID is pure cost (leak + clock) with no
benefit here.

### 2.4 Node identity vs package `content_sha256` — kept separate

- **`id`** answers *which node is this?* — a stable identity for a place in a
  learner's questioning tree. It never changes once minted, even when the node's
  `core` is re-written, re-rendered for a new audience, or corrected.
- **`content_sha256`** answers *which bytes are these?* — the hash of a packaged
  core/rendering. It changes every time the content changes, and two different
  nodes that happen to render identical content share one `content_sha256`.

They are deliberately decoupled so that: (a) identity survives edits (links,
progress, and the parent_id chain stay valid across a correction); and (b)
content can be **deduplicated and cached by hash** (design law 2 — knowledge is
shared, presentation is personal) without collapsing two distinct node
identities. Identity is minted once; content hash is recomputed on every stamp.

---

## 3. New and changed node fields (0.3)

| Field | 0.2 | 0.3 |
|---|---|---|
| `id` | breadcrumb `parent/slug/...`, ≤ 200 chars | objective `L..M..O..` **or** opaque `n_<base32>` |
| `parent_id` | present (already) | present; **the chain is the source of truth** |
| `depth` | present but defined as `1 + count("/")` | **stored** integer, `= parent.depth + 1`; objective = 1 |
| `slug` | lived *inside* the id | **own field**, human-readable, **not part of identity** |
| display breadcrumb | the id itself | **derived** at render time from ancestor slugs (optional) |

- **`parent_id`** — the id of the node the learner was reading when they asked.
  `null` only for objective (depth-1) nodes. The parent_id chain, stored in the
  registry, is the single source of truth for a node's full ancestry.
- **`depth`** — a stored integer. An objective node is `1`. Every other node is
  `parent.depth + 1`. Engines and validators check `depth == parent.depth + 1`;
  they **never** count "/" and **never** count PATH entries (PATH may be
  compressed, MP-03).
- **`slug`** — computed from the title by the SCHEMAS §1 slug rule, kept as a
  field for human-readable display (file names, breadcrumbs, URLs). It is **not**
  part of identity: two siblings may share a slug without colliding, because
  their ids are independent opaque values. No `-2`/`-3` disambiguation is needed
  for identity (a runtime MAY still disambiguate slugs for display paths).
- **display breadcrumb** (optional) — a UI MAY build `great-grandparent ›
  grandparent › parent › this` by walking `parent_id` and joining each
  ancestor's `slug`. It is presentation only and never stored as identity.

Schema version bumps **0.2 → 0.3**: `metadax.node/0.3`,
`metadax.registry/0.3`, `metadax.registry-index/0.3`, and the MP-05
follow-up-output envelope's `$id`. The `schema` const inside each record changes
accordingly.

---

## 4. The new PATH / trail contract — O(1) carried context

The carried PATH block passed into any follow-up call is **bounded regardless of
depth**:

```
PATH = [ objective entry ]              # the depth-1 root, verbatim
     + [ at most one trail entry ]      # replaces the compressed middle
     + [ the last 3 ancestors, verbatim ]
```

So PATH is at most **5 entries** at depth 8 or depth 8000.

**Ancestor entry** (verbatim): `{ id, title, canonical_question, summary }` as
today.

**Trail entry** (the one change): a bounded summary, **not** a list of ids:

```json
{
  "id": "trail",
  "summary": "one or two sentences tracing the line of questions "
             "from the first to the last covered node",
  "covers_count": 42,
  "first_covered": "n_0a1b2c3d4e5f6g7h8j9k0mnpq",
  "last_covered":  "n_9z8y7x6w5v4t3s2r1q0pnmkjh"
}
```

- `covers_count` — how many ancestors the trail stands in for (an integer).
- `first_covered` / `last_covered` — the endpoint ids of the compressed span,
  so a UI can show where the trail starts and ends without a directory walk.
- The trail carries **no per-id array**. This is what flattens the growth: the
  trail is O(1) in `covers_count`, so compressed PATH no longer grows with
  depth. (In v0.2 the `covers[]` array made it grow ~51 tokens/level.)

**Source of truth = the registry parent_id chain.** The full, exact ancestry is
*not* in the trail — it is reconstructable from the registry by following
`parent_id` from the target node up to the depth-1 objective:

```
chain(node) = node → registry[node.parent_id] → … → objective (parent_id == null)
```

**A runtime MUST be able to rebuild the full chain from the registry.** The
trail is lossy-by-design *display* memory; the registry is authoritative. This
replaces the v0.2 preservation contract ("keep every covered id in `covers`;
fall back to the uncompressed block if one is lost"): there is no longer any id
to lose in-band, because no id is carried in-band. The contract becomes: the
trail MUST carry `covers_count` and both endpoints, and the runtime MUST be able
to reconstruct `chain(node)` from the registry if the full ancestry is needed.

---

## 5. Depth guidance (unchanged intent, no hard stop)

- **Zoom-out at depth ≥ 6** stays a *suggestion*: MP-05 still adds a zoom-out
  line and, past `max_depth`, the seed "Zoom out: how does this branch serve the
  objective?" plus a `depth_limit` warning. This is advice, not a wall.
- **`max_depth` becomes optional with no default hard stop.** If a course omits
  it, there is **no** depth limit — a thread may recurse arbitrarily deep, and
  the engine keeps answering. If a course sets it, exceeding it only triggers the
  zoom-out seed and the `depth_limit` warning; the node is still created. The old
  "default 8" hard feel is gone: the only thing that ever stopped depth (the
  id-length cap) is removed in §2, and nothing replaces it.

---

## 6. Compatibility and migration (handled by a follow-up ask)

- `tools/path.js` keeps a **legacy parser** for v0.2 ids: a `/`-bearing id is a
  v0.2 breadcrumb whose depth is `1 + count("/")` and whose ancestors are its
  slash prefixes. New ids are minted in the v0.3 opaque form.
- Existing fixtures and samples are still v0.2 and will **fail** 0.3 schema
  validation (schema `const` mismatch and id pattern). A separate migration ask
  converts fixtures/samples, writes the id-rewrite + parent_id/depth backfill
  script, and re-runs the depth experiment. This spec does not migrate data.
