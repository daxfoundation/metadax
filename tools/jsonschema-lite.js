#!/usr/bin/env node
'use strict';
// jsonschema-lite.js -- a minimal JSON Schema 2020-12 checker. Zero deps.
// Supports: type, required, enum, const, pattern, minLength, maxLength,
// minimum, maximum, items, properties, additionalProperties, anyOf, oneOf,
// and $ref within the same document only ("#/..." JSON Pointer).
//
//   validate(instance, schema, root?) -> [ "path: message", ... ]  (empty = ok)

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (Number.isInteger(v)) return 'integer';
  return typeof v; // string, number, boolean, object
}

function matchesType(v, t) {
  const actual = typeOf(v);
  if (t === 'number') return actual === 'number' || actual === 'integer';
  if (t === 'integer') return actual === 'integer';
  return actual === t;
}

function resolveRef(ref, root) {
  if (!ref.startsWith('#')) {
    throw new Error('only same-document $ref is supported: ' + ref);
  }
  const pointer = ref.slice(1);
  if (pointer === '' || pointer === '/') return root;
  const parts = pointer.split('/').slice(1).map(function (p) {
    return p.replace(/~1/g, '/').replace(/~0/g, '~');
  });
  let cur = root;
  for (const part of parts) {
    if (cur == null) throw new Error('unresolvable $ref: ' + ref);
    cur = cur[part];
  }
  if (cur === undefined) throw new Error('unresolvable $ref: ' + ref);
  return cur;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every(function (x, i) { return deepEqual(x, b[i]); });
  }
  if (a && b && typeof a === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every(function (k) { return deepEqual(a[k], b[k]); });
  }
  return false;
}

function validate(instance, schema, root, path, errors) {
  root = root || schema;
  path = path || '';
  errors = errors || [];

  if (schema === true) return errors;
  if (schema === false) { errors.push(path + ': schema is false'); return errors; }
  if (typeof schema !== 'object' || schema === null) return errors;

  if (schema.$ref) {
    return validate(instance, resolveRef(schema.$ref, root), root, path, errors);
  }

  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some(function (t) { return matchesType(instance, t); })) {
      errors.push(path + ': expected type ' + types.join('|') + ', got ' + typeOf(instance));
    }
  }

  if (schema.const !== undefined && !deepEqual(instance, schema.const)) {
    errors.push(path + ': must equal const ' + JSON.stringify(schema.const));
  }

  if (schema.enum !== undefined) {
    if (!schema.enum.some(function (e) { return deepEqual(instance, e); })) {
      errors.push(path + ': not in enum');
    }
  }

  const t = typeOf(instance);

  if (t === 'string') {
    if (schema.minLength !== undefined && instance.length < schema.minLength) {
      errors.push(path + ': shorter than minLength ' + schema.minLength);
    }
    if (schema.maxLength !== undefined && instance.length > schema.maxLength) {
      errors.push(path + ': longer than maxLength ' + schema.maxLength);
    }
    if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(instance)) {
      errors.push(path + ': does not match pattern ' + schema.pattern);
    }
  }

  if (t === 'number' || t === 'integer') {
    if (schema.minimum !== undefined && instance < schema.minimum) {
      errors.push(path + ': below minimum ' + schema.minimum);
    }
    if (schema.maximum !== undefined && instance > schema.maximum) {
      errors.push(path + ': above maximum ' + schema.maximum);
    }
  }

  if (t === 'array' && schema.items !== undefined) {
    instance.forEach(function (item, i) {
      validate(item, schema.items, root, path + '[' + i + ']', errors);
    });
  }

  if (t === 'object') {
    for (const req of schema.required || []) {
      if (!(req in instance)) errors.push(path + ': missing required property ' + req);
    }
    const props = schema.properties || {};
    for (const key of Object.keys(instance)) {
      const childPath = path ? path + '.' + key : key;
      if (props[key] !== undefined) {
        validate(instance[key], props[key], root, childPath, errors);
      } else if (schema.additionalProperties === false) {
        errors.push(childPath + ': additional property not allowed');
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        validate(instance[key], schema.additionalProperties, root, childPath, errors);
      }
    }
  }

  if (Array.isArray(schema.anyOf)) {
    const ok = schema.anyOf.some(function (sub) {
      return validate(instance, sub, root, path, []).length === 0;
    });
    if (!ok) errors.push(path + ': matches none of anyOf');
  }

  if (Array.isArray(schema.oneOf)) {
    const matches = schema.oneOf.filter(function (sub) {
      return validate(instance, sub, root, path, []).length === 0;
    }).length;
    if (matches !== 1) errors.push(path + ': matches ' + matches + ' of oneOf (want exactly 1)');
  }

  return errors;
}

module.exports = { validate };
