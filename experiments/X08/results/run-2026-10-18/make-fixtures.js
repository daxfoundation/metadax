'use strict';
/**
 * make-fixtures.js — generate X08 deterministic test fixtures.
 * Outputs: fixtures.json
 * Run: node make-fixtures.js
 */

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE = __dirname;

function nid(seed) {
  const alphabet = '0123456789abcdefghjkmnpqrstvwxyz';
  const h = crypto.createHash('sha256').update(seed).digest();
  let val = BigInt('0x' + h.slice(0, 16).toString('hex'));
  const chars = [];
  for (let i = 0; i < 26; i++) {
    chars.push(alphabet[Number(val % 32n)]);
    val /= 32n;
  }
  return 'n_' + chars.join('');
}

// ── Org declaration ────────────────────────────────────────────────────────────

const ORG_DECL = {
  schema: 'metadax.org-declaration/0.1',
  org_id: 'example-freight-co',
  org_name: 'Example Freight Co. (fictional)',
  default_visibility: 'private',
  private_module_ids: ['meridian-protocol'],
  private_node_ids: [],          // filled below
  private_terms: [
    'Meridian Protocol',
    'MRD-7',
    'Project Apex',
    'audit score 87',
    'Section 4.2 gap',
    'Example Freight Co. Internal',
  ],
  export_requires_review: true,
  reviewers: ['eva.m', 'omar.t'],
  declared_at: '2026-10-18T09:00:00Z',
  notes: 'All meridian-protocol module content is proprietary. Any node quoting Example Freight Co. Internal materials requires re-authoring before export.',
};

// ── 30 private nodes ───────────────────────────────────────────────────────────

const PRIVATE_NODES = [];

const rootTopics = [
  ['Meridian Protocol overview',       'What is the Meridian Protocol and why does Example Freight Co. Internal use it?'],
  ['MRD-7 control framework',          'What controls does MRD-7 specify for data handling?'],
  ['Project Apex audit preparation',   'How should teams prepare for a Project Apex audit?'],
  ['Section 4.2 gap remediation',      'What steps close the Section 4.2 gap identified in the last audit?'],
  ['Audit score 87 improvement plan',  'What actions will raise our audit score 87 to target 95?'],
];

for (let i = 0; i < rootTopics.length; i++) {
  const [title, question] = rootTopics[i];
  const rid = nid(`priv-root-${i}`);
  PRIVATE_NODES.push({
    id: rid,
    parent_id: null,
    module_id: 'meridian-protocol',
    kind: 'objective',
    depth: 1,
    title,
    question,
    canonical_question: question,
    summary: [`This node covers ${title.toLowerCase()}.`],
    visibility: 'private',
    core: {
      sections: [{ id: 's1', heading: 'Overview',
        body_md: `Example Freight Co. Internal requires compliance with the Meridian Protocol. ${title} is foundational.` }],
      key_points: [`The Meridian Protocol mandates ${title.toLowerCase()}.`],
      bridge_to_parent: '',
      bridge_to_objective: '',
      source_refs: ['Example Freight Co. Internal policy v2.4'],
    },
  });
}

const followupTemplates = [
  ['Scope of {topic}',              'What is in scope for {topic}?'],
  ['{topic}: step-by-step',         'What is the step-by-step process for {topic}?'],
  ['Common mistakes in {topic}',    'What mistakes do teams make when addressing {topic}?'],
  ['Evidence required for {topic}', 'What evidence must be submitted to satisfy {topic}?'],
  ['Escalation path for {topic}',   'Who approves exceptions to {topic} requirements?'],
];

