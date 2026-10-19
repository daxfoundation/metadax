#!/usr/bin/env node
'use strict';
// run_x05.js -- X05 simulation: steer flags vs blind leads rubric.
// Zero dependencies, Node >= 18.
//
// Modes:
//   node run_x05.js --generate          writes sessions.json, key.json
//   node run_x05.js --stats             reads learner-flags-s*.json + rubric-scores-s*.json,
//                                       writes stats.json and prints a summary
//   node run_x05.js --learner-prompt N  prints the learner prompt for session N (0-indexed)
//   node run_x05.js --eval-prompt N     prints the evaluator prompt for session N

const fs = require('fs');
const path = require('path');
const DIR = __dirname;

// ── TURN TEMPLATES ───────────────────────────────────────────────────────────
// cell-membrane concept (s00-s04)
const CM = [
  /* t0  */ "Welcome! Today we're exploring how cells control what enters and exits. To start: what do you think the main job of a cell membrane is? There's no wrong answer — just tell me what comes to mind.",
  /* t1  */ "Interesting. If molecules could freely cross the membrane in any direction without any control, what might go wrong for the cell? Try to think of a specific example.",
  /* t2  */ "Let's look at the membrane's structure. What do you already know — or what can you guess — about what a cell membrane is physically made of?",
  /* t3  */ "If the membrane is built from lipid molecules, what property of a substance might determine whether it can slip through easily or gets blocked?",
  /* t4  */ "What would happen to a charged particle — like a sodium ion — if it tried to cross through the fatty interior of the membrane without any help? Walk me through your reasoning.",
  /* t5  */ "Now let's consider protein channels. Without looking anything up, what role might you guess membrane proteins play in moving substances across the membrane?",
  /* t6  */ "If there is a high concentration of glucose outside a cell and a low concentration inside, in which direction would glucose naturally tend to move? What principle drives that?",
  /* t7  */ "A cell sometimes needs to pull ions in even when the concentration is already higher inside. What would it need that simple diffusion cannot provide?",
  /* t8  */ "Osmosis involves water moving across a membrane. What determines the direction water will move — what is the water responding to?",
  /* t9  */ "Scenario: a red blood cell is placed in a solution with much more salt than the cell's interior. What do you predict will happen, and why?",
  /* t10 */ "Why does the cell benefit from having selective control over what gets in and out? What's the advantage over just letting things flow freely?",
  /* t11 */ "Let's pull it all together. Describe in your own words the three main ways a substance can get from outside a cell to inside. Include the key conditions for each.",
];

// water-cycle concept (s05-s09)
const WC = [
  /* t0  */ "Let's think about water moving around our planet. It's constantly cycling. What do you already know about where water goes after it falls as rain? Start wherever makes sense to you.",
  /* t1  */ "So rain doesn't just stay where it falls. Where are some different places water might end up after a rainstorm? Try to name at least three.",
  /* t2  */ "One major way water leaves the surface is by turning into vapor. What conditions do you think cause water to evaporate more quickly versus more slowly?",
  /* t3  */ "Plants also release water vapor into the air. What do you think might be happening inside a plant that causes it to release water?",
  /* t4  */ "Water vapor rises into the atmosphere. What do you think has to happen before it can form clouds?",
  /* t5  */ "Under what conditions do you think clouds finally release water as precipitation? What triggers that release?",
  /* t6  */ "If you think about all the places rain can fall — city streets, forests, mountains, deserts — what determines where that water goes next? What factors matter?",
  /* t7  */ "Some rainwater soaks into the ground instead of running off. What do you think happens to it underground? Where might it go?",
  /* t8  */ "Oceans and lakes collect most of the water that flows from land. What do you think drives the water back into the air rather than staying in the ocean forever?",
  /* t9  */ "Think about what would happen if global temperatures dropped sharply. How would that change different stages of the water cycle?",
  /* t10 */ "The water cycle connects land, air, and ocean. What do you think would happen to life on land if evaporation were to stop completely?",
  /* t11 */ "Let's wrap up: trace the full journey of a water molecule from the ocean surface to falling as rain on a mountain and back again. Include every stage you can name.",
];

