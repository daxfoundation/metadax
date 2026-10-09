# `companion.json` — the sidecar a package carries for a companion that is on all day

*Schema experiment. No runtime. A way, never the way.*

A MetaDAX package is the learning: the guide's pages, the learner's game, the
next-time note. `companion.json` is a small machine-readable file that rides
**beside** a package and tells a cognitive companion how to be, in the Foundation's
words, the hands and ears of the system around that learning — connected
continuously, taking on most of the processing, bolstered by supplementary
services, while the human guide keeps the part only a human can do.

The package is downloaded once a day today. The direction is a companion connected
all day. This sidecar is designed so the same file works in both: everything must
degrade to a five-minute bundle, and everything the continuous modality adds is
written as additive, never as a replacement for the guide.

- Contract: [`companion.schema.json`](companion.schema.json) (JSON Schema 2020-12).
- Validator: [`validate-companion.mjs`](validate-companion.mjs) — zero-dependency
  Node; reuses `tools/jsonschema-lite.js` for the structural pass and adds the
  invariants JSON Schema cannot express. Run `node companion/validate-companion.mjs`.
- Examples: one sidecar per public sample, made-up data, under
  [`examples/`](examples/).

## The three rules this schema makes structural

These are not comments; they are shapes the validator enforces.

1. **Behaviour, never a diagnosis.** Every `signals[]` entry has a required `not`
   field: the inference the signal must never become. A named condition anywhere in
   the file fails validation.
2. **The human guide is never automated away.** `interventions.guide_only` is
   required and non-empty, and every reserved item must say *why* it stays with the
   human. The boundary is a field, so a sidecar that leaves the guide nothing does
   not validate. This is the human delta value boundary.
3. **A way, never the way.** Every captured `techniques[]` move is `one_way: true`,
   `provenance: "guide"`, and `status: "pending_review"` — a companion may propose a
   move for capture, but a person authors and accepts it, and it is always offered
   as one way among those on record.

## The fields, and what if each one is wrong

| field | what it is | what if it's wrong |
|---|---|---|
| `format` / `v` | `"metadax-companion"`, `1` | wrong → the reader doesn't recognise the sidecar and ignores it; the companion falls back to the package alone. |
| `ref` | the family ref from the intake note | wrong → the sidecar can't be matched to its family's record; writes land on the wrong learner or nowhere. |
| `pairs_with.sample_id` | the package this sidecar annotates | wrong → the companion applies one package's signals and ceilings to a different learning; everything downstream is subtly off-target. |
| `next_step.guide` / `next_step.learner` | the single next thing for each | if it becomes a list, the companion loses its one job — pointing at one thing — and an always-on companion turns into noise. If it drifts into a label ("work on their weak blending") it breaks the behaviour rule and gives the guide nothing to do. |
| `reach.alone` | what the learner does unaided | too high → the companion withholds help the learner needs; too low → it props up what they already own and the session stalls. |
| `reach.with_help` | the band just past alone — the target | wrong → the companion aims at the wrong edge: too far and the learner frustrates, too near and nothing moves. This is the whole point of the field. |
| `reach.not_yet` | what to keep off the table today | if it's missing or wrong, the companion steers the learner into what is out of reach and the freeze or the drift returns. Stated as behaviour, never a ceiling on the person. |
| `signals[].watch` / `looks_like` | the behaviour and its observable form | vague → two people wouldn't agree it happened, so the signal fires on nothing or everything; the companion either nags or misses the moment. |
| `signals[].not` | the inference it must not become | **the field that holds the hardest rule.** If it's wrong or weak, a behaviour quietly becomes a label and the companion starts diagnosing — the one thing it must never do. |
| `signals[].then.action` | offer / surface_to_guide / pause / log_only | wrong → the companion acts above its station: concludes instead of offering, or stays silent when it should raise something to the guide. |
| `interventions.companion_may[].ceiling` | the top of the companion's authority for a move | too high → the companion crosses into the guide's work (reads the word for them, finishes the sum); missing → there is no stated stop and the boundary leaks. |
| `interventions.guide_only[].reserved` / `why` | what only the human does, and why | if emptied, the human delta value collapses and the companion is running the session; if the `why` is hand-waved, the next author can't tell whether a new feature crosses the line. |
| `techniques[].move` | the guide's move, audience-neutral | if it keeps this learner's specifics, it can't transfer to another learner; if it becomes a quiz answer, it stops being a technique and starts leaking the test. |
| `techniques[].stuck_signature` | the behaviour that should trigger offering it | wrong → the move is offered on the wrong stuck, which reads as the companion steering rather than helping (the X01 kill line). |
| `techniques[].provenance` / `status` / `one_way` | guide / pending_review / true | if a companion could author a technique, or ship it un-reviewed, or present it as the way, the capture loop stops being human-owned — the thing that made it trustworthy. |
| `services[].capability` | an external capability, named generically | a vendor name here ties the learning to one product and dates instantly; a capability name survives the market. The validator blocks vendors. |
| `services[].boundary` | what the service must not do | missing → a supplementary service quietly keeps the child's data or starts making decisions; the boundary is the only thing holding it to "supplementary". |
| `services[].offline_fallback` | what happens when it's unreachable | missing → the learning silently depends on a service being up, and the bundle stops working when connectivity drops. |
| `cadence.authored_for` | bundle / intermittent / continuous | wrong → a continuous reader assumes affordances the sidecar never specified, or a bundle reader is handed expectations it can't meet. |
| `cadence.bundle.does` / `cannot` | the floor, and its honest limits | if `cannot` is empty or flattering, the once-a-day modality looks more capable than it is and the guide stops doing the part the bundle can't. |
| `cadence.continuous.unlocks` | what being always-on adds | if it smuggles in guide-only work as an "unlock", connectivity is used to erode the boundary — the failure this whole schema is built to prevent. |
| `cadence.continuous.still_guide_only` | what stays human even when always-on | missing → readers assume continuity moves the boundary; it never does. |
| `record_hooks[].writes` | what lands in the learning record | if it's a diagnosis or a minute-count, the record fills with labels and surveillance instead of behaviour; wrong → the record misremembers the learner. |
| `record_hooks[].event` | the learner-record event type | wrong type → the write lands in the wrong place in the record (coordinate with the record experiment); the history reads incoherently. |
| `record_hooks[].consent` | whose consent gates the write | if it defaults to consentless, an always-on companion becomes an always-on recorder — the privacy line MetaDAX will not cross. |
| `record_hooks[].visibility` | who can see the write | wrong → a note meant for the guide is shown to the learner, or a shared signal is hidden; trust in the record erodes either way. |

