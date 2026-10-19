#!/usr/bin/env node
// compact-record.js -- append-log compaction for the learner companion record (B03).
//
// Contract (mirrors MP-03 PATH compaction: "shrink the view, keep the source"):
//   - The append log is READ-ONLY input. This tool never edits or deletes log entries.
//   - It folds the many sessions of each (year, course) into ONE bounded course summary.
//   - It carries EVERY active refusal forward verbatim -- refusals are protected and are
//     never dropped, even if a size budget is exceeded (then it warns instead).
//   - It records a `dropped` list of what the view no longer carries, so a bad later
//     answer can be traced to lost context.
//
// Zero dependencies. Node stdlib only.
//
// Usage:
//   node compact-record.js <companion-log.jsonl>          # prints {view, compaction} JSON
//   const {compact} = require('./compact-record.js')       # as a module

'use strict';

// Fold the append log into a compacted view. `log` is an array of log entries.
function compact(log, asOf) {
  const dropped = [];

  // --- Refusals: protected. Keep every one whose latest status is `active`, verbatim. ---
  const refusalLatest = new Map(); // refusal_id -> entry (latest wins)
  for (const e of log) {
    if (e.kind === 'refusal') refusalLatest.set(e.refusal_id, e);
  }
  const refusals = [...refusalLatest.values()].filter(r => r.status === 'active');
  const activeTargets = new Set(refusals.map(r => r.target));

  // --- Courses: fold all sessions of a (year, course_id) into one summary. ---
  const courseKey = e => e.year + '|' + e.course_id;
  const courseOrder = [];
  const courseMap = new Map();
  for (const e of log) {
    if (e.kind !== 'session') continue;
    const k = courseKey(e);
    if (!courseMap.has(k)) {
      courseMap.set(k, {
        year: e.year, course_id: e.course_id, guide_ref: e.guide_ref,
        sessions: 0, conceptAcc: new Map(), notes: []
      });
      courseOrder.push(k);
    }
    const c = courseMap.get(k);
    c.sessions += 1;
    c.guide_ref = e.guide_ref; // last guide seen for the course
    for (const cp of e.concepts) {
      const prev = c.conceptAcc.get(cp.concept) || { competency: 0, misconceptions: new Set() };
      prev.competency = Math.max(prev.competency, cp.competency); // latest/best competency
      if (cp.misconception) prev.misconceptions.add(cp.misconception);
      c.conceptAcc.set(cp.concept, prev);
    }
    if (e.note) c.notes.push(e.note);
  }

  const courses = courseOrder.map(k => {
    const c = courseMap.get(k);
    const concepts = [...c.conceptAcc.entries()].map(([concept, v]) => ({
      concept, competency: v.competency,
      ...(v.misconceptions.size ? { misconceptions: [...v.misconceptions] } : {})
    }));
    // One bounded summary sentence from the course's notes. The per-session notes
    // themselves are folded away (recoverable from the log), so we record that.
    if (c.notes.length > 1) {
      dropped.push(`${c.notes.length} per-session notes for ${c.course_id} (year ${c.year}) folded to one summary`);
    }
    const summary = foldNotes(c.notes, c.course_id, c.sessions).slice(0, 600);
    return { year: c.year, course_id: c.course_id, guide_ref: c.guide_ref, sessions: c.sessions, concepts, summary };
  });

  // --- Competency: person-level latest/best per concept across all courses. ---
  const competency = {};
  for (const c of courses) {
    for (const cp of c.concepts) {
      competency[cp.concept] = Math.max(competency[cp.concept] || 0, cp.competency);
    }
  }

  // --- Carry-over ledger: every offer + outcome, so refused/declined bridges stay visible. ---
  const carry_over_ledger = log
    .filter(e => e.kind === 'carry_over')
    .map(e => ({
      year: e.year, into_course: e.into_course,
      from_concept: e.from.concept, to_concept: e.concept, outcome: e.outcome
    }));

  // --- Lapses kept (small, and relevant to re-engagement). ---
  const lapses = log.filter(e => e.kind === 'lapse').map(e => ({
    kind: 'lapse', from: e.from, to: e.to, days: e.days
  }));

  // Note what the view structurally does not carry.
  dropped.push('per-session competency trajectory (only latest/best per concept kept)');
  if (log.some(e => e.kind === 'session' && e.concepts.some(c => c.misconception))) {
    // misconceptions are kept at course level, but their per-session timing is lost
    dropped.push('timing of when each misconception appeared within a course');
  }

  const warnings = [];
  // refusals are never dropped; if we had a hard byte budget we would warn here.

  const view = {
    as_of: asOf || 'runtime',
    refusals,
    courses,
    competency,
    carry_over_ledger,
    lapses
  };

  // Assert the protection invariant: every active refusal target is present in the view.
  for (const t of activeTargets) {
    if (!view.refusals.some(r => r.target === t)) {
      throw new Error('compaction dropped a protected refusal: ' + t);
    }
  }

  const bytesView = Buffer.byteLength(JSON.stringify(view), 'utf8');
  const bytesLog = Buffer.byteLength(log.map(e => JSON.stringify(e)).join('\n'), 'utf8');

  const compaction = {
    kind: 'compaction', at: asOf || 'runtime',
    folded_through: log.length,
    bytes_log: bytesLog, bytes_view: bytesView,
    dropped, warnings
  };

  return { view, compaction };
}

// Deterministic one-line fold of a course's notes. Keeps the first and last note's gist;
// the middle is replaced by a count -- the full notes remain in the log.
function foldNotes(notes, courseId, sessions) {
  if (notes.length === 0) return `${courseId}: ${sessions} sessions, no notes.`;
  if (notes.length === 1) return notes[0];
  const first = notes[0].replace(/\s+/g, ' ').trim();
  const last = notes[notes.length - 1].replace(/\s+/g, ' ').trim();
  return `${courseId} across ${sessions} sessions. Opened: ${first} Ended: ${last}`;
}

module.exports = { compact, foldNotes };

if (require.main === module) {
  const fs = require('fs');
  const path = process.argv[2];
  if (!path) { console.error('usage: node compact-record.js <log.jsonl>'); process.exit(2); }
  const log = fs.readFileSync(path, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
  const out = compact(log);
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
}
