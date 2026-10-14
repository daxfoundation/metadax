# Context profiles

A **context profile** holds the defaults for a population or setting, so the same
generic prompts (MP-11 CURRICULUM, MP-02 ARCHITECT, MP-04 CONTENT) can build a
course *for anybody in any context* without baking a context into the prompt.
One generic engine + one profile = a curriculum tuned for university, for an HR
onboarding, for a crisis classroom, or for an elder self-learner.

Profiles set **defaults only**. An explicit value in the brief (INPUT), a source
(SOURCE), or an individual LEARNER profile always wins; the engine notes the
override in its `assumptions`. A profile never appears inside shared `core`
content (SCHEMAS design law 2): it shapes *presentation and planning*, not the
audience-neutral knowledge.

## Who reads them

| Engine | Reads via | Uses it for |
|---|---|---|
| MP-11 CURRICULUM | `CONFIG.context_profile` (+ `CONTEXT` block) | lesson time unit (`session.minutes`), audience bands, guide role, assessment style, privacy floor, per-course hand-off defaults |
| MP-02 ARCHITECT | the hand-off's `context_profile` + `defaults_for.MP-02` | size, depth, scope and source policy defaults |
| MP-04 CONTENT | `defaults_for.MP-04` + `reading_level`, `tone`, `supports` | section count, register, which `supports` to honour |

## The 10 profiles

| id | Setting |
|---|---|
| `early-childhood-with-caregiver` | ~4-6, a parent/caregiver reads and guides |
| `primary-school` | ~7-11, classroom or homeschool, teacher/parent present |
| `secondary-school` | ~12-18, teacher-led, often syllabus/exam bound |
| `higher-education` | university/college course, independent adult readers |
| `vocational-trades-apprenticeship` | hands-on trade training with a trainer, safety-critical |
| `workplace-hr-training` | onboarding, compliance, upskilling inside an organisation |
| `professional-continuing-education` | certification/CE for practising professionals |
| `adult-basic-education-and-language` | adult literacy, numeracy, second language |
| `community-humanitarian` | crisis/under-resourced, volunteer teachers, offline-first |
| `lifelong-and-elder-learners` | self-directed adults and older learners |

Each profile validates against `schemas/context-profile.schema.json`
(`metadax.context-profile/0.3`) and carries a `what_if_wrong` note per field.

## Modifiers are cross-cutting, not populations

Accessibility and bandwidth are **not** populations and are **never** a label for
a learner. They live in `modifiers.json` and apply *on top of* any profile:

| id | What it does |
|---|---|
| `screen-reader` | spoken-form for every symbol; linearised tables; text alternatives |
| `dyslexia-friendly` | short chunks, plain words, sparse emphasis |
| `captions` | captions + transcript for all audio/video; transcript is the fallback |
| `low-vision` | no colour-only cues; reflowable text; clear structure |
| `low-bandwidth` | text-first; media optional; small lessons |
| `offline-first` | no live dependency; printable one-page form per lesson |

Each modifier names **what to do** and maps to the existing learner-profile
`supports` vocabulary (SCHEMAS section 5) and/or a delivery rule. Pass them in
`CONFIG.modifiers`; MP-11 records them on the program and in every hand-off, and
MP-04 applies them in rendering. We **never** write "for dyslexic learners" or
store a condition — only the accommodation (design law 6: accommodations, not
diagnoses).

## Adding a profile

Copy an existing file, keep every required field (see the schema), give a
`what_if_wrong` line per field, and add a row to the table above. Keep the id a
kebab slug. If the new setting is really an accommodation (a how, not a who), it
belongs in `modifiers.json`, not here.
