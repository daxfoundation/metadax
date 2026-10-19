#!/usr/bin/env node
'use strict';
// build-fixture.js  -- generates the 50-node registry, 60-query list, and
// answer key for E05.  Zero dependencies; Node >= 18.
// Run: node build-fixture.js
// Writes into ../proposed/fixtures/e05-registry-50/

const fs   = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '../proposed/fixtures/e05-registry-50');
fs.mkdirSync(OUT, { recursive: true });

// ── 20 base nodes (the knowledge tree) ──────────────────────────────────────
const BASE = [
  { id:'L01.M01.O01',                          parent_id:null,                              depth:1,  title:'Introduction to energy production in the mitochondria',      canonical_question:'How do mitochondria produce energy for the cell?',                                                           intent:null,      summary:'Cellular respiration converts nutrients into ATP. Most ATP is made in the mitochondrion.',                                                                  concepts:['cellular-respiration','atp-synthesis','mitochondrion-structure'] },
  { id:'n_hh1ash4knccqm98y2n9hfn1h5c',         parent_id:'L01.M01.O01',                     depth:2,  title:'ATP synthase mechanism',                                      canonical_question:'How does ATP synthase use proton flow to make ATP?',                                                           intent:'deepen',   summary:'Protons flow through the F0 rotor, spinning the stalk. The F1 head cycles through conformations that bind ADP and phosphate and release ATP.',             concepts:['atp-synthesis','proton-gradient'] },
  { id:'n_r5p2w8jv3cxtnm6bq9dk0yf4hs',         parent_id:'L01.M01.O01',                     depth:2,  title:'Inner mitochondrial membrane role',                           canonical_question:'Why is the inner mitochondrial membrane important for ATP production?',                                        intent:'clarify',  summary:'The inner membrane is impermeable to protons. This forces protons through ATP synthase, coupling the gradient to ATP production.',                          concepts:['mitochondrion-structure','proton-gradient'] },
  { id:'n_b4m7gx1pz6wqdce8nv3sk0rty2',         parent_id:'L01.M01.O01',                     depth:2,  title:'NADH and FADH2 as electron donors',                           canonical_question:'How do NADH and FADH2 feed electrons into the transport chain?',                                                intent:'deepen',   summary:'NADH donates electrons at Complex I; FADH2 at Complex II. Each donation ultimately pumps protons across the membrane.',                                   concepts:['electron-transport-chain','cellular-respiration'] },
  { id:'n_e9c2fv5aq7ytxmrb0kp3dh8wn1',         parent_id:'L01.M01.O01',                     depth:2,  title:'Glycolysis yield and mitochondrial input',                    canonical_question:'How much ATP does glycolysis produce and how does it feed the mitochondrion?',                                    intent:'connect',  summary:'Glycolysis nets 2 ATP and 2 NADH in the cytoplasm. Pyruvate enters the mitochondrion and is converted to acetyl-CoA.',                                   concepts:['cellular-respiration','atp-synthesis'] },
  { id:'n_x7a3ck9qm5vwrpb2dt4nhe0fy6',         parent_id:'L01.M01.O01',                     depth:2,  title:'Mitochondrial cristae surface area',                          canonical_question:'Why do mitochondria have inner membrane folds called cristae?',                                                  intent:'clarify',  summary:'Cristae dramatically increase inner membrane surface area. More surface means more ATP synthase complexes and higher ATP output.',                          concepts:['mitochondrion-structure','atp-synthesis'] },
  { id:'n_d2z8pm1sw6ybqren3vt5cx7kh0',         parent_id:'L01.M01.O01',                     depth:2,  title:'Oxygen as the final electron acceptor',                       canonical_question:'Why does the electron transport chain require oxygen?',                                                          intent:'clarify',  summary:'Oxygen accepts the final electrons at Complex IV, forming water. Without oxygen the chain stalls and ATP production stops.',                               concepts:['electron-transport-chain','cellular-respiration'] },
  { id:'n_y6g3ht5wm8dkrpxq2vb0cz9ns1',         parent_id:'L01.M01.O01',                     depth:2,  title:'Krebs cycle connection to electron transport',                canonical_question:'How does the Krebs cycle supply electrons to the transport chain?',                                                intent:'connect',  summary:'Each acetyl-CoA through the Krebs cycle yields 3 NADH, 1 FADH2, and 1 GTP. These carriers feed the electron transport chain.',                           concepts:['cellular-respiration','electron-transport-chain'] },
  { id:'n_s8k1rz4cx7mvpwqb5fy9dn0jte6',        parent_id:'L01.M01.O01',                     depth:2,  title:'Total ATP yield from one glucose molecule',                  canonical_question:'How many ATP molecules can one glucose molecule produce through aerobic respiration?',                             intent:'apply',    summary:'Complete oxidation of one glucose can yield approximately 30-32 ATP under cellular conditions via glycolysis, Krebs cycle, and oxidative phosphorylation.', concepts:['cellular-respiration','atp-synthesis'] },
  { id:'n_tn2fp8vd0wzjqxk6bc9mr4esh7y',        parent_id:'L01.M01.O01',                     depth:2,  title:'Mitochondrial double membrane',                               canonical_question:'What is the function of each mitochondrial membrane layer?',                                                      intent:'clarify',  summary:'The outer membrane is permeable via porins. The inner membrane is tight, creating the intermembrane space where protons accumulate.',                      concepts:['mitochondrion-structure','proton-gradient'] },
  { id:'n_f7dv1ks4rb9mcphwzx2qne0yt6b',        parent_id:'L01.M01.O01',                     depth:2,  title:'Chemiosmosis definition',                                     canonical_question:'What is chemiosmosis and how does it generate ATP?',                                                               intent:'clarify',  summary:'Chemiosmosis is the use of an electrochemical gradient across a membrane to drive ATP synthesis. Proton flow through ATP synthase releases energy.',         concepts:['proton-gradient','atp-synthesis'] },
  { id:'n_zt4qn7js2xcwbmkr9fv1hp6yde0',        parent_id:'L01.M01.O01',                     depth:2,  title:'Reactive oxygen species from the transport chain',            canonical_question:'How does the electron transport chain generate reactive oxygen species?',                                          intent:'tangent',  summary:'Electrons occasionally leak from Complexes I and III to oxygen, forming superoxide. Cells use antioxidant enzymes to neutralise these radicals.',           concepts:['electron-transport-chain'] },
  { id:'n_ub6ej0pf4wyrzshx5gm2nk1ctd9',        parent_id:'L01.M01.O01',                     depth:2,  title:'ATP use in active transport',                                 canonical_question:'How do cells use ATP to power active transport across membranes?',                                                  intent:'apply',    summary:'Membrane pumps like the sodium-potassium ATPase hydrolyse ATP to move ions against their concentration gradient.',                                        concepts:['atp-synthesis','cellular-respiration'] },
  { id:'n_og9tq2fd6nhwbsrxe0vz4mp1jcy',        parent_id:'L01.M01.O01',                     depth:2,  title:'Mitochondrial endosymbiotic origin',                          canonical_question:'What is the endosymbiotic theory of mitochondrial origin?',                                                        intent:'connect',  summary:'An ancestral eukaryotic cell engulfed an aerobic bacterium. Over time this became a permanent endosymbiont, retaining its own DNA and double membrane.',   concepts:['mitochondrion-structure'] },
  { id:'n_a5e8bq2jx0yfcvnr4hwd7pmkt3z',        parent_id:'L01.M01.O01',                     depth:2,  title:'Anaerobic respiration versus aerobic',                        canonical_question:'Why does anaerobic respiration produce far less ATP than aerobic respiration?',                                    intent:'contrast',  summary:'Without the electron transport chain, cells rely on substrate-level phosphorylation only, yielding just 2 ATP per glucose instead of ~30.',               concepts:['cellular-respiration','atp-synthesis'] },
  { id:'n_gh3np6wz8krvmxs1qt0bc5jyd4e',        parent_id:'L01.M01.O01',                     depth:2,  title:'Mitochondria as semi-autonomous organelles',                  canonical_question:'Why are mitochondria considered semi-autonomous organelles?',                                                       intent:'clarify',  summary:'Mitochondria have their own circular DNA and ribosomes and divide by binary fission. But most of their proteins are nuclear-encoded and imported.',         concepts:['mitochondrion-structure'] },
  { id:'n_w3j6nt8ld1krscxp5qm0bv7ez4',         parent_id:'n_hh1ash4knccqm98y2n9hfn1h5c',   depth:3,  title:'Proton gradient formation by Complex I',                      canonical_question:'How does Complex I pump protons across the inner membrane?',                                                        intent:'deepen',   summary:'Complex I couples NADH oxidation to proton pumping via a long hydrophobic arm. Four protons are translocated per NADH.',                                   concepts:['electron-transport-chain','proton-gradient'] },
  { id:'n_p9f0gh2re4mvzywq7kb5cx6uts8',        parent_id:'n_hh1ash4knccqm98y2n9hfn1h5c',   depth:3,  title:'F1 catalytic head conformational cycling',                    canonical_question:'What are the three conformational states of the F1 head during ATP synthesis?',                                     intent:'deepen',   summary:'The F1 beta subunits cycle through open, loose, and tight states. ADP and Pi bind in the loose state; ATP is released from the tight state.',              concepts:['atp-synthesis'] },
  { id:'n_v1f4bk7nz0xjgrp9wh8dm5etq2',         parent_id:'n_d2z8pm1sw6ybqren3vt5cx7kh0',   depth:3,  title:'Complex IV and oxygen reduction',                             canonical_question:'How does Complex IV transfer electrons to oxygen and what is the product?',                                          intent:'deepen',   summary:'Complex IV (cytochrome c oxidase) passes four electrons to one oxygen molecule, producing two water molecules and pumping four protons.',                   concepts:['electron-transport-chain','cytochrome-c'] },
  { id:'n_ka7589qwn4z1n2tghxxcv2vzbm',         parent_id:'n_b4m7gx1pz6wqdce8nv3sk0rty2',   depth:3,  title:'Cytochrome c structure and role',                             canonical_question:'What does cytochrome c do in the electron transport chain?',                                                        intent:'deepen',   summary:'Cytochrome c is a small mobile electron carrier. It shuttles electrons from Complex III to Complex IV.',                                                    concepts:['cytochrome-c','electron-transport-chain'] },
];

