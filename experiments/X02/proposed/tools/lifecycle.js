// metadax node lifecycle — fix for B21.
//
// B21: node.visibility is private|pending_review|shared with no accepted_by /
// reviewed_by provenance for the transition, and no `contested` flag to keep two
// cores side by side. Today federation indexes pending_review nodes as reusable,
// so unreviewed learner content propagates cross-fork before any teacher review.
//
// This adds an `accepted` state with review provenance and a `contested` flag,
// and the one rule federation needs: ONLY accepted nodes propagate cross-fork.
//
// Zero deps. Pure functions over node objects; no I/O.

'use strict';

// Visibility ladder. `accepted` sits above pending_review: a reviewer (teacher /
// curator, MP-09) has signed off. `shared` remains the public-availability flag;
// a node can be shared within its origin fork while still only `accepted` nodes
// cross fork boundaries.
const STATES = ['private', 'pending_review', 'accepted', 'shared'];

// Record a review decision on a node. Stamps reviewed_by always; on accept also
// stamps accepted_by and lifts visibility to `accepted` (unless already shared).
// Never erases prior provenance — reviewers accumulate (append-only).
function review(node, reviewer, decision /* 'accept' | 'reject' */) {
  const out = Object.assign({}, node);
  out.reviewed_by = (node.reviewed_by || []).concat([reviewer]);
  if (decision === 'accept') {
    out.accepted_by = (node.accepted_by || []).concat([reviewer]);
    if (out.visibility === 'private' || out.visibility === 'pending_review') {
      out.visibility = 'accepted';
    }
  }
  return out;
}

// The federation gate (replaces contract point 8's indexing of pending_review).
// A node may be read by a *different* fork only once a reviewer has accepted it.
// A node is always visible within its own origin fork and to its own author.
function propagatesCrossFork(node) {
  return node.visibility === 'accepted' || node.visibility === 'shared';
}

// Mark two nodes as a contested core: both kept, neither superseded. Each points
// at the other and carries a shared contest id so a merge keeps them side by side
// (preservation rule, shared with X09). Returns the two updated nodes.
function markContested(a, b, contestId) {
  const ca = Object.assign({}, a, {
    contested: true,
    contested_with: (a.contested_with || []).concat([b.id]),
    contest_id: contestId,
  });
  const cb = Object.assign({}, b, {
    contested: true,
    contested_with: (b.contested_with || []).concat([a.id]),
    contest_id: contestId,
  });
  return [ca, cb];
}

function isContested(node) { return node.contested === true; }

module.exports = { STATES, review, propagatesCrossFork, markContested, isContested };
