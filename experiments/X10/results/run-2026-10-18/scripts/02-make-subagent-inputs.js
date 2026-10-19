#!/usr/bin/env node
// 02-make-subagent-inputs.js -- assemble the exact inputs each SIMULATED subagent gets.
// Probes see ONLY a compacted view + the next year's guide-facing offers (never the
// scenario, the suppression reasoning, or the answer key). Guides see their course's
// post-filter offers + the refusal set. The evaluator (grader) gets the answer key.
'use strict';
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'out');
const scenario = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'scenario.json'), 'utf8'));
const carry = JSON.parse(fs.readFileSync(path.join(OUT, 'carryover-by-year.json'), 'utf8'));
const read = y => JSON.parse(fs.readFileSync(path.join(OUT, 'compacted-by-year', `year-${y}.json`), 'utf8')).view;

// --- Probe inputs: one per year. Only the compacted view + guide-facing next-year offers. ---
const inDir = path.join(OUT, 'subagent-inputs');
fs.mkdirSync(inDir, { recursive: true });
for (let y = 1; y <= 5; y++) {
  const view = read(y);
  const nextOffers = carry[String(y + 1)] ? carry[String(y + 1)].offers : [];
  const probeInput = {
    instruction: 'You see ONLY this learner compacted view and the carry-over offers a guide would be given for the NEXT course. You do not have the raw record or any answer key. Decide whether every refusal is honoured.',
    compacted_view: view,
    next_course_guide_offers: nextOffers
  };
  fs.writeFileSync(path.join(inDir, `probe-year-${y}.json`), JSON.stringify(probeInput, null, 2) + '\n');
}

// --- Guide inputs: G1@Y2, G2@Y4, G3@Y5 (each guide's richest carry-over moment). ---
const guideMoments = [
  { guide: 'g1', name: 'Nadia', year: 2 },
  { guide: 'g2', name: 'Tomas', year: 4 },
  { guide: 'g3', name: 'Priya', year: 5 }
];
for (const g of guideMoments) {
  const view = read(g.year - 1); // the view handed to the guide at the course seam
  const res = carry[String(g.year)];
  const course = scenario.plan.find(p => p.year === g.year);
  const guideInput = {
    instruction: 'You are the guide opening a new course for an adult learner. Use the carry-over offers to open from what they already hold. You MUST honour every refusal. Produce a short opening (<=120 words) and name which offers you lean on.',
    new_course: course.course,
    new_course_concepts: Object.keys(course.concepts),
    carry_over_offers: res.offers,
    active_refusals: view.refusals.map(r => ({ directive: r.directive, scope: r.scope, target: r.target, said: r.said })),
    lapse_before_days: course.lapse_before || 0
  };
  fs.writeFileSync(path.join(inDir, `guide-${g.guide}-year-${g.year}.json`), JSON.stringify(guideInput, null, 2) + '\n');
}

// --- Evaluator input: all offers + the answer key (bridges with truth labels). ---
const evalInput = {
  instruction: 'You are the carry-over correctness evaluator (grader). For each year, judge the proposer against the answer key.',
  per_year: {},
  answer_key: scenario.bridges
};
for (let y = 2; y <= 5; y++) {
  evalInput.per_year[y] = { offers: carry[String(y)].offers, not_offered: carry[String(y)].not_offered, suppressed: carry[String(y)].suppressed };
}
fs.writeFileSync(path.join(inDir, 'evaluator-input.json'), JSON.stringify(evalInput, null, 2) + '\n');

console.log('wrote subagent inputs to', inDir);
console.log(fs.readdirSync(inDir).join('\n'));