// ── 10 light near-duplicates (mild paraphrases of base nodes 0-9) ────────────
// Same meaning, slightly different wording; should trigger reuse of the base
const LIGHT_DUPS = [
  { id:'n_nl01rq4fv8mt2dxyps7bknc0ej', dup_of:'L01.M01.O01',                          title:'Mitochondrial ATP generation overview',                         canonical_question:'What process do mitochondria use to generate ATP for the cell?',                                                  intent:null,      summary:'Cellular respiration converts nutrients into ATP. Most ATP is made in the mitochondrion.' },
  { id:'n_nl02jz5bw3xmpve0tkfrd8qynh',  dup_of:'n_hh1ash4knccqm98y2n9hfn1h5c',        title:'ATP synthase proton-driven synthesis',                          canonical_question:'How does the flow of protons through ATP synthase produce ATP molecules?',                                       intent:'deepen',   summary:'Protons flow through the F0 rotor, spinning the stalk. The F1 head cycles through conformations that bind ADP and phosphate and release ATP.' },
  { id:'n_nl03dn7cg4qswry2mkve5xbf0zh', dup_of:'n_r5p2w8jv3cxtnm6bq9dk0yf4hs',       title:'Inner membrane and ATP coupling',                               canonical_question:'What role does the inner membrane of the mitochondrion play in ATP synthesis?',                                   intent:'clarify',  summary:'The inner membrane is impermeable to protons. This forces protons through ATP synthase, coupling the gradient to ATP production.' },
  { id:'n_nl04x8bftm3nvkd5wyjpc6rqhe0', dup_of:'n_b4m7gx1pz6wqdce8nv3sk0rty2',       title:'Electron-carrier input to respiratory chain',                   canonical_question:'How do the electron carriers NADH and FADH2 donate electrons to the respiratory chain?',                       intent:'deepen',   summary:'NADH donates electrons at Complex I; FADH2 at Complex II. Each donation ultimately pumps protons across the membrane.' },
  { id:'n_nl05tp7jgwz2fxbs0qmne8rvck4', dup_of:'n_e9c2fv5aq7ytxmrb0kp3dh8wn1',       title:'Glycolysis ATP and pyruvate entry',                             canonical_question:'What is the ATP yield of glycolysis and how does pyruvate enter the mitochondrion?',                              intent:'connect',  summary:'Glycolysis nets 2 ATP and 2 NADH in the cytoplasm. Pyruvate enters the mitochondrion and is converted to acetyl-CoA.' },
  { id:'n_nl06mf4kyz8rqcpnjsdx3wtbvhg', dup_of:'n_x7a3ck9qm5vwrpb2dt4nhe0fy6',       title:'Cristae function in energy output',                             canonical_question:'What is the function of cristae in the inner mitochondrial membrane?',                                           intent:'clarify',  summary:'Cristae dramatically increase inner membrane surface area. More surface means more ATP synthase complexes and higher ATP output.' },
  { id:'n_nl07vr9nze1bqkpsdtxhcw5fjg2', dup_of:'n_d2z8pm1sw6ybqren3vt5cx7kh0',       title:'Oxygen requirement for electron transport',                     canonical_question:'What is the role of oxygen in the mitochondrial electron transport chain?',                                      intent:'clarify',  summary:'Oxygen accepts the final electrons at Complex IV, forming water. Without oxygen the chain stalls and ATP production stops.' },
  { id:'n_nl08ec2yfxm4kspn9wdrtbhq7g0', dup_of:'n_y6g3ht5wm8dkrpxq2vb0cz9ns1',       title:'Krebs cycle electron carrier production',                       canonical_question:'What electron carriers does the Krebs cycle produce for the electron transport chain?',                          intent:'connect',  summary:'Each acetyl-CoA through the Krebs cycle yields 3 NADH, 1 FADH2, and 1 GTP. These carriers feed the electron transport chain.' },
  { id:'n_nl09zs6vpcxn0bdmkfrtyq4wjh3', dup_of:'n_s8k1rz4cx7mvpwqb5fy9dn0jte6',      title:'ATP per glucose in aerobic respiration',                        canonical_question:'What is the total ATP yield when one glucose is fully oxidised in aerobic respiration?',                         intent:'apply',    summary:'Complete oxidation of one glucose can yield approximately 30-32 ATP under cellular conditions via glycolysis, Krebs cycle, and oxidative phosphorylation.' },
  { id:'n_nl10hk3drp0wzjembnfsxyvtcq5', dup_of:'n_tn2fp8vd0wzjqxk6bc9mr4esh7y',      title:'Outer versus inner mitochondrial membrane',                     canonical_question:'How do the outer and inner mitochondrial membranes differ in structure and function?',                          intent:'clarify',  summary:'The outer membrane is permeable via porins. The inner membrane is tight, creating the intermembrane space where protons accumulate.' },
];