for (let i = 0; i < 5; i++) {
  const root = PRIVATE_NODES[i];
  const topic = root.title;
  for (let j = 0; j < 5; j++) {
    const [tmplTitle, tmplQ] = followupTemplates[j];
    const title    = tmplTitle.replace('{topic}', topic);
    const question = tmplQ.replace('{topic}', topic);
    const fid = nid(`priv-follow-${i}-${j}`);
    PRIVATE_NODES.push({
      id: fid,
      parent_id: root.id,
      module_id: 'meridian-protocol',
      kind: 'followup',
      depth: 2,
      title,
      question,
      canonical_question: question,
      summary: [`Covers ${title.toLowerCase()} in the Meridian Protocol context.`],
      visibility: 'private',
      core: {
        sections: [{ id: 's1', heading: 'Detail',
          body_md: `Under Example Freight Co. Internal policy, ${title.toLowerCase()} is governed by MRD-7.` }],
        key_points: [`Section 4.2 gap applies to ${title.toLowerCase()} in certain modules.`],
        bridge_to_parent: `This follows from '${root.title}'.`,
        bridge_to_objective: `Supports the main objective of ${root.title.toLowerCase()}.`,
        source_refs: ['MRD-7 control spec', 'Example Freight Co. Internal audit log 2026'],
      },
    });
  }
}

if (PRIVATE_NODES.length !== 30) throw new Error(`Expected 30 private nodes, got ${PRIVATE_NODES.length}`);

ORG_DECL.private_node_ids = PRIVATE_NODES.map(n => n.id);

// ── 30 derived candidates ──────────────────────────────────────────────────────

const CANDIDATES = [];

function makeCleanNode(seed, title, question, summary, body, parentId = null, depth = 1) {
  return {
    id: nid(seed),
    parent_id: parentId,
    module_id: 'general-compliance',
    kind: parentId ? 'followup' : 'objective',
    depth,
    title,
    question,
    canonical_question: question,
    summary: [summary],
    visibility: 'pending_review',
    core: {
      sections: [{ id: 's1', heading: 'Overview', body_md: body }],
      key_points: [summary],
      bridge_to_parent: '',
      bridge_to_objective: '',
      source_refs: [],
    },
  };
}

// Group A — 10 SAFE rewrites (should ALLOW)
const safeTopics = [
  ['Understanding compliance frameworks',
   'What is a compliance framework and why do organisations use one?',
   'Compliance frameworks help organisations manage risk systematically.',
   'A compliance framework is a structured set of guidelines that helps an organisation align its policies with regulatory requirements.'],
  ['Control-based risk management',
   'How do control-based frameworks reduce organisational risk?',
   'Controls reduce risk by limiting exposure at defined points in a process.',
   'Control frameworks enumerate checkpoints at which risk can be measured and mitigated.'],
  ['Audit preparation fundamentals',
   'What general steps should a team take before an external audit?',
   'Good audit preparation involves evidence gathering and gap identification.',
   'Teams should collect supporting documentation, map controls to requirements, and run internal pre-checks before an external auditor arrives.'],
  ['Gap analysis methodology',
   'How do you perform a gap analysis for a compliance standard?',
   'Gap analysis compares current state to required state across each control.',
   'A gap analysis maps each control requirement to current evidence and flags where evidence is missing or insufficient.'],
  ['Continuous improvement cycles',
   'What is a continuous improvement cycle in a compliance context?',
   'Continuous improvement cycles use audit findings to iteratively close gaps.',
   'After each audit, identified gaps are prioritised, remediated, and re-tested in the next cycle.'],
  ['Evidence collection best practices',
   'What makes audit evidence reliable and sufficient?',
   'Reliable evidence is contemporaneous, attributable, and complete.',
   'Evidence is strongest when it is collected at the time of the controlled activity, tagged to the person responsible, and covers the full scope of the control.'],
  ['Escalation and exception handling',
   'When should a compliance exception be escalated and how?',
   'Exceptions that cannot be remediated in-cycle require formal escalation.',
   'An exception is raised when a control cannot be met by the required date. It is escalated to the process owner who logs the risk acceptance or requests a waiver.'],
  ['Scope definition for compliance reviews',
   'How do you define the scope of a compliance review?',
   'Scope definition identifies which systems, processes, and data are in-scope.',
   'Scope is bounded by data classification, system ownership, and the specific standard being assessed.'],
  ['Common compliance mistakes',
   'What are the most common mistakes teams make during compliance reviews?',
   'Common mistakes include incomplete evidence and undocumented exceptions.',
   'Teams frequently fail to maintain contemporaneous records, leaving auditors with reconstructed evidence that carries less weight.'],
  ['Roles in a compliance programme',
   'Who owns compliance activities in a typical organisation?',
   'Compliance ownership is distributed across process owners, a central function, and executive sponsors.',
   'The central compliance function sets the framework; process owners gather evidence; executive sponsors approve risk acceptance.'],
];

