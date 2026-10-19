#!/usr/bin/env node
// conformance-tester.js — validates quiz-turn JSON outputs against the grammar rules
// from quiz-turn.gbnf and the tutor-turn/0.2 schema.
//
// Usage:
//   node conformance-tester.js <input.jsonl>   — validate each line
//   node conformance-tester.js --self-test      — run built-in fixtures
//
// Exit 0 if all outputs pass; exit 1 if any fail.
// Writes a JSONL result to stdout: one record per input.
//
// Zero dependencies — pure Node stdlib.

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Schema constants (derived from grammar and tutor-turn/0.2 schema)
// ─────────────────────────────────────────────────────────────────────────────

const BLOOM_LEVELS = ['Remember','Understand','Apply','Analyze','Evaluate','Create'];
const NEXT_ACTIONS = ['awaiting_answer','awaiting_command','done'];
const TURN_TYPES   = ['intro','question','feedback','handoff','summary','error'];
const LEVEL_STATUSES = ['not_started','passed_first_try','passed_after_help','failed','skipped'];
const PHASES = ['main','remedial'];
const WARNING_CODES = [
  'steer_conflict','audience_conflict','out_of_scope','depth_limit','low_confidence',
  'source_gap','wellbeing_flag','missing_input','orphans_followups','budget_unmet','unstamped',
];
const CRITERION_STATUSES = ['met','partly','not_met'];
const EVAL_RESULTS = ['correct','partial','incorrect'];
const QUESTION_TYPES = [
  'True/False','Multiple Choice','Matching','Fill-in-the-Blanks','Binary Choice',
  'Short Answer (explain in own words)','Categorization','Cloze','Numeric/Calculation',
  'Short Answer (practical use)','Completion','Short Problem-Solving','Ordering/Sequencing',
  'Assertion-Reason','Ranking','Short Answer (analytical)','Short Answer (critical judgement)',
  'Short Essay (1 paragraph)','Ranking with justification','Essay or Design','Open-Ended Completion',
];
const CONCEPT_ID_RE = /^[a-z0-9][a-z0-9-]*$/;

// ─────────────────────────────────────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────────────────────────────────────

function fail(errors, msg) { errors.push(msg); }

function requireString(val, path, errors) {
  if (typeof val !== 'string') fail(errors, `${path}: must be a string, got ${typeof val}`);
}

function requireEnum(val, path, allowed, errors) {
  if (!allowed.includes(val)) fail(errors, `${path}: "${val}" not in [${allowed.join(', ')}]`);
}

function requireInt(val, path, min, max, errors) {
  if (!Number.isInteger(val)) fail(errors, `${path}: must be an integer, got ${val}`);
  else if (val < min || val > max) fail(errors, `${path}: ${val} outside [${min}, ${max}]`);
}