// ── 10 heavy near-duplicates (heavy paraphrases of base nodes 10-19) ─────────
// Extensively reworded; same meaning should still trigger reuse
const HEAVY_DUPS = [
  { id:'n_nh11gw4zfh7cntbsyxjmrpvd9k', dup_of:'n_f7dv1ks4rb9mcphwzx2qne0yt6b',      title:'Electrochemical gradient ATP coupling',                         canonical_question:'In cellular energy production, how is a concentration difference of hydrogen ions across a membrane used to synthesise adenosine triphosphate?',   intent:'clarify',  summary:'Chemiosmosis is the use of an electrochemical gradient across a membrane to drive ATP synthesis. Proton flow through ATP synthase releases energy.' },
  { id:'n_nh12pj5nxe2skbdtfrcmqhzwy0', dup_of:'n_zt4qn7js2xcwbmkr9fv1hp6yde0',      title:'Radical oxygen escape during respiration',                      canonical_question:'During oxidative phosphorylation, under what circumstances do partially reduced oxygen molecules escape as harmful radicals?',                      intent:'tangent',  summary:'Electrons occasionally leak from Complexes I and III to oxygen, forming superoxide. Cells use antioxidant enzymes to neutralise these radicals.' },
  { id:'n_nh13by6wkq3xhefnjdmczvs8tp', dup_of:'n_ub6ej0pf4wyrzshx5gm2nk1ctd9',      title:'ATP hydrolysis driving ion pumps',                              canonical_question:'In membrane biology, how do ion pumps couple adenosine triphosphate hydrolysis to moving substances against their concentration gradients?',        intent:'apply',    summary:'Membrane pumps like the sodium-potassium ATPase hydrolyse ATP to move ions against their concentration gradient.' },
  { id:'n_nh14cf0hntbsxmwyjpzdvrgkq8', dup_of:'n_og9tq2fd6nhwbsrxe0vz4mp1jcy',      title:'Bacterial ancestor of the mitochondrion',                       canonical_question:'How does the hypothesis that an ancient cell absorbed a free-living aerobic bacterium explain the two-membrane structure of present-day mitochondria?', intent:'connect',  summary:'An ancestral eukaryotic cell engulfed an aerobic bacterium. Over time this became a permanent endosymbiont, retaining its own DNA and double membrane.' },
  { id:'n_nh15mw8bfpzkdvcsnhg3qrxjyt', dup_of:'n_a5e8bq2jx0yfcvnr4hwd7pmkt3z',      title:'Oxygen absence and ATP shortfall',                              canonical_question:'When cells lack access to oxygen, why is the ATP output of glucose breakdown reduced from roughly 30 to just 2 molecules per glucose?',               intent:'contrast',  summary:'Without the electron transport chain, cells rely on substrate-level phosphorylation only, yielding just 2 ATP per glucose instead of ~30.' },
  { id:'n_nh16xt4rg5kdpzm9bfhynvsqwe', dup_of:'n_gh3np6wz8krvmxs1qt0bc5jyd4e',      title:'Mitochondria own DNA yet need nucleus',                         canonical_question:'Given that mitochondria carry circular DNA and divide independently but depend on nuclear genes for most of their proteins, what does this hybrid dependence tell us?', intent:'clarify',  summary:'Mitochondria have their own circular DNA and ribosomes and divide by binary fission. But most of their proteins are nuclear-encoded and imported.' },
  { id:'n_nh17jd7qwvbkcnzsxphrtem4fg', dup_of:'n_w3j6nt8ld1krscxp5qm0bv7ez4',       title:'NADH dehydrogenase proton translocation',                       canonical_question:'Describe the structural mechanism by which NADH dehydrogenase couples electron transfer from NADH to the translocation of hydrogen ions across the inner membrane.', intent:'deepen',   summary:'Complex I couples NADH oxidation to proton pumping via a long hydrophobic arm. Four protons are translocated per NADH.' },
  { id:'n_nh18yn3kqrx7hdfmtzvsecbpwg', dup_of:'n_p9f0gh2re4mvzywq7kb5cx6uts8',      title:'Beta subunit shape changes in F1 motor',                        canonical_question:'In the rotary mechanism of ATP production, what sequential shape changes of the beta catalytic subunits drive binding of ADP and phosphate and release of ATP?', intent:'deepen',   summary:'The F1 beta subunits cycle through open, loose, and tight states. ADP and Pi bind in the loose state; ATP is released from the tight state.' },
  { id:'n_nh19sk9mzb4xrcpfwdjgvhyqnt', dup_of:'n_v1f4bk7nz0xjgrp9wh8dm5etq2',      title:'Cytochrome c oxidase reaction products',                        canonical_question:'At the terminus of the respiratory chain, how does cytochrome c oxidase reduce molecular oxygen, how many protons does it translocate, and what metabolite is formed?', intent:'deepen',   summary:'Complex IV (cytochrome c oxidase) passes four electrons to one oxygen molecule, producing two water molecules and pumping four protons.' },
  { id:'n_nh20wf2tpvy7rznqkbsjhxmdc9', dup_of:'n_ka7589qwn4z1n2tghxxcv2vzbm',       title:'Mobile haem protein in electron relay',                         canonical_question:'In oxidative phosphorylation, how does the small haem-containing protein that shuttles between two protein complexes participate in electron transfer?',       intent:'deepen',   summary:'Cytochrome c is a small mobile electron carrier. It shuttles electrons from Complex III to Complex IV.' },
];

