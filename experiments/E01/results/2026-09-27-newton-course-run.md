# E01 run 2 -- teacher builds "Newton's Laws of Motion" (2026-09-27)

An automated run in the Claude desktop app: Claude (Anthropic) acted as the client
(assemble -> gates -> apply_packet --stamp -> stamp -> validate -> commit) and as the model
(one JSON object per operation), following the same self-hosting pattern as the Claude Code
client in this repository. Not a human pilot; human-facing metrics (minutes, approval
dialogs, off-script help) are not measured here.

Full illustrated report (typeset maths, course pages, 3D follow-up tree, PNG screenshots):
https://claude.ai/artifact/Nv4j2tpPh9PidXvLiAaP31

## Request

> Newton's laws of motion: an introductory course for an adult learner who wants to understand the three laws properly, with everyday examples and a little algebra, no calculus.

## Result

- Course `newtons-laws-of-motion`: "Newton's Laws of Motion: An Everyday Introduction". 3 lessons, 7 modules, 21 objectives,
  11 concepts with prerequisites and Bloom targets, steer scope_policy `tangents_allowed`,
  depth `introductory`, max_depth 8.
- 21 objective nodes, 12810 words of core text, 79 LaTeX tags (K-9 latex_tags; every
  expression typesets with KaTeX, 0 render errors).
- `tools/validate.js course --schemas schemas` printed OK after every node (21/21).
- Wall time 57 min for 22 operations, including a pause mid-run when the first model
  session stopped and a second one took over.

## Who wrote what

- MP-02 architect and the first 6 objectives: Claude, model A (one fresh context per
  operation).
- The remaining 15 objectives: Claude, model B (a different Claude model version, one
  session). The stacks for all 21 MP-04 calls share an identical kernel + MP-04 prefix (md5
  of lines 1-83), so the switch changed the model, not the instructions.

## Per objective

| Objective | Claude model | Stack bytes | Tokens (est.) | Sections | Words | LaTeX | validate |
|---|---|---:|---:|---:|---:|---:|---|
| L01.M01.O01 Distinguish speed, velocity and acceleration | A | 14994 | 3748 | 5 | 955 | 5 | OK |
| L01.M01.O02 Identify the forces acting on an everyday object | A | 14936 | 3734 | 5 | 1001 | 4 | OK |
| L01.M01.O03 Calculate the net force from forces along a line | A | 14954 | 3738 | 5 | 917 | 5 | OK |
| L01.M02.O01 Explain Newton's first law with everyday examples | A | 14965 | 3741 | 5 | 953 | 1 | OK |
| L01.M02.O02 Explain why moving objects on Earth slow down | A | 15469 | 3867 | 5 | 855 | 0 | OK |
| L01.M02.O03 Identify balanced forces from an object's motion | A | 15506 | 3876 | 5 | 968 | 1 | OK |
| L02.M01.O01 Explain how acceleration depends on net force and mass | B | 15683 | 3920 | 5 | 624 | 8 | OK |
| L02.M01.O02 Calculate force, mass or acceleration with F = ma | B | 15110 | 3777 | 5 | 512 | 11 | OK |
| L02.M01.O03 Compare the effects of changing force and changing mass | B | 15177 | 3794 | 5 | 473 | 4 | OK |
| L02.M02.O01 Distinguish mass from weight | B | 15132 | 3783 | 5 | 502 | 3 | OK |
| L02.M02.O02 Calculate weight from mass | B | 15094 | 3773 | 5 | 405 | 11 | OK |
| L02.M02.O03 Explain why heavy and light objects fall together | B | 15043 | 3760 | 5 | 479 | 5 | OK |
| L02.M03.O01 Build a force list for an everyday object | B | 15638 | 3909 | 5 | 486 | 1 | OK |
| L02.M03.O02 Predict acceleration from a force list | B | 15687 | 3921 | 5 | 429 | 5 | OK |
| L02.M03.O03 Use net force to explain feeling heavier or lighter in a lift | B | 15698 | 3924 | 5 | 481 | 5 | OK |
| L03.M01.O01 Identify the partner force for a given force | B | 15116 | 3779 | 5 | 478 | 0 | OK |
| L03.M01.O02 Explain why an action-reaction pair does not cancel | B | 15120 | 3780 | 5 | 442 | 2 | OK |
| L03.M01.O03 Explain walking, rowing and rockets with the third law | B | 15117 | 3779 | 5 | 450 | 0 | OK |
| L03.M02.O01 Analyze a sudden car stop using all three laws | B | 15249 | 3812 | 5 | 479 | 4 | OK |
| L03.M02.O02 Evaluate the horse-and-cart puzzle | B | 15258 | 3814 | 5 | 463 | 1 | OK |
| L03.M02.O03 Justify how a rocket accelerates in empty space | B | 15270 | 3817 | 5 | 458 | 3 | OK |

Architect stack: 13568 bytes (~3392 tokens); output 28102 bytes.

## Notes

- Length differs by model: the 6 model-A pages average 942 words, the 15 model-B pages
  477. MP-04 caps each section at 220 words and sets no floor: model A wrote close to
  the cap (section average 188, max 219), model B about half (average 95, max 158). All 105
  sections are within the limit. The model-B pages are also Lessons 2-3 (the algebra-heavy
  half), so part of the gap is topic. A words target in MP-04 would make pages comparable.
- Every node carries content_sha256 and a provenance file stamped by tools/stamp.js; the
  model wrote "runtime" in every stamped field (K-15) and the client gate rejects anything else.
- The run's course and learner repositories, every stack and every raw output are kept by
  the maintainers; they are not published in this repository.
- E03 run 2 (the learner taking this course) is in `experiments/E03/results/2026-09-27-newton-learner-run.md`.
