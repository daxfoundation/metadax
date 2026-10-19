'use strict';
/**
 * run-gates-r2.js — X08 run 2 gate evaluation
 *
 * Runs three gate variants on 60 candidates from fixtures-run2.json:
 *   1. lexical-only
 *   2. judge-only  (calls Anthropic API; requires ANTHROPIC_API_KEY)
 *   3. lexical-then-judge
 *
 * Writes gate-results-run2.json and transcripts/judge-run2-trimmed.jsonl
 *
 * Reproduce:
 *   ANTHROPIC_API_KEY=<key> node run-gates-r2.js
 */

const fs   = require('fs');
const path = require('path');
const { lexicalGate, judgeGate, baselineBlock } = require('./paraphrase-gate');

async function main() {
  const fixturesPath = path.join(__dirname, 'fixtures-run2.json');
  const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set — judge gate will record errors');
  }

  const orgDecl = fixtures.org_declaration;

  // Build registry for ancestry checks
  const registry = {};
  for (const n of fixtures.private_nodes)    registry[n.id] = n;
  for (const c of fixtures.test_candidates)  registry[c.id] = c;

  const perCandidate = [];
  const judgeTranscripts = [];
  let judgeCallCount = 0;

  for (let i = 0; i < fixtures.test_candidates.length; i++) {
    const node = fixtures.test_candidates[i];
    const meta = node._run2_meta || {};
    process.stdout.write(`[${String(i + 1).padStart(2, '0')}/60] ${node.id}  `);

    // Gate 1: lexical (sync)
    const lex = lexicalGate(node, registry, orgDecl);

    // Gate 2: judge — baseline first; if baseline allows, call judge
    const bl = baselineBlock(node, registry, orgDecl);
    let jud;
    if (bl.blocked) {
      jud = { decision: 'block', check: bl.reason, judge_called: false };
    } else {
      jud = await judgeGate(node, orgDecl, apiKey);
      if (jud.judge_called) {
        judgeCallCount++;
        judgeTranscripts.push({
          id: node.id, title: node.title,
          source: meta.source, should_block: meta.should_block,
          judge_decision: jud.decision,
          judge_check: jud.check,
        });
      }
    }

    // Gate 3: lexical-then-judge — reuse judge result when lexical allows
    let ltj;
    if (lex.decision === 'block') {
      ltj = { decision: 'block', check: lex.check, judge_called: false };
    } else {
      // Lexical allowed → escalate to judge (reuse result from gate 2)
      ltj = { decision: jud.decision, check: jud.check, judge_called: !bl.blocked };
    }

    const isParaphrase = meta.source && meta.source.includes('paraphrase');
    process.stdout.write(
      `lex=${lex.decision.padEnd(5)} jud=${jud.decision.padEnd(5)} ltj=${ltj.decision}  [${meta.source}]\n`
    );

    perCandidate.push({
      id: node.id, title: node.title,
      source: meta.source, category: meta.category || null,
      should_block: meta.should_block,
      is_paraphrase: !!isParaphrase,
      lexical:       { decision: lex.decision, check: lex.check, judge_called: false },
      judge:         { decision: jud.decision, check: jud.check, judge_called: jud.judge_called },
      lex_then_judge:{ decision: ltj.decision, check: ltj.check, judge_called: ltj.judge_called },
    });
  }

  // ─── Score calculation ───────────────────────────────────────────────────
  // "leaks"   = 20 paraphrase candidates that should be blocked
  // "clean"   = 40 non-paraphrase candidates
  //   false positive = clean candidate that should_block=false but gate blocked
  // "judge_calls" = number of actual API calls made for each gate variant

  function scoreGate(gate) {
    const leaks = perCandidate.filter(r => r.is_paraphrase);
    const clean = perCandidate.filter(r => !r.is_paraphrase);
    const leaksCaught    = leaks.filter(r => r[gate].decision === 'block').length;
    const falsePositives = clean.filter(r => !r.should_block && r[gate].decision === 'block').length;
    const jCalls         = perCandidate.filter(r => r[gate].judge_called).length;
    return {
      leaks_caught:    leaksCaught,
      leaks_total:     leaks.length,
      false_positives: falsePositives,
      clean_total:     clean.length,
      judge_calls:     jCalls,
    };
  }

  const scores = {
    lexical:       scoreGate('lexical'),
    judge:         scoreGate('judge'),
    lex_then_judge: scoreGate('lex_then_judge'),
  };

  // ─── Write outputs ───────────────────────────────────────────────────────
  const output = {
    run: 'X08-run2-2026-10-18',
    scores,
    per_candidate: perCandidate,
  };
  fs.writeFileSync(path.join(__dirname, 'gate-results-run2.json'), JSON.stringify(output, null, 2));

  const txPath = path.join(__dirname, 'transcripts', 'judge-run2-trimmed.jsonl');
  fs.writeFileSync(txPath, judgeTranscripts.map(t => JSON.stringify(t)).join('\n') + '\n');

  // ─── Summary table ───────────────────────────────────────────────────────
  console.log('\n╔══════════════════════╤══════════════╤══════════════╤═════════════╗');
  console.log('║ gate                 │ leaks caught │ false pos.   │ judge calls ║');
  console.log('╠══════════════════════╪══════════════╪══════════════╪═════════════╣');
  for (const [g, s] of Object.entries(scores)) {
    const g2 = g.padEnd(20);
    const lc = `${s.leaks_caught}/${s.leaks_total}`.padEnd(12);
    const fp = `${s.false_positives}/${s.clean_total}`.padEnd(12);
    const jc = String(s.judge_calls).padEnd(11);
    console.log(`║ ${g2} │ ${lc} │ ${fp} │ ${jc} ║`);
  }
  console.log('╚══════════════════════╧══════════════╧══════════════╧═════════════╝');
  console.log(`\nTotal judge API calls made: ${judgeCallCount}`);
  console.log(`Results: ${path.join(__dirname, 'gate-results-run2.json')}`);
}

main().catch(err => { console.error(err); process.exit(1); });