// ── 10 different-intent traps (same vocabulary, different question) ──────────
// These should NOT match any base node -- new or extend decision expected
const TRAPS = [
  { id:'n_tr01fp8yvx3mzkqs4rcntdb9hw', title:'ATP synthase assembly regulation',       canonical_question:'How is ATP synthase assembly regulated during mitochondrial biogenesis?',                                                              intent:'deepen',   summary:'Mitochondrial biogenesis signals coordinate assembly of F0 and F1 subunits. ATPAF chaperones hold F1 subunits until F0 is ready.',             trap_looks_like:['n_hh1ash4knccqm98y2n9hfn1h5c','n_p9f0gh2re4mvzywq7kb5cx6uts8'] },
  { id:'n_tr02kd5gv4ywrxfmhzpbn7qstj', title:'Cristae remodelling during apoptosis',   canonical_question:'How do mitochondrial cristae remodel during apoptosis and what proteins control this?',                                                intent:'connect',  summary:'OPA1 oligomers seal crista junctions; during apoptosis BAX/BAK cause junction opening and cytochrome c release.',                              trap_looks_like:['n_x7a3ck9qm5vwrpb2dt4nhe0fy6'] },
  { id:'n_tr03hz2qfxs9rmtjpndckvb5wy', title:'Hypoxia and ETC gene expression',        canonical_question:'How does low oxygen availability affect transcription of electron transport chain subunit genes?',                                         intent:'deepen',   summary:'HIF-1 accumulates under hypoxia and activates genes for glycolysis while suppressing some ETC subunits to reduce ROS production.',               trap_looks_like:['n_d2z8pm1sw6ybqren3vt5cx7kh0','n_zt4qn7js2xcwbmkr9fv1hp6yde0'] },
  { id:'n_tr04bv7zydcmkhtfxp2nrgqsw5', title:'Phosphofructokinase allosteric control',  canonical_question:'How does phosphofructokinase regulate glycolysis and how does accumulated ATP inhibit the enzyme?',                                       intent:'deepen',   summary:'PFK-1 is allosterically inhibited by ATP and citrate and activated by AMP. This makes glycolytic flux respond to the cell energy charge.',       trap_looks_like:['n_e9c2fv5aq7ytxmrb0kp3dh8wn1','n_s8k1rz4cx7mvpwqb5fy9dn0jte6'] },
  { id:'n_tr05mn4xbqzpfytskdh8rcwvjg', title:'Krebs cycle anaplerosis',                 canonical_question:'How does the Krebs cycle supply biosynthetic precursors for amino acid and lipid synthesis?',                                            intent:'connect',  summary:'Alpha-ketoglutarate and oxaloacetate are drained for amino acid synthesis. Anaplerotic reactions replenish them so the cycle continues.',        trap_looks_like:['n_y6g3ht5wm8dkrpxq2vb0cz9ns1'] },
  { id:'n_tr06qs3jrcxhkdvmybt6fpzwn0', title:'Mitochondrial DNA replication',           canonical_question:'How is mitochondrial DNA replicated and which polymerase carries out this process?',                                                     intent:'deepen',   summary:'Mitochondrial DNA uses a strand-displacement mechanism. DNA polymerase gamma (POLG) replicates the heavy strand; the light strand template remains single-stranded.', trap_looks_like:['n_gh3np6wz8krvmxs1qt0bc5jyd4e'] },
  { id:'n_tr07dc8nqmrkvfbzxy5hepwgts', title:'2,4-DNP and uncoupling mechanism',        canonical_question:'How does 2,4-dinitrophenol collapse the proton gradient and why does it increase oxygen consumption?',                                    intent:'apply',    summary:'DNP is a proton carrier that shuttles H+ across the inner membrane without ATP synthase, dissipating the gradient as heat.',                     trap_looks_like:['n_f7dv1ks4rb9mcphwzx2qne0yt6b','n_r5p2w8jv3cxtnm6bq9dk0yf4hs'] },
  { id:'n_tr08gf5ywx8kpzhvstmrcq3ndb', title:'Malate-aspartate shuttle',                canonical_question:'How does the malate-aspartate shuttle transfer cytoplasmic NADH electrons into the mitochondrial matrix?',                                intent:'deepen',   summary:'Malate carries reducing equivalents across the inner membrane; aspartate carries the spent carbon skeleton back. Net effect is NADH oxidation in the matrix.',  trap_looks_like:['n_b4m7gx1pz6wqdce8nv3sk0rty2'] },
  { id:'n_tr09cz9rpjbd7thwvqxfmgkne0', title:'Adenine nucleotide translocase',          canonical_question:'How does the mitochondrial ADP/ATP translocase exchange matrix ATP for cytosolic ADP?',                                                  intent:'deepen',   summary:'ANT (SLC25A4) catalyses electrogenic exchange of one ATP4- for one ADP3- per cycle, driven by the membrane potential.',                         trap_looks_like:['n_ub6ej0pf4wyrzshx5gm2nk1ctd9'] },
  { id:'n_tr10wy0bsxn4ztgrjfckmvph3e', title:'P/O ratio determination method',          canonical_question:'How do researchers measure the P/O ratio of isolated mitochondria experimentally?',                                                       intent:'apply',    summary:'Oxygen electrodes measure O2 consumption; luminometry or HPLC measure ATP produced. The ratio of ATP synthesised to O consumed gives the P/O ratio.', trap_looks_like:['n_s8k1rz4cx7mvpwqb5fy9dn0jte6'] },
];

