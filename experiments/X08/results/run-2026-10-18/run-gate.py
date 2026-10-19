"""
run-gate.py — deterministic outward-gate test runner.

Reads fixtures.json, applies the gate to all 30 candidates, writes gate-results.json.

The gate logic mirrors outward-gate.js — implemented here in Python for the
deterministic harness (no Node dependency in CI).
"""

import json, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))

# ── Gate logic (mirrors outward-gate.js) ──────────────────────────────────────

def get_ancestry(node_id, registry):
    visited = set()
    ancestors = []
    current = node_id
    while current:
        if current in visited:
            break
        visited.add(current)
        node = registry.get(current)
        if not node:
            break
        parent_id = node.get("parent_id")
        if not parent_id:
            break
        ancestors.append(parent_id)
        current = parent_id
    return ancestors

def node_text(node):
    parts = [
        node.get("title", ""),
        node.get("question", ""),
        node.get("canonical_question", ""),
        *node.get("summary", []),
    ]
    core = node.get("core", {})
    if core:
        parts.extend(core.get("key_points", []))
        parts.append(core.get("bridge_to_parent", ""))
        parts.append(core.get("bridge_to_objective", ""))
        for s in core.get("sections", []):
            parts.append(s.get("heading", ""))
            parts.append(s.get("body_md", ""))
            chk = s.get("check", {})
            if chk:
                parts.append(chk.get("question", ""))
                parts.append(chk.get("answer", ""))
    return " ".join(parts)

def gate(node_id, registry, org_decl):
    node = registry.get(node_id)
    if not node:
        return {"decision": "block", "node_id": node_id,
                "reasons": ["Node not found in registry."]}

    reasons = []
    private_module_ids = set(org_decl.get("private_module_ids", []))
    private_node_ids   = set(org_decl.get("private_node_ids",   []))
    private_terms      = org_decl.get("private_terms", [])

    # Check 1: own visibility
    if node.get("visibility") == "private":
        reasons.append("Node visibility is 'private'.")

    # Check 2: module_id
    mod = node.get("module_id", "")
    if mod and mod in private_module_ids:
        reasons.append(f"Node module_id '{mod}' is in private_module_ids.")

    # Check 3: node id in private_node_ids
    if node_id in private_node_ids:
        reasons.append("Node id is in private_node_ids.")

    # Check 4: private ancestor
    ancestors = get_ancestry(node_id, registry)
    for anc_id in ancestors:
        anc = registry.get(anc_id)
        if not anc:
            continue
        if anc.get("visibility") == "private":
            reasons.append(f"Ancestor {anc_id} has visibility 'private' — re-author required.")
            break
        anc_mod = anc.get("module_id", "")
        if anc_mod and anc_mod in private_module_ids:
            reasons.append(f"Ancestor {anc_id} belongs to private module '{anc_mod}'.")
            break
        if anc_id in private_node_ids:
            reasons.append(f"Ancestor {anc_id} is in private_node_ids.")
            break

    # Check 5: private term in content
    text = node_text(node)
    for term in private_terms:
        if term in text:
            reasons.append(f"Content contains private term '{term}'.")

    if reasons:
        return {"decision": "block", "node_id": node_id, "reasons": reasons}

    result = {"decision": "allow", "node_id": node_id,
              "reasons": ["No private markers or ancestry found."]}
    if org_decl.get("export_requires_review"):
        result["review_required"] = True
        result["reasons"].append(
            "export_requires_review is set — human review needed before publishing.")
    return result

# ── Main ──────────────────────────────────────────────────────────────────────

fixtures_path = os.path.join(BASE, "fixtures.json")
with open(fixtures_path) as f:
    fixtures = json.load(f)

org_decl = fixtures["org_declaration"]
private_nodes = fixtures["private_nodes"]
candidates = fixtures["candidates"]

# Build registry: all private nodes + all candidate nodes
registry = {}
for n in private_nodes:
    registry[n["id"]] = n
for c in candidates:
    n = c["node"]
    registry[n["id"]] = n

results = []
for c in candidates:
    node = c["node"]
    decision = gate(node["id"], registry, org_decl)
    results.append({
        "category":     c["category"],
        "node_id":      node["id"],
        "title":        node["title"],
        "gate_decision": decision["decision"],
        "reasons":      decision["reasons"],
        "review_required": decision.get("review_required", False),
    })

# ── Scoring ───────────────────────────────────────────────────────────────────

safe_total = sum(1 for r in results if r["category"] == "safe_rewrite")
safe_allowed = sum(1 for r in results if r["category"] == "safe_rewrite" and r["gate_decision"] == "allow")
safe_wrongly_blocked = safe_total - safe_allowed

near_copy_total = sum(1 for r in results if r["category"] == "near_copy")
near_copy_blocked = sum(1 for r in results if r["category"] == "near_copy" and r["gate_decision"] == "block")

quoting_total = sum(1 for r in results if r["category"] == "quotes_private_fact")
quoting_blocked = sum(1 for r in results if r["category"] == "quotes_private_fact" and r["gate_decision"] == "block")

leaks = near_copy_total - near_copy_blocked + quoting_total - quoting_blocked
all_decisions_explained = all(len(r["reasons"]) > 0 for r in results)

summary = {
    "safe_rewrites":        {"total": safe_total, "allowed": safe_allowed, "wrongly_blocked": safe_wrongly_blocked},
    "near_copies":          {"total": near_copy_total, "blocked": near_copy_blocked, "leaked": near_copy_total - near_copy_blocked},
    "quoting_private_fact": {"total": quoting_total, "blocked": quoting_blocked, "leaked": quoting_total - quoting_blocked},
    "leaks_total":          leaks,
    "safe_wrongly_blocked": safe_wrongly_blocked,
    "all_decisions_explained": all_decisions_explained,
}

output = {
    "run_type": "deterministic",
    "summary": summary,
    "results": results,
}

out_path = os.path.join(BASE, "gate-results.json")
with open(out_path, "w") as f:
    json.dump(output, f, indent=2)

print("=== Deterministic gate test ===")
print(f"Safe rewrites    : {safe_allowed}/{safe_total} allowed  (wrongly blocked: {safe_wrongly_blocked})")
print(f"Near copies      : {near_copy_blocked}/{near_copy_total} blocked (leaked: {near_copy_total - near_copy_blocked})")
print(f"Quoting private  : {quoting_blocked}/{quoting_total} blocked (leaked: {quoting_total - quoting_blocked})")
print(f"Total leaks      : {leaks}")
print(f"All explained    : {all_decisions_explained}")
print(f"Written {out_path}")
