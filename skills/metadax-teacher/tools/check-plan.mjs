#!/usr/bin/env node
// check-plan.mjs — every lesson node in a year plan must have an objective,
// a misconception, and a check. Zero dependencies.
//
// Usage: node tools/check-plan.mjs <plan.json>
// Exits 0 if all checks pass; exits 1 on any error.
//
// Input: a JSON file with a "nodes" (or "lessons") array. Each lesson node
// must have level/kind/type set to "lesson" plus the three required fields.
// See templates/YEAR-PLAN-FORMAT.md for the expected structure.

import { readFileSync } from "fs";

const [, , planPath] = process.argv;
if (!planPath) {
  console.error("Usage: check-plan.mjs <plan.json>");
  process.exit(2);
}

let plan;
try {
  plan = JSON.parse(readFileSync(planPath, "utf8"));
} catch (err) {
  console.error("Could not parse " + planPath + ": " + err.message);
  process.exit(2);
}

const nodes = plan.nodes || plan.lessons || [];
if (!Array.isArray(nodes)) {
  console.error("Expected a 'nodes' or 'lessons' array at the top level.");
  process.exit(2);
}

const errors = [];
let lessonCount = 0;

for (let i = 0; i < nodes.length; i++) {
  const node = nodes[i];
  const isLesson =
    node.level === "lesson" ||
    node.kind === "lesson" ||
    node.type === "lesson";
  if (!isLesson) continue;

  lessonCount++;
  const label = node.title || node.id || ("nodes[" + i + "]");

  if (!node.objective || String(node.objective).trim() === "") {
    errors.push(label + ": missing objective (a 'The learner can …' statement)");
  }
  if (!node.misconception || String(node.misconception).trim() === "") {
    errors.push(label + ": missing misconception (the common wrong step, as observable behaviour)");
  }
  if (!node.check || String(node.check).trim() === "") {
    errors.push(label + ": missing check (one thing to tell whether the objective landed)");
  }
}

if (lessonCount === 0) {
  console.error(
    "No lesson nodes found.\n" +
    "Each lesson must have level, kind, or type set to 'lesson'.\n" +
    "See templates/YEAR-PLAN-FORMAT.md for the expected JSON shape."
  );
  process.exit(1);
}

console.log("Lessons checked: " + lessonCount);

if (errors.length) {
  console.error("Errors:");
  for (const e of errors) console.error("  [error] " + e);
  process.exit(1);
} else {
  console.log("OK — all lessons have objective, misconception and check.");
}
