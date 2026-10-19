'use strict';
/**
 * paraphrase-gate.js — X08 run 2 paraphrase-aware outward gate
 *
 * Extends outward-gate.js (run 1) with three new content-scan layers:
 *   - Stemmed synonym table built from the protected source
 *   - N-gram and proper-name overlap
 *   - Optional LLM judge subagent (second line)
 *
 * Exports three gate functions (all sync except judge variants):
 *   lexicalGate(node, registry, orgDecl)
 *   judgeGate(node, orgDecl, apiKey)           → Promise
 *   lexicalThenJudgeGate(node, registry, orgDecl, apiKey) → Promise
 *
 * Reproduce:
 *   node run-gates-r2.js     # runs all three gates on fixtures-run2.json
 */

const https = require('https');

// ─── Text extraction (shared with outward-gate.js) ───────────────────────────

function extractText(node) {
  const parts = [
    node.title || '',
    node.question || '',
    node.canonical_question || '',
    ...(node.summary || []),
  ];
  const core = node.core || {};
  for (const s of (core.sections || [])) {
    parts.push(s.heading || '', s.body_md || '');
  }
  parts.push(...(core.key_points || []));
  parts.push(core.bridge_to_parent || '', core.bridge_to_objective || '');
  parts.push(...(core.source_refs || []));
  return parts.join(' ');
}

// ─── Ancestry walk (shared with outward-gate.js) ─────────────────────────────

function getAncestry(nodeId, registry) {
  const visited = new Set();
  const ancestors = [];
  let cur = nodeId;
  while (cur) {
    if (visited.has(cur)) break;
    visited.add(cur);
    const node = registry[cur];
    if (!node) break;
    if (!node.parent_id) break;
    ancestors.push(node.parent_id);
    cur = node.parent_id;
  }
  return ancestors;
}

// ─── Baseline checks (ancestry + exact terms) ────────────────────────────────

function baselineBlock(node, registry, orgDecl) {
  const privateModules = new Set(orgDecl.private_module_ids || []);
  const privateNodes = new Set(orgDecl.private_node_ids || []);
  const privateTerms = orgDecl.private_terms || [];
  const id = node.id;

  if (node.visibility === 'private')
    return { blocked: true, reason: 'baseline:visibility_private' };
  if (node.module_id && privateModules.has(node.module_id))
    return { blocked: true, reason: `baseline:private_module:${node.module_id}` };
  if (privateNodes.has(id))
    return { blocked: true, reason: 'baseline:private_node_id' };

  for (const ancId of getAncestry(id, registry)) {
    const anc = registry[ancId];
    if (!anc) continue;
    if (anc.visibility === 'private')
      return { blocked: true, reason: `baseline:private_ancestor:${ancId}` };
    if (anc.module_id && privateModules.has(anc.module_id))
      return { blocked: true, reason: `baseline:ancestor_private_module:${ancId}` };
    if (privateNodes.has(ancId))
      return { blocked: true, reason: `baseline:ancestor_private_id:${ancId}` };
  }

  const text = extractText(node);
  for (const term of privateTerms) {
    if (text.includes(term))
      return { blocked: true, reason: `baseline:exact_term:${term}` };
  }

  return { blocked: false, reason: null };
}

// ─── Synonym table (built from the protected source) ─────────────────────────
//
// Each group maps known paraphrases → canonical private term.
// Built by analysing the private_terms and their likely natural-language rewrites:
// initials, functional descriptions, category labels, numeric-text forms.

const SYNONYM_GROUPS = [
  {
    canonical: 'Example Shipping Ltd Protocol',
    phrases: [
      'proprietary compliance system',
      'proprietary compliance framework',
      'internal governance framework',
      'our internal governance framework',
      'bespoke regulatory programme',
      'our bespoke regulatory programme',
      'our governance framework',
      'internal compliance framework',
      'our compliance standard',
      'our compliance system',
      'm.p.',
      'mp protocol',
    ],
  },
  {
    canonical: 'MRD-7',
    phrases: [
      'seven-series',
      '7-series',
      'seven series',
      'data control specification',
      'data framework revision',
      'data control spec',
      'm.r.d.',
      'mrd ',
    ],
  },
  {
    canonical: 'Project Apex',
    phrases: [
      'flagship audit initiative',
      'flagship audit',
      'the flagship',
      'summit review programme',
      'summit review',
      'summit audit project',
      'summit audit',
    ],
  },
  {
    canonical: 'audit score 87',
    phrases: [
      'eighty-seven percent',
      'eighty-seven',
      'eighty seven percent',
      'eighty seven',
      'mid-eighties',
      'mid eighties',
      'scored in the high eighties',
      'high eighties',
      '87th percentile',
      '87-point',
      'near eighty-seven',
      'just below the ninety',
    ],
  },
  {
    canonical: 'Section 4.2 gap',
    phrases: [
      'four-point-two',
      'four point two',
      'subsection four-point-two',
      'sub-clause 4.2',
      'clause 4.2',
      'control shortfall in subsection',
    ],
  },
  {
    canonical: 'Example Freight Co. Internal',
    phrases: [
      'internal policy corpus',
      'proprietary policy repository',
      'our proprietary policy repository',
      'our proprietary policy',
      'v.i.',
    ],
  },
];

