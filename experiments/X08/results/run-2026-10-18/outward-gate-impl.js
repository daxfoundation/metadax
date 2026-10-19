'use strict';
// Local copy of the gate implementation for the test harness.
// Canonical version: ../proposed/tools/outward-gate.js

function getAncestry(nodeId, registry) {
  const visited = new Set();
  const ancestors = [];
  let current = nodeId;
  while (current) {
    if (visited.has(current)) break;
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

function nodeText(node) {
  const parts = [
    node.title || '',
    node.question || '',
    node.canonical_question || '',
    ...(node.summary || []),
  ];
  const core = node.core || {};
  parts.push(...(core.key_points || []));
  parts.push(core.bridge_to_parent || '');
  parts.push(core.bridge_to_objective || '');
  for (const s of (core.sections || [])) {
    parts.push(s.heading || '');
    parts.push(s.body_md || '');
    if (s.check) {
      parts.push(s.check.question || '');
      parts.push(s.check.answer || '');
    }
  }
  return parts.join(' ');
}

function gate(nodeId, registry, orgDecl) {
  const node = registry[nodeId];
  if (!node) {
    return { decision: 'block', node_id: nodeId, reasons: ['Node not found in registry.'] };
  }

  const reasons = [];
  const privateModuleIds = new Set(orgDecl.private_module_ids || []);
  const privateNodeIds   = new Set(orgDecl.private_node_ids || []);
  const privateTerms     = orgDecl.private_terms || [];

  if (node.visibility === 'private') {
    reasons.push("Node visibility is 'private'.");
  }
  if (node.module_id && privateModuleIds.has(node.module_id)) {
    reasons.push(`Node module_id '${node.module_id}' is in private_module_ids.`);
  }
  if (privateNodeIds.has(nodeId)) {
    reasons.push('Node id is in private_node_ids.');
  }

  const ancestors = getAncestry(nodeId, registry);
  for (const ancId of ancestors) {
    const anc = registry[ancId];
    if (!anc) continue;
    if (anc.visibility === 'private') {
      reasons.push(`Ancestor ${ancId} has visibility 'private' — re-author required.`);
      break;
    }
    const ancMod = anc.module_id || '';
    if (ancMod && privateModuleIds.has(ancMod)) {
      reasons.push(`Ancestor ${ancId} belongs to private module '${ancMod}'.`);
      break;
    }
    if (privateNodeIds.has(ancId)) {
      reasons.push(`Ancestor ${ancId} is in private_node_ids.`);
      break;
    }
  }

  const text = nodeText(node);
  for (const term of privateTerms) {
    if (text.includes(term)) {
      reasons.push(`Content contains private term '${term}'.`);
    }
  }

  if (reasons.length > 0) {
    return { decision: 'block', node_id: nodeId, reasons };
  }

  const result = { decision: 'allow', node_id: nodeId, reasons: ['No private markers or ancestry found.'] };
  if (orgDecl.export_requires_review) {
    result.review_required = true;
    result.reasons.push('export_requires_review is set — human review needed before publishing.');
  }
  return result;
}

function gateBatch(candidateIds, registry, orgDecl) {
  return candidateIds.map(id => gate(id, registry, orgDecl));
}

module.exports = { gate, gateBatch, getAncestry, nodeText };
