#!/usr/bin/env node
'use strict';
// build-cm-stacks.cjs -- build Charlotte Mason variant stacks for run 2.
// Reads run-2026-10-18 variant stacks, substitutes §1 with the CM §1,
// and writes stacks + expect.json for the 4 CM eval cases.

const fs = require('fs');
const path = require('path');

const RUN1_DIR = path.resolve(__dirname, '..', 'run-2026-10-18');
const RUN2_DIR = path.resolve(__dirname);
const CM_S1 = fs.readFileSync(path.join(RUN2_DIR, 'cm-variant-section1.txt'), 'utf8').trim();

// The retrieval-first §1 to replace (from variant-stack.txt)
const R1_S1_START = '1. Start or resume\n- If SESSION has no previous state, this is a new quiz:';
const R1_S1_END_MARKER = '\n2. Levels and weights';

function substituteSection1(text, newS1) {
  const start = text.indexOf(R1_S1_START);
  if (start < 0) throw new Error('Could not find §1 start in stack');
  const end = text.indexOf(R1_S1_END_MARKER, start);
  if (end < 0) throw new Error('Could not find §2 start in stack');
  return text.slice(0, start) + newS1 + '\n' + text.slice(end + 1);
}

// Read a stack file from run1
function readRun1Stack(caseGroup, caseName, type) {
  const fname = type === 'stack' ? 'stack.txt' : type + '-stack.txt';
  const f = path.join(RUN1_DIR, 'evals', 'cases', caseGroup, caseName, fname);
  if (!fs.existsSync(f)) return null;
  return fs.readFileSync(f, 'utf8');
}

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  console.log('wrote', path.relative(RUN2_DIR, p));
}

// --- Build the 6 MP-06 base case CM variant stacks ---
// We reuse the variant-stack.txt from run1, replacing §1 with CM §1.
// These are used for the regression check (do base cases still pass?).
const MP06_CASES = ['correct-answer', 'handoff-ask', 'hint', 'intro', 'summary-end', 'wrong-answer'];
for (const c of MP06_CASES) {
  const varStack = readRun1Stack('MP-06', c, 'variant');
  if (!varStack) { console.warn('missing variant stack for MP-06/' + c); continue; }
  const baseStack = readRun1Stack('MP-06', c, 'stack');
  const cmStack = substituteSection1(varStack, CM_S1);
  const outDir = path.join(RUN2_DIR, 'evals', 'cases', 'MP-06', c);
  if (baseStack) writeFile(path.join(outDir, 'stack.txt'), baseStack);
  writeFile(path.join(outDir, 'variant-stack.txt'), cmStack);
  // Copy expect.json from run1
  const expectSrc = path.join(RUN1_DIR, 'evals', 'cases', 'MP-06', c, 'expect.json');
  if (fs.existsSync(expectSrc)) writeFile(path.join(outDir, 'expect.json'), fs.readFileSync(expectSrc, 'utf8'));
}

// --- Build the 4 CM-specific eval cases ---

// Shared data blocks (kernel + operation up to §1 substitution happens via substituteSection1)
// Get a template from any of the MP-06 cases
const templateStack = readRun1Stack('MP-06-variant', 'fresh-no-progress', 'variant');
const cmTemplateStack = substituteSection1(templateStack, CM_S1);

// Helper: replace everything from <<START PROGRESS>> to end of file with new tail
function replaceTail(stack, newTail) {
  const marker = '<<START PROGRESS>>';
  const idx = stack.indexOf(marker);
  if (idx < 0) {
    // Try <<START INPUT>>
    const idx2 = stack.indexOf('<<START INPUT>>');
    if (idx2 < 0) throw new Error('no PROGRESS or INPUT marker found');
    return stack.slice(0, idx2) + newTail;
  }
  return stack.slice(0, idx) + newTail;
}

// Case 1: fresh-no-progress (no PROGRESS, no SESSION, INPUT = "start")
{
  const baseStack = readRun1Stack('MP-06-variant', 'fresh-no-progress', 'stack');
  const variantStack = cmTemplateStack; // template already has no PROGRESS session
  const cmCaseDir = path.join(RUN2_DIR, 'evals', 'cases', 'MP-06-cm', 'fresh-no-progress');
  writeFile(path.join(cmCaseDir, 'stack.txt'), baseStack);
  writeFile(path.join(cmCaseDir, 'variant-stack.txt'), variantStack);
  writeFile(path.join(cmCaseDir, 'expect.json'), JSON.stringify({
    "schema": "metadax.tutor-turn/0.2",
    "type": ["intro", "question"],
    "state_present": true
  }, null, 2) + '\n');
}

// Case 2: fresh-with-progress (partial PROGRESS on ETC, no SESSION, INPUT = "start")
{
  const baseStack = readRun1Stack('MP-06-variant', 'fresh-with-progress', 'stack');
  const variantSrc = readRun1Stack('MP-06-variant', 'fresh-with-progress', 'variant');
  const cmCaseDir = path.join(RUN2_DIR, 'evals', 'cases', 'MP-06-cm', 'fresh-with-progress');
  writeFile(path.join(cmCaseDir, 'stack.txt'), baseStack);
  writeFile(path.join(cmCaseDir, 'variant-stack.txt'), substituteSection1(variantSrc, CM_S1));
  writeFile(path.join(cmCaseDir, 'expect.json'), JSON.stringify({
    "schema": "metadax.tutor-turn/0.2",
    "type": ["question"],
    "state_present": true
  }, null, 2) + '\n');
}

