#!/usr/bin/env node
// 00-scenario.js -- generate the SIMULATED scenario: one made-up adult learner,
// "Mara", across 5 course-years (60 sessions), with 3 guides, 4 durable refusals
// issued at different times, and 2 six-month lapses.
//
// This is a SCRIPTED scenario (deterministic), not model behaviour. It is the
// ground truth the rest of the harness builds the record from and the evaluator
// judges against. Output: fixtures/scenario.json.
//
// Node stdlib only. Run: node 00-scenario.js
'use strict';
const fs = require('fs');
const path = require('path');

const LEARNER = 'lrn-mara01';
const DEVICE = 'dev-ab12cd';

// Three made-up guides (opaque handles in the record; names only for the report).
const GUIDES = { g1: 'Nadia', g2: 'Tomas', g3: 'Priya' };

// A day-stepper so session dates are deterministic (committed scripts, real Date ok here).
function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// 5 years, one course per year. 12 sessions each = 60. Concepts carry forward across
// the biology -> chemistry -> organic -> biochem -> molecular-biology arc.
const PLAN = [
  { year: 1, course: 'cell-biology', guide: 'g1', start: '2020-01-07',
    concepts: {
      'cell-structure': 82, 'osmosis': 78, 'diffusion': 74, 'enzymes': 80, 'mitosis': 85
    },
    misconceptions: { 'diffusion': 'treats diffusion and osmosis as the same process' } },

  { year: 2, course: 'intro-chemistry', guide: 'g1', start: '2021-01-12',
    concepts: {
      'atomic-structure': 76, 'chemical-bonding': 81, 'reaction-rates': 79,
      'acids-bases': 70, 'concentration': 77
    },
    misconceptions: { 'reaction-rates': 'expects rate to rise without limit as temperature rises' } },

  // lapse 1 (six months) sits just before year 3.
  { year: 3, course: 'organic-chemistry', guide: 'g2', start: '2022-07-11', lapse_before: 184,
    concepts: {
      'functional-groups': 75, 'isomers': 72, 'reaction-mechanisms': 74,
      'chemical-bonding': 84, 'reaction-rates': 80
    },
    misconceptions: {} },

  { year: 4, course: 'biochemistry', guide: 'g2', start: '2023-01-16',
    concepts: {
      'enzyme-kinetics': 73, 'metabolism': 71, 'protein-structure': 76,
      'functional-groups': 79, 'chemical-bonding': 85
    },
    misconceptions: { 'enzyme-kinetics': 'reads a saturation curve as linear' } },

  // lapse 2 (six months) sits just before year 5.
  { year: 5, course: 'molecular-biology', guide: 'g3', start: '2023-11-13', lapse_before: 182,
    concepts: {
      'dna-structure': 77, 'transcription': 72, 'translation': 74,
      'gene-regulation': 70, 'cell-division': 78, 'protein-structure': 80
    },
    misconceptions: {} }
];

// Four durable refusals, each issued inside a specific session (different times).
const REFUSALS = [
  { refusal_id: 'ref-food', year: 1, at_session: 8, directive: 'never_show',
    scope: 'example-style', target: 'food-and-diet-examples', status: 'active',
    said: 'Please stop using food and diet examples, they upset me.' },
  { refusal_id: 'ref-mito', year: 2, at_session: 4, directive: 'stop_suggesting',
    scope: 'concept', target: 'mitosis', status: 'active',
    said: 'Stop bringing mitosis back. It never clicks and I do not want it carried on.' },
  { refusal_id: 'ref-3d', year: 3, at_session: 6, directive: 'never_show',
    scope: 'modality', target: '3d-rotating-molecule-visuals', status: 'active',
    said: 'The spinning 3-D molecule animations make me dizzy, never show those.' },
  { refusal_id: 'ref-cards', year: 5, at_session: 2, directive: 'stop_suggesting',
    scope: 'technique', target: 'spaced-repetition-flashcards', status: 'active',
    said: 'Stop suggesting flashcards, I never do them.' }
];

