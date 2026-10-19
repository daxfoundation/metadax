// lib/carryover.js -- the cross-course carry-over proposer and the refusal filter.
//
// This is the deterministic core of MP-14's "suppression is the runtime's job"
// contract: the runtime filters candidates against the active refusal set BEFORE the
// model (or guide) ever sees them. Three stages:
//   1. relevance  -- drop weak bridges (noise) and candidates whose source concept the
//                    learner does not actually hold (competency < 50 in the view).
//   2. refusal    -- drop any candidate whose from/to concept, course, technique,
//                    modality or example-style matches an ACTIVE refusal with directive
//                    never_carry or stop_suggesting; strip a never_show presentation.
//   3. rank/bound -- order by bridge strength, cap at 6, set stance from lapse.
//
// Returns { preFilter, postFilter, suppressed, notOffered } so the run can show exactly
// what the refusal filter removed (the refusal-integrity evidence).
'use strict';

const BRIDGE_RANK = { prerequisite: 0, 'shared-technique': 1, 'watch-misconception': 2 };

function activeRefusals(refusals) {
  const latest = new Map();
  for (const r of refusals) latest.set(r.refusal_id, r);
  return [...latest.values()].filter(r => r.status === 'active');
}

// Does an active refusal suppress this candidate entirely (concept/course/technique)?
function suppressingRefusal(cand, refs) {
  for (const r of refs) {
    if (r.directive !== 'never_carry' && r.directive !== 'stop_suggesting') continue;
    if (r.scope === 'concept' && (cand.from === r.target || cand.to === r.target)) return r;
    if (r.scope === 'course' && cand.from_course === r.target) return r;
    if (r.scope === 'technique' && cand.bridge === 'shared-technique' && cand.technique === r.target) return r;
  }
  return null;
}

// Does a never_show refusal forbid this candidate's suggested presentation?
function forbiddenPresentation(cand, refs) {
  if (!cand.present) return null;
  for (const r of refs) {
    if (r.directive !== 'never_show') continue;
    if (r.scope === 'modality' && cand.present.modality === r.target) return r;
    if (r.scope === 'example-style' && cand.present.example_style === r.target) return r;
  }
  return null;
}

// view: compacted companion view (has .competency map and .carry_over_ledger).
// candidates: scenario BRIDGES for this year. refusals: full refusal list.
// newCourseConcepts: concept slugs in the course being started. lapseDays: int|0.
function proposeCarryOver(view, candidates, refusals, newCourseConcepts, lapseDays) {
  const refs = activeRefusals(refusals);
  const held = view.competency || {};
  const courseSet = new Set(newCourseConcepts);
  const stance = lapseDays >= 90 ? 'review' : 'advance';

  const preFilter = [];
  const notOffered = [];

  for (const c of candidates) {
    // relevance: the `to` concept must exist in the new course.
    if (!courseSet.has(c.to)) { notOffered.push({ concept: c.from, to: c.to, reason: 'no bridge to this course' }); continue; }
    // relevance: learner must actually hold the source concept.
    if ((held[c.from] || 0) < 50) { notOffered.push({ concept: c.from, to: c.to, reason: 'low competency on source' }); continue; }
    // relevance: weak bridges are noise.
    if (c.bridge === 'weak') { notOffered.push({ concept: c.from, to: c.to, reason: 'bridge too weak (noise)' }); continue; }
    // ledger: never re-propose a bridge already declined or suppressed.
    const prior = (view.carry_over_ledger || []).find(l => l.from_concept === c.from && l.to_concept === c.to);
    if (prior && (prior.outcome === 'declined' || prior.outcome === 'suppressed_by_refusal')) {
      notOffered.push({ concept: c.from, to: c.to, reason: 'previously ' + prior.outcome });
      continue;
    }
    preFilter.push(c);
  }

  // Refusal filter.
  const suppressed = [];
  const postFilter = [];
  for (const c of preFilter) {
    const sup = suppressingRefusal(c, refs);
    if (sup) { suppressed.push({ from: c.from, to: c.to, refusal_id: sup.refusal_id, kind: 'offer', reason: `${sup.directive} ${sup.scope} ${sup.target}` }); continue; }
    const offer = { from_course: c.from_course, from_concept: c.from, to_concept: c.to, bridge: c.bridge, stance, why: whyLine(c) };
    const fp = forbiddenPresentation(c, refs);
    if (c.present) {
      if (fp) { suppressed.push({ from: c.from, to: c.to, refusal_id: fp.refusal_id, kind: 'presentation', reason: `stripped ${JSON.stringify(c.present)}` }); offer.presentation = 'neutral (refused presentation stripped)'; }
      else offer.presentation = c.present;
    }
    postFilter.push(offer);
  }

  // rank + bound to 6.
  postFilter.sort((a, b) => (BRIDGE_RANK[a.bridge] - BRIDGE_RANK[b.bridge]));
  const bounded = postFilter.slice(0, 6);

  const refused_seen = refs
    .filter(r => r.directive !== 'never_show' || true) // acknowledge all active refusals for this course
    .map(r => r.refusal_id);

  return {
    into_course: null, // set by caller
    stance,
    offers: bounded,
    not_offered: notOffered,
    suppressed,
    refused_seen
  };
}

function whyLine(c) {
  const verb = { prerequisite: 'builds directly on', 'shared-technique': 'uses the same move you learned for', 'watch-misconception': 'is a spot you got tangled on before, in' };
  return `${c.to} ${verb[c.bridge] || 'relates to'} your ${c.from}.`;
}

module.exports = { proposeCarryOver, activeRefusals, suppressingRefusal, forbiddenPresentation };
