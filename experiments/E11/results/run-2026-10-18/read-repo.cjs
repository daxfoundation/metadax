#!/usr/bin/env node
// Reads the learner repo and prints a compact text summary for the companion subagent.
// Usage: node read-repo.cjs [--cap 4096|16384] [--without-week3]
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'learner-repo');
const args = process.argv.slice(2);
const cap = parseInt(args[args.indexOf('--cap') + 1] || '4096');
const withoutWeek3 = args.includes('--without-week3');

function r(p) {
  try { return JSON.parse(fs.readFileSync(path.join(BASE, p), 'utf8')); }
  catch { return null; }
}

const course = r('course.json');
const profile = r('learners/lrn-mira01/profile.json');
const refusals = r('learners/lrn-mira01/never_show.json');
const guideNote = r('learners/lrn-mira01/guide_note.json');

// Read weekly progress (latest file per week)
const progDir = 'learners/lrn-mira01/progress/data-analysis-fundamentals/dev-alpha';
const progFiles = fs.readdirSync(path.join(BASE, progDir))
  .filter(f => f.endsWith('.json'))
  .sort()
  .map(f => r(`${progDir}/${f}`))
  .filter(Boolean)
  .filter(wk => withoutWeek3 ? wk.week_number !== 3 : true);

// Read public nodes
const publicNodeIds = fs.readdirSync(path.join(BASE, 'nodes'));
const publicNodes = publicNodeIds.map(id => {
  const n = r(`nodes/${id}/node.json`);
  return n && n.visibility === 'public' ? n : null;
}).filter(Boolean);

// Build output text
const lines = [
  '=== LEARNER REPO CONTENTS ===',
  `Course: ${course.title}`,
  `Description: ${course.description}`,
  '',
  '--- PROFILE ---',
  JSON.stringify(profile, null, 2),
  '',
  '--- REFUSALS (mandatory, never omit) ---',
  JSON.stringify(refusals, null, 2),
  '',
  '--- GUIDE NOTE ---',
  JSON.stringify(guideNote, null, 2),
  '',
  '--- WEEKLY PROGRESS ---',
  ...progFiles.map(wk =>
    `Week ${wk.week_number} (${wk.snapshot_date}): topics=${wk.topics_covered.join(', ')}; competency=${wk.overall_competency}; sessions=${wk.sessions_completed}; summary="${wk.weekly_summary}"`
  ),
  '',
  '--- PUBLIC FOLLOW-UP NODES (21 total, no private nodes included) ---',
  ...publicNodes.map(n =>
    `[${n.id}] week${n.week} "${n.title}" (${n.concept}): ${n.core.body}`
  ),
  '',
  `=== END REPO (cap=${cap} bytes) ===`
];

const text = lines.join('\n');
process.stdout.write(text);