function requireConceptId(val, path, errors) {
  requireString(val, path, errors);
  if (typeof val === 'string' && !CONCEPT_ID_RE.test(val))
    fail(errors, `${path}: "${val}" is not a valid concept id (^[a-z0-9][a-z0-9-]*$)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// State validator (shared between tutor-turn types)
// ─────────────────────────────────────────────────────────────────────────────

function validateState(state, errors) {
  const p = 'state';
  if (typeof state !== 'object' || state === null || Array.isArray(state)) {
    fail(errors, `${p}: must be an object`); return;
  }
  const req = ['concept_order','concept','level','attempt','help_used','hints_given','phase','levels','competency'];
  for (const k of req) if (!(k in state)) fail(errors, `${p}.${k}: required field missing`);

  if (Array.isArray(state.concept_order)) {
    state.concept_order.forEach((c,i) => requireConceptId(c, `${p}.concept_order[${i}]`, errors));
  } else {
    fail(errors, `${p}.concept_order: must be an array`);
  }

  requireConceptId(state.concept, `${p}.concept`, errors);
  requireEnum(state.level, `${p}.level`, BLOOM_LEVELS, errors);
  requireInt(state.attempt, `${p}.attempt`, 1, 999, errors);
  if (typeof state.help_used !== 'boolean') fail(errors, `${p}.help_used: must be boolean`);
  if (![0,1,2].includes(state.hints_given)) fail(errors, `${p}.hints_given: must be 0, 1, or 2`);
  requireEnum(state.phase, `${p}.phase`, PHASES, errors);

  if (typeof state.levels === 'object' && state.levels !== null && !Array.isArray(state.levels)) {
    for (const [concept, levelMap] of Object.entries(state.levels)) {
      if (typeof levelMap !== 'object' || levelMap === null) {
        fail(errors, `${p}.levels.${concept}: must be an object`); continue;
      }
      for (const [bloom, status] of Object.entries(levelMap)) {
        requireEnum(bloom, `${p}.levels.${concept} key`, BLOOM_LEVELS, errors);
        requireEnum(status, `${p}.levels.${concept}.${bloom}`, LEVEL_STATUSES, errors);
      }
    }
  } else {
    fail(errors, `${p}.levels: must be an object`);
  }

  if (typeof state.competency === 'object' && state.competency !== null && !Array.isArray(state.competency)) {
    for (const [concept, score] of Object.entries(state.competency)) {
      requireInt(score, `${p}.competency.${concept}`, 0, 100, errors);
    }
  } else {
    fail(errors, `${p}.competency: must be an object`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Display validator
// ─────────────────────────────────────────────────────────────────────────────

function validateDisplay(display, errors) {
  if (typeof display !== 'object' || display === null) { fail(errors, 'display: must be an object'); return; }
  requireString(display.message, 'display.message', errors);
  for (const opt of ['instructions','example','question']) {
    if (opt in display) requireString(display[opt], `display.${opt}`, errors);
  }
  if ('options' in display) {
    if (!Array.isArray(display.options)) fail(errors, 'display.options: must be an array');
    else display.options.forEach((o,i) => requireString(o, `display.options[${i}]`, errors));
  }
  const extra = Object.keys(display).filter(k => !['message','instructions','example','question','options'].includes(k));
  if (extra.length) fail(errors, `display: unknown field(s): ${extra.join(', ')}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Meta validator
// ─────────────────────────────────────────────────────────────────────────────

function validateMeta(meta, errors) {
  if (typeof meta !== 'object' || meta === null) { fail(errors, 'meta: must be an object'); return; }
  requireConceptId(meta.concept, 'meta.concept', errors);
  requireEnum(meta.bloom_level, 'meta.bloom_level', BLOOM_LEVELS, errors);
  requireEnum(meta.question_type, 'meta.question_type', QUESTION_TYPES, errors);
  requireInt(meta.attempt, 'meta.attempt', 1, 999, errors);
}

// ─────────────────────────────────────────────────────────────────────────────
// Warnings array validator
// ─────────────────────────────────────────────────────────────────────────────

function validateWarnings(warnings, path, errors) {
  if (!Array.isArray(warnings)) { fail(errors, `${path}: must be an array`); return; }
  warnings.forEach((w,i) => requireEnum(w, `${path}[${i}]`, WARNING_CODES, errors));
}

// ─────────────────────────────────────────────────────────────────────────────
// Top-level validators
// ─────────────────────────────────────────────────────────────────────────────

function validateTutorTurn(obj) {
  const errors = [];

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return { valid: false, errors: ['root: must be a JSON object'] };
  }

  // Required scalar fields
  if (obj.schema !== 'metadax.tutor-turn/0.2')
    fail(errors, `schema: must be "metadax.tutor-turn/0.2", got "${obj.schema}"`);
  requireEnum(obj.type, 'type', TURN_TYPES, errors);
  requireEnum(obj.next_action, 'next_action', NEXT_ACTIONS, errors);

  // State (required)
  if ('state' in obj) validateState(obj.state, errors);
  else fail(errors, 'state: required field missing');

  // Optional fields
  if ('display' in obj)   validateDisplay(obj.display, errors);
  if ('meta' in obj)      validateMeta(obj.meta, errors);
  if ('warnings' in obj)  validateWarnings(obj.warnings, 'warnings', errors);

  // Feedback object (optional)
  if ('feedback' in obj) {
    const fb = obj.feedback;
    if (typeof fb !== 'object' || fb === null) {
      fail(errors, 'feedback: must be an object');
    } else {
      if ('result' in fb && fb.result !== null)
        requireEnum(fb.result, 'feedback.result', ['correct','partial','incorrect'], errors);
      for (const f of ['hint','correct_answer','explanation','misconception']) {
        if (f in fb) requireString(fb[f], `feedback.${f}`, errors);
      }
    }
  }

  // Semantic rules for question turns
  if (obj.type === 'question') {
    if (!obj.display) fail(errors, 'type=question: display is required');
    if (!obj.meta)    fail(errors, 'type=question: meta is required');
    if (obj.next_action !== 'awaiting_answer')
      fail(errors, 'type=question: next_action must be "awaiting_answer"');
  }

  return { valid: errors.length === 0, errors };
}

function validateEvaluation(obj) {
  const errors = [];

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return { valid: false, errors: ['root: must be a JSON object'] };
  }

  if (obj.type !== 'evaluation')
    fail(errors, `type: must be "evaluation", got "${obj.type}"`);
  requireInt(obj.score, 'score', 0, 100, errors);
  requireEnum(obj.result, 'result', EVAL_RESULTS, errors);

  if (!Array.isArray(obj.criteria)) {
    fail(errors, 'criteria: must be an array');
  } else {
    obj.criteria.forEach((c,i) => {
      if (typeof c !== 'object' || c === null) { fail(errors, `criteria[${i}]: must be an object`); return; }
      requireString(c.criterion, `criteria[${i}].criterion`, errors);
      requireEnum(c.status, `criteria[${i}].status`, CRITERION_STATUSES, errors);
    });
  }

  requireInt(obj.bonus_points, 'bonus_points', 0, 10, errors);
  requireString(obj.misconception, 'misconception', errors);
  requireString(obj.feedback_md, 'feedback_md', errors);
  requireString(obj.next_hint, 'next_hint', errors);

  if ('warnings' in obj) validateWarnings(obj.warnings, 'warnings', errors);
  else fail(errors, 'warnings: required field missing');

  return { valid: errors.length === 0, errors };
}

