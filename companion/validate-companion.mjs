#!/usr/bin/env node
// validate-companion.mjs — check companion.json sidecars against companion.schema.json
// plus the invariants JSON Schema cannot express: no diagnoses, no vendor names,
// a non-empty human-guide boundary, techniques offered as one way.
//
// Zero dependencies. Reuses the repo's tools/jsonschema-lite.js for the structural
// pass. Run from the repo root:
//     node companion/validate-companion.mjs
// or point it at files:
//     node companion/validate-companion.mjs companion/examples/*.companion.json
// Exits 1 on any error.

import { readFileSync, readdirSync } from "fs";
import { dirname, resolve, join, basename } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const { validate } = require(resolve(repoRoot, "tools/jsonschema-lite.js"));

const schemaPath = resolve(here, "companion.schema.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf8"));

// Behaviour, never a diagnosis: a named condition must never appear anywhere in a
// sidecar. The meta-words "evaluation"/"diagnosis" are allowed (the `not` field is
// expected to say "this is not a diagnosis"); only *named conditions* are flagged.
const DIAGNOSIS = [
  "dyslexia", "dyslexic", "dyscalculia", "dysgraphia", "adhd",
  "autism", "autistic", "asperger", "spld", "dyspraxia", "dyspraxic",
  "learning disability", "learning disabilities", "processing disorder"
];
const diagRe = new RegExp("\\b(" + DIAGNOSIS.join("|") + ")\\b", "i");

// No vendor names in `services` (or anywhere). A short, extend-as-needed list of
// product/company tokens; capabilities are generic, vendors are not.
const VENDORS = [
  "openai", "chatgpt", "gpt", "anthropic", "claude", "gemini", "bard",
  "google", "microsoft", "copilot", "duolingo", "khan academy", "khanmigo",
  "quizlet", "grammarly", "elevenlabs", "whisper", "azure", "aws", "amazon",
  "apple", "meta", "llama", "mistral", "cohere", "notion", "anki"
];
const vendorRe = new RegExp("\\b(" + VENDORS.map(v => v.replace(/ /g, "\\s+")).join("|") + ")\\b", "i");

function collectStrings(node, path, out) {
  if (typeof node === "string") { out.push([path, node]); return; }
  if (Array.isArray(node)) { node.forEach((v, i) => collectStrings(v, path + "[" + i + "]", out)); return; }
  if (node && typeof node === "object") {
    for (const k of Object.keys(node)) collectStrings(node[k], path ? path + "." + k : k, out);
  }
}

function checkFile(file) {
  const errors = [];
  const warnings = [];
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    return { errors: ["cannot parse: " + e.message], warnings: [] };
  }

  // 1. Structural pass against the JSON Schema.
  for (const msg of validate(pkg, schema, schema)) errors.push(msg);

  // 2. minItems invariants (jsonschema-lite does not implement minItems).
  const nonEmpty = (arr, at) => {
    if (!Array.isArray(arr) || arr.length < 1) errors.push(at + ": must have at least one item");
  };
  nonEmpty(pkg.signals, "signals");
  nonEmpty(pkg.record_hooks, "record_hooks");
  nonEmpty(pkg.interventions && pkg.interventions.guide_only, "interventions.guide_only");

  // 3. The human-delta boundary is a field, not a comment: guide_only may never be
  //    emptied, and every reserved item must say why it stays with the human.
  const guideOnly = (pkg.interventions && pkg.interventions.guide_only) || [];
  for (let i = 0; i < guideOnly.length; i++) {
    if (!guideOnly[i] || !String(guideOnly[i].why || "").trim()) {
      errors.push("interventions.guide_only[" + i + "]: a reserved item must say why it stays with the human");
    }
  }

  // 4. Techniques: a human's move, offered as one way, pending review.
  (pkg.techniques || []).forEach((t, i) => {
    if (t && t.one_way !== true) errors.push("techniques[" + i + "]: one_way must be true (a way, never the way)");
    if (t && t.provenance !== "guide") errors.push("techniques[" + i + "]: provenance must be 'guide' (a companion proposes, a person authors)");
    if (t && t.status !== "pending_review") errors.push("techniques[" + i + "]: status must be 'pending_review'");
  });

  // 5. Every signal names the inference it must NOT become.
  (pkg.signals || []).forEach((s, i) => {
    if (!s || !String(s.not || "").trim()) errors.push("signals[" + i + "]: a signal must state what it is NOT (behaviour, never diagnosis)");
  });

  // 6. No named condition anywhere; no vendor anywhere (and never in services).
  const strings = [];
  collectStrings(pkg, "", strings);
  for (const [path, s] of strings) {
    const m = s.match(diagRe);
    if (m) errors.push(path + ': names a condition ("' + m[1] + '") — behaviour only, never a diagnosis');
    const vm = s.match(vendorRe);
    if (vm) errors.push(path + ': names a vendor ("' + vm[1] + '") — capabilities only, never products or companies');
  }

  // 7. Cadence must degrade to the bundle: the floor is required by the schema; warn
  //    if a sidecar authored_for continuous forgets to say what still fails on a bundle.
  if (pkg.cadence && pkg.cadence.bundle && !String(pkg.cadence.bundle.cannot || "").trim()) {
    warnings.push("cadence.bundle.cannot: say plainly what the once-a-day modality cannot do here");
  }

  return { errors, warnings };
}

function main() {
  let files = process.argv.slice(2);
  if (files.length === 0) {
    const dir = resolve(here, "examples");
    files = readdirSync(dir).filter(f => f.endsWith(".companion.json")).map(f => join(dir, f));
  }
  if (files.length === 0) {
    console.error("no companion files found");
    process.exit(1);
  }
  let total = 0;
  let warnTotal = 0;
  for (const file of files) {
    const { errors, warnings } = checkFile(file);
    const name = basename(file);
    if (errors.length === 0) {
      console.log("OK   " + name + (warnings.length ? "  (" + warnings.length + " warning" + (warnings.length > 1 ? "s" : "") + ")" : ""));
    } else {
      console.log("FAIL " + name);
      for (const e of errors) console.log("     error: " + e);
    }
    for (const w of warnings) console.log("     warn:  " + w);
    total += errors.length;
    warnTotal += warnings.length;
  }
  console.log("");
  console.log(total === 0
    ? "OK — " + files.length + " sidecar(s), no errors" + (warnTotal ? ", " + warnTotal + " warning(s)" : "")
    : "FAILED — " + total + " error(s) across " + files.length + " sidecar(s)");
  process.exit(total === 0 ? 0 : 1);
}

main();
