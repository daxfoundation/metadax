#!/usr/bin/env node
// E09 — simulate-parents.js
// Drives 6 parent personas; each persona is a subagent that writes record entries.
// Run output is committed in run-2026-10-18/records/*.json.
// This script documents what ran; re-running requires Claude subagents (sonnet).
// Results are SIMULATED.

// Package used for sessions
const PACKAGE = {
  ref: "HS-RDG7", title: "Sounds That Stick", subject: "Reading", age_band: "7-9"
};

// Sessions shown to each parent
const SESSIONS = [
  { n:1, date:"2026-10-13", game:"Dino Sound Game",  answered:11, right:8,  level:2, of:3,
    behaviours:["said the sounds but they stayed apart ×2","guessed from the first sound ×1"] },
  { n:2, date:"2026-10-15", game:"Word Chain Race",   answered:14, right:11, level:2, of:3,
    behaviours:["reversed sounds in short blends ×2"] },
  { n:3, date:"2026-10-17", game:"Rhyme Rocket",      answered:18, right:16, level:3, of:3,
    behaviours:["confused rhyme with starting sound ×1"] }
];

// Personas — each was a fresh sonnet subagent that saw sessions + schema, not each other
const PERSONAS = [
  { name:"Maelle",   description:"two kids (Pip age 7, Jo age 9), warm brief notes",  entries:6 },
  { name:"Lea",      description:"teen (Ash, 14) leads own learning; parent checks stats", entries:3 },
  { name:"Yuna",     description:"very little time; one-sentence notes; skips optional fields", entries:3 },
  { name:"Francois", description:"ex-teacher; 300-500 word pedagogical guide_notes", entries:3 },
  { name:"Simone",   description:"Québec parent; writes in French",                  entries:3 },
  { name:"Etienne",  description:"over-sharer; includes PII and diagnosis words",    entries:3 }
];
// Total: 21 entries

// Validation command (run from repo root of metadax-learner-record clone):
//   node tools/validate-record.mjs <path-to-records>/*.json

console.log("Script documents the simulation that ran 2026-10-18.");
console.log("Sessions:", SESSIONS.length, "| Personas:", PERSONAS.length, "| Total entries:", PERSONAS.reduce((s,p)=>s+p.entries,0));