// ── PLANTED LEADING TURNS ────────────────────────────────────────────────────
// key: [session_index][turn_index] -> replacement text
// 12 planted turns across 10 sessions (1-2 per session)
const PLANTED = {
  0: {
    3: "The phospholipid bilayer has a hydrophobic interior that strongly repels water-soluble substances. Given that property, what category of molecule would you predict can cross the membrane freely without any help?",
    8: "In osmosis, water moves from a region of lower solute concentration toward higher solute concentration — toward where there are more dissolved particles. So if a cell sits in a very salty solution, which way would water flow?",
  },
  1: {
    5: "Membrane proteins form hydrophilic channels that allow charged and polar molecules to pass through a barrier that would otherwise block them completely. Knowing that function, what problem do you think these protein channels exist to solve?",
  },
  2: {
    2: "The cell membrane is a phospholipid bilayer — two layers of molecules, each with a water-loving head and a water-fearing tail, arranged so the tails point inward. With that structure in mind, which part of the membrane would repel water-based substances?",
  },
  3: {
    6: "Substances naturally move from areas of high concentration to areas of low concentration — this tendency is called diffusion. Knowing this, in which direction would glucose flow if there is more of it outside the cell than inside?",
  },
  4: {
    9: "When a cell is placed in a hypertonic solution — one with more solutes than the cell's interior — water leaves the cell by osmosis. Given that, what do you predict will happen to the cell's size and shape?",
  },
  5: {
    4: "When warm, moist air rises and cools, the water vapor condenses around tiny dust particles to form clouds. Given that mechanism, what do you predict happens when a moist air mass is forced upward over a mountain range?",
    10: "If evaporation stopped completely, no water vapor would enter the atmosphere — which means condensation, cloud formation, and precipitation would all halt. Given that chain, which stage of the water cycle do you think is the single most critical driver?",
  },
  6: {
    3: "Plants draw water up from their roots and release it through tiny pores in their leaves — a process called transpiration. Knowing this, where in the water cycle would you place transpiration: is it more similar to evaporation or to precipitation?",
  },
  7: {
    7: "Water that soaks into the ground becomes groundwater, stored in porous rock formations called aquifers that can supply wells and springs. Given that storage system, what human activity do you think poses the greatest threat to groundwater quality?",
  },
  8: {
    2: "Evaporation is driven by heat energy — warm temperatures break the bonds holding liquid water together and allow molecules to escape into the air as vapor. Given that, when during the day would you expect evaporation to be highest?",
  },
  9: {
    5: "Precipitation falls when water droplets in a cloud grow too heavy to stay suspended — triggered by dropping temperatures or too much water accumulating. Given that trigger, what type of precipitation would you expect when air temperatures are well below freezing versus above freezing?",
  },
};

// ── BUILD SESSIONS ────────────────────────────────────────────────────────────
function buildSessions() {
  const sessions = [];
  for (let s = 0; s < 10; s++) {
    const base = s < 5 ? CM : WC;
    const concept = s < 5 ? 'cell-membrane' : 'water-cycle';
    const planted = PLANTED[s] || {};
    const turns = base.map(function(text, t) {
      return {
        turn: t,
        text: planted[t] !== undefined ? planted[t] : text,
        is_planted: planted[t] !== undefined,
      };
    });
    sessions.push({ session: s, concept: concept, turns: turns });
  }
  return sessions;
}

function buildKey() {
  const key = [];
  for (const s of Object.keys(PLANTED)) {
    for (const t of Object.keys(PLANTED[s])) {
      key.push({ session: parseInt(s, 10), turn: parseInt(t, 10) });
    }
  }
  key.sort(function(a, b) { return a.session - b.session || a.turn - b.turn; });
  return key;
}

// ── PROMPT BUILDERS ───────────────────────────────────────────────────────────
function learnerPrompt(session) {
  const lines = [
    'You are a learner who has just completed a tutoring session. Read the guide\'s turns below.',
    'Flag any turn where the guide seems to be steering you toward the answer rather than',
    'letting you figure it out yourself.',
    '',
    'A turn is "leading" if it:',
    '- Reveals or strongly implies the answer before you can respond',
    '- Embeds the answer inside the question ("Since X is true, why does Y happen?")',
    '- Is so narrow that only one response is possible',
    '',
    'Return ONLY a JSON array. Each element: {"turn": N, "reason": "one short sentence"}.',
    'If none feel leading, return [].',
    '',
    'Session turns (concept: ' + session.concept + '):',
  ];
  for (const t of session.turns) {
    lines.push('T' + t.turn + ': ' + t.text);
  }
  return lines.join('\n');
}

function evalPrompt(session) {
  const lines = [
    'Apply the EVALUATE_LEADS rubric to each guide turn below.',
    '',
    'A turn LEADS if it does ANY of the following:',
    '1. States or strongly implies the answer before the learner responds.',
    '2. Embeds the answer in the question ("Since X is true, explain Y").',
    '3. Narrows to one obvious response — barely a question.',
    '4. Provides an example so specific that the answer is obvious from the example alone.',
    '5. Uses leading phrasing ("Doesn\'t it seem that…?").',
    '',
    'A turn does NOT lead if it asks an open question, provides context without revealing',
    'the target insight, or asks for the learner\'s own reasoning or prediction.',
    '',
    'When in doubt, prefer leads: false — only flag leads you can specifically justify.',
    '',
    'Return ONLY a JSON array, one object per turn, in order:',
    '{"turn": N, "leads": true|false, "reason": "≤25 words citing the specific phrase"}',
    '',
    'Session turns (concept: ' + session.concept + '):',
  ];
  for (const t of session.turns) {
    lines.push('T' + t.turn + ': ' + t.text);
  }
  return lines.join('\n');
}

