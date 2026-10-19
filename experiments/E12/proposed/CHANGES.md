Proposed by the runs of 18-19 Oct 2026; not merged into the canonical files.

# Proposed changes — E12

## proposed/tools/verify-chain.js

**New file.** Zero-dependency Node.js verifier for signed-commit provenance chains.

Checks:
1. Every commit's SSH signature (`git verify-commit` via configurable signing program)
2. Each node's `provenance.json` names the guide who signed the commit
3. History is strictly linear from a pinned root SHA (append-only enforcement)
4. No duplicate `node_id` values across the chain

Why: E12's core deliverable. Reusable by X09 (append-only store verification) and any
tool that needs to confirm a course's provenance chain from the repo alone.

Interface:
```
node verify-chain.js <repo> <allowed_signers> <pinned_root_sha>
  [--signing-program <path>]   default: ssh-keygen
  [--json]                     emit JSON instead of human summary
```

Exit code 0 = chain OK, 1 = errors found.

## proposed/tools/sshsig.js  (via run-2026-10-18/sshsig.js)

**Companion tool** (not strictly proposed for the main repo, but needed in environments
without ssh-keygen). Implements the ssh-keygen `-Y sign`, `-Y find-principals`, and
`-Y verify` interface using Node.js `crypto` and the SSHSIG wire format (same as
openssh-portable PROTOCOL.sshsig). Keys are PKCS8 PEM (Node.js native export).

Why it exists: ssh-keygen was absent in this run environment. In a standard deployment,
`gpg.ssh.program` can be left unset. Ship as an optional fallback.
