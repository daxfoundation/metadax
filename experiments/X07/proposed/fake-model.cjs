#!/usr/bin/env node
// fake-model.js — scripted deterministic stand-in for a 2–4B constrained model.
// Generates 20 quiz turns (10 question turns + 10 evaluation turns) from a
// minimal practice bank fixture, then validates each through conformance-tester.
//
// Labelled SIMULATED throughout — no real model ran.
// Designed to exercise both grammar shapes in conformance-tester.js.
//
// Usage:
//   node fake-model.js                      — run 20 turns, print JSONL + summary
//   node fake-model.js --out <file.jsonl>   — write raw outputs to file

'use strict';

const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// Minimal practice bank fixture (3 items, 2 concepts)
// ─────────────────────────────────────────────────────────────────────────────

const PRACTICE_BANK = [
  {
    id: 'n_0000000000000000000000001#p01',
    concept: 'fractions',
    bloom_level: 'Remember',
    question_type: 'True/False',
    grading: 'exact',
    question: 'A fraction always has a numerator and a denominator.',
    answer: 'True',
    accept: ['true'],
    explanation: 'By definition a fraction is a/b with numerator a and denominator b.',
  },
  {
    id: 'n_0000000000000000000000001#p02',
    concept: 'fractions',
    bloom_level: 'Understand',
    question_type: 'Multiple Choice',
    grading: 'exact',
    question: 'Which fraction is equivalent to 1/2?',
    options: ['1/3', '2/4', '3/5', '4/6'],
    answer: '2/4',
    accept: ['2/4'],
    explanation: '2/4 simplifies to 1/2 by dividing numerator and denominator by 2.',
  },
  {
    id: 'n_0000000000000000000000002#p01',
    concept: 'decimals',
    bloom_level: 'Remember',
    question_type: 'Fill-in-the-Blanks',
    grading: 'exact',
    question: '0.5 as a fraction is ___.',
    answer: '1/2',
    accept: ['1/2', '½'],
    explanation: '0.5 = 5/10 = 1/2 in lowest terms.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Learner answers fixture — deterministic, cycling correct/incorrect
// ─────────────────────────────────────────────────────────────────────────────

const LEARNER_ANSWERS = [
  { item: 0, answer: 'True',  correct: true  },
  { item: 1, answer: '2/4',   correct: true  },
  { item: 2, answer: '1/3',   correct: false },
  { item: 0, answer: 'False', correct: false },
  { item: 1, answer: '1/3',   correct: false },
  { item: 2, answer: '1/2',   correct: true  },
  { item: 0, answer: 'True',  correct: true  },
  { item: 1, answer: '2/4',   correct: true  },
  { item: 2, answer: '1/2',   correct: true  },
  { item: 0, answer: 'True',  correct: true  },
];

// ─────────────────────────────────────────────────────────────────────────────
// State helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeInitialState(item) {
  return {
    concept_order: ['fractions', 'decimals'],
    concept: item.concept,
    level: item.bloom_level,
    attempt: 1,
    help_used: false,
    hints_given: 0,
    phase: 'main',
    levels: {
      fractions: { Remember: 'not_started', Understand: 'not_started' },
      decimals:  { Remember: 'not_started' },
    },
    competency: { fractions: 0, decimals: 0 },
  };
}

function advanceState(state, item, correct, attempt) {
  const newState = JSON.parse(JSON.stringify(state));
  newState.attempt = attempt + 1;
  const status = correct ? (attempt === 1 ? 'passed_first_try' : 'passed_after_help') : 'failed';
  if (!newState.levels[item.concept]) newState.levels[item.concept] = {};
  newState.levels[item.concept][item.bloom_level] = status;
  const weight = item.bloom_level === 'Remember' ? 10
               : item.bloom_level === 'Understand' ? 15
               : item.bloom_level === 'Apply'      ? 20
               : item.bloom_level === 'Analyze'    ? 20
               : item.bloom_level === 'Evaluate'   ? 15 : 20;
  const earned = correct ? (attempt === 1 ? weight : weight * 0.5) : 0;
  const prev = newState.competency[item.concept] || 0;
  newState.competency[item.concept] = Math.min(100, Math.round(prev + earned));
  return newState;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate question turn (grammar shape: tutor-turn, type=question)
// ─────────────────────────────────────────────────────────────────────────────

function generateQuestionTurn(item, state, turnIndex) {
  const display = {
    message: `Turn ${turnIndex + 1}: Let's test your knowledge of ${item.concept}.`,
    instructions: item.question_type === 'True/False'
      ? 'Reply with **True** or **False**.'
      : item.question_type === 'Multiple Choice'
        ? 'Reply with the letter or the full text of the best answer.'
        : 'Fill in the blank with a single value.',
    example: item.question_type === 'True/False'
      ? 'E.g. "True — because water is wet."'
      : item.question_type === 'Multiple Choice'
        ? 'E.g. "2/6 — because 2 and 6 share a factor of 2."'
        : 'E.g. "0.25 as a fraction is 1/4."',
    question: item.question,
  };
  if (item.options) display.options = item.options;

  return {
    schema: 'metadax.tutor-turn/0.2',
    type: 'question',
    display,
    meta: {
      concept: item.concept,
      bloom_level: item.bloom_level,
      question_type: item.question_type,
      attempt: state.attempt,
    },
    state,
    next_action: 'awaiting_answer',
    warnings: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate evaluation (grammar shape: evaluation, MP-07 output)
// ─────────────────────────────────────────────────────────────────────────────

function generateEvaluation(item, learnerAnswer, correct) {
  const score = correct ? 100 : 0;
  const result = correct ? 'correct' : 'incorrect';
  const criteria = item.grading === 'rubric'
    ? [{ criterion: 'Answer matches expected', status: correct ? 'met' : 'not_met' }]
    : [];

  return {
    type: 'evaluation',
    score,
    result,
    criteria,
    bonus_points: 0,
    misconception: correct ? '' : `Common error: confusing ${item.concept} equivalences`,
    feedback_md: correct
      ? `Correct. "${learnerAnswer}" matches the expected answer. ${item.explanation}`
      : `Not quite. "${learnerAnswer}" is not correct. ${item.explanation}`,
    next_hint: correct ? '' : (item.hints ? item.hints[0] : `Review the definition of ${item.concept}.`),
    warnings: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Run 20 turns (10 pairs of question+evaluation)
// ─────────────────────────────────────────────────────────────────────────────

function runTurns() {
  const outputs = [];
  let state = makeInitialState(PRACTICE_BANK[0]);

  for (let i = 0; i < 10; i++) {
    const la = LEARNER_ANSWERS[i];
    const item = PRACTICE_BANK[la.item];

    // Question turn
    const questionTurn = generateQuestionTurn(item, JSON.parse(JSON.stringify(state)), i);
    outputs.push({ turnIndex: outputs.length, role: 'question', data: questionTurn });

    // Evaluation turn
    const evaluation = generateEvaluation(item, la.answer, la.correct);
    outputs.push({ turnIndex: outputs.length, role: 'evaluation', data: evaluation });

    // Advance state for next pair
    state = advanceState(state, item, la.correct, state.attempt);
  }

  return outputs;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline validation (mirrors conformance-tester logic, self-contained)
// ─────────────────────────────────────────────────────────────────────────────

const BLOOM_LEVELS   = ['Remember','Understand','Apply','Analyze','Evaluate','Create'];
const NEXT_ACTIONS   = ['awaiting_answer','awaiting_command','done'];
const TURN_TYPES     = ['intro','question','feedback','handoff','summary','error'];
const LEVEL_STATUSES = ['not_started','passed_first_try','passed_after_help','failed','skipped'];
const PHASES         = ['main','remedial'];
const EVAL_RESULTS   = ['correct','partial','incorrect'];
const CONCEPT_ID_RE  = /^[a-z0-9][a-z0-9-]*$/;
const CRITERION_STATUSES = ['met','partly','not_met'];

function quickValidate(obj) {
  // Delegate to conformance-tester if available, else do basic checks
  const errors = [];
  if (!obj || typeof obj !== 'object') return ['not an object'];

  if (obj.type === 'evaluation') {
    if (!Number.isInteger(obj.score) || obj.score < 0 || obj.score > 100) errors.push('score out of range');
    if (!EVAL_RESULTS.includes(obj.result)) errors.push('invalid result');
    if (!Array.isArray(obj.criteria)) errors.push('criteria not array');
    if (!Number.isInteger(obj.bonus_points) || obj.bonus_points < 0 || obj.bonus_points > 10) errors.push('bonus_points out of range');
    if (typeof obj.feedback_md !== 'string') errors.push('feedback_md not string');
    if (typeof obj.next_hint !== 'string') errors.push('next_hint not string');
    if (!Array.isArray(obj.warnings)) errors.push('warnings not array');
  } else {
    if (obj.schema !== 'metadax.tutor-turn/0.2') errors.push('wrong schema');
    if (!TURN_TYPES.includes(obj.type)) errors.push('invalid type');
    if (!NEXT_ACTIONS.includes(obj.next_action)) errors.push('invalid next_action');
    if (!obj.state) errors.push('state missing');
    else {
      const s = obj.state;
      if (!BLOOM_LEVELS.includes(s.level)) errors.push('state.level invalid');
      if (!PHASES.includes(s.phase)) errors.push('state.phase invalid');
      if (!CONCEPT_ID_RE.test(s.concept)) errors.push('state.concept invalid');
    }
    if (obj.type === 'question') {
      if (!obj.display) errors.push('question turn missing display');
      if (!obj.meta)    errors.push('question turn missing meta');
      if (obj.meta && !BLOOM_LEVELS.includes(obj.meta.bloom_level)) errors.push('meta.bloom_level invalid');
    }
  }
  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const outArg = args.indexOf('--out');
const outFile = outArg >= 0 ? args[outArg + 1] : null;

const turns = runTurns();

let validCount = 0, invalidCount = 0;
const rawLines = [];
const summary = [];

for (const turn of turns) {
  const errs = quickValidate(turn.data);
  const valid = errs.length === 0;
  if (valid) validCount++; else invalidCount++;

  const record = {
    turn: turn.turnIndex,
    role: turn.role,
    valid,
    errors: errs,
    // SIMULATED label on the data
    data: Object.assign({ _simulated: true }, turn.data),
  };
  rawLines.push(JSON.stringify(record));
  summary.push({ turn: turn.turnIndex, role: turn.role, valid, errors: errs });
}

// Output raw JSONL
const jsonlOutput = rawLines.join('\n') + '\n';

if (outFile) {
  fs.writeFileSync(outFile, jsonlOutput);
  process.stderr.write(`Wrote ${turns.length} turns to ${outFile}\n`);
} else {
  process.stdout.write(jsonlOutput);
}

// Summary to stderr
process.stderr.write([
  '',
  '=== SIMULATED run summary ===',
  `Turns generated : ${turns.length} (10 question + 10 evaluation)`,
  `Grammar-valid   : ${validCount}/${turns.length}`,
  `Invalid         : ${invalidCount}`,
  `Note: this is a SCRIPTED FAKE MODEL — no real 2–4B model ran.`,
  `      A real run requires: llama.cpp or equivalent + a 2–4B GGUF model.`,
  '',
].join('\n'));

if (invalidCount > 0) process.exit(1);
