# Learning-record format — one entry per session

A learning record is an append-only log a guide keeps on their own device. One short
entry per session; readable by a person or a program. This format is used by both the
metadax-tutor and metadax-homeschool skills — it is the shared contract.

It records **behaviour only**: what the learner did, what worked, what slipped. It
never names a diagnosis, never uses a real name, school or anything identifying. A
nickname or "the learner" only. MetaDAX is free.

---

## The entry — human-readable form

Keep it to one screen. Fill in what you saw; skip what you did not.

```
metadax-record v1
ref: <short ref, e.g. HS-4KQ2 or TU-A3F7 — or blank>   session: <which one, e.g. 2>
subject: <Math | Reading | Writing | Spelling | Science | Language | History | Other>
age band: <4-6 | 7-9 | 10-12 | 13-15 | 16-18 — or blank>

what happened:  <what they worked on; how far they got>
what worked:    <the idea or moment that landed — build next session on this>
misconceptions seen: <the slips, as behaviour, each with a rough count — never a label;
                     e.g. "added the tops and bottoms separately × 3">
next step:      <the one thing to move on next time>
```

### Worked example (multiplication — 3× table, session 1)

```
metadax-record v1
ref:    session: 1
subject: Math
age band: 7-9

what happened:  Worked through the 3× table (3×1 to 3×6) using groups of counters.
what worked:    Jump-counting aloud from physical groups — "3, 6, 9, 12" — clicked
                with no hesitation.
misconceptions seen: Wrote a guessed answer before completing the count (3×5 → 14
                     or 16) × several times.
next step:      Open next session with a choral jump-count, then solo with counters;
                pencil stays down until the count is done.
```

---

## The entry — JSON form (for programs that read it)

```json
{
  "format": "metadax-record",
  "v": 1,
  "ref": "",
  "session": 1,
  "subject": "Math",
  "age_band": "7-9",
  "what_happened": "...",
  "what_worked": "...",
  "misconceptions_seen": [
    { "description": "added the tops and bottoms separately", "count": 3 }
  ],
  "next_step": "..."
}
```

Fields `ref`, `age_band` and `misconceptions_seen` are optional. `subject` is one of
the values listed above. `session` is a positive integer. All text fields: behaviour
only, no diagnosis, no real name, no identifying detail.

---

## Keeping the record

Drop entries into a plain `.txt` or `.md` file on your device, newest at the bottom.
Add a date line before each entry if you want to search by date later. Nothing is
uploaded unless you choose to share. This is your record; the file does not leave
your device.