## One page: the once-a-day package, and the shift to always-on

**What the once-a-day package simulates well.** The bundle already proves the core
of the idea on a day's connectivity. It carries a whole session — the guide's steps,
the learner's game, the swinging-lead moment, the human-only block — and it comes
back as a plain next-time note, so the loop (intake → package → session → note →
next package) closes with nothing leaving the device uninvited. It simulates the
*content* of a companion well: the next step, the reach, the behaviours worth
watching, the guide's reusable move, and the services a richer setting could add are
all expressible in a file a person can read in full. And it enforces the boundary
honestly: the package already reserves a block for what only a person can do, and
this sidecar makes that reservation a required, non-empty field.

**What it cannot simulate.** Three things, and they are the same three in every
example here. *Timing* — the bundle cannot act in the moment the page is covered,
the digits go side by side, or the youngest drifts; it can only describe the signal
and leave the catching to the guide. *Listening and watching* — blending lives in
sound the written quiz can't hear, carrying shows in a layout a static game can't
see, a group's pace lives in faces; the bundle records only the chosen answer.
*Following the edge continuously* — the bundle sets one difficulty for one burst a
day, where an always-on companion could keep the learner at the edge of their reach
across the day and across days. Everything in `cadence.bundle.cannot` is one of
these three, stated plainly so no one mistakes the simulation for the thing.

**The three smallest things to build next, toward the continuously connected
modality.**

1. **A behaviour-event stream the bundle already emits.** The package player keeps
   records in memory and `localStorage` today; have it emit them as
   `record_hooks`-shaped events (the `metadax.event/0.2` vocabulary) locally, gated
   by the consent in the sidecar. Nothing leaves the device yet — but the companion,
   once connected, reads the same stream it will read all day. This is the smallest
   step that makes the same file work in both modalities.
2. **A capability adapter contract, one capability.** Pick the sharpest gap — spoken-
   sound alignment for blending — and define the request/response contract as a
   *capability*, with the `boundary` and `offline_fallback` the sidecar already
   names, and no vendor. Prove one supplementary service can bolster a session and
   fall back cleanly when unreachable. The sidecar is already written for this.
3. **The technique-capture propose step, human-owned end to end.** Let a companion
   turn a `techniques[]` entry into a candidate written `pending_review` to the
   course, attached to concept and stuck-signature, offered to the next matching
   learner as one way, never imposed — the X01 hook, closed locally, with a person
   accepting before anything is shared. This is the loop that compounds, and it is
   small because the sidecar already carries the move.

None of these moves the boundary. Each one is a step the bundle can take today that
a continuously connected companion will stand on tomorrow.
