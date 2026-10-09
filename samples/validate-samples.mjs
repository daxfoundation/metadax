#!/usr/bin/env node
// validate-samples.mjs — check samples/index.json against the fixed schema.
// Zero dependencies. Run from the repo root:  node samples/validate-samples.mjs
// Exits 1 on any error.
import { readFileSync, existsSync, readdirSync } from "fs";
import { dirname, resolve, join } from "path";
import { fileURLToPath } from "url";

const here = dirname(fileURLToPath(import.meta.url));
const indexPath = resolve(here, "index.json");

const FIELDS = ["id", "subject", "age_band", "stuck", "loves", "approach", "date", "licence", "path"];
const SUBJECTS = ["Math", "Reading", "Writing", "Spelling", "Science", "French", "Language", "History", "Other"];
const AGE_BANDS = ["4-6", "4-9", "7-9", "10-12", "13-15", "16-18"];
const LICENCES = ["CC BY 4.0", "CC BY-SA 4.0", "CC0 1.0"];
// Behaviour, never a diagnosis: a named condition must never appear in a sample.
// (The meta-words "evaluation"/"diagnosis" are allowed — the samples are expected
// to say "this is not a diagnosis; consider an evaluation" — only *named
// conditions* are flagged.)
const DIAGNOSIS = [
  "dyslexia", "dyslexic", "dyscalculia", "dysgraphia", "adhd",
  "autism", "autistic", "asperger", "spld",
  "learning disability", "learning disabilities"
];

const errors = [];
const warnings = [];
function err(m) { errors.push(m); }
function warn(m) { warnings.push(m); }

let index;
try {
  index = JSON.parse(readFileSync(indexPath, "utf8"));
} catch (e) {
  console.error("Cannot read samples/index.json: " + e.message);
  process.exit(1);
}
if (!index || index.format !== "metadax-samples" || index.v !== 1) {
  err('index.json must have {"format":"metadax-samples","v":1}');
}
const samples = (index && index.samples) || [];
if (!Array.isArray(samples)) { err("samples must be an array"); }

const seenIds = new Set();
const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const diagRe = new RegExp("\\b(" + DIAGNOSIS.join("|") + ")\\b", "i");

for (let i = 0; i < samples.length; i++) {
  const s = samples[i] || {};
  const at = "samples[" + i + "]" + (s.id ? " (" + s.id + ")" : "");
  for (const f of FIELDS) {
    if (s[f] === undefined || s[f] === null || String(s[f]).trim() === "") {
      err(at + ": missing field " + f);
    }
  }
  if (s.id) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.id)) err(at + ": id must be kebab-case");
    if (seenIds.has(s.id)) err(at + ": duplicate id"); else seenIds.add(s.id);
  }
  if (s.subject && !SUBJECTS.includes(s.subject)) err(at + ": subject not in " + SUBJECTS.join("|"));
  if (s.age_band && !AGE_BANDS.includes(s.age_band)) err(at + ": age_band not in " + AGE_BANDS.join("|"));
  if (s.licence && !LICENCES.includes(s.licence)) err(at + ": licence not in " + LICENCES.join("|"));
  if (s.date && !dateRe.test(s.date)) err(at + ": date must be YYYY-MM-DD");
  if (s.path) {
    if (s.path !== "samples/" + s.id + ".md") err(at + ': path must be "samples/" + id + ".md"');
    const abs = resolve(here, "..", s.path);
    if (!existsSync(abs)) err(at + ": path does not exist: " + s.path);
    else {
      const body = readFileSync(abs, "utf8");
      const m = body.match(diagRe);
      if (m) err(at + ': sample file names a diagnosis/condition ("' + m[1] + '") — behaviour, never a diagnosis');
      if (!/a way, never the way/i.test(body)) warn(at + ': sample file is missing the "a way, never the way" line');
    }
  }
  for (const f of ["stuck", "loves", "approach"]) {
    const v = s[f] ? String(s[f]) : "";
    const m = v.match(diagRe);
    if (m) err(at + ": field " + f + ' names a diagnosis/condition ("' + m[1] + '")');
    if (/https?:\/\/|www\.|@/.test(v)) err(at + ": field " + f + " looks like a link or handle");
  }
}

// Every samples/*.md must have an index entry.
const sampleDir = here;
for (const f of readdirSync(sampleDir)) {
  if (f.endsWith(".md") && f !== "README.md") {
    const id = f.replace(/\.md$/, "");
    if (!seenIds.has(id)) err("samples/" + f + " has no entry in index.json");
  }
}

for (const w of warnings) console.log("[warn]  " + w);
if (errors.length) {
  for (const e of errors) console.log("[error] " + e);
  console.log("\n" + errors.length + " error(s).");
  process.exit(1);
}
console.log("OK — " + samples.length + " sample(s), no errors.");
