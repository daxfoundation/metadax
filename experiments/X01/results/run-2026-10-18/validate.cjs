#!/usr/bin/env node
// Zero-dependency JSON Schema (draft-2020-12 subset) validator for X01.
// Supports: type, const, enum, pattern, required, properties, additionalProperties:false,
// items, minItems, minimum/maximum, anyOf, $ref (local #/$defs/...), nested $defs.
// Also mints deterministic technique ids: t_ + 26 base32 (Crockford) from sha256(core+origin).
'use strict';
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function deref(schema, root) {
  if (schema && schema.$ref) {
    const ref = schema.$ref;
    if (!ref.startsWith('#/')) throw new Error('only local $ref: ' + ref);
    let node = root;
    for (const part of ref.slice(2).split('/')) node = node[part];
    return node;
  }
  return schema;
}

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v === 'object' ? 'object'
       : typeof v === 'number' ? (Number.isInteger(v) ? 'integer' : 'number')
       : typeof v;
}

function validate(data, schema, root, errs, loc) {
  schema = deref(schema, root);
  if (!schema) return;
  if (schema.anyOf) {
    const ok = schema.anyOf.some(s => { const e = []; validate(data, s, root, e, loc); return e.length === 0; });
    if (!ok) errs.push(loc + ': no anyOf branch matched');
    return;
  }
  if ('const' in schema && JSON.stringify(data) !== JSON.stringify(schema.const))
    errs.push(loc + ': const mismatch (want ' + JSON.stringify(schema.const) + ')');
  if (schema.enum && !schema.enum.some(x => JSON.stringify(x) === JSON.stringify(data)))
    errs.push(loc + ': not in enum');
  if (schema.type) {
    const t = typeOf(data);
    const want = schema.type;
    const ok = (want === 'number' && t === 'integer') || t === want;
    if (!ok) { errs.push(loc + ': type ' + t + ' != ' + want); return; }
  }
  const t = typeOf(data);
  if (t === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) errs.push(loc + ': pattern fail /' + schema.pattern + '/');
    if (schema.maxLength != null && data.length > schema.maxLength) errs.push(loc + ': maxLength');
  }
  if (t === 'integer' || t === 'number') {
    if (schema.minimum != null && data < schema.minimum) errs.push(loc + ': minimum');
    if (schema.maximum != null && data > schema.maximum) errs.push(loc + ': maximum');
  }
  if (t === 'array') {
    if (schema.minItems != null && data.length < schema.minItems) errs.push(loc + ': minItems');
    if (schema.items) data.forEach((v, i) => validate(v, schema.items, root, errs, loc + '[' + i + ']'));
  }
  if (t === 'object') {
    (schema.required || []).forEach(k => { if (!(k in data)) errs.push(loc + ': missing required "' + k + '"'); });
    const props = schema.properties || {};
    if (schema.additionalProperties === false)
      Object.keys(data).forEach(k => { if (!(k in props)) errs.push(loc + ': extra property "' + k + '"'); });
    Object.keys(props).forEach(k => { if (k in data) validate(data[k], props[k], root, errs, loc + '.' + k); });
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object')
      Object.keys(data).forEach(k => { if (!(k in props)) validate(data[k], schema.additionalProperties, root, errs, loc + '.' + k); });
  }
}

const B32 = '0123456789abcdefghjkmnpqrstvwxyz'; // Crockford, no i l o u
function mintTechniqueId(core, originLang) {
  const h = crypto.createHash('sha256').update(JSON.stringify(core) + '|' + originLang).digest();
  let out = '';
  for (let i = 0; i < 26; i++) out += B32[h[i] & 31];
  return 't_' + out;
}

function validateFile(schemaPath, instPath) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const inst = JSON.parse(fs.readFileSync(instPath, 'utf8'));
  const items = Array.isArray(inst) ? inst : [inst];
  let allOk = true;
  items.forEach((it, i) => {
    const errs = [];
    validate(it, schema, schema, errs, 'root');
    const tag = Array.isArray(inst) ? '[' + i + ']' : '';
    if (errs.length) { allOk = false; console.log('FAIL ' + path.basename(instPath) + tag); errs.forEach(e => console.log('   ' + e)); }
    else console.log('OK   ' + path.basename(instPath) + tag);
  });
  return allOk;
}

if (require.main === module) {
  const [, , cmd, a, b] = process.argv;
  if (cmd === 'mint') {
    const core = JSON.parse(fs.readFileSync(a, 'utf8'));
    console.log(mintTechniqueId(core.core || core, core.provenance ? core.provenance.origin_language : (b || 'en')));
  } else if (cmd === 'validate') {
    process.exit(validateFile(a, b) ? 0 : 1);
  } else {
    console.log('usage: validate.cjs validate <schema.json> <instance.json> | mint <technique.json>');
  }
}
module.exports = { validate, mintTechniqueId };
