#!/usr/bin/env node
'use strict';
// patch-stack.js -- replace the "Operation: tutor" section in a base stack.txt
// with a variant operation prompt, producing a variant stack.txt.
//
// Usage:
//   node patch-stack.js <base-stack.txt> <variant-operation.txt> <out-stack.txt>
//
// The variant-operation.txt contains only the operation section text (from
// "Operation: tutor" through to the line before "<<START CONFIG>>").
// The script locates that section in base-stack.txt by the sentinel
// "\nOperation: tutor" and replaces everything from there to the first
// "\n<<START " block marker.

const fs = require('fs');
const path = require('path');

const [,, baseFile, variantOpFile, outFile] = process.argv;
if (!baseFile || !variantOpFile || !outFile) {
  process.stderr.write('usage: node patch-stack.js <base> <variant-op> <out>\n');
  process.exit(2);
}

const base = fs.readFileSync(baseFile, 'utf8');
const variantOp = fs.readFileSync(variantOpFile, 'utf8');

const OP_SENTINEL = '\nOperation: tutor';
const BLOCK_SENTINEL = '\n<<START ';

const opStart = base.indexOf(OP_SENTINEL);
if (opStart < 0) { process.stderr.write('No "Operation: tutor" found in base stack\n'); process.exit(1); }
const blockStart = base.indexOf(BLOCK_SENTINEL, opStart);
if (blockStart < 0) { process.stderr.write('No <<START block found after operation section\n'); process.exit(1); }

const kernel = base.slice(0, opStart);
const blocks = base.slice(blockStart);
const variantOpText = variantOp.startsWith('\n') ? variantOp : '\n' + variantOp;
const patched = kernel + variantOpText + blocks;
fs.writeFileSync(outFile, patched, 'utf8');
process.stdout.write('Written ' + outFile + '\n');
