# Contributing to MetaDAX

MetaDAX is a research project of the DAX Foundation, built in the open. You do not
need an account on anything but GitHub, and most contributions never touch code.

A few things hold across everything here:

- **Language is guide and learner.** Whoever is a step ahead right now is the guide;
  everyone is a learner. "Teacher" and "tutor" name a job or a prompt operation, not
  the person in the chair.
- **A way, never the way.** Nothing you add should present itself as *the* answer or
  steer a learner down one road. Offer a way among many.
- **Never diagnose.** Describe behaviour -- what a learner does, freezes on, lights up
  at. Never name a condition or a diagnosis anywhere, in a sample, a prompt or an issue.
- **No real child, ever.** No real learner's name, photo, school, town, birth date or
  any identifying detail appears in anything you submit. Made-up names only.
- **Sign your commits.** Contributions to the repository need a DCO sign-off:
  `git commit -s`. Prompt changes are versioned (`prompts/CHANGELOG-v0.2.md`); a change
  to a prompt is a decision, not a patch -- say what changed and why in the PR.

## Using AI to contribute

AI-assisted contributions are welcome -- this project is built with AI agents itself.
Two rules make them safe to accept:

1. **Say so.** State in the PR or issue that AI helped, and how (drafted, reviewed,
   translated).
2. **A human must have read and tried it.** Someone has to have read every line and
   actually run or used the result -- a sample worked through, a prompt change exercised,
   a translation read by someone who speaks the language. AI output you have not read and
   tried is not ready to submit.

And, as above: no real child's name, photo or identifying detail ever, whether a human or
a model wrote it.

## Ways to contribute

### 1. Share a sample you made with your own learner

A sample is one generic, made-up example of what MetaDAX hands a guide and a learner.

1. Run the `metadax-homeschool` skill (or the plain prompt) with your own learner. It
   produces a `sample.md` and an `entry.json`.
2. Remove every identifying detail: swap in made-up names, drop any school, town, birth
   date, photo, phone or email. Describe the stuck point as behaviour, not a diagnosis.
   Check the "a way, never the way" line is present.
3. Open a **"Share a sample"** issue from the issue chooser
   (`.github/ISSUE_TEMPLATE/share-a-sample.yml`). Paste the `sample.md` into the first box
   and the `entry.json` (the nine index fields) into the second, and tick the three
   confirmations.
4. A reviewer checks it, publishes it into `samples/` and adds the index entry. There is
   no upload and no account; a person reviews each one before it appears.

### 2. Add a scene mechanic or a theme

The learner page is a small interactive built from a scene. A **mechanic** is how a scene
works (match, sort, build, sequence); a **theme** dresses an existing mechanic in what a
learner loves (dinosaurs, marble runs, hockey) without changing the mechanic; **levels**
set difficulty within a scene. Adding a theme is the smaller, safer change and the best
first contribution; a new mechanic is larger.

1. If the scenes registry is present in the repo, it lives under the play views
   (`views/play/scenes`): each scene registers a mechanic, its themes and its levels.
   Add a theme as a new entry against an existing mechanic, or a mechanic as a new scene.
   **If you do not find the scenes code in the public repo yet**, it has not been
   published -- open an issue describing the theme or mechanic you would add (the mechanic
   it dresses, the levels, what a learner loves that it serves) so it can be built or the
   code opened.
2. Keep it generic: no named learner, no vendor, no diagnosis. A theme is a reskin, so it
   must not change what the mechanic teaches.
3. Run the package checker against a sample package that uses your scene before you open
   the PR.

### 3. Adapt a template for another kind of guide

The templates assume a homeschool guide, but a guide is also a tutor, a classroom teacher,
a workplace trainer or a professor. Adapting a template opens MetaDAX to them.

1. Start from the templates (`templates/`) and the homeschool skill, and copy -- do not
   overwrite -- the piece you are adapting.
2. Change only what the new kind of guide needs: the words it uses, what it asks for, what
   it hands back. Keep guide/learner language and the "a way, never the way" and
   never-diagnose rules intact.
3. Name the guide kind clearly (tutor, classroom teacher, trainer, professor) and open a
   PR describing who it is for and what you changed from the homeschool version.

### 4. Fix a prompt or the checker

1. For a prompt, edit the file under `prompts/` and record the change in
   `prompts/CHANGELOG-v0.2.md` -- what changed and why. A prompt change is a decision.
2. For the checker (`tools/validate.js` and the homeschool `check-package.mjs`), add or
   adjust a test alongside your fix; the tools are zero-dependency Node and run offline.
3. Open a PR with the before/after behaviour. If you can, include the input that used to
   fail or misbehave.

## Licence

Prose here, including this file, is **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/legalcode).
Other paths carry their own licence -- prompts, schemas and eval fixtures are CC0 1.0; code,
templates, skills, adapters and `.github/` are Apache-2.0; generated course content takes the
licence the course author chooses (default CC BY 4.0). The full split is in
[`LICENSES.md`](LICENSES.md) and `docs/LICENSING.md`. By contributing you agree your
contribution is released under the licence for its path.
