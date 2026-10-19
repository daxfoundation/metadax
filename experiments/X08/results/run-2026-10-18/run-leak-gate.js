'use strict';
/**
 * run-leak-gate.js — run the gate on all 10 leak-attempt nodes.
 * Outputs leak-results.json.
 */

const fs   = require('fs');
const path = require('path');
const BASE = __dirname;
const { gate } = require('./outward-gate-impl.js');

const fixtures    = JSON.parse(fs.readFileSync(path.join(BASE, 'fixtures.json'), 'utf8'));
const leakData    = JSON.parse(fs.readFileSync(path.join(BASE, 'leak-attempts.json'), 'utf8'));

const { org_declaration: orgDecl, private_nodes: privateNodes, candidates } = fixtures;

// Build registry with private nodes + safe candidate nodes + leak attempt nodes
const registry = {};
for (const n of privateNodes) registry[n.id] = n;
for (const c of candidates)   registry[c.node.id] = c.node;
for (const n of leakData.nodes) registry[n.id] = n;

const results = leakData.nodes.map(node => {
  const decision = gate(node.id, registry, orgDecl);
  return {
    id:              node.id,
    desc:            node._test_meta.desc,
    title:           node.title,
    gate_decision:   decision.decision,
    reasons:         decision.reasons,
    review_required: decision.review_required || false,
  };
});

const blocked = results.filter(r => r.gate_decision === 'block').length;
const leaked  = results.filter(r => r.gate_decision === 'allow').length;
const allExplained = results.every(r => r.reasons.length > 0);

const output = {
  generation: leakData.generation_note,
  summary: {
    total: results.length,
    blocked,
    leaked,
    all_decisions_explained: allExplained,
  },
  results,
};

const outPath = path.join(BASE, 'leak-results.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log('=== Paraphrase-evasion leak test ===');
console.log(`Blocked : ${blocked}/10`);
console.log(`Leaked  : ${leaked}/10`);
console.log(`All explained: ${allExplained}`);
results.forEach(r => {
  console.log(`  [${r.gate_decision.toUpperCase().padEnd(5)}] ${r.id}: ${r.desc}`);
});
console.log(`Written ${outPath}`);
