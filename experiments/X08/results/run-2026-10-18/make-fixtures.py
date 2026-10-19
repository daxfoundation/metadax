"""
make-fixtures.py — generate the X08 deterministic test fixtures.

Outputs:
  fixtures.json  — org_declaration + 30 private nodes + 30 derived candidates
"""

import json, hashlib, os

BASE = os.path.dirname(os.path.abspath(__file__))

def nid(n):
    """Stable fake node ID for test (26-char crockford base32 subset)."""
    # Use sha256 of a seed string, take 26 chars from [0-9a-hjkmnp-tv-z]
    alphabet = "0123456789abcdefghjkmnpqrstvwxyz"
    h = hashlib.sha256(n.encode()).digest()
    chars = []
    val = int.from_bytes(h[:16], 'big')
    for _ in range(26):
        chars.append(alphabet[val % 32])
        val //= 32
    return "n_" + "".join(chars)

# ── Org declaration ────────────────────────────────────────────────────────────

ORG_DECL = {
    "schema": "metadax.org-declaration/0.1",
    "org_id": "example-freight-co",
    "org_name": "Example Freight Co. (fictional)",
    "default_visibility": "private",
    "private_module_ids": ["meridian-protocol"],
    "private_node_ids": [],          # filled below
    "private_terms": [
        "Meridian Protocol",
        "MRD-7",
        "Project Apex",
        "audit score 87",
        "Section 4.2 gap",
        "Example Freight Co. Internal"
    ],
    "export_requires_review": True,
    "reviewers": ["eva.m", "omar.t"],
    "declared_at": "2026-10-18T09:00:00Z",
    "notes": "All meridian-protocol module content is proprietary. Any node quoting Example Freight Co. Internal materials requires re-authoring before export."
}

# ── 30 private nodes (a compliance training course) ────────────────────────────
# 5 root objectives (depth 1) + 5 × 5 followups (depths 2–3)

PRIVATE_NODES = []

root_topics = [
    ("Meridian Protocol overview",          "What is the Meridian Protocol and why does Example Freight Co. Internal use it?"),
    ("MRD-7 control framework",             "What controls does MRD-7 specify for data handling?"),
    ("Project Apex audit preparation",      "How should teams prepare for a Project Apex audit?"),
    ("Section 4.2 gap remediation",         "What steps close the Section 4.2 gap identified in the last audit?"),
    ("Audit score 87 improvement plan",     "What actions will raise our audit score 87 to target 95?"),
]

for i, (title, question) in enumerate(root_topics):
    rid = nid(f"priv-root-{i}")
    PRIVATE_NODES.append({
        "id": rid,
        "parent_id": None,
        "module_id": "meridian-protocol",
        "kind": "objective",
        "depth": 1,
        "title": title,
        "question": question,
        "canonical_question": question,
        "summary": [f"This node covers {title.lower()}."],
        "visibility": "private",
        "core": {
            "sections": [{"id": "s1", "heading": "Overview",
                          "body_md": f"Example Freight Co. Internal requires compliance with the Meridian Protocol. {title} is foundational."}],
            "key_points": [f"The Meridian Protocol mandates {title.lower()}."],
            "bridge_to_parent": "",
            "bridge_to_objective": "",
            "source_refs": ["Example Freight Co. Internal policy v2.4"]
        }
    })

# 5 followup batches (5 children per root)
followup_templates = [
    ("Scope of {topic}",               "What is in scope for {topic}?"),
    ("{topic}: step-by-step",          "What is the step-by-step process for {topic}?"),
    ("Common mistakes in {topic}",     "What mistakes do teams make when addressing {topic}?"),
    ("Evidence required for {topic}",  "What evidence must be submitted to satisfy {topic}?"),
    ("Escalation path for {topic}",    "Who approves exceptions to {topic} requirements?"),
]

