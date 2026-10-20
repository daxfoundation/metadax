{
  "type": "followup",
  "decision": "new",
  "target_id": null,
  "confidence": 0.0,
  "resolved": {
    "question": "How is ATP actually spent to power work inside the cell?",
    "canonical_question": "How does ATP power work inside the cell?",
    "intent": "deepen",
    "scope": "adjacent"
  },
  "node": {
    "schema": "metadax.node/0.2",
    "id": "L01.M01.O01/cells-spend-atp-work",
    "parent_id": "L01.M01.O01",
    "kind": "followup",
    "depth": 2,
    "anchor": {
      "section_id": "s1",
      "quote": "Cells spend ATP to move, build, and signal, so a steady supply matters."
    },
    "path": [
      {
        "id": "L01.M01.O01",
        "title": "Introduction to energy production in the mitochondria",
        "summary": "Cellular respiration converts nutrients into ATP. Most ATP is made in the mitochondrion."
      }
    ],
    "title": "How cells spend ATP to do work",
    "question": "How is ATP actually spent to power work inside the cell?",
    "canonical_question": "How does ATP power work inside the cell?",
    "intent": "deepen",
    "summary": [
      "ATP releases energy when one of its phosphate bonds is broken, yielding ADP and a phosphate group.",
      "Cells direct this energy burst to three broad categories of work: mechanical movement, building molecules, and sending signals.",
      "The spent ADP is continuously recharged back to ATP in the mitochondrion, keeping the pool in circulation."
    ],
    "concepts": [
      "atp-synthesis",
      "cellular-respiration"
    ],
    "new_concepts": [
      {
        "id": "atp-hydrolysis",
        "name": "ATP hydrolysis",
        "description": "The reaction that breaks a phosphate bond in ATP to release energy for cellular work."
      },
      {
        "id": "molecular-motors",
        "name": "Molecular motors",
        "description": "Proteins such as myosin and kinesin that convert ATP energy into directed mechanical movement."
      }
    ],
    "bloom_level": "Understand",
    "scope": "adjacent",
    "reuse": {
      "decision": "new",
      "of": null,
      "confidence": 0.0,
      "rationale": "No registry node addresses how ATP is consumed to do cellular work; the parent node names the categories but does not explain the mechanism."
    },
    "links": [],
    "core": {
      "sections": [
        {
          "id": "s1",
          "heading": "Breaking the bond: how ATP releases energy",
          "body_md": "ATP — adenosine triphosphate — carries three phosphate groups joined in a chain. The bond linking the third phosphate to the rest of the molecule is under chemical strain. When a cell needs energy, an enzyme breaks that bond in a reaction called hydrolysis, splitting ATP into ADP (adenosine diphosphate) and a free phosphate group. The energy released in this step is what drives the cell's machinery. One ATP molecule yields a modest but precisely sized burst of energy — just enough to nudge a protein into a new shape or attach a building block to a growing chain. Everyday example: think of ATP as a compressed spring. Hydrolysis releases the spring; the snap is the energy the cell captures."
        },
        {
          "id": "s2",
          "heading": "Three kinds of cellular work",
          "body_md": "Cells channel ATP energy into three broad categories. First, mechanical work: motor proteins such as myosin (in muscle) and kinesin (in all cells) change shape each time they hydrolyse one ATP, tugging on filaments or carrying cargo along tracks. Second, biosynthesis: building proteins, copying DNA, and assembling membranes all require ATP to push reactions that would otherwise not proceed on their own. Third, active transport: pumps embedded in cell membranes use ATP to move ions and molecules against their concentration gradient, maintaining the correct internal chemistry. Everyday example: each heartbeat calls on billions of myosin motors, each firing once per ATP."
        },
        {
          "id": "s3",
          "heading": "The recycling loop",
          "body_md": "After hydrolysis, ADP and phosphate re-enter the mitochondrion and are rejoined into ATP by ATP synthase — the same process described in the parent node (see: Introduction to energy production in the mitochondria). Because cells cannot stockpile large amounts of ATP, the cycle runs continuously: a resting human cell turns over roughly its own weight in ATP every day. This tight coupling between spending and recharging means the rate of ATP production must match demand almost instantly."
        }
      ],
      "key_points": [
        "ATP releases energy by hydrolysis: the third phosphate bond breaks, yielding ADP plus phosphate.",
        "The energy drives mechanical work (motor proteins), biosynthesis, and active transport.",
        "ADP is recharged to ATP in the mitochondrion, so the pool is recycled rather than stored in bulk.",
        "Production rate tracks demand in near real time, with no large ATP reserve."
      ],
      "bridge_to_parent": "The ATP whose production the parent node traces — from food molecules through the mitochondrion — is the same currency spent here to drive every action in the cell.",
      "bridge_to_objective": "Understanding how ATP is spent completes the energy picture: it shows why continuous mitochondrial production is essential and how the mitochondrion's output connects directly to cellular function."
    },
    "seeds": [
      "How do molecular motors use ATP to generate mechanical force?",
      "What happens to a cell when its ATP supply runs out?",
      "How does the rate of ATP spending compare to the rate of ATP production?"
    ],
    "created_by": "lrn-fixture01",
    "visibility": "pending_review",
    "created_at": "runtime",
    "updated_at": "runtime",
    "content_sha256": "runtime",
    "superseded_by": null
  },
  "seeds": [
    "How do molecular motors use ATP to generate mechanical force?",
    "What happens to a cell when its ATP supply runs out?",
    "How does the rate of ATP spending compare to the rate of ATP production?"
  ],
  "rendering_md": "## How does ATP actually power work?\n\n<!--section:s1-->\n### Breaking the bond\n\nATP carries three phosphate groups. The outermost bond is under strain. When a cell needs energy, an enzyme breaks that bond — a reaction called **hydrolysis** — splitting ATP into ADP and a free phosphate. The released energy is captured to drive the cell's machinery.\n\nThink of ATP as a compressed spring. Hydrolysis releases the spring; that snap is the energy the cell uses.\n\n<!--section:s2-->\n### Three kinds of work\n\nCells direct this energy burst into three categories:\n\n- **Mechanical movement** — motor proteins like myosin (muscle) and kinesin (cargo transport) change shape with each ATP they break, pulling filaments or carrying molecules along tracks. Every heartbeat uses billions of these motors.\n- **Building molecules** — making proteins, copying DNA, and assembling membranes all require ATP to push reactions that would not proceed on their own.\n- **Active transport** — pumps in cell membranes use ATP to move ions against their natural flow, keeping the cell's internal chemistry in balance.\n\n<!--section:s3-->\n### The recycling loop\n\nSpent ADP and phosphate return to the mitochondrion and are rejoined into ATP by ATP synthase — the very process covered in the parent node. Because cells keep only a small ATP pool, the cycle runs continuously. A resting human cell turns over roughly its own weight in ATP every day, with production tracking demand almost instantly.\n\n---\n\n**Keep exploring:**\n\n1. How do molecular motors use ATP to generate mechanical force?\n2. What happens to a cell when its ATP supply runs out?\n3. How does the rate of ATP spending compare to the rate of ATP production?",
  "options": [],
  "warnings": [],
  "missing": []
}
