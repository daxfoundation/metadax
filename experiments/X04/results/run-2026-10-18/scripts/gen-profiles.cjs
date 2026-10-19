#!/usr/bin/env node
'use strict';
// gen-profiles.cjs -- the 18 simulated-learner profiles (12 wave-1 atlas,
// 6 wave-2 negative-space), identical personas to run 1 so the two runs are
// comparable. No id_pool this run: learners resolve stalls to the STABLE
// opaque objective id (from the v0.3 snapshot), not to a freshly minted id.
// All ages 18+ (E-series). Run once; not an analysis step.
const wave1 = [
  { sid: 'w1aa', name: 'Dani',   age: 19, lang: 'en', prior: 'no physics since school', interests: ['skateboarding'],   patience: 'high',   gives_up: false, lost_prone: false },
  { sid: 'w1ab', name: 'Marco',  age: 34, lang: 'es', prior: 'some high-school physics', interests: ['cars','driving'], patience: 'medium', gives_up: false, lost_prone: true  },
  { sid: 'w1ac', name: 'Priya',  age: 22, lang: 'en', prior: 'strong math, weak physics', interests: ['video games'],   patience: 'low',    gives_up: true,  lost_prone: false },
  { sid: 'w1ad', name: 'Chloe',  age: 45, lang: 'fr', prior: 'rusty, long ago',           interests: ['cooking'],       patience: 'medium', gives_up: false, lost_prone: true  },
  { sid: 'w1ae', name: 'Sam',    age: 28, lang: 'en', prior: 'engineering background',    interests: ['cycling'],       patience: 'high',   gives_up: false, lost_prone: false },
  { sid: 'w1af', name: 'Jordan', age: 18, lang: 'en', prior: 'just finished school',      interests: ['basketball'],    patience: 'low',    gives_up: true,  lost_prone: true  },
  { sid: 'w1ag', name: 'Ute',    age: 52, lang: 'de', prior: 'no science background',     interests: ['gardening'],     patience: 'medium', gives_up: false, lost_prone: true  },
  { sid: 'w1ah', name: 'Theo',   age: 31, lang: 'en', prior: 'physics hobbyist',          interests: ['space','rockets'],patience: 'high',  gives_up: false, lost_prone: false },
  { sid: 'w1ai', name: 'Bruno',  age: 24, lang: 'pt', prior: 'weak prior',                interests: ['football'],      patience: 'low',    gives_up: true,  lost_prone: true  },
  { sid: 'w1aj', name: 'Robin',  age: 38, lang: 'en', prior: 'teacher, non-science',      interests: ['music'],         patience: 'medium', gives_up: false, lost_prone: false },
  { sid: 'w1ak', name: 'Kai',    age: 20, lang: 'en', prior: 'average',                   interests: ['cars'],          patience: 'medium', gives_up: false, lost_prone: true  },
  { sid: 'w1al', name: 'Edie',   age: 60, lang: 'en', prior: 'curious retiree',           interests: ['sailing'],       patience: 'high',   gives_up: false, lost_prone: true  },
];
const wave2 = [
  { sid: 'w2aa', name: 'Noor',   age: 27, lang: 'en', prior: 'no physics since school', interests: ['climbing'],    patience: 'medium', gives_up: false, lost_prone: true  },
  { sid: 'w2ab', name: 'Lena',   age: 41, lang: 'es', prior: 'some physics',           interests: ['cars'],        patience: 'high',   gives_up: false, lost_prone: false },
  { sid: 'w2ac', name: 'Omar',   age: 19, lang: 'en', prior: 'just finished school',   interests: ['video games'], patience: 'low',    gives_up: true,  lost_prone: true  },
  { sid: 'w2ad', name: 'Tess',   age: 35, lang: 'en', prior: 'engineering background', interests: ['running'],     patience: 'high',   gives_up: false, lost_prone: false },
  { sid: 'w2ae', name: 'Youssef',age: 23, lang: 'fr', prior: 'weak prior',             interests: ['football'],    patience: 'low',    gives_up: true,  lost_prone: true  },
  { sid: 'w2af', name: 'Greta',  age: 55, lang: 'de', prior: 'no science background',  interests: ['gardening'],   patience: 'medium', gives_up: false, lost_prone: true  },
];
function band(a) { return a >= 56 ? '56+' : a >= 36 ? '36-55' : a >= 26 ? '26-35' : '18-25'; }
function build(arr, wave) {
  return arr.map((p) => ({
    schema: 'metadax.learner-profile/0.3-sim',
    session_id: `ses-20261018-${p.sid}`,
    wave,
    display_name: p.name,
    age_band: band(p.age),
    languages: [p.lang],
    prior_knowledge: p.prior,
    interests: p.interests,
    patience: p.patience,
    gives_up: p.gives_up,
    lost_prone: p.lost_prone,
    consent: { share_my_questions: true, share_abandoned_shape: true },
  }));
}
process.stdout.write(JSON.stringify({ wave1: build(wave1, 1), wave2: build(wave2, 2) }, null, 2) + '\n');
