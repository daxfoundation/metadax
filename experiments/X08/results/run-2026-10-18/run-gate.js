'use strict';
/**
 * run-gate.js — deterministic outward-gate test runner.
 * Reads fixtures.json, applies gate to all 30 candidates, writes gate-results.json.
 * Run: node run-gate.js
 */

const fs   = require('fs');
const path = require('path');
const BASE = __dirname;

const { gate } = require('./outward-gate-impl.js');

const fixtures = JSON.parse(fs.readFileSync(path.join(BASE, 'fixtures.json'), 'utf8'));
const { org_declaration: orgDecl, private_nodes: privateNodes, candidates } = fixtures;

// Build unified registry
const registry = {};
for (const n of privateNodes) registry[n.id] = n;
for (const c of candidates)   registry[c.node.id] = c.node;

const results = candidates.map(c => {
  const decision = gate(c.node.id, registry, orgDecl);
  return {
    category:        c.category,
    node_id:         c.node.id,
    title:           c.node.title,
    gate_decision:   decision.decision,
    reasons:         decision.reasons,
    review_required: decision.review_required || false,
  };
});

// Scoring
const safe    = results.filter(r => r.category === 'safe_rewrite');
const near    = results.filter(r => r.category === 'near_copy');
const quoting = results.filter(r => r.category === 'quotes_private_fact');

const safeAllowed         = safe.filter(r => r.gate_decision === 'allow').length;
const safeWronglyBlocked  = safe.length - safeAllowed;
const nearBlocked         = near.filter(r => r.gate_decision === 'block').length;
const quotingBlocked      = quoting.filter(r => r.gate_decision === 'block').length;
const leaks               = (near.length - nearBlocked) + (quoting.length - quotingBlocked);
const allExplained        = results.every(r => r.reasons.length > 0);

const summary = {
  safe_rewrites:        { total: safe.length,    allowed: safeAllowed,   wrongly_blocked: safeWronglyBlocked },
  near_copies:          { total: near.length,    blocked: nearBlocked,   leaked: near.length - nearBlocked },
  quoting_private_fact: { total: quoting.length, blocked: quotingBlocked, leaked: quoting.length - quotingBlocked },
  leaks_total:          leaks,
  safe_wrongly_blocked: safeWronglyBlocked,
  all_decisions_explained: allExplained,
};

const output = { run_type: 'deterministic', summary, results };
const outPath = path.join(BASE, 'gate-results.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log('=== Deterministic gate test ===');
console.log(`Safe rewrites    : ${safeAllowed}/${safe.length} allowed  (wrongly blocked: ${safeWronglyBlocked})`);
console.log(`Near copies      : ${nearBlocked}/${near.length} blocked (leaked: ${near.length - nearBlocked})`);
console.log(`Quoting private  : ${quotingBlocked}/${quoting.length} blocked (leaked: ${quoting.length - quotingBlocked})`);
console.log(`Total leaks      : ${leaks}`);
console.log(`All explained    : ${allExplained}`);
console.log(`Written ${outPath}`);