// Ground-truth candidate carry-overs at the start of each year>1 (the superset a
// perfect proposer would consider). `truth` is the answer key for the evaluator:
//   good  = on-topic, should be offered
//   noise = too weak a link, should NOT be offered (relevance filter)
//   good-but-refused = genuinely relevant, but a durable refusal must suppress it
// `present` tags a suggested presentation that collides with a never_show refusal
// (example-style / modality) -- the filter must strip it, not the whole offer.
const BRIDGES = {
  2: [
    { from_course: 'cell-biology', from: 'enzymes', to: 'reaction-rates', bridge: 'shared-technique', present: { example_style: 'food-and-diet-examples' }, truth: 'good' },
    { from_course: 'cell-biology', from: 'osmosis', to: 'concentration', bridge: 'prerequisite', truth: 'good' },
    { from_course: 'cell-biology', from: 'diffusion', to: 'concentration', bridge: 'prerequisite', truth: 'good' }
  ],
  3: [
    { from_course: 'intro-chemistry', from: 'chemical-bonding', to: 'reaction-mechanisms', bridge: 'prerequisite', truth: 'good' },
    { from_course: 'intro-chemistry', from: 'reaction-rates', to: 'reaction-mechanisms', bridge: 'prerequisite', truth: 'good' }
  ],
  4: [
    { from_course: 'cell-biology', from: 'enzymes', to: 'enzyme-kinetics', bridge: 'prerequisite', truth: 'good' },
    { from_course: 'organic-chemistry', from: 'functional-groups', to: 'protein-structure', bridge: 'prerequisite', present: { modality: '3d-rotating-molecule-visuals' }, truth: 'good' },
    { from_course: 'intro-chemistry', from: 'chemical-bonding', to: 'protein-structure', bridge: 'prerequisite', truth: 'good' },
    { from_course: 'intro-chemistry', from: 'reaction-rates', to: 'enzyme-kinetics', bridge: 'prerequisite', truth: 'good' },
    { from_course: 'cell-biology', from: 'enzymes', to: 'metabolism', bridge: 'prerequisite', present: { example_style: 'food-and-diet-examples' }, truth: 'good' }
  ],
  5: [
    { from_course: 'biochemistry', from: 'protein-structure', to: 'translation', bridge: 'prerequisite', truth: 'good' },
    { from_course: 'intro-chemistry', from: 'chemical-bonding', to: 'dna-structure', bridge: 'prerequisite', truth: 'good' },
    { from_course: 'cell-biology', from: 'mitosis', to: 'cell-division', bridge: 'prerequisite', truth: 'good-but-refused' },
    { from_course: 'biochemistry', from: 'enzyme-kinetics', to: 'gene-regulation', bridge: 'weak', truth: 'noise' }
  ]
};

// Scripted learner responses to the offers the guide actually makes (post-filter).
// Keyed by "<into_course>:<from>-><to>". Anything not listed defaults to 'accepted'.
const OUTCOMES = {
  'intro-chemistry:diffusion->concentration': 'declined',
  'biochemistry:enzymes->metabolism': 'declined'
};

const SESSIONS_PER_YEAR = 12;
const DAYS_BETWEEN_SESSIONS = 9;

// Expand into 60 session records with a per-session competency ramp and a short note.
function buildSessions() {
  const sessions = [];
  for (const y of PLAN) {
    const conceptEntries = Object.entries(y.concepts);
    for (let s = 1; s <= SESSIONS_PER_YEAR; s++) {
      const at = addDays(y.start, (s - 1) * DAYS_BETWEEN_SESSIONS);
      // Each session touches ~2 concepts, cycling through the course's set.
      const touched = [];
      for (let k = 0; k < 2; k++) {
        const idx = ((s - 1) * 2 + k) % conceptEntries.length;
        const [concept, finalComp] = conceptEntries[idx];
        // competency ramps toward the final across the 12 sessions.
        const comp = Math.round(finalComp * Math.min(1, s / 9));
        const entry = { concept, competency: comp };
        if (y.misconceptions[concept] && s <= 6) entry.misconception = y.misconceptions[concept];
        touched.push(entry);
      }
      const note = `Year ${y.year} ${y.course} session ${s}: worked on ` +
        touched.map(t => t.concept).join(' and ') +
        `. ${s === 1 ? 'Opened the course.' : s === SESSIONS_PER_YEAR ? 'Wrapped the course.' : 'Steady progress.'}`;
      sessions.push({ year: y.year, course_id: y.course, guide_ref: y.guide, at, session_no: s, concepts: touched, note });
    }
  }
  return sessions;
}

const scenario = {
  note: 'SIMULATED scenario. Scripted, deterministic ground truth. Not a real person.',
  learner_id: LEARNER,
  device_id: DEVICE,
  guides: GUIDES,
  plan: PLAN,
  refusals: REFUSALS,
  bridges: BRIDGES,
  outcomes: OUTCOMES,
  sessions_per_year: SESSIONS_PER_YEAR,
  sessions: buildSessions()
};

const outPath = path.join(__dirname, '..', 'fixtures', 'scenario.json');
fs.writeFileSync(outPath, JSON.stringify(scenario, null, 2) + '\n');
console.log('wrote', outPath, '-', scenario.sessions.length, 'sessions');