for i, root in enumerate(PRIVATE_NODES[:5]):
    topic = root["title"]
    for j, (tmpl_title, tmpl_q) in enumerate(followup_templates):
        title = tmpl_title.format(topic=topic)
        question = tmpl_q.format(topic=topic)
        fid = nid(f"priv-follow-{i}-{j}")
        PRIVATE_NODES.append({
            "id": fid,
            "parent_id": root["id"],
            "module_id": "meridian-protocol",
            "kind": "followup",
            "depth": 2,
            "title": title,
            "question": question,
            "canonical_question": question,
            "summary": [f"Covers {title.lower()} in the Meridian Protocol context."],
            "visibility": "private",
            "core": {
                "sections": [{"id": "s1", "heading": "Detail",
                              "body_md": f"Under Example Freight Co. Internal policy, {title.lower()} is governed by MRD-7."}],
                "key_points": [f"Section 4.2 gap applies to {title.lower()} in certain modules."],
                "bridge_to_parent": f"This follows from '{root['title']}'.",
                "bridge_to_objective": f"Supports the main objective of {root['title'].lower()}.",
                "source_refs": ["MRD-7 control spec", "Example Freight Co. Internal audit log 2026"]
            }
        })

assert len(PRIVATE_NODES) == 30, f"Expected 30, got {len(PRIVATE_NODES)}"

# Add all private node IDs to the declaration
ORG_DECL["private_node_ids"] = [n["id"] for n in PRIVATE_NODES]

# ── 30 derived candidates ──────────────────────────────────────────────────────

CANDIDATES = []

# Helper: make a minimal clean node with no private ancestry/terms
def make_clean_node(seed, title, question, summary, body, parent_id=None, depth=1):
    return {
        "id": nid(seed),
        "parent_id": parent_id,
        "module_id": "general-compliance",   # not a private module
        "kind": "followup" if parent_id else "objective",
        "depth": depth,
        "title": title,
        "question": question,
        "canonical_question": question,
        "summary": [summary],
        "visibility": "pending_review",
        "core": {
            "sections": [{"id": "s1", "heading": "Overview", "body_md": body}],
            "key_points": [summary],
            "bridge_to_parent": "",
            "bridge_to_objective": "",
            "source_refs": []
        }
    }

# Group A — 10 SAFE rewrites (should ALLOW)
# Re-authored generic compliance content, no private ancestry or terms.
safe_topics = [
    ("Understanding compliance frameworks",
     "What is a compliance framework and why do organisations use one?",
     "Compliance frameworks help organisations manage risk systematically.",
     "A compliance framework is a structured set of guidelines that helps an organisation align its policies with regulatory requirements."),
    ("Control-based risk management",
     "How do control-based frameworks reduce organisational risk?",
     "Controls reduce risk by limiting exposure at defined points in a process.",
     "Control frameworks enumerate checkpoints at which risk can be measured and mitigated."),
    ("Audit preparation fundamentals",
     "What general steps should a team take before an external audit?",
     "Good audit preparation involves evidence gathering and gap identification.",
     "Teams should collect supporting documentation, map controls to requirements, and run internal pre-checks before an external auditor arrives."),
    ("Gap analysis methodology",
     "How do you perform a gap analysis for a compliance standard?",
     "Gap analysis compares current state to required state across each control.",
     "A gap analysis maps each control requirement to current evidence and flags where evidence is missing or insufficient."),
    ("Continuous improvement cycles",
     "What is a continuous improvement cycle in a compliance context?",
     "Continuous improvement cycles use audit findings to iteratively close gaps.",
     "After each audit, identified gaps are prioritised, remediated, and re-tested in the next cycle."),
    ("Evidence collection best practices",
     "What makes audit evidence reliable and sufficient?",
     "Reliable evidence is contemporaneous, attributable, and complete.",
     "Evidence is strongest when it is collected at the time of the controlled activity, tagged to the person responsible, and covers the full scope of the control."),
    ("Escalation and exception handling",
     "When should a compliance exception be escalated and how?",
     "Exceptions that cannot be remediated in-cycle require formal escalation.",
     "An exception is raised when a control cannot be met by the required date. It is escalated to the process owner who logs the risk acceptance or requests a waiver."),
    ("Scope definition for compliance reviews",
     "How do you define the scope of a compliance review?",
     "Scope definition identifies which systems, processes, and data are in-scope.",
     "Scope is bounded by data classification, system ownership, and the specific standard being assessed."),
    ("Common compliance mistakes",
     "What are the most common mistakes teams make during compliance reviews?",
     "Common mistakes include incomplete evidence and undocumented exceptions.",
     "Teams frequently fail to maintain contemporaneous records, leaving auditors with reconstructed evidence that carries less weight."),
    ("Roles in a compliance programme",
     "Who owns compliance activities in a typical organisation?",
     "Compliance ownership is distributed across process owners, a central function, and executive sponsors.",
     "The central compliance function sets the framework; process owners gather evidence; executive sponsors approve risk acceptance."),
]

