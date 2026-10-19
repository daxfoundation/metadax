#!/usr/bin/env node
// 01-run-pipeline.js -- the deterministic year-by-year pipeline.
//
// For each year, in causal order:
//   1. append a lapse entry if the year follows a six-month gap;
//   2. compact the log-so-far into the compacted view (B03 append-log compaction);
//   3. if year>1, run the carry-over proposer against that view + the new course,
//      filtered by the active refusal set; append carry_over entries (with scripted
//      outcomes) to the log;
//   4. append the year's 12 sessions in order, inserting refusal entries at the
//      session where the learner issued them;
//   5. snapshot the end-of-year compacted view + the guide-facing carry-over offers.
//
// Emits everything under ../out/. Node stdlib only. Run after 00-scenario.js.
'use strict';
const fs = require('fs');
const path = require('path');
const { compact } = require('../../proposed/tools/compact-record.js');
const { proposeCarryOver } = require('./lib/carryover.js');

const OUT = path.join(__dirname, '..', 'out');
const scenario = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'scenario.json'), 'utf8'));

const log = [];                 // the append-only companion log
const refusalsIssued = [];      // refusal entries appended so far (for the filter)
const bytesByYear = [];         // { year, bytes_log_raw, bytes_view_compacted, dropped_count }
const carryByYear = {};         // year -> proposer result (pre/post/suppressed)
const ledger = [];              // running carry_over ledger (to feed next year's view)

function refusalForYearSession(year, sessionNo) {
  return scenario.refusals.filter(r => r.year === year && r.at_session === sessionNo);
}

function appendRefusal(r, at) {
  const entry = { kind: 'refusal', at, refusal_id: r.refusal_id, directive: r.directive,
    scope: r.scope, target: r.target, status: r.status, said: r.said };
  log.push(entry);
  refusalsIssued.push(entry);
}

for (const y of scenario.plan) {
  // 1. lapse before this year.
  if (y.lapse_before) {
    const prev = log.filter(e => e.kind === 'session').slice(-1)[0];
    const from = prev ? prev.at : y.start;
    log.push({ kind: 'lapse', from, to: y.start, days: y.lapse_before });
  }

  // 2. compact the log-so-far -> the view the carry-over proposer sees.
  const viewBefore = compact(log).view;
  // keep the running ledger visible in the view (compactor derives it from log; we also
  // carry our explicit ledger so declined/suppressed bridges are never re-proposed).
  viewBefore.carry_over_ledger = ledger.slice();

  // 3. carry-over at the seam (year > 1).
  if (y.year > 1) {
    const candidates = scenario.bridges[String(y.year)] || [];
    const courseConcepts = Object.keys(y.concepts);
    const res = proposeCarryOver(viewBefore, candidates, refusalsIssued, courseConcepts, y.lapse_before || 0);
    res.into_course = y.course;
    carryByYear[y.year] = res;

    // record each offered bridge's outcome and append a carry_over log entry.
    for (const o of res.offers) {
      const key = `${y.course}:${o.from_concept}->${o.to_concept}`;
      const outcome = scenario.outcomes[key] || 'accepted';
      const entry = { kind: 'carry_over', at: y.start, year: y.year, into_course: y.course,
        from: { course_id: o.from_course, concept: o.from_concept }, concept: o.to_concept,
        outcome, why: o.why };
      log.push(entry);
      ledger.push({ year: y.year, into_course: y.course, from_concept: o.from_concept, to_concept: o.to_concept, outcome });
    }
    // record suppressed bridges in the ledger too (outcome suppressed_by_refusal) so the
    // trail of what was refused is durable and never re-proposed.
    for (const s of res.suppressed.filter(s => s.kind === 'offer')) {
      const entry = { kind: 'carry_over', at: y.start, year: y.year, into_course: y.course,
        from: { course_id: 'prior', concept: s.from }, concept: s.to,
        outcome: 'suppressed_by_refusal', why: s.reason };
      log.push(entry);
      ledger.push({ year: y.year, into_course: y.course, from_concept: s.from, to_concept: s.to, outcome: 'suppressed_by_refusal' });
    }
  }

  // 4. the year's 12 sessions, with refusals inserted at their session.
  const yearSessions = scenario.sessions.filter(s => s.year === y.year);
  for (const s of yearSessions) {
    for (const r of refusalForYearSession(y.year, s.session_no)) appendRefusal(r, s.at);
    log.push({ kind: 'session', at: s.at, year: s.year, course_id: s.course_id,
      guide_ref: s.guide_ref, concepts: s.concepts, note: s.note });
  }

  // 5. end-of-year snapshots + byte measurement.
  const { view, compaction } = compact(log);
  view.carry_over_ledger = ledger.slice();
  const rawBytes = Buffer.byteLength(log.map(e => JSON.stringify(e)).join('\n'), 'utf8');
  const viewBytes = Buffer.byteLength(JSON.stringify(view), 'utf8');
  bytesByYear.push({ year: y.year, course: y.course,
    log_entries: log.length,
    bytes_log_raw: rawBytes,
    bytes_view_compacted: viewBytes,
    ratio: +(rawBytes / viewBytes).toFixed(2),
    dropped: compaction.dropped.length });

  fs.writeFileSync(path.join(OUT, 'compacted-by-year', `year-${y.year}.json`),
    JSON.stringify({ year: y.year, into_next: null, view, compaction }, null, 2) + '\n');
}

