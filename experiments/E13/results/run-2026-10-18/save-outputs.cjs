#!/usr/bin/env node
'use strict';
// save-outputs.cjs -- save workflow results array to raw/<slug>.json files.
// Usage: node save-outputs.cjs '<JSON array string>'
// Or pipe JSON array via stdin: echo '[...]' | node save-outputs.cjs

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, 'raw');
fs.mkdirSync(RAW_DIR, { recursive: true });

let input = process.argv[2] || '';
if (!input) {
  // read from stdin
  input = fs.readFileSync(0, 'utf8');
}

const results = JSON.parse(input.trim());
let saved = 0;
for (const item of results) {
  if (!item || !item.case || !item.stackType) continue;
  const slug = item.case.replace('/', '_') + '__' + item.stackType;
  const outPath = path.join(RAW_DIR, slug + '.json');
  fs.writeFileSync(outPath, JSON.stringify(item, null, 2), 'utf8');
  console.log('saved:', outPath);
  saved++;
}
console.log('Total saved:', saved);
