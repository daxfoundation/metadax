# Install the Meta DAX skill in Claude

Meta DAX › [Help](index.md) › Claude skill

A skill is a small folder Claude reads so it knows one job well. This one,
`metadax-homeschool`, interviews you and builds your child's lesson. Add it once;
use it whenever you like. It runs on your own Claude subscription and costs this
project nothing.

## 1. Get the skill folder

The skill lives in the open repository, in the folder
`skills/metadax-homeschool`. Download or copy that whole folder to your computer:

[skills/metadax-homeschool on GitHub →](https://github.com/daxfoundation/metadax/tree/main/skills/metadax-homeschool)

Keep the folder together — the `SKILL.md` file and its `templates` and `tools`
folders all belong with it.

## 2. Add the skill folder to Claude

In Claude, add the skill folder (see Claude's help for Skills). The exact steps
depend on which Claude you use, and Claude's own help is kept current:

[Claude help & support →](https://support.claude.com)

If you use an assistant that reads a `SKILL.md` from a project folder (for example
a coding assistant), copy `skills/metadax-homeschool` into that assistant's skills
folder and it will be picked up.

## 3. Type the first message

Start a new chat with Claude and type, more or less:

> Use the metadax-homeschool skill — I homeschool and my child is stuck on
> something.

From there it asks you about a dozen short questions, a few at a time, in plain
words: a nickname for your child (never a real name), a rough age, the subject,
the exact spot where it keeps going wrong, a real wrong answer if you have one,
and — the important one — what they love. It builds the lesson through that.

When it is done it writes `family-package.json` and checks it. If you typed
anything identifying — an email, a phone number, a real name — it tells you and
leaves it out.

## 4. Open what it built

The package is yours and private; the skill never uploads it. Open it in the
player, paste in the JSON, and press Play — or print it for paper.

[Open it and print it →](play-and-print.md) · [Prefer a different AI? Use the plain prompt](any-ai.md) · [Back to the guide](index.md)