// ── Assemble full registry ───────────────────────────────────────────────────
function makeEntry(n, extras) {
  // Use explicit null check so depth-1 root node keeps parent_id: null
  const pid = (n.parent_id !== undefined) ? n.parent_id
            : (extras && extras.parent_id != null) ? extras.parent_id
            : 'L01.M01.O01';
  return {
    id: n.id,
    parent_id: pid,
    title: n.title,
    canonical_question: n.canonical_question,
    intent: n.intent,
    summary: n.summary,
    concepts: n.concepts || extras.concepts || ['cellular-respiration'],
    depth: n.depth || extras.depth || 2,
    visibility: 'shared',
    created_by: 'author-fixture',
    reuse_count: 0,
    superseded_by: null,
  };
}

const registry = {
  schema: 'metadax.registry/0.3',
  course_id: 'cell-biology-obsidian',
  module_id: 'L01.M01',
  updated_at: '2026-10-18T00:00:00Z',
  nodes: [
    ...BASE.map(n => makeEntry(n, {})),
    ...LIGHT_DUPS.map(n => makeEntry(n, { parent_id: n.dup_of || 'L01.M01.O01', depth: 2, concepts: ['atp-synthesis'] })),
    ...HEAVY_DUPS.map(n => makeEntry(n, { parent_id: n.dup_of || 'L01.M01.O01', depth: 2, concepts: ['atp-synthesis'] })),
    ...TRAPS.map(n => makeEntry(n, { parent_id: 'L01.M01.O01', depth: 2, concepts: ['cellular-respiration'] })),
  ],
};

console.log('Total nodes:', registry.nodes.length);

// ── Near-duplicate metadata (for answer key) ─────────────────────────────────
const dupMeta = [
  ...LIGHT_DUPS.map(d => ({ dup_id: d.id, target_id: d.dup_of, kind: 'light' })),
  ...HEAVY_DUPS.map(d => ({ dup_id: d.id, target_id: d.dup_of, kind: 'heavy' })),
];

// ── 60 queries ───────────────────────────────────────────────────────────────
// Q01-Q20: should reuse the near-dup node (or the base node it duplicates)
// Q21-Q30: trap queries that must NOT reuse
// Q31-Q45: ordinary reusable (match a base node)
// Q46-Q60: ordinary new (no match)

