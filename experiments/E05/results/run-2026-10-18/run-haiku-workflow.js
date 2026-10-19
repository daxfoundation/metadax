export const meta = {
  name: 'e05-haiku-run',
  description: 'Run E05 robustness pass: 60 queries through haiku subagents',
  phases: [
    { title: 'Run haiku queries', detail: 'One agent per query, reads stack, acts as MP-05 engine', model: 'haiku' },
  ],
};

const STACKS_DIR = 'proposed/fixtures/e05-registry-50/stacks';
const RAW_DIR    = 'run-2026-10-18/raw-haiku';

const Q_IDS = [
  'Q01','Q02','Q03','Q04','Q05','Q06','Q07','Q08','Q09','Q10',
  'Q11','Q12','Q13','Q14','Q15','Q16','Q17','Q18','Q19','Q20',
  'Q21','Q22','Q23','Q24','Q25','Q26','Q27','Q28','Q29','Q30',
  'Q31','Q32','Q33','Q34','Q35','Q36','Q37','Q38','Q39','Q40',
  'Q41','Q42','Q43','Q44','Q45',
  'Q46','Q47','Q48','Q49','Q50','Q51','Q52','Q53','Q54','Q55',
  'Q56','Q57','Q58','Q59','Q60',
];

phase('Run haiku queries');

const results = await pipeline(
  Q_IDS,
  async (qid) => {
    const stackPath = `${STACKS_DIR}/${qid}.txt`;
    const outPath   = `${RAW_DIR}/${qid}.json`;

    const result = await agent(
      `You are going to act as the MetaDAX Follow-Up Engine for one query.

Steps:
1. Read the file at path: ${stackPath}
   That file contains a complete assembled prompt (MP-00 kernel + MP-05 operation + all input blocks).
2. Follow ALL instructions in that file exactly. You ARE the MetaDAX engine described there. The instructions define your role, rules, and required output format.
3. Produce ONLY the JSON object specified in the Output section of those instructions (type=followup, with decision, target_id, confidence, resolved, node, seeds, rendering_md, options, warnings). No prose, no code fence, no text before or after the JSON.
4. Write your JSON output to the file: ${outPath}
   Use the Write tool. The file content should be a JSON object with fields:
   { "id": "${qid}", "ok": true, "parsed": <the full MP-05 JSON object you produced> }
   If you cannot produce valid JSON, write: { "id": "${qid}", "ok": false, "error": "<reason>" }
5. Return a one-line summary: "DONE ${qid}: decision=<decision> target=<target_id or null>"`,
      { label: `mp05-haiku:${qid}`, phase: 'Run haiku queries', model: 'haiku' }
    );

    return { qid, summary: result };
  }
);

const done = results.filter(Boolean).length;
log(`Completed ${done}/${Q_IDS.length} haiku queries`);
return { done, total: Q_IDS.length };
