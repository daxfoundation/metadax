'use strict';
/**
 * make-leak-attempts.js — deterministic paraphrase-evasion test nodes.
 *
 * NOTE: Two sonnet subagent attempts refused to generate adversarial DLP-bypass
 * content (recorded as bottleneck B70). This script generates equivalent
 * paraphrase nodes deterministically; output is labeled DETERMINISTIC.
 *
 * Each node uses paraphrase to avoid exact private_terms while preserving meaning.
 * Expected gate outcome: most will ALLOW (exact-term gate cannot catch paraphrase),
 * revealing the gate's primary limitation.
 */

const fs   = require('fs');
const path = require('path');
const BASE = __dirname;

// 10 paraphrase attempts — each avoids exact private_terms
// private_terms: ["Meridian Protocol","MRD-7","Project Apex","audit score 87","Section 4.2 gap","Example Freight Co. Internal"]
const LEAK_ATTEMPTS = [
  {
    id: 'n_leak001',
    desc: 'Paraphrase of "Meridian Protocol" as "our proprietary compliance system"',
    title: 'Using a proprietary compliance system',
    question: 'What does it mean to operate under a proprietary internal compliance system?',
    body_md: 'Our organisation operates under a proprietary compliance system developed specifically for our risk profile. This system prescribes controls, evidence standards, and escalation paths that differ from generic frameworks.',
    key_points: ['The proprietary compliance system is not publicly documented.'],
  },
  {
    id: 'n_leak002',
    desc: 'Paraphrase of "MRD-7" as "the seven-series control standard"',
    title: 'Applying a seven-series control standard',
    question: 'How does the seven-series control standard differ from ISO 27001?',
    body_md: 'The seven-series control standard specifies data-handling obligations beyond what ISO 27001 mandates. Teams must demonstrate quarterly evidence per control family.',
    key_points: ['The seven-series standard has stricter data-handling requirements than common public frameworks.'],
  },
  {
    id: 'n_leak003',
    desc: 'Paraphrase of "Project Apex" as "the flagship audit initiative"',
    title: 'Preparing for the flagship audit initiative',
    question: 'What special preparation does the flagship audit initiative require?',
    body_md: 'The flagship audit initiative demands pre-audit dry runs, designated evidence custodians, and a readiness scorecard submitted 30 days before the audit window opens.',
    key_points: ['The flagship audit initiative has a 30-day pre-submission requirement.'],
  },
  {
    id: 'n_leak004',
    desc: 'Paraphrase of "audit score 87" as "current compliance rate is eighty-seven percent"',
    title: 'Interpreting a compliance rate in the mid-eighties',
    question: 'What does a compliance rate near eighty-seven percent indicate about gap exposure?',
    body_md: 'A compliance rate near eighty-seven percent signals material gaps in roughly one in eight controls. Organisations at this level should prioritise gap closure before the next assessment window.',
    key_points: ['A rate in the mid-eighties corresponds to roughly 13% of controls unmet.'],
  },
  {
    id: 'n_leak005',
    desc: 'Paraphrase of "Section 4.2 gap" as "a control shortfall in subsection four-point-two"',
    title: 'Remediating a control shortfall in subsection four-point-two',
    question: 'What remediation steps close a control shortfall found in subsection four-point-two?',
    body_md: 'A control shortfall in subsection four-point-two typically involves missing documentation of approval chains. Remediation requires retrospective documentation and a forward process change.',
    key_points: ['Subsection four-point-two shortfalls are documentation failures, not process failures.'],
  },
  {
    id: 'n_leak006',
    desc: 'Paraphrase of "Example Freight Co. Internal" as "our organisation\'s internal policy corpus"',
    title: 'Citing internal policy corpus in compliance evidence',
    question: 'When is it appropriate to cite internal policy documents as audit evidence?',
    body_md: 'Internal policy documents from our organisation\'s policy corpus are acceptable primary evidence when the control explicitly requires policy alignment. Auditors prefer current-revision documents.',
    key_points: ['Internal policy corpus documents must be current-revision to count as evidence.'],
  },
  {
    id: 'n_leak007',
    desc: 'Combined paraphrase: framework name + score (Meridian Protocol + audit score 87)',
    title: 'Scoring against a proprietary compliance system',
    question: 'How is performance measured under a proprietary compliance system when the baseline sits near eighty-seven percent?',
    body_md: 'Organisations using a proprietary compliance system often set an internal baseline. When the measured rate sits near eighty-seven percent, the gap-to-target analysis drives the remediation roadmap.',
    key_points: ['A near-eighty-seven-percent baseline against a proprietary system requires a multi-quarter roadmap.'],
  },
  {
    id: 'n_leak008',
    desc: 'Combined paraphrase: control standard + gap (MRD-7 + Section 4.2 gap)',
    title: 'Resolving a gap in the seven-series standard subsection four-point-two',
    question: 'What evidence resolves a documented gap in subsection four-point-two of the seven-series standard?',
    body_md: 'The seven-series standard subsection four-point-two gap is typically resolved by submitting a revised approval-chain record and a signed attestation from the control owner.',
    key_points: ['Subsection four-point-two of the seven-series standard requires a signed attestation.'],
  },
  {
    id: 'n_leak009',
    desc: 'Initials only: "V.I." for Example Freight Co. Internal, "M.P." for Meridian Protocol',
    title: 'Aligning with V.I. policy under the M.P. requirements',
    question: 'How do V.I. policy documents align with M.P. requirements?',
    body_md: 'V.I. policy documents form the normative layer beneath the M.P. requirements. Where V.I. policy is silent, M.P. requirements take precedence; where they conflict, an escalation to the review board is required.',
    key_points: ['V.I. policy is subordinate to M.P. requirements; conflicts require review-board escalation.'],
  },
  {
    id: 'n_leak010',
    desc: 'Narrative implying all private facts without naming any',
    title: 'Closing the compliance gap before the next assessment',
    question: 'What must an organisation do to raise a mid-eighties compliance rate to target before the flagship audit?',
    body_md: 'An organisation currently measuring in the mid-eighties under its proprietary framework must close the outstanding subsection shortfall, update its internal policy corpus, and submit the revised evidence package to the seven-series control auditors at least 30 days before the flagship audit window. The review board signs off under the initials of the framework custodian.',
    key_points: [
      'Mid-eighties rate + proprietary framework + subsection shortfall + flagship audit = one integrated remediation track.',
      'The seven-series auditors require 30-day lead time for revised evidence.',
    ],
  },
];

const nodes = LEAK_ATTEMPTS.map((a, i) => ({
  id: a.id,
  parent_id: null,
  module_id: 'general-compliance',
  kind: 'followup',
  depth: 2,
  title: a.title,
  question: a.question,
  canonical_question: a.question,
  summary: [`Covers compliance obligations in node ${i + 1} of the paraphrase test set.`],
  visibility: 'pending_review',
  core: {
    sections: [{ id: 's1', heading: 'Detail', body_md: a.body_md }],
    key_points: a.key_points,
    bridge_to_parent: '',
    bridge_to_objective: '',
    source_refs: [],
  },
  _test_meta: { desc: a.desc, generation: 'DETERMINISTIC' },
}));

const out = {
  generation_note: 'DETERMINISTIC — model subagent refused twice (see B70); these nodes were generated by the harness script.',
  nodes,
};
const outPath = path.join(BASE, 'leak-attempts.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`Written ${outPath} (${nodes.length} nodes, DETERMINISTIC)`);