for k, (title, question, summary, body) in enumerate(safe_topics):
    node = make_clean_node(f"safe-{k}", title, question, summary, body)
    node["reauthored"] = True   # extension field marking explicit re-authoring
    CANDIDATES.append({"category": "safe_rewrite", "node": node})

# Group B — 10 NEAR-COPIES (should BLOCK: private ancestor OR private terms)
# These are slight paraphrases that either keep a private parent_id or retain
# a private term.
priv_roots = PRIVATE_NODES[:5]
for k in range(10):
    root = priv_roots[k % 5]
    title = root["title"].replace("Example Freight Co. Internal", "our organisation") \
                         .replace("Meridian Protocol", "the protocol") \
                         .replace("MRD-7", "the control spec") \
                         .replace("Project Apex", "the audit project")
    question = root["question"].replace("Example Freight Co. Internal", "our organisation") \
                               .replace("Meridian Protocol", "the protocol")
    # NEAR-COPY FLAW: still links parent_id to a private node
    node = {
        "id": nid(f"near-{k}"),
        "parent_id": root["id"],   # <-- private ancestor
        "module_id": "general-compliance",
        "kind": "followup",
        "depth": 2,
        "title": title,
        "question": question,
        "canonical_question": question,
        "summary": [f"Paraphrase of {root['title']} with private parent still attached."],
        "visibility": "pending_review",
        "core": {
            "sections": [{"id": "s1", "heading": "Overview",
                          "body_md": f"This rewords content from '{root['title']}' but retains the original parent link."}],
            "key_points": ["The protocol mandates this practice."],
            "bridge_to_parent": f"Derived from private node {root['id']}.",
            "bridge_to_objective": "",
            "source_refs": []
        }
    }
    CANDIDATES.append({"category": "near_copy", "node": node})

# Group C — 10 DESCENDANTS quoting private facts (should BLOCK: private term in content)
# These have public-looking parent IDs but embed private terms in content.
for k in range(10):
    safe_parent_id = nid(f"safe-{k}")   # points to a safe node (not private)
    private_terms_sample = [
        "Meridian Protocol",
        "MRD-7",
        "Project Apex",
        "audit score 87",
        "Section 4.2 gap",
        "Example Freight Co. Internal",
        "Meridian Protocol",
        "MRD-7",
        "audit score 87",
        "Section 4.2 gap",
    ]
    embedded_term = private_terms_sample[k]
    node = {
        "id": nid(f"desc-quoting-{k}"),
        "parent_id": safe_parent_id,
        "module_id": "general-compliance",
        "kind": "followup",
        "depth": 2,
        "title": f"Compliance review follow-up {k+1}",
        "question": f"How does this relate to {embedded_term} requirements?",
        "canonical_question": f"How does this relate to {embedded_term} requirements?",
        "summary": [f"Discusses compliance obligations referencing {embedded_term}."],
        "visibility": "pending_review",
        "core": {
            "sections": [{"id": "s1", "heading": "Detail",
                          "body_md": f"As established under {embedded_term}, teams must document all control activities on a quarterly basis."}],
            "key_points": [f"Requirement stems from {embedded_term}."],
            "bridge_to_parent": "Extends the parent node's discussion of control frameworks.",
            "bridge_to_objective": "",
            "source_refs": []
        }
    }
    CANDIDATES.append({"category": "quotes_private_fact", "node": node})

assert len(CANDIDATES) == 30, f"Expected 30, got {len(CANDIDATES)}"

# ── Write fixtures.json ────────────────────────────────────────────────────────

fixtures = {
    "org_declaration": ORG_DECL,
    "private_nodes": PRIVATE_NODES,
    "candidates": CANDIDATES,
}

out_path = os.path.join(BASE, "fixtures.json")
with open(out_path, "w") as f:
    json.dump(fixtures, f, indent=2)

print(f"Written {out_path}")
print(f"  org_declaration : 1")
print(f"  private_nodes   : {len(PRIVATE_NODES)}")
print(f"  candidates      : {len(CANDIDATES)}")
print(f"    safe_rewrite      : {sum(1 for c in CANDIDATES if c['category']=='safe_rewrite')}")
print(f"    near_copy         : {sum(1 for c in CANDIDATES if c['category']=='near_copy')}")
print(f"    quotes_private_fact: {sum(1 for c in CANDIDATES if c['category']=='quotes_private_fact')}")
