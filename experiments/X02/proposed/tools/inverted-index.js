// metadax inverted-index — fix for B22.
//
// B22: the federated index re-scans the union of all fork registries per
// follow-up candidate lookup (O(union)); there is no stored index keyed on
// stuck-signature or content hash. This builds that stored inverted index so a
// candidate lookup is a map hit (amortised O(1)) rather than a union scan.
//
// Zero deps beyond node's crypto. Pure data in, pure data out — no I/O.

'use strict';
const crypto = require('crypto');

// Canonical content hash for a node's reusable payload. Deterministic; the same
// key a runtime stamps as content_sha256. Keyed on canonical_question + intent so
// "same question, same intent" collapses to one key (the reuse rule, MP-05 c).
function contentKey(node) {
  const basis = JSON.stringify([
    (node.canonical_question || '').trim().toLowerCase(),
    node.intent || null,
  ]);
  return crypto.createHash('sha256').update(basis).digest('hex');
}

// A stuck-signature is the cross-language retrieval key for a technique: the
// confusion a move addresses, not its wording. Nodes that carry one are indexed
// under it so an es/de learner can find an en move by signature (see X01).
function stuckSignature(node) {
  return node.stuck_signature || null;
}

// Build a stored inverted index over a union of registry entries (the federated
// read-only union). Two posting maps: content-hash -> ids, signature -> ids.
// `entries` is a flat array of registry entries (each with id, plus the fields
// contentKey/stuckSignature read above). Build is O(union); every subsequent
// lookup is O(1)+O(hits), replacing the per-call O(union) scan.
function build(entries) {
  const byContent = new Map();
  const bySignature = new Map();
  let indexed = 0;
  for (const e of entries) {
    const ck = e.content_sha256 || contentKey(e);
    if (!byContent.has(ck)) byContent.set(ck, []);
    byContent.get(ck).push(e.id);
    const sig = stuckSignature(e);
    if (sig) {
      if (!bySignature.has(sig)) bySignature.set(sig, []);
      bySignature.get(sig).push(e.id);
    }
    indexed++;
  }
  return {
    schema: 'metadax.inverted-index/0.1-PROPOSED',
    size: indexed,
    byContent,
    bySignature,
    // O(1) candidate lookup by content hash.
    lookupByContent(ck) { return byContent.get(ck) || []; },
    // O(1) candidate lookup by stuck-signature (cross-language reuse).
    lookupBySignature(sig) { return bySignature.get(sig) || []; },
  };
}

// Reference O(union) scan — what the federated index does today. Kept so the
// simulation can count comparisons for the before/after lookup-cost measure.
function unionScan(entries, ck) {
  const hits = [];
  let comparisons = 0;
  for (const e of entries) {
    comparisons++;
    const k = e.content_sha256 || contentKey(e);
    if (k === ck) hits.push(e.id);
  }
  return { hits, comparisons };
}

module.exports = { contentKey, stuckSignature, build, unionScan };
