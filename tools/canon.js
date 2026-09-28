#!/usr/bin/env node
'use strict';
// canon.js -- JSON Canonicalization Scheme (RFC 8785, JCS) for the MetaDAX
// subset. Zero dependencies, Node >= 18, CommonJS.
//
//   canonicalJson(obj) -> Buffer   the canonical UTF-8 byte string:
//     - object keys sorted by their UTF-16 code units (JS "<" does this);
//     - no insignificant whitespace;
//     - strings escaped with the RFC 8785 minimal-escape rule (only ", \ and
//       the C0 control characters are escaped; \b \t \n \f \r use the short
//       form, other controls use \u00xx; every other character is literal);
//     - integers as their base-10 digits;
//     - floats per the ES6 Number-to-string rule (String(n) gives this);
//     - booleans as true/false, null as null.
//   sha256Hex(obj) -> hex sha256 of canonicalJson(obj).
//
// CLI: node tools/canon.js <file> [--hash]
//   default prints the canonical JSON; --hash prints the sha256 hex.

const crypto = require('crypto');
const fs = require('fs');

function escapeString(s) {
  let out = '"';
  for (const ch of s) {
    const o = ch.codePointAt(0);
    if (ch === '"') out += '\\"';
    else if (ch === '\\') out += '\\\\';
    else if (o === 0x08) out += '\\b';
    else if (o === 0x09) out += '\\t';
    else if (o === 0x0a) out += '\\n';
    else if (o === 0x0c) out += '\\f';
    else if (o === 0x0d) out += '\\r';
    else if (o < 0x20) out += '\\u' + o.toString(16).padStart(4, '0');
    else out += ch;
  }
  return out + '"';
}

function formatNumber(n) {
  if (!Number.isFinite(n)) {
    throw new Error('non-finite number is not allowed in canonical JSON');
  }
  // String() implements the ES6 Number-to-string rule; an integral value is
  // rendered without a fractional part (1.0 -> "1").
  return String(n);
}

function serialize(obj) {
  if (obj === true) return 'true';
  if (obj === false) return 'false';
  if (obj === null || obj === undefined) return 'null';
  const t = typeof obj;
  if (t === 'string') return escapeString(obj);
  if (t === 'number') return formatNumber(obj);
  if (t === 'boolean') return obj ? 'true' : 'false';
  if (Array.isArray(obj)) {
    return '[' + obj.map(serialize).join(',') + ']';
  }
  if (t === 'object') {
    // Sort keys by UTF-16 code units: the default JS string comparison.
    const keys = Object.keys(obj).sort();
    return '{' + keys.map(function (k) {
      return escapeString(k) + ':' + serialize(obj[k]);
    }).join(',') + '}';
  }
  throw new TypeError('cannot canonicalise value of type ' + t);
}

function canonicalJson(obj) {
  return Buffer.from(serialize(obj), 'utf-8');
}

function sha256Hex(obj) {
  return crypto.createHash('sha256').update(canonicalJson(obj)).digest('hex');
}

module.exports = { canonicalJson, sha256Hex };

function main(argv) {
  const args = argv.filter(function (a) { return a !== '--hash'; });
  const wantHash = argv.includes('--hash');
  if (args.length < 1) {
    process.stderr.write('usage: node tools/canon.js <file> [--hash]\n');
    return 2;
  }
  const file = args[0];
  const text = file === '-'
    ? fs.readFileSync(0, 'utf-8')
    : fs.readFileSync(file, 'utf-8');
  const obj = JSON.parse(text);
  if (wantHash) {
    process.stdout.write(sha256Hex(obj) + '\n');
  } else {
    process.stdout.write(canonicalJson(obj));
    process.stdout.write('\n');
  }
  return 0;
}

if (require.main === module) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (e) {
    process.stderr.write('error: ' + e.message + '\n');
    process.exit(1);
  }
}
