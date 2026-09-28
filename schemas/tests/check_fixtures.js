#!/usr/bin/env node
// check_fixtures.js -- zero-dependency test for the metadax 0.2 schemas.
//
// It walks every *.json file under fixtures/, reads the file's "schema"
// field, looks the schema file up in schemas/index.json, and validates the
// instance with a small JSON Schema 2020-12 subset validator defined below.
// The subset is exactly the one schemas/README.md promises tools/validate.js
// supports: type, required, enum, const, pattern, minLength, maxLength,
// minimum, maximum, items, properties, additionalProperties, anyOf, oneOf,
// and same-document $ref (#/...). Nothing else is interpreted.
//
// Prints PASS/FAIL per file with the first failing path; exits 1 on any FAIL.

const fs = require("fs");
const path = require("path");

const SCHEMAS_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(SCHEMAS_DIR, "..");
const FIXTURES_DIR = path.join(REPO_ROOT, "fixtures");

// ---- subset validator -------------------------------------------------------

function resolveRef(ref, root) {
  // same-document only: "#/$defs/foo" or "#/..."
  if (!ref.startsWith("#")) throw new Error("unsupported $ref: " + ref);
  const parts = ref.slice(1).split("/").filter((p) => p.length > 0);
  let cur = root;
  for (const raw of parts) {
    const key = raw.replace(/~1/g, "/").replace(/~0/g, "~");
    if (cur == null || !Object.prototype.hasOwnProperty.call(cur, key)) {
      throw new Error("cannot resolve $ref: " + ref);
    }
    cur = cur[key];
  }
  return cur;
}

function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v; // "object", "string", "number", "boolean"
}

function matchesType(v, t) {
  if (t === "integer") return typeof v === "number" && Number.isInteger(v);
  if (t === "number") return typeof v === "number";
  return typeOf(v) === t;
}

// Returns null if valid, or a string error "<path>: <message>".
function validate(schema, data, root, dpath) {
  if (schema === true || schema === undefined) return null;
  if (schema === false) return dpath + ": schema is false (nothing allowed)";

  if (Object.prototype.hasOwnProperty.call(schema, "$ref")) {
    return validate(resolveRef(schema["$ref"], root), data, root, dpath);
  }

  if (Object.prototype.hasOwnProperty.call(schema, "const")) {
    if (JSON.stringify(data) !== JSON.stringify(schema.const)) {
      return dpath + ": expected const " + JSON.stringify(schema.const);
    }
  }

  if (Object.prototype.hasOwnProperty.call(schema, "enum")) {
    const ok = schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(data));
    if (!ok) return dpath + ": value not in enum " + JSON.stringify(schema.enum);
  }

  if (Object.prototype.hasOwnProperty.call(schema, "type")) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => matchesType(data, t))) {
      return dpath + ": expected type " + types.join("|") + ", got " + typeOf(data);
    }
  }

  if (Object.prototype.hasOwnProperty.call(schema, "anyOf")) {
    const errs = [];
    let ok = false;
    for (const sub of schema.anyOf) {
      const e = validate(sub, data, root, dpath);
      if (e === null) { ok = true; break; }
      errs.push(e);
    }
    if (!ok) return dpath + ": no anyOf branch matched (" + errs.join(" | ") + ")";
  }

  if (Object.prototype.hasOwnProperty.call(schema, "oneOf")) {
    let count = 0;
    for (const sub of schema.oneOf) {
      if (validate(sub, data, root, dpath) === null) count++;
    }
    if (count !== 1) return dpath + ": expected exactly one oneOf branch, matched " + count;
  }

  // string constraints
  if (typeof data === "string") {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      return dpath + ": string shorter than minLength " + schema.minLength;
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      return dpath + ": string longer than maxLength " + schema.maxLength + " (len " + data.length + ")";
    }
    if (schema.pattern !== undefined && !(new RegExp(schema.pattern).test(data))) {
      return dpath + ": string does not match pattern " + schema.pattern;
    }
  }

  // number constraints
  if (typeof data === "number") {
    if (schema.minimum !== undefined && data < schema.minimum) {
      return dpath + ": number below minimum " + schema.minimum;
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      return dpath + ": number above maximum " + schema.maximum;
    }
  }

  // array constraints
  if (Array.isArray(data) && schema.items !== undefined) {
    for (let i = 0; i < data.length; i++) {
      const e = validate(schema.items, data[i], root, dpath + "[" + i + "]");
      if (e) return e;
    }
  }

  // object constraints
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    if (Array.isArray(schema.required)) {
      for (const key of schema.required) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
          return dpath + ": missing required property '" + key + "'";
        }
      }
    }
    const props = schema.properties || {};
    for (const key of Object.keys(data)) {
      const childPath = dpath + "." + key;
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const e = validate(props[key], data[key], root, childPath);
        if (e) return e;
      } else if (Object.prototype.hasOwnProperty.call(schema, "additionalProperties")) {
        const ap = schema.additionalProperties;
        if (ap === false) {
          return childPath + ": additional property not allowed";
        } else if (ap !== true && ap !== undefined) {
          const e = validate(ap, data[key], root, childPath);
          if (e) return e;
        }
      }
    }
  }

  return null;
}

// ---- driver -----------------------------------------------------------------

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".json")) out.push(full);
  }
  return out;
}

function main() {
  const map = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, "index.json"), "utf8"));
  const schemaCache = {};
  function loadSchema(file) {
    if (!schemaCache[file]) {
      schemaCache[file] = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, file), "utf8"));
    }
    return schemaCache[file];
  }

  const files = walk(FIXTURES_DIR, []).sort();
  let failures = 0;
  for (const f of files) {
    const rel = path.relative(REPO_ROOT, f);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(f, "utf8"));
    } catch (e) {
      console.log("FAIL " + rel + " -- invalid JSON: " + e.message);
      failures++;
      continue;
    }
    const schemaId = data && data.schema;
    if (!schemaId) {
      console.log("FAIL " + rel + " -- no 'schema' field");
      failures++;
      continue;
    }
    const schemaFile = map[schemaId];
    if (!schemaFile) {
      console.log("FAIL " + rel + " -- no schema mapped for '" + schemaId + "'");
      failures++;
      continue;
    }
    const schema = loadSchema(schemaFile);
    const err = validate(schema, data, schema, "$");
    if (err === null) {
      console.log("PASS " + rel + " [" + schemaFile + "]");
    } else {
      console.log("FAIL " + rel + " [" + schemaFile + "] -- " + err);
      failures++;
    }
  }
  console.log("");
  console.log(files.length + " fixture(s), " + failures + " failure(s)");
  process.exit(failures > 0 ? 1 : 0);
}

main();
