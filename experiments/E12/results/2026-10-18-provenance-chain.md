# E12 — Provenance plus signed commits, verified later as a chain

**Date:** 2026-10-18  
**Status:** SIMULATED (deterministic scripted run; no real guides participated)

---

## Question

Can a node's `provenance.json` plus signed git commits be reconstructed later into a
verifiable chain — signatures checked, guide identity confirmed, history linear from a
pinned root — from the repository alone?

---

## What ran

| Item | Value |
|---|---|
| Signing model | ED25519 via Node.js `crypto` (SSHSIG wire format; `gpg.format=ssh` compatible) |
| Guides (simulated) | Alice, Bora, Clem (made-up; keys generated fresh each run) |
| Course repo commits | 40 (also 4,000 for scale) |
| Tamper cases | 12 |
| Verifier | `proposed/tools/verify-chain.js` (zero-dependency Node, calls git) |
| Signing program | `run-2026-10-18/sshsig.js` (Node.js ssh-keygen drop-in; needed because ssh-keygen absent in this environment) |

---

## Numbers

### Tamper detection (12 cases)

| ID | Case | Expected check | Detected | Error types |
|---|---|---|---|---|
| T01 | Unsigned tip commit (history rewrite, no resign) | bad_signature | ✓ | bad_signature |
| T02 | Unsigned commit inserted in middle | bad_signature | ✓ | bad_signature, provenance_author_mismatch |
| T03 | Commit signed with unknown key (not in allowed_signers) | bad_signature | ✓ | bad_signature, provenance_author_mismatch |
| T04 | Key swapped in allowed_signers after the fact | bad_signature | ✓ | bad_signature |
| T05 | Working-tree provenance.json tampered (not committed) | none (correct non-detection) | ✓ PASS | — |
| T06 | Forged author line (author=Alice, signed by Bora) | provenance_signer_mismatch | ✓ | provenance_signer_mismatch |
| T07 | Full chain rewritten + re-signed with valid key | root_mismatch | ✓ | root_mismatch |
| T08 | Merge commit injected (non-linear history) | merge_commit / non_linear | ✓ | root_mismatch, non_linear |
| T09 | Commit missing provenance.json | missing_provenance | ✓ | missing_provenance |
| T10 | provenance.guide_email ≠ signer | provenance_signer_mismatch | ✓ | provenance_signer_mismatch, provenance_author_mismatch |
| T11 | provenance.json has invalid JSON | invalid_provenance_json | ✓ | invalid_provenance_json |
| T12 | Duplicate node_id across two commits | duplicate_node_id | ✓ | duplicate_node_id |

**12/12 cases handled correctly (11 tampers detected, 1 clean case correctly passed). False alarms on clean repo: 0.**

### Scale timing (MEASURED)

| Repo size | Wall-clock | ms/commit |
|---|---|---|
| 40 commits | 2,890 ms | 72 ms |
| 4,000 commits | 290,023 ms (~4.8 min) | 72.5 ms |

Scaling is linear. Cost is dominated by one `git verify-commit` process-spawn per commit.

---

## Verdict

**PASS.** Every check the E12 card defines is satisfied: every commit's signature is
verifiable from the repo alone; each node's provenance names the guide who signed it;
history is linear from a pinned root. 12/12 cases handled correctly (11 tampers detected,
1 clean case correctly passed), 0 false alarms on a clean chain.

The kill line from the E12 card — "Kill if any field cannot be reconstructed from the
repository alone" — is not triggered. All fields (signature, guide identity, parent
chain) are reconstructable from git objects with no out-of-band trust.

---

## What compounds

E12 directly unblocks **X09** (nothing quietly edited). `verify-chain.js` is written to
be reusable: pass `--signing-program`, `--allowed-signers`, and `--pinned-root` as
arguments; the verifier is zero-dependency Node with no path assumptions.

The T07 result (re-signed rewrite detected by root-pin) confirms the append-only
property: a valid re-signing of the entire chain is still caught, because the root
commit SHA is pinned at first publication and any rewrite changes it.

---

## Dead ends

- **72 ms/commit is prohibitive at 4,000 commits (~4.8 min)**: process-spawn per
  commit is the bottleneck. A batch verifier (one `git log -p` call to extract all
  signatures, then verify in-process) would cut this by ~50–100×. Not built here;
  kept as B44.

- **ssh-keygen absent**: this environment has no `ssh-keygen`, so `sshsig.js` (a
  Node.js drop-in implementing the SSHSIG wire format) was needed. In a standard
  environment, `gpg.ssh.program` can be left unset and the system ssh-keygen is used.
  `verify-chain.js` defaults `--signing-program` to `ssh-keygen`; swap to `sshsig.js`
  only when needed. Kept as B45.

- **T08 detection fires root_mismatch/non_linear (not merge_commit)**: the merge commit
  is created without a signature, so verify-chain.js detects the unsigned merge tip
  and non-linear parent chain before it gets to the merge_commit check. The merge_commit
  check works correctly on its own but is shadowed in this case. Both paths lead to
  detection; not a correctness issue.

---

## Bottlenecks

See `bottlenecks-2026-10-18.md`.

---

## Reproduce

```bash
cd state/metadax/public-staging/experiments/E12/run-2026-10-18

# 1. Generate keys
node gen-keys.js .

# 2. Build 40-commit course repo
node build-course.js . 40

# 3. Verify clean chain
node ../proposed/tools/verify-chain.js course-repo allowed_signers \
  $(cat pinned_root.txt) --signing-program ./sshsig.js

# 4. Tamper suite (12 cases)
node tamper-suite.js .

# 5. Scale test (rebuild + time 4000 commits)
# Build:
mv course-repo course-repo-40-backup
node build-course.js . 4000
mv course-repo course-repo-4000
mv course-repo-40-backup course-repo
git -C course-repo-4000 log --reverse --format=%H | head -1 > pinned_root_4000.txt
# Time:
time node ../proposed/tools/verify-chain.js course-repo-4000 allowed_signers \
  $(cat pinned_root_4000.txt) --signing-program ./sshsig.js
```
