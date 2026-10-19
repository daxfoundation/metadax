#!/usr/bin/env node
'use strict';
// build-clean-fixture.cjs -- builds a cleaned registry (no trap nodes) and
// assembles stacks for Q21-Q30 that use it.
// Addresses B30: trap nodes polluting the registry makes expected_decision='new'
// incorrect. This cleaned fixture removes n_tr* from the REGISTRY block so the
// model cannot reuse them, giving a clean test of whether it creates 'new' anyway.

const fs   = require('fs');
const path = require('path');

const PROPOSED  = path.resolve(__dirname, '../proposed/fixtures/e05-registry-50');
const STACKS    = path.join(PROPOSED, 'stacks');
const OUT_DIR   = path.join(__dirname, 'stacks-clean');
const FIX_DIR   = path.join(__dirname, 'fixtures');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(FIX_DIR, { recursive: true });

// Load registry and remove trap nodes
const regFull = JSON.parse(fs.readFileSync(path.join(PROPOSED, 'registry.json'), 'utf8'));
const regClean = {
  ...regFull,
  nodes: regFull.nodes.filter(n => !n.id.startsWith('n_tr')),
  updated_at: 'runtime',
};

fs.writeFileSync(
  path.join(FIX_DIR, 'registry-no-traps.json'),
  JSON.stringify(regClean, null, 2)
);
console.log('Clean registry: ', regClean.nodes.length, 'nodes (removed', regFull.nodes.length - regClean.nodes.length, 'trap nodes)');

// Build REGISTRY block text from clean registry
function buildRegistryBlock(nodes) {
  return `<<START REGISTRY>>\n${JSON.stringify(nodes, null, 2)}\n<<END REGISTRY>>`;
}

const cleanRegBlock = buildRegistryBlock(regClean.nodes);

// For Q21-Q30: swap out the REGISTRY block in the original stacks
for (let i = 21; i <= 30; i++) {
  const qid = 'Q' + String(i).padStart(2, '0');
  const origStack = fs.readFileSync(path.join(STACKS, qid + '.txt'), 'utf8');

  // Replace <<START REGISTRY>>...<<END REGISTRY>> with clean version
  const cleanStack = origStack.replace(
    /<<START REGISTRY>>[\s\S]*?<<END REGISTRY>>/,
    cleanRegBlock
  );

  const outPath = path.join(OUT_DIR, qid + '.txt');
  fs.writeFileSync(outPath, cleanStack);
  console.log('Wrote', outPath);
}

console.log('Done. Clean stacks written to', OUT_DIR);
