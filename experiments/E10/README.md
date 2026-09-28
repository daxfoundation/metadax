# E10 -- Can a 2-4B on-device model run the quiz with GBNF?

## Question

Can a small (2-4B) model running on a phone run the quiz from a practice bank, using
grammar-constrained decoding to guarantee valid output?

## Why it matters

The offline client depends on a small model answering follow-ups and running short-answer quiz
tiers from the week's nodes, with no cloud. Grammar-constrained decoding (llama.cpp GBNF) is
what should make even a 2-4B model produce schema-valid JSON. E10 checks whether that holds on
real hardware; if not, the offline tutor rung needs a different approach.

## Method

Run llama.cpp under Termux on a mid-range Android phone with a 2-4B model and a GBNF grammar
compiled from the tutor state schema. Feed 30 practice items and grade against their exact
answers.

## Metrics

- schema-valid rate of the model's output
- grading agreement with the exact answers
- tokens per second
- battery drain

## Stop rule

Kill if the schema-valid rate is under 95 percent even with the grammar.

## Owner

U (on a device).

## Estimated effort

3 days.

## Dependencies

A practice-set fixture with exact answers (MP-06 practice_set output), a GBNF grammar derived
from the tutor state schema, and a phone with Termux and llama.cpp.

## Status

not started

## Results

none yet -- see `results/`.
