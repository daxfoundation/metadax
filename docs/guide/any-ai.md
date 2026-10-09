# Use MetaDAX with any AI chat

MetaDAX › [Help](index.md) › Any AI chat

No special skill needed. Everything the Claude skill does is also written as one
plain prompt you can paste into any capable AI assistant you already pay for. The
task uses no features specific to any one product.

## 1. Copy the prompt

The prompt is one file in the open repository,
`skills/metadax-homeschool/prompt.md`. Open it and copy everything below the line
near the top:

[prompt.md on GitHub →](https://github.com/daxfoundation/metadax/blob/main/skills/metadax-homeschool/prompt.md)

## 2. Paste it, and attach the templates

Start a new chat and paste the prompt in. Then attach (or paste) the files the
prompt asks for, from the same folder's `templates`:

- `PACKAGE-FORMAT.md` — the contract the package is built to.
- `intake-questions.md` — the questions it will ask you.
- `SAMPLE-FORMAT.md` — the shape of the generic version you can share.
- `EXAMPLE-package.json` — a complete, valid example to model yours on.
- And, for the next session and more than one child, `NEXT-TIME-NOTE.md` and
  `FAMILY-PROGRESS.md`.

[The templates folder →](https://github.com/daxfoundation/metadax/tree/main/skills/metadax-homeschool/templates)

## 3. Answer its questions

It interviews you a few questions at a time, in plain words: a nickname (not a
real name), a rough age, the subject, where exactly they get stuck, a real wrong
answer if you have one, and what they love. Give it nothing identifying — no real
name, school, town, email or phone. If you do, it tells you what it looks like and
leaves it out.

## 4. Save the package JSON

It produces a `metadax-package` in JSON — the two-page lesson. Copy all of it and
save it as a plain text file ending in `.json` (for example
`family-package.json`). That file is yours and private; nothing is uploaded.

To use it, open the player and paste the JSON in, or print it for paper.

[Open it and print it →](play-and-print.md) · [No AI at all? Use the questionnaire](no-ai.md) · [Back to the guide](index.md)
