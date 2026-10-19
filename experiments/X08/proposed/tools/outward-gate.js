/**
 * outward-gate.js — ancestry-aware export gate for an org-declared private registry.
 *
 * Usage:
 *   const { gate } = require('./outward-gate');
 *   const result = gate(nodeId, registryMap, orgDecl);
 *   // result: { decision: 'allow'|'block', reasons: string[], node_id: string }
 *
 * A node is blocked if ANY of the following holds:
 *   1. Its own visibility field is 'private'.
 *   2. Its module_id (if present) is in orgDecl.private_module_ids.
 *   3. Its node_id is in orgDecl.private_node_ids.
 *   4. Any node in its parent chain (via parent_id links) satisfies 1–3.
 *   5. Any private_term from orgDecl appears in the node's scannable text fields.
 *
 * A node that passes 1–5 is still held as 'pending_review' (not outright blocked)
 * when orgDecl.export_requires_review is true. The gate returns decision:'allow'
 * with a 'review_required' note in that case so callers can enforce the review step.
 *
 * Node registry format: plain object keyed by node_id.
 *   Each entry: { id, parent_id, visibility, module_id?, title, question, summary[], core }
 */

'use strict';

/**
 * Walk the parent_id chain and return all ancestor node IDs (nearest first).
 * Stops at null parent_id or a cycle (safety: visited set).
 */
function getAncestry(nodeId, registry) {
  const visited = new Set();
  const ancestors = [];
  let current = nodeId;
  while (current) {
    if (visited.has(current)) break; // cycle guard
    visited.add(current);
    const node = registry[current];
    if (!node) break;
    const parentId = node.parent_id;
    if (!parentId) break;
    ancestors.push(parentId);
    current = parentId;
  }
  return ancestors;
}

/**
 * Collect all text content from a node's scannable fields.
 */
function nodeText(node) {
  const parts = [
    node.title || '',
    node.question || '',
    node.canonical_question || '',
    ...(node.summary || []),
  ];
  if (node.core) {
    parts.push(...(node.core.key_points || []));
    parts.push(node.core.bridge_to_parent || '');
    parts.push(node.core.bridge_to_objective || '');
    for (const s of (node.core.sections || [])) {
      parts.push(s.heading || '');
      parts.push(s.body_md || '');
      if (s.check) {
        parts.push(s.check.question || '');
        parts.push(s.check.answer || '');
      }
    }
  }
  return parts.join(' ');
}

/**
 * Decide whether a single node may leave the org wall.
 *
 * @param {string} nodeId
 * @param {Object} registry  - map from node_id to node object
 * @param {Object} orgDecl   - org-declaration object
 * @returns {{ decision: 'allow'|'block', reasons: string[], node_id: string, review_required?: boolean }}
 */
function gate(nodeId, registry, orgDecl) {
  const node = registry[nodeId];
  if (!node) {
    return {
      decision: 'block',
      node_id: nodeId,
      reasons: ['Node not found in registry.'],
    };
  }

  const reasons = [];
  const privateModuleIds = new Set(orgDecl.private_module_ids || []);
  const privateNodeIds = new Set(orgDecl.private_node_ids || []);
  const privateTerms = orgDecl.private_terms || [];

  // Check 1: node's own visibility
  if (node.visibility === 'private') {
    reasons.push(`Node visibility is 'private'.`);
  }

  // Check 2: node's module_id is private
  if (node.module_id && privateModuleIds.has(node.module_id)) {
    reasons.push(`Node module_id '${node.module_id}' is in the org's private_module_ids.`);
  }

  // Check 3: node itself is named in private_node_ids
  if (privateNodeIds.has(nodeId)) {
    reasons.push(`Node id is listed in org's private_node_ids.`);
  }

  // Check 4: ancestor touch — any ancestor is private
  const ancestors = getAncestry(nodeId, registry);
  for (const ancId of ancestors) {
    const anc = registry[ancId];
    if (!anc) continue;
    if (anc.visibility === 'private') {
      reasons.push(`Ancestor ${ancId} has visibility 'private' — re-author required before export.`);
      break;
    }
    if (anc.module_id && privateModuleIds.has(anc.module_id)) {
      reasons.push(`Ancestor ${ancId} belongs to private module '${anc.module_id}'.`);
      break;
    }
    if (privateNodeIds.has(ancId)) {
      reasons.push(`Ancestor ${ancId} is in org's private_node_ids.`);
      break;
    }
  }

  // Check 5: private term in content
  const text = nodeText(node);
  for (const term of privateTerms) {
    if (text.includes(term)) {
      reasons.push(`Node content contains private term '${term}'.`);
    }
  }

  if (reasons.length > 0) {
    return { decision: 'block', node_id: nodeId, reasons };
  }

  // All checks passed
  const result = { decision: 'allow', node_id: nodeId, reasons: ['No private markers or ancestry found.'] };
  if (orgDecl.export_requires_review) {
    result.review_required = true;
    result.reasons.push('export_requires_review is set — human review needed before publishing.');
  }
  return result;
}

/**
 * Run the gate on a list of candidate node IDs and return a batch report.
 */
function gateBatch(candidateIds, registry, orgDecl) {
  return candidateIds.map(id => gate(id, registry, orgDecl));
}

module.exports = { gate, gateBatch, getAncestry, nodeText };