// Final append log (JSONL) + final compacted view.
fs.writeFileSync(path.join(OUT, 'companion-log.jsonl'), log.map(e => JSON.stringify(e)).join('\n') + '\n');
const final = compact(log);
final.view.carry_over_ledger = ledger.slice();
fs.writeFileSync(path.join(OUT, 'compacted-view.json'), JSON.stringify(final.view, null, 2) + '\n');
fs.writeFileSync(path.join(OUT, 'carryover-by-year.json'), JSON.stringify(carryByYear, null, 2) + '\n');
fs.writeFileSync(path.join(OUT, 'bytes.json'), JSON.stringify({
  measure: 'record bytes per year, raw append-log vs compacted view',
  note: 'raw = full JSONL append log so far; compacted = the derived view handed to a guide/engine',
  per_year: bytesByYear
}, null, 2) + '\n');

// Compaction-loss report: what the compacted view can no longer answer that the log can.
const lossProbe = buildLossReport(log, final.view);
fs.writeFileSync(path.join(OUT, 'compaction-loss.json'), JSON.stringify(lossProbe, null, 2) + '\n');

console.log('pipeline done.');
console.log('log entries:', log.length, '| final raw bytes:', bytesByYear.slice(-1)[0].bytes_log_raw,
  '| final view bytes:', bytesByYear.slice(-1)[0].bytes_view_compacted);
for (const b of bytesByYear) console.log(`  year ${b.year} ${b.course}: raw ${b.bytes_log_raw}  view ${b.bytes_view_compacted}  (${b.ratio}x)`);

// --- what compaction lost: concrete questions the log answers but the view cannot ---
function buildLossReport(log, view) {
  const sessions = log.filter(e => e.kind === 'session');
  const lost = [];
  const kept = [];

  // Q1: on which session did a given misconception first appear?
  const firstMiscSession = {};
  for (const s of sessions) for (const c of s.concepts) if (c.misconception) {
    const k = c.concept + '|' + c.misconception;
    if (!(k in firstMiscSession)) firstMiscSession[k] = { course: s.course_id, at: s.at, note: s.note.slice(0, 40) };
  }
  if (Object.keys(firstMiscSession).length) lost.push({ question: 'on which session/date did each misconception first appear', answerable_from_log: true, answerable_from_view: false, example: Object.entries(firstMiscSession)[0] });

  // Q2: per-session competency trajectory (the ramp).
  lost.push({ question: 'the per-session competency trajectory within a course (the ramp)', answerable_from_log: true, answerable_from_view: false, note: 'view keeps only latest/best per concept' });

  // Q3: the exact wording of each session note.
  lost.push({ question: 'the verbatim per-session notes (only first+last survive in the folded summary)', answerable_from_log: true, answerable_from_view: false, folded_count: sessions.length });

  // What the view DOES still answer (the things that must survive):
  kept.push({ question: 'every active refusal, verbatim', answerable_from_view: true, count: view.refusals.length });
  kept.push({ question: 'latest competency per concept (person-level map)', answerable_from_view: true, count: Object.keys(view.competency).length });
  kept.push({ question: 'every carry-over offered and its outcome', answerable_from_view: true, count: view.carry_over_ledger.length });
  kept.push({ question: 'course-level misconceptions (which, not when)', answerable_from_view: true });
  kept.push({ question: 'the six-month lapses', answerable_from_view: true, count: (view.lapses || []).length });

  return { lost, kept };
}