// ─────────────────────────────────────────────────────────────────────────────
// Route: detect which type and validate
// ─────────────────────────────────────────────────────────────────────────────

function validateOutput(obj) {
  if (obj && obj.type === 'evaluation') return validateEvaluation(obj);
  if (obj && obj.schema === 'metadax.tutor-turn/0.2') return validateTutorTurn(obj);
  // Heuristic fallback: check for tutor-turn-like structure
  if (obj && TURN_TYPES.includes(obj.type)) return validateTutorTurn(obj);
  return { valid: false, errors: ['Cannot determine output type: missing schema or unrecognised type'] };
}

// ─────────────────────────────────────────────────────────────────────────────
// Self-test fixtures
// ─────────────────────────────────────────────────────────────────────────────

const SELF_TESTS = [
  {
    label: 'valid question turn',
    expectValid: true,
    input: {
      schema: 'metadax.tutor-turn/0.2',
      type: 'question',
      display: {
        message: 'Here is your first question.',
        instructions: 'Choose the best answer.',
        example: 'E.g. "False — because X"',
        question: 'Is water a compound?',
        options: ['True','False'],
      },
      meta: { concept: 'compounds', bloom_level: 'Remember', question_type: 'True/False', attempt: 1 },
      state: {
        concept_order: ['compounds'],
        concept: 'compounds',
        level: 'Remember',
        attempt: 1,
        help_used: false,
        hints_given: 0,
        phase: 'main',
        levels: { compounds: { Remember: 'not_started' } },
        competency: { compounds: 0 },
      },
      next_action: 'awaiting_answer',
    },
  },
  {
    label: 'valid feedback turn',
    expectValid: true,
    input: {
      schema: 'metadax.tutor-turn/0.2',
      type: 'feedback',
      display: { message: 'Correct! Well done.' },
      feedback: { result: 'correct', explanation: 'Water (H2O) is indeed a compound.' },
      state: {
        concept_order: ['compounds'],
        concept: 'compounds',
        level: 'Understand',
        attempt: 1,
        help_used: false,
        hints_given: 0,
        phase: 'main',
        levels: { compounds: { Remember: 'passed_first_try' } },
        competency: { compounds: 10 },
      },
      next_action: 'awaiting_command',
    },
  },
  {
    label: 'valid evaluation',
    expectValid: true,
    input: {
      type: 'evaluation',
      score: 75,
      result: 'partial',
      criteria: [
        { criterion: 'Names the compound correctly', status: 'met' },
        { criterion: 'Explains bonding type', status: 'not_met' },
      ],
      bonus_points: 0,
      misconception: '',
      feedback_md: 'You named the compound. Explain the covalent bond next.',
      next_hint: 'Think about shared electrons between H and O.',
      warnings: [],
    },
  },
  {
    label: 'invalid — wrong schema string',
    expectValid: false,
    input: {
      schema: 'metadax.tutor-turn/0.1',  // wrong version
      type: 'question',
      state: {
        concept_order: ['x'], concept: 'x', level: 'Remember', attempt: 1,
        help_used: false, hints_given: 0, phase: 'main', levels: {}, competency: {},
      },
      next_action: 'awaiting_answer',
    },
  },
  {
    label: 'invalid — question turn missing meta',
    expectValid: false,
    input: {
      schema: 'metadax.tutor-turn/0.2',
      type: 'question',
      display: { message: 'Q?' },
      // meta missing
      state: {
        concept_order: ['x'], concept: 'x', level: 'Remember', attempt: 1,
        help_used: false, hints_given: 0, phase: 'main', levels: {}, competency: {},
      },
      next_action: 'awaiting_answer',
    },
  },
  {
    label: 'invalid — bloom_level typo',
    expectValid: false,
    input: {
      schema: 'metadax.tutor-turn/0.2',
      type: 'question',
      display: { message: 'Q?' },
      meta: { concept: 'x', bloom_level: 'remember', question_type: 'True/False', attempt: 1 }, // lowercase
      state: {
        concept_order: ['x'], concept: 'x', level: 'Remember', attempt: 1,
        help_used: false, hints_given: 0, phase: 'main', levels: {}, competency: {},
      },
      next_action: 'awaiting_answer',
    },
  },
  {
    label: 'invalid — score out of range',
    expectValid: false,
    input: {
      type: 'evaluation', score: 110, result: 'correct',
      criteria: [], bonus_points: 0, misconception: '',
      feedback_md: 'ok', next_hint: '', warnings: [],
    },
  },
  {
    label: 'invalid — concept id with uppercase',
    expectValid: false,
    input: {
      schema: 'metadax.tutor-turn/0.2',
      type: 'feedback',
      display: { message: 'ok' },
      state: {
        concept_order: ['BadConcept'],  // uppercase
        concept: 'BadConcept',
        level: 'Remember', attempt: 1,
        help_used: false, hints_given: 0, phase: 'main', levels: {}, competency: {},
      },
      next_action: 'awaiting_command',
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CLI entry point
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');

function runSelfTest() {
  let passed = 0, failed = 0;
  for (const t of SELF_TESTS) {
    const result = validateOutput(t.input);
    const ok = result.valid === t.expectValid;
    const mark = ok ? 'PASS' : 'FAIL';
    const detail = ok ? '' : ` [expected valid=${t.expectValid}, errors: ${result.errors.join('; ')}]`;
    console.log(`${mark}  ${t.label}${detail}`);
    if (ok) passed++; else failed++;
  }
  console.log(`\n${passed}/${SELF_TESTS.length} self-tests passed`);
  if (failed > 0) process.exit(1);
}

function runFile(path) {
  const lines = fs.readFileSync(path, 'utf8').split('\n').filter(l => l.trim());
  let passed = 0, failed = 0;
  for (let i = 0; i < lines.length; i++) {
    let obj;
    try { obj = JSON.parse(lines[i]); }
    catch (e) {
      const rec = { line: i+1, valid: false, errors: [`JSON parse error: ${e.message}`] };
      console.log(JSON.stringify(rec));
      failed++; continue;
    }
    const result = validateOutput(obj);
    const rec = { line: i+1, valid: result.valid, errors: result.errors };
    console.log(JSON.stringify(rec));
    if (result.valid) passed++; else failed++;
  }
  process.stderr.write(`\n${passed}/${lines.length} outputs valid\n`);
  if (failed > 0) process.exit(1);
}

const args = process.argv.slice(2);
if (args[0] === '--self-test') {
  runSelfTest();
} else if (args[0]) {
  runFile(args[0]);
} else {
  console.error('Usage: node conformance-tester.js <input.jsonl> | --self-test');
  process.exit(1);
}