for (let k = 0; k < safeTopics.length; k++) {
  const [title, question, summary, body] = safeTopics[k];
  const node = makeCleanNode(`safe-${k}`, title, question, summary, body);
  node.reauthored = true;
  CANDIDATES.push({ category: 'safe_rewrite', node });
}

// Group B — 10 NEAR-COPIES (should BLOCK: private ancestor)
const privRoots = PRIVATE_NODES.slice(0, 5);
for (let k = 0; k < 10; k++) {
  const root = privRoots[k % 5];
  const title    = root.title.replace('Example Freight Co. Internal', 'our organisation')
                             .replace('Meridian Protocol', 'the protocol')
                             .replace('MRD-7', 'the control spec')
                             .replace('Project Apex', 'the audit project');
  const question = root.question.replace('Example Freight Co. Internal', 'our organisation')
                                .replace('Meridian Protocol', 'the protocol');
  CANDIDATES.push({
    category: 'near_copy',
    node: {
      id: nid(`near-${k}`),
      parent_id: root.id,   // PRIVATE ancestor still attached
      module_id: 'general-compliance',
      kind: 'followup',
      depth: 2,
      title,
      question,
      canonical_question: question,
      summary: [`Paraphrase of '${root.title}' with private parent still attached.`],
      visibility: 'pending_review',
      core: {
        sections: [{ id: 's1', heading: 'Overview',
          body_md: `This rewords content from '${root.title}' but retains the original parent link.` }],
        key_points: ['The protocol mandates this practice.'],
        bridge_to_parent: `Derived from private node ${root.id}.`,
        bridge_to_objective: '',
        source_refs: [],
      },
    },
  });
}

// Group C — 10 DESCENDANTS quoting private facts (should BLOCK: private term in content)
const embeddedTerms = [
  'Meridian Protocol', 'MRD-7', 'Project Apex', 'audit score 87', 'Section 4.2 gap',
  'Example Freight Co. Internal', 'Meridian Protocol', 'MRD-7', 'audit score 87', 'Section 4.2 gap',
];
for (let k = 0; k < 10; k++) {
  const safeParentId = nid(`safe-${k}`);  // points to a SAFE node
  const term = embeddedTerms[k];
  CANDIDATES.push({
    category: 'quotes_private_fact',
    node: {
      id: nid(`desc-quoting-${k}`),
      parent_id: safeParentId,
      module_id: 'general-compliance',
      kind: 'followup',
      depth: 2,
      title: `Compliance review follow-up ${k + 1}`,
      question: `How does this relate to ${term} requirements?`,
      canonical_question: `How does this relate to ${term} requirements?`,
      summary: [`Discusses compliance obligations referencing ${term}.`],
      visibility: 'pending_review',
      core: {
        sections: [{ id: 's1', heading: 'Detail',
          body_md: `As established under ${term}, teams must document all control activities on a quarterly basis.` }],
        key_points: [`Requirement stems from ${term}.`],
        bridge_to_parent: "Extends the parent node's discussion of control frameworks.",
        bridge_to_objective: '',
        source_refs: [],
      },
    },
  });
}

if (CANDIDATES.length !== 30) throw new Error(`Expected 30 candidates, got ${CANDIDATES.length}`);

const fixtures = {
  org_declaration: ORG_DECL,
  private_nodes: PRIVATE_NODES,
  candidates: CANDIDATES,
};

const outPath = path.join(BASE, 'fixtures.json');
fs.writeFileSync(outPath, JSON.stringify(fixtures, null, 2));

console.log(`Written ${outPath}`);
console.log(`  org_declaration : 1`);
console.log(`  private_nodes   : ${PRIVATE_NODES.length}`);
console.log(`  candidates      : ${CANDIDATES.length}`);
console.log(`    safe_rewrite        : ${CANDIDATES.filter(c => c.category === 'safe_rewrite').length}`);
console.log(`    near_copy           : ${CANDIDATES.filter(c => c.category === 'near_copy').length}`);
console.log(`    quotes_private_fact : ${CANDIDATES.filter(c => c.category === 'quotes_private_fact').length}`);