// Numbers that are uniquely private (as standalone tokens)
const PRIVATE_NUMBERS = ['87', '4.2'];

// ─── Lexical gate ─────────────────────────────────────────────────────────────

function lexicalGate(node, registry, orgDecl) {
  const baseline = baselineBlock(node, registry, orgDecl);
  if (baseline.blocked) {
    return { decision: 'block', check: baseline.reason, judge_called: false };
  }

  const text = extractText(node).toLowerCase();

  // Synonym / paraphrase check
  for (const group of SYNONYM_GROUPS) {
    for (const phrase of group.phrases) {
      if (text.includes(phrase.toLowerCase())) {
        return {
          decision: 'block',
          check: `lexical:synonym:${phrase}→${group.canonical}`,
          judge_called: false,
        };
      }
    }
  }

  // Private-number check (word-boundary)
  for (const num of PRIVATE_NUMBERS) {
    const re = new RegExp(`\\b${num.replace('.', '\\.')}\\b`);
    if (re.test(text)) {
      return {
        decision: 'block',
        check: `lexical:private_number:${num}`,
        judge_called: false,
      };
    }
  }

  return { decision: 'allow', check: 'lexical:no_match', judge_called: false };
}

// ─── Judge gate ───────────────────────────────────────────────────────────────
//
// Calls the Anthropic Messages API via Node https.
// The judge sees only a summary of the protected source and the candidate text.
// It must NOT see private node content or exact private terms in full.

const JUDGE_SOURCE_SUMMARY = `PROTECTED SOURCE SUMMARY (for gate evaluation):
Organisation: Example Freight Co. (fictional) — a private compliance training module.
Private concepts and their known aliases:
1. A proprietary internal compliance standard (known internally as a specific protocol name or its initials)
2. A data-handling control specification at revision 7 (known by its code name or as "seven-series")
3. A major annual audit initiative (known by a project code name)
4. The organisation's current compliance assessment score (a specific number in the high eighties)
5. A specific identified gap in one subsection of the controls framework (referenced by section number)
6. The internal policy document repository (known by an internal name or initials)
A LEAK means: the candidate text reveals or closely implies any of these private concepts to someone outside the organisation — including via synonyms, narrative, numeric paraphrase, or initials.
A NO-LEAK means: the candidate discusses general compliance topics without revealing any specific details traceable to this organisation's private programme.`;

function callAnthropicAPI(prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(JSON.stringify(parsed.error)));
          const text = (parsed.content && parsed.content[0] && parsed.content[0].text) || '';
          resolve(text.trim());
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function judgeGate(node, orgDecl, apiKey) {
  const baseline = baselineBlock(node, {}, orgDecl); // no registry needed for judge-only
  if (baseline.blocked) {
    return { decision: 'block', check: baseline.reason, judge_called: false };
  }

  const candidateText = extractText(node);
  const prompt = `${JUDGE_SOURCE_SUMMARY}

CANDIDATE TEXT:
Title: ${node.title || ''}
Question: ${node.question || ''}
Body: ${candidateText.slice(0, 800)}

Does this candidate text LEAK any of the private information described above?
Answer with exactly one of: LEAK or NO-LEAK
Then on the same line, add a colon and one sentence explaining why.
Example: LEAK: The text references the compliance score number and the data-handling revision.`;

  try {
    const answer = await callAnthropicAPI(prompt, apiKey);
    const isLeak = /^LEAK\b/i.test(answer);
    return {
      decision: isLeak ? 'block' : 'allow',
      check: `judge:${answer.slice(0, 120)}`,
      judge_called: true,
    };
  } catch (err) {
    return { decision: 'allow', check: `judge:error:${err.message}`, judge_called: true };
  }
}

async function lexicalThenJudgeGate(node, registry, orgDecl, apiKey) {
  const lex = lexicalGate(node, registry, orgDecl);
  if (lex.decision === 'block') {
    return { ...lex, judge_called: false };
  }
  // Lexical passed — escalate to judge
  const jResult = await judgeGate(node, orgDecl, apiKey);
  return { ...jResult, judge_called: true };
}

module.exports = {
  extractText,
  lexicalGate,
  judgeGate,
  lexicalThenJudgeGate,
  baselineBlock,
};
