#!/usr/bin/env node
// check-record.mjs — validate a metadax-record entry (schema + privacy pass).
// Zero dependencies. Run from wherever you wrote the entry:
//   node check-record.mjs                 # checks ./record-entry.json
//   node check-record.mjs my-entry.json   # checks one named file
// Exits 1 on any error.
//
// This is the same check the learner-record template repo runs
// (daxfoundation/metadax-learner-record, tools/validate-record.mjs) — mirrored
// here so the skill can validate an entry the moment it writes one, before it
// ever leaves the guide's machine. A record is private by default; this check is
// the privacy gate that runs every time one is created, not only at publish.
import { readFileSync } from "fs";
import { resolve, basename } from "path";

const SUBJECTS = ["Math", "Reading", "Writing", "Spelling", "Science", "French", "Language", "History", "Other"];
const AGE_BANDS = ["4-6", "4-9", "7-9", "10-12", "13-15", "16-18"];

// Behaviour, never a diagnosis: a named condition must never appear in a record.
// (The meta-words "evaluation"/"diagnosis" are allowed — a guide may write "we
// decided to ask for an evaluation" — only *named conditions* are flagged.)
const DIAGNOSIS = [
  "dyslexia", "dyslexic", "dyscalculia", "dysgraphia", "adhd",
  "autism", "autistic", "asperger", "spld",
  "learning disability", "learning disabilities"
];
const diagRe = new RegExp("\\b(" + DIAGNOSIS.join("|") + ")\\b", "i");
// PII a program can actually detect: email, phone (7+ digits), @handle, a link.
const emailRe = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const phoneRe = /(?:\+?\d[\s\-().]*){7,}/;
const handleRe = /(^|\s)@[A-Za-z0-9_]{2,}/;
const linkRe = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|uk|ca|edu|gov)\b/i;

const errors = [];
const warnings = [];
const E = (f, m) => errors.push(f + ": " + m);
const W = (f, m) => warnings.push(f + ": " + m);

const FREE_TEXT = ["learner_words", "guide_note"];

function checkEntry(file, entry) {
  const at = basename(file);
  if (!entry || typeof entry !== "object") { E(at, "not a JSON object"); return; }
  if (entry.format !== "metadax-record") E(at, 'format must be "metadax-record"');
  if (entry.v !== 1) E(at, "v must be 1");

  const stem = basename(file).replace(/\.json$/, "");
  if (!entry.entry_id) E(at, "missing entry_id");
  else {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.entry_id)) E(at, "entry_id must be kebab-case");
    // The entry_id must equal the filename stem *once you drop it into record/*.
    // The skill writes it as record-entry.json, so only enforce the shape here.
    if (stem !== "record-entry" && entry.entry_id !== stem)
      W(at, 'entry_id "' + entry.entry_id + '" should equal the filename stem "' + stem + '" once saved into record/');
  }

  const p = entry.package;
  if (!p || typeof p !== "object") E(at, "missing package {ref, session}");
  else {
    if (!p.ref || typeof p.ref !== "string") E(at, "package.ref missing");
    if (!Number.isInteger(p.session) || p.session < 1) E(at, "package.session must be an integer >= 1");
    if (p.subject !== undefined && !SUBJECTS.includes(p.subject)) E(at, "package.subject not in " + SUBJECTS.join("|"));
    if (p.age_band !== undefined && !AGE_BANDS.includes(p.age_band)) E(at, "package.age_band not in " + AGE_BANDS.join("|"));
  }

  if (!entry.date) E(at, "missing date");
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) E(at, "date must be YYYY-MM-DD");

  for (const key of ["attempted", "reached"]) {
    if (entry[key] === undefined) { E(at, "missing " + key); continue; }
    if (!Array.isArray(entry[key])) { E(at, key + " must be an array"); continue; }
    for (let i = 0; i < entry[key].length; i++) {
      const g = entry[key][i] || {};
      if (!g.game || typeof g.game !== "string") E(at, key + "[" + i + "].game missing");
    }
  }
  if (Array.isArray(entry.reached)) {
    for (const r of entry.reached) {
      if (r && r.of !== undefined && r.level !== undefined && r.level > r.of)
        W(at, 'reached level ' + r.level + ' exceeds total ' + r.of + ' for "' + r.game + '"');
    }
  }

  // --- the privacy pass: never a real name, a location, or a named condition ---
  const scan = {};
  for (const f of FREE_TEXT) if (entry[f]) scan[f] = String(entry[f]);
  if (Array.isArray(entry.mistakes)) entry.mistakes.forEach((m, i) => { if (m && m.name) scan["mistakes[" + i + "].name"] = String(m.name); });
  if (p && p.title) scan["package.title"] = String(p.title);
  for (const [field, v] of Object.entries(scan)) {
    const d = v.match(diagRe);
    if (d) E(at, field + ' names a condition ("' + d[1] + '") — behaviour, never a diagnosis');
    if (emailRe.test(v)) E(at, field + " contains something that looks like an email address");
    if (handleRe.test(v)) E(at, field + " contains something that looks like an @handle");
    if (phoneRe.test(v)) W(at, field + " contains a long run of digits that looks like a phone number");
    if (linkRe.test(v)) E(at, field + " contains a link — links belong only in the links block");
  }

  if (entry.links !== undefined) {
    if (typeof entry.links !== "object") E(at, "links must be an object");
    else for (const [k, v] of Object.entries(entry.links)) {
      if (!["sample", "package", "play"].includes(k)) E(at, "links has unexpected key " + k);
      if (v === "" || v === undefined) continue;
      if (!/^https:\/\//.test(String(v))) E(at, "links." + k + " must be an https URL (or empty)");
      else if (!/^https:\/\/([a-z0-9-]+\.)*(daxfoundation\.org|github\.com|github\.io)\//i.test(String(v)))
        W(at, "links." + k + " is not on daxfoundation.org or github — check it is what you mean to publish");
    }
  }
}

const args = process.argv.slice(2);
const files = (args.length ? args : ["record-entry.json"]).map((a) => resolve(a));
for (const file of files) {
  let entry;
  try { entry = JSON.parse(readFileSync(file, "utf8")); }
  catch (e) { E(basename(file), "cannot read/parse JSON: " + e.message); continue; }
  checkEntry(file, entry);
}

for (const w of warnings) console.log("[warn]  " + w);
if (errors.length) {
  for (const e of errors) console.log("[error] " + e);
  console.log("\n" + errors.length + " error(s).");
  process.exit(1);
}
console.log("OK — record entry is valid and carries nothing identifying.");