// ── STATS ─────────────────────────────────────────────────────────────────────
function computeStats(sessions, key, learnerFlags, rubricScores) {
  const keySet = new Set(key.map(function(k) { return k.session + ':' + k.turn; }));
  const totalPlanted = key.length;

  let lTruePos = 0, lFalsePos = 0, lFalseNeg = 0;
  let rTruePos = 0, rFalsePos = 0, rFalseNeg = 0;
  let agree = 0, disagree = 0;
  let totalTurns = 0;

  for (let s = 0; s < sessions.length; s++) {
    const lFlags = learnerFlags[s] || [];
    const rScores = rubricScores[s] || [];
    const lFlagSet = new Set(lFlags.map(function(f) { return f.turn; }));
    const rLeadSet = new Set(rScores.filter(function(r) { return r.leads; }).map(function(r) { return r.turn; }));

    for (let t = 0; t < sessions[s].turns.length; t++) {
      totalTurns++;
      const k = s + ':' + t;
      const planted = keySet.has(k);
      const lFlagged = lFlagSet.has(t);
      const rLead = rLeadSet.has(t);

      if (planted && lFlagged) lTruePos++;
      else if (!planted && lFlagged) lFalsePos++;
      else if (planted && !lFlagged) lFalseNeg++;

      if (planted && rLead) rTruePos++;
      else if (!planted && rLead) rFalsePos++;
      else if (planted && !rLead) rFalseNeg++;

      if (lFlagged === rLead) agree++;
      else disagree++;
    }
  }

  function safe(n, d) { return d === 0 ? null : Math.round(1000 * n / d) / 1000; }

  const lPrec = safe(lTruePos, lTruePos + lFalsePos);
  const lRec = safe(lTruePos, totalPlanted);
  const rPrec = safe(rTruePos, rTruePos + rFalsePos);
  const rRec = safe(rTruePos, totalPlanted);
  const agreementRate = safe(agree, totalTurns);

  return {
    planted: totalPlanted,
    total_turns: totalTurns,
    learner: { true_pos: lTruePos, false_pos: lFalsePos, false_neg: lFalseNeg,
               precision: lPrec, recall: lRec },
    rubric: { true_pos: rTruePos, false_pos: rFalsePos, false_neg: rFalseNeg,
              precision: rPrec, recall: rRec },
    agreement: { agree: agree, disagree: disagree, rate: agreementRate },
  };
}

// ── CLI ───────────────────────────────────────────────────────────────────────
function main(argv) {
  const mode = argv[0] || '';

  if (mode === '--generate') {
    const sessions = buildSessions();
    const key = buildKey();
    fs.writeFileSync(path.join(DIR, 'sessions.json'), JSON.stringify(sessions, null, 2));
    fs.writeFileSync(path.join(DIR, 'key.json'), JSON.stringify(key, null, 2));
    process.stdout.write('wrote sessions.json (' + sessions.length + ' sessions, ' +
      sessions.reduce(function(a, s) { return a + s.turns.length; }, 0) + ' turns)\n');
    process.stdout.write('wrote key.json (' + key.length + ' planted turns)\n');
    return 0;
  }

  if (mode === '--learner-prompt') {
    const n = parseInt(argv[1], 10);
    const sessions = buildSessions();
    if (isNaN(n) || n < 0 || n >= sessions.length) {
      process.stderr.write('session index out of range\n'); return 1;
    }
    process.stdout.write(learnerPrompt(sessions[n]) + '\n');
    return 0;
  }

  if (mode === '--eval-prompt') {
    const n = parseInt(argv[1], 10);
    const sessions = buildSessions();
    if (isNaN(n) || n < 0 || n >= sessions.length) {
      process.stderr.write('session index out of range\n'); return 1;
    }
    process.stdout.write(evalPrompt(sessions[n]) + '\n');
    return 0;
  }

  if (mode === '--stats') {
    const sessions = buildSessions();
    const key = buildKey();
    const learnerFlags = [];
    const rubricScores = [];
    for (let s = 0; s < sessions.length; s++) {
      const lf = path.join(DIR, 'learner-flags-s' + String(s).padStart(2, '0') + '.json');
      const rs = path.join(DIR, 'rubric-scores-s' + String(s).padStart(2, '0') + '.json');
      learnerFlags.push(fs.existsSync(lf) ? JSON.parse(fs.readFileSync(lf, 'utf-8')) : []);
      rubricScores.push(fs.existsSync(rs) ? JSON.parse(fs.readFileSync(rs, 'utf-8')) : []);
    }
    const stats = computeStats(sessions, key, learnerFlags, rubricScores);
    fs.writeFileSync(path.join(DIR, 'stats.json'), JSON.stringify(stats, null, 2));
    process.stdout.write(JSON.stringify(stats, null, 2) + '\n');
    return 0;
  }

  process.stderr.write('usage: node run_x05.js --generate | --stats | --learner-prompt N | --eval-prompt N\n');
  return 2;
}

process.exit(main(process.argv.slice(2)));