// Case 3: narration-given-correctly
// SESSION contains a CM narration question turn; INPUT is a correct narration.
{
  const baseStack = readRun1Stack('MP-06-variant', 'probe-answered-correctly', 'stack');
  const variantSrc = readRun1Stack('MP-06-variant', 'probe-answered-correctly', 'variant');
  // Replace SESSION with CM narration session
  const cmNarrationSession = `<<START PROGRESS>>
{
  "schema": "metadax.progress/0.2",
  "learner_id": "lrn-fixture01",
  "course_id": "cell-biology-obsidian",
  "concepts": {}
}
<<END PROGRESS>>
<<START SESSION>>
[
  {
    "schema": "metadax.tutor-turn/0.2",
    "type": "question",
    "display": {
      "message": "Before we dive in, tell me in your own words what you already know about the electron transport chain — as if you were explaining it to a curious friend. No right or wrong here, just your thoughts. Commands: next, skip, hint, why, more, ask: <question>, summary, stop. Hints and second chances are part of learning.",
      "instructions": "Answer in your own words — a sentence or two is fine.",
      "example": "Example: 'The mitochondrion is an organelle that makes energy for the cell.'",
      "question": "What do you already know about the electron transport chain? Tell me in your own words."
    },
    "meta": {
      "concept": "electron-transport-chain",
      "bloom_level": "Remember",
      "question_type": "Short Answer (explain in own words)",
      "attempt": 1
    },
    "state": {
      "concept_order": ["electron-transport-chain","proton-gradient","cytochrome-c"],
      "concept": "electron-transport-chain",
      "level": "Remember",
      "attempt": 1,
      "help_used": false,
      "hints_given": 0,
      "phase": "main",
      "levels": {
        "electron-transport-chain": {"Remember": "not_started"},
        "proton-gradient": {"Remember": "not_started","Understand": "not_started"},
        "cytochrome-c": {"Remember": "not_started","Understand": "not_started"}
      },
      "competency": {"electron-transport-chain": 0,"proton-gradient": 0,"cytochrome-c": 0}
    },
    "next_action": "awaiting_answer",
    "warnings": []
  }
]
<<END SESSION>>
<<START INPUT>>
The electron transport chain passes electrons through protein complexes in the inner mitochondrial membrane, pumping protons to build a gradient used to make ATP.
<<END INPUT>>`;

  // Build the stack with CM §1 and CM session
  const variantBase = substituteSection1(variantSrc, CM_S1);
  const cmStack = replaceTail(variantBase, cmNarrationSession);
  const cmCaseDir = path.join(RUN2_DIR, 'evals', 'cases', 'MP-06-cm', 'narration-given-correctly');
  writeFile(path.join(cmCaseDir, 'stack.txt'), replaceTail(baseStack, cmNarrationSession));
  writeFile(path.join(cmCaseDir, 'variant-stack.txt'), cmStack);
  writeFile(path.join(cmCaseDir, 'expect.json'), JSON.stringify({
    "schema": "metadax.tutor-turn/0.2",
    "type": ["feedback", "question"],
    "state_present": true
  }, null, 2) + '\n');
}

// Case 4: resume-established
// SESSION has established state (narration done, now at Understand level), INPUT = correct answer
{
  const baseStack = readRun1Stack('MP-06-variant', 'resume-established', 'stack');
  const variantSrc = readRun1Stack('MP-06-variant', 'resume-established', 'variant');
  const cmResumeSession = `<<START SESSION>>
[
  {
    "schema": "metadax.tutor-turn/0.2",
    "type": "question",
    "display": {"message": "Welcome back, Fixture Learner! Here is your current question."},
    "meta": {"concept": "electron-transport-chain", "bloom_level": "Apply", "question_type": "Short Answer (practical use)", "attempt": 1},
    "state": {
      "concept_order": ["electron-transport-chain","proton-gradient","cytochrome-c"],
      "concept": "electron-transport-chain",
      "level": "Apply",
      "attempt": 1,
      "help_used": false,
      "hints_given": 0,
      "phase": "main",
      "levels": {
        "electron-transport-chain": {"Remember": "passed_first_try","Understand": "passed_first_try","Apply": "not_started"},
        "proton-gradient": {"Remember": "not_started","Understand": "not_started"},
        "cytochrome-c": {"Remember": "not_started","Understand": "not_started"}
      },
      "competency": {"electron-transport-chain": 38,"proton-gradient": 0,"cytochrome-c": 0}
    },
    "next_action": "awaiting_answer",
    "warnings": []
  }
]
<<END SESSION>>
<<START INPUT>>
When oxygen runs out, the electron chain backs up because there is no acceptor at the end, so proton pumping stops and ATP synthesis halts.
<<END INPUT>>`;

  // Build stack: kernel + base op (no SESSION substitution here — use run1 resume base)
  const variantBase = substituteSection1(variantSrc, CM_S1);
  // Replace from SESSION onward
  const replaceFromSession = (stack, newSess) => {
    const m = '<<START SESSION>>';
    const i = stack.indexOf(m);
    if (i < 0) throw new Error('no SESSION in stack');
    return stack.slice(0, i) + newSess;
  };
  const cmStack = replaceFromSession(variantBase, cmResumeSession);
  const cmCaseDir = path.join(RUN2_DIR, 'evals', 'cases', 'MP-06-cm', 'resume-established');
  writeFile(path.join(cmCaseDir, 'stack.txt'), replaceFromSession(baseStack, cmResumeSession));
  writeFile(path.join(cmCaseDir, 'variant-stack.txt'), cmStack);
  writeFile(path.join(cmCaseDir, 'expect.json'), JSON.stringify({
    "schema": "metadax.tutor-turn/0.2",
    "type": ["feedback", "question"],
    "state_present": true
  }, null, 2) + '\n');
}

console.log('\nDone building CM stacks.');