const QUERIES = [
  // Q01-Q10: match light near-dups (expected: reuse ND node)
  { id:'Q01', query:'How do cells in the mitochondria make ATP from food molecules?',                                                          expected_decision:'reuse', expected_target:'n_nl01rq4fv8mt2dxyps7bknc0ej', category:'near-dup-light' },
  { id:'Q02', query:'How does ATP synthase harness the movement of protons to build ATP?',                                                      expected_decision:'reuse', expected_target:'n_nl02jz5bw3xmpve0tkfrd8qynh', category:'near-dup-light' },
  { id:'Q03', query:'Why is the tightness of the inner mitochondrial membrane crucial for making ATP?',                                         expected_decision:'reuse', expected_target:'n_nl03dn7cg4qswry2mkve5xbf0zh', category:'near-dup-light' },
  { id:'Q04', query:'In what way do NADH and FADH2 supply electrons to the mitochondrial respiratory chain?',                                   expected_decision:'reuse', expected_target:'n_nl04x8bftm3nvkd5wyjpc6rqhe0', category:'near-dup-light' },
  { id:'Q05', query:'How many ATP does glycolysis net and how does its product pyruvate reach the mitochondrion?',                              expected_decision:'reuse', expected_target:'n_nl05tp7jgwz2fxbs0qmne8rvck4', category:'near-dup-light' },
  { id:'Q06', query:'What purpose do the inner membrane folds in mitochondria serve for energy production?',                                    expected_decision:'reuse', expected_target:'n_nl06mf4kyz8rqcpnjsdx3wtbvhg', category:'near-dup-light' },
  { id:'Q07', query:'Why is molecular oxygen necessary for the electron transport chain to keep running?',                                      expected_decision:'reuse', expected_target:'n_nl07vr9nze1bqkpsdtxhcw5fjg2', category:'near-dup-light' },
  { id:'Q08', query:'What high-energy electron carriers does the TCA cycle hand off to the transport chain?',                                   expected_decision:'reuse', expected_target:'n_nl08ec2yfxm4kspn9wdrtbhq7g0', category:'near-dup-light' },
  { id:'Q09', query:'Roughly how many ATP molecules does complete aerobic breakdown of one glucose molecule yield?',                             expected_decision:'reuse', expected_target:'n_nl09zs6vpcxn0bdmkfrtyq4wjh3', category:'near-dup-light' },
  { id:'Q10', query:'How do the two membranes around a mitochondrion differ in their permeability and purpose?',                                expected_decision:'reuse', expected_target:'n_nl10hk3drp0wzjembnfsxyvtcq5', category:'near-dup-light' },
  // Q11-Q20: match heavy near-dups
  { id:'Q11', query:'Explain how a pH gradient across the inner mitochondrial membrane is converted into chemical energy in the form of ATP.',   expected_decision:'reuse', expected_target:'n_nh11gw4zfh7cntbsyxjmrpvd9k', category:'near-dup-heavy' },
  { id:'Q12', query:'What happens when electrons escape from respiratory complexes and why is this dangerous to the cell?',                      expected_decision:'reuse', expected_target:'n_nh12pj5nxe2skbdtfrcmqhzwy0', category:'near-dup-heavy' },
  { id:'Q13', query:'How do cells spend the energy in ATP to shuttle ions across a membrane against a gradient?',                               expected_decision:'reuse', expected_target:'n_nh13by6wkq3xhefnjdmczvs8tp', category:'near-dup-heavy' },
  { id:'Q14', query:'Why do mitochondria have two membranes, and what does this tell us about their evolutionary past?',                        expected_decision:'reuse', expected_target:'n_nh14cf0hntbsxmwyjpzdvrgkq8', category:'near-dup-heavy' },
  { id:'Q15', query:'If a cell runs out of oxygen, why does its total ATP production drop from around 30 down to 2 per glucose?',               expected_decision:'reuse', expected_target:'n_nh15mw8bfpzkdvcsnhg3qrxjyt', category:'near-dup-heavy' },
  { id:'Q16', query:'Mitochondria replicate their own DNA and divide, yet still rely on nuclear gene products -- what explains this paradox?',  expected_decision:'reuse', expected_target:'n_nh16xt4rg5kdpzm9bfhynvsqwe', category:'near-dup-heavy' },
  { id:'Q17', query:'Walk me through how the large hydrophobic arm of Complex I moves protons every time it accepts electrons from NADH.',       expected_decision:'reuse', expected_target:'n_nh17jd7qwvbkcnzsxphrtem4fg', category:'near-dup-heavy' },
  { id:'Q18', query:'What shape transitions do the F1 beta subunits go through to grab ADP and Pi and then push out the finished ATP molecule?',expected_decision:'reuse', expected_target:'n_nh18yn3kqrx7hdfmtzvsecbpwg', category:'near-dup-heavy' },
  { id:'Q19', query:'How does the last complex in the respiratory chain use cytochrome c electrons to turn oxygen into water, and how many protons does it move?', expected_decision:'reuse', expected_target:'n_nh19sk9mzb4xrcpfwdjgvhyqnt', category:'near-dup-heavy' },
  { id:'Q20', query:'What exactly does the small iron-containing protein that ferries electrons between Complex III and IV do, and why can it leave the membrane?', expected_decision:'reuse', expected_target:'n_nh20wf2tpvy7rznqkbsjhxmdc9', category:'near-dup-heavy' },
  // Q21-Q30: traps -- must NOT reuse
  { id:'Q21', query:'When mitochondria are first assembled in a cell, how are the ATP synthase subunits put together correctly?',               expected_decision:'new',   expected_target:null, category:'trap', trap_node:'n_tr01fp8yvx3mzkqs4rcntdb9hw' },
  { id:'Q22', query:'During cell death, do the cristae folds change shape and what proteins are involved in that change?',                      expected_decision:'new',   expected_target:null, category:'trap', trap_node:'n_tr02kd5gv4ywrxfmhzpbn7qstj' },
  { id:'Q23', query:'When oxygen is scarce, how does the cell change which ETC genes it turns on?',                                             expected_decision:'new',   expected_target:null, category:'trap', trap_node:'n_tr03hz2qfxs9rmtjpndckvb5wy' },
  { id:'Q24', query:'How does the enzyme PFK slow glycolysis down when there is already plenty of ATP available?',                              expected_decision:'new',   expected_target:null, category:'trap', trap_node:'n_tr04bv7zydcmkhtfxp2nrgqsw5' },
  { id:'Q25', query:'How does the Krebs cycle provide the building blocks for making amino acids rather than just making energy?',               expected_decision:'new',   expected_target:null, category:'trap', trap_node:'n_tr05mn4xbqzpfytskdh8rcwvjg' },
  { id:'Q26', query:'What enzyme copies the mitochondrial DNA when the organelle divides?',                                                     expected_decision:'new',   expected_target:null, category:'trap', trap_node:'n_tr06qs3jrcxhkdvmybt6fpzwn0' },
  { id:'Q27', query:'How does the poison DNP work and why does it cause the cell to consume more oxygen while making less ATP?',                expected_decision:'new',   expected_target:null, category:'trap', trap_node:'n_tr07dc8nqmrkvfbzxy5hepwgts' },
  { id:'Q28', query:'Since NADH made in glycolysis cannot cross the inner mitochondrial membrane itself, how do its electrons get inside?',     expected_decision:'new',   expected_target:null, category:'trap', trap_node:'n_tr08gf5ywx8kpzhvstmrcq3ndb' },
  { id:'Q29', query:'How does the transporter that swaps ATP out of the mitochondria for ADP from the cytoplasm work?',                         expected_decision:'new',   expected_target:null, category:'trap', trap_node:'n_tr09cz9rpjbd7thwvqxfmgkne0' },
  { id:'Q30', query:'How would a scientist measure how many ATP molecules are synthesised for every oxygen atom consumed in isolated mitochondria?', expected_decision:'new', expected_target:null, category:'trap', trap_node:'n_tr10wy0bsxn4ztgrjfckmvph3e' },
  // Q31-Q45: ordinary reusable (exact or near-exact paraphrase of base nodes)
  { id:'Q31', query:'How does the mitochondrion produce ATP for the cell?',                                                                     expected_decision:'reuse', expected_target:'L01.M01.O01',                          category:'ordinary-reuse' },
  { id:'Q32', query:'How does proton flow through ATP synthase produce ATP?',                                                                   expected_decision:'reuse', expected_target:'n_hh1ash4knccqm98y2n9hfn1h5c',        category:'ordinary-reuse' },
  { id:'Q33', query:'Why is the inner membrane important for making ATP in the mitochondrion?',                                                  expected_decision:'reuse', expected_target:'n_r5p2w8jv3cxtnm6bq9dk0yf4hs',        category:'ordinary-reuse' },
  { id:'Q34', query:'How do NADH and FADH2 feed into the electron transport chain?',                                                            expected_decision:'reuse', expected_target:'n_b4m7gx1pz6wqdce8nv3sk0rty2',        category:'ordinary-reuse' },
  { id:'Q35', query:'How much ATP does glycolysis make and how does pyruvate get into the mitochondrion?',                                       expected_decision:'reuse', expected_target:'n_e9c2fv5aq7ytxmrb0kp3dh8wn1',        category:'ordinary-reuse' },
  { id:'Q36', query:'Why do mitochondria have cristae?',                                                                                        expected_decision:'reuse', expected_target:'n_x7a3ck9qm5vwrpb2dt4nhe0fy6',        category:'ordinary-reuse' },
  { id:'Q37', query:'Why does the electron transport chain need oxygen?',                                                                       expected_decision:'reuse', expected_target:'n_d2z8pm1sw6ybqren3vt5cx7kh0',        category:'ordinary-reuse' },
  { id:'Q38', query:'How does the Krebs cycle supply the electron transport chain?',                                                             expected_decision:'reuse', expected_target:'n_y6g3ht5wm8dkrpxq2vb0cz9ns1',        category:'ordinary-reuse' },
  { id:'Q39', query:'How many ATP molecules does aerobic respiration yield from one glucose?',                                                  expected_decision:'reuse', expected_target:'n_s8k1rz4cx7mvpwqb5fy9dn0jte6',        category:'ordinary-reuse' },
  { id:'Q40', query:'What is chemiosmosis and how does it make ATP?',                                                                           expected_decision:'reuse', expected_target:'n_f7dv1ks4rb9mcphwzx2qne0yt6b',        category:'ordinary-reuse' },
  { id:'Q41', query:'How does the electron transport chain produce harmful oxygen species?',                                                     expected_decision:'reuse', expected_target:'n_zt4qn7js2xcwbmkr9fv1hp6yde0',        category:'ordinary-reuse' },
  { id:'Q42', query:'How do cells use ATP for active transport?',                                                                               expected_decision:'reuse', expected_target:'n_ub6ej0pf4wyrzshx5gm2nk1ctd9',        category:'ordinary-reuse' },
  { id:'Q43', query:'What does cytochrome c do in the respiratory chain?',                                                                      expected_decision:'reuse', expected_target:'n_ka7589qwn4z1n2tghxxcv2vzbm',         category:'ordinary-reuse' },
  { id:'Q44', query:'How does Complex I pump protons across the inner membrane?',                                                               expected_decision:'reuse', expected_target:'n_w3j6nt8ld1krscxp5qm0bv7ez4',         category:'ordinary-reuse' },
  { id:'Q45', query:'What are the three conformational states of the F1 head in ATP synthase?',                                                  expected_decision:'reuse', expected_target:'n_p9f0gh2re4mvzywq7kb5cx6uts8',        category:'ordinary-reuse' },
  // Q46-Q60: ordinary new (no match in registry)
  { id:'Q46', query:'How do mitochondria fuse and divide, and what proteins control this?',                                                     expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q47', query:'What is mitophagy and how do damaged mitochondria get targeted for degradation?',                                          expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q48', query:'How does calcium signalling inside mitochondria affect ATP production?',                                                   expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q49', query:'Why do heart muscle cells have many more mitochondria than skin cells?',                                                   expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q50', query:'What is the role of VDAC channels in the outer mitochondrial membrane?',                                                   expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q51', query:'How do mitochondria respond to cold temperatures to generate body heat in brown fat?',                                     expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q52', query:'What is mitochondrial permeability transition and when does it occur?',                                                    expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q53', query:'How does coenzyme Q (ubiquinone) move between the respiratory complexes?',                                                 expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q54', query:'What triggers the release of cytochrome c from the mitochondrion during apoptosis?',                                       expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q55', query:'How does the cell regulate mitochondrial biogenesis in response to exercise?',                                             expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q56', query:'Can cancer cells survive without mitochondrial oxidative phosphorylation?',                                                expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q57', query:'What is the role of cardiolipin in stabilising the respiratory supercomplexes?',                                           expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q58', query:'How do mitochondria import proteins made in the cytoplasm?',                                                               expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q59', query:'What mutations in mitochondrial DNA cause maternally inherited diseases?',                                                  expected_decision:'new',   expected_target:null, category:'ordinary-new' },
  { id:'Q60', query:'How does the cell balance NADH production between the cytoplasm and the mitochondrial matrix?',                            expected_decision:'new',   expected_target:null, category:'ordinary-new' },
];

console.log('Total queries:', QUERIES.length);

// ── Build a shared PATH and ANCHOR context for the queries ───────────────────
// All queries are follow-ups from the root objective node
const SHARED_PATH = [
  {
    id: 'L01.M01.O01',
    title: 'Introduction to energy production in the mitochondria',
    canonical_question: 'How do mitochondria produce energy for the cell?',
    summary: 'Cellular respiration converts nutrients into ATP. Most ATP is made in the mitochondrion.',
  },
];

const SHARED_ANCHOR = 'none'; // learner asks about the whole node

// ── Build the MP-00 + MP-05 kernel text ─────────────────────────────────────
const KERNEL_PATH = path.resolve('/tmp/metadax/prompts/MP-00-kernel.md');
const PROMPT_PATH = path.resolve('/tmp/metadax/prompts/MP-05-followup-engine.md');

function extractCodeBlock(md) {
  // Extract first ```text ... ``` block, or just the whole content
  const m = md.match(/```(?:text)?\n([\s\S]*?)```/);
  return m ? m[1] : md;
}

const kernelRaw = fs.readFileSync(KERNEL_PATH, 'utf8');
const promptRaw = fs.readFileSync(PROMPT_PATH, 'utf8');
const kernelText = extractCodeBlock(kernelRaw);
const promptText = extractCodeBlock(promptRaw);

// ── Build a stack.txt for a single query ────────────────────────────────────
function buildStack(query) {
  const registryJson = JSON.stringify(registry, null, 2);
  const pathJson = JSON.stringify(SHARED_PATH, null, 2);

  return [
    kernelText,
    '',
    promptText,
    '',
    '<<START CONFIG>>',
    JSON.stringify({ mode: 'ask', output_mode: 'json', math_mode: 'plain' }),
    '<<END CONFIG>>',
    '<<START COURSE>>',
    JSON.stringify({
      id: 'cell-biology-obsidian',
      title: 'Cell Biology Obsidian',
      language: 'en',
      audience: { intended_bands: ['16-18', 'adult'] },
      steer: {
        focus: 'how cells produce and use energy',
        include: [],
        exclude: [],
        depth: 'introductory',
        source_policy: 'general',
        scope_policy: 'tangents_allowed',
      },
      policy: { learner_nodes: 'pending_review', minor_nodes: 'private' },
    }),
    '<<END COURSE>>',
    '<<START OBJECTIVE>>',
    JSON.stringify({
      id: 'L01.M01.O01',
      title: 'Introduction to energy production in the mitochondria',
      statement: 'Understand how mitochondria produce ATP through cellular respiration.',
      concepts: ['cellular-respiration', 'atp-synthesis', 'mitochondrion-structure', 'proton-gradient', 'electron-transport-chain', 'cytochrome-c'],
      bloom_target: 'Understand',
    }),
    '<<END OBJECTIVE>>',
    '<<START CONCEPTS>>',
    JSON.stringify([
      { id: 'cellular-respiration',      name: 'Cellular respiration',      description: 'The process by which cells break down glucose to produce ATP.', bloom_target: 'Understand' },
      { id: 'atp-synthesis',             name: 'ATP synthesis',              description: 'The production of ATP by ATP synthase driven by the proton gradient.', bloom_target: 'Understand' },
      { id: 'mitochondrion-structure',   name: 'Mitochondrion structure',    description: 'The double-membrane organelle where oxidative phosphorylation occurs.', bloom_target: 'Remember' },
      { id: 'proton-gradient',           name: 'Proton gradient',            description: 'The electrochemical gradient of protons across the inner mitochondrial membrane.', bloom_target: 'Understand' },
      { id: 'electron-transport-chain',  name: 'Electron transport chain',   description: 'The series of protein complexes that transfer electrons and pump protons.', bloom_target: 'Understand' },
      { id: 'cytochrome-c',              name: 'Cytochrome c',               description: 'A small mobile electron carrier between Complex III and Complex IV.', bloom_target: 'Remember' },
    ]),
    '<<END CONCEPTS>>',
    '<<START LEARNER>>',
    'none',
    '<<END LEARNER>>',
    '<<START PATH>>',
    pathJson,
    '<<END PATH>>',
    '<<START ANCHOR>>',
    'none',
    '<<END ANCHOR>>',
    '<<START REGISTRY>>',
    registryJson,
    '<<END REGISTRY>>',
    '<<START INPUT>>',
    query,
    '<<END INPUT>>',
  ].join('\n');
}

// ── Write outputs ────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(OUT, 'registry.json'), JSON.stringify(registry, null, 2));
console.log('registry.json written:', registry.nodes.length, 'nodes');

// dup-map.json: metadata about which nodes are near-dups/traps (used by scorer, not the model)
const dupMap = {
  light_dups: LIGHT_DUPS.map(d => ({ dup_id: d.id, target_id: d.dup_of })),
  heavy_dups: HEAVY_DUPS.map(d => ({ dup_id: d.id, target_id: d.dup_of })),
  trap_ids: TRAPS.map(t => t.id),
};
fs.writeFileSync(path.join(OUT, 'dup-map.json'), JSON.stringify(dupMap, null, 2));
console.log('dup-map.json written');

// queries.json: what the runner sees (no expected_decision)
const queriesPublic = QUERIES.map(q => ({ id: q.id, query: q.query }));
fs.writeFileSync(path.join(OUT, 'queries.json'), JSON.stringify(queriesPublic, null, 2));
console.log('queries.json written:', queriesPublic.length, 'queries');

// answer-key.json: expected decisions (never shown to model)
fs.writeFileSync(path.join(OUT, 'answer-key.json'), JSON.stringify(QUERIES, null, 2));
console.log('answer-key.json written');

// Write individual stack files for each query (for the runner)
const STACKS_DIR = path.join(OUT, 'stacks');
fs.mkdirSync(STACKS_DIR, { recursive: true });
for (const q of QUERIES) {
  const stack = buildStack(q.query);
  fs.writeFileSync(path.join(STACKS_DIR, q.id + '.txt'), stack);
}
console.log('stacks/ written:', QUERIES.length, 'files');
