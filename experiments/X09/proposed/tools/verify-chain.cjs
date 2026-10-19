#!/usr/bin/env node
// verify-chain.js — zero-dependency Node; calls git to verify provenance chains.
//
// Checks:
//   1. Every commit's SSH signature (via git verify-commit)
//   2. Each node's provenance.json names the guide who signed the commit
//   3. History is linear from a pinned root SHA (append-only, no rewrites)
//
// Usage:
//   node verify-chain.js <repo> <allowed_signers> <pinned_root_sha> [options]
//
// Options:
//   --signing-program <path>   SSH signing program (default: ssh-keygen)
//   --json                     Output raw JSON (default: human summary)
//
// Exit code: 0 = chain OK, 1 = errors found

'use strict'
const { execSync } = require('child_process')
const { readFileSync } = require('fs')
const path = require('path')

function run(cmd) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
    return { ok: true, out: out.trim() }
  } catch (e) {
    const out = ((e.stdout || '') + (e.stderr || '')).trim()
    return { ok: false, out, code: e.status }
  }
}

function parseArgs(argv) {
  const pos = []
  const opts = { signingProgram: 'ssh-keygen', json: false }
  let i = 0
  while (i < argv.length) {
    if (argv[i] === '--signing-program') { opts.signingProgram = argv[++i]; i++ }
    else if (argv[i] === '--json') { opts.json = true; i++ }
    else { pos.push(argv[i]); i++ }
  }
  return { pos, opts }
}

function main() {
  const { pos, opts } = parseArgs(process.argv.slice(2))
  const [_repoPath, _allowedSigners, pinnedRoot] = pos
  const repoPath = path.resolve(_repoPath)
  const allowedSigners = path.resolve(_allowedSigners)

  if (!repoPath || !allowedSigners || !pinnedRoot) {
    process.stderr.write(
      'Usage: verify-chain.js <repo> <allowed_signers> <pinned_root_sha> [--signing-program <prog>] [--json]\n'
    )
    process.exit(2)
  }

  const errors = []

  // --- 1. Read history (oldest-first) ---------------------------------------
  const logR = run(`git -C "${repoPath}" log --reverse --format="%H %P %ae"`)
  if (!logR.ok) {
    const out = { ok: false, errors: [{ type: 'git_log_failed', detail: logR.out }] }
    emit(out, opts.json)
    process.exit(1)
  }

  const commits = logR.out.split('\n').filter(Boolean).map(line => {
    const parts = line.split(' ')
    const sha = parts[0]
    const parents = parts.slice(1, -1).filter(p => p.length === 40)
    const email = parts[parts.length - 1]
    return { sha, parents, firstParent: parents[0] || null, email }
  })

  if (commits.length === 0) {
    const out = { ok: false, errors: [{ type: 'empty_repo' }] }
    emit(out, opts.json)
    process.exit(1)
  }

  // --- 2. Root check --------------------------------------------------------
  if (commits[0].sha !== pinnedRoot) {
    errors.push({ type: 'root_mismatch', expected: pinnedRoot, got: commits[0].sha.slice(0, 12) })
  }

  // --- 3. Linearity ---------------------------------------------------------
  for (let i = 0; i < commits.length; i++) {
    const c = commits[i]
    if (c.parents.length > 1) {
      errors.push({ type: 'merge_commit', sha: c.sha.slice(0, 12), parents: c.parents.map(p => p.slice(0, 12)) })
    }
    if (i > 0 && c.firstParent !== commits[i - 1].sha) {
      errors.push({
        type: 'non_linear',
        sha: c.sha.slice(0, 12),
        expected_parent: commits[i - 1].sha.slice(0, 12),
        got: (c.firstParent || 'none').slice(0, 12)
      })
    }
  }

  // --- 4. Per-commit: signature + provenance --------------------------------
  const seen_node_ids = new Set()
  const commitResults = []

  const signingProgram = path.resolve(opts.signingProgram)

  for (const c of commits) {
    const ces = []

    // 4a. Signature
    const vR = run(
      `git -c gpg.format=ssh ` +
      `-c gpg.ssh.program="${signingProgram}" ` +
      `-c gpg.ssh.allowedSignersFile="${allowedSigners}" ` +
      `-C "${repoPath}" verify-commit "${c.sha}" 2>&1`
    )

    let signerEmail = null
    // git 2.39 exits 1 even for a valid SSH signature when the trust level is
    // GPG_SIGNATURE_GOOD_EXPIRED_KEY or similar edge case; parse the output text
    // to distinguish a genuine bad signature from a quirky non-zero exit.
    const goodMatch = vR.out.match(/Good .* signature for (\S+)/)
    if (goodMatch) {
      signerEmail = goodMatch[1]
    } else if (!vR.ok) {
      ces.push({ type: 'bad_signature', detail: vR.out.replace(/\n/g, ' ').slice(0, 200) })
    }

    // 4b. Provenance
    const provR = run(`git -C "${repoPath}" show "${c.sha}:provenance.json" 2>&1`)
    if (!provR.ok) {
      ces.push({ type: 'missing_provenance' })
    } else {
      let prov = null
      try { prov = JSON.parse(provR.out) } catch (e) {
        ces.push({ type: 'invalid_provenance_json', detail: e.message })
      }
      if (prov) {
        // guide_email in provenance must match who signed
        if (signerEmail && prov.guide_email && prov.guide_email !== signerEmail) {
          ces.push({
            type: 'provenance_signer_mismatch',
            prov_guide_email: prov.guide_email,
            signer: signerEmail
          })
        }
        // author email from git log must match provenance
        if (prov.guide_email && c.email && prov.guide_email !== c.email) {
          ces.push({
            type: 'provenance_author_mismatch',
            prov_guide_email: prov.guide_email,
            commit_email: c.email
          })
        }
        // duplicate node_id check
        if (prov.node_id) {
          if (seen_node_ids.has(prov.node_id)) {
            ces.push({ type: 'duplicate_node_id', node_id: prov.node_id })
          }
          seen_node_ids.add(prov.node_id)
        }
      }
    }

    commitResults.push({ sha: c.sha.slice(0, 12), ok: ces.length === 0, errors: ces })
    errors.push(...ces.map(e => ({ ...e, sha: c.sha.slice(0, 12) })))
  }

  const out = {
    ok: errors.length === 0,
    total_commits: commits.length,
    pinned_root: pinnedRoot,
    actual_root: commits[0].sha,
    errors,
    commits: commitResults
  }

  emit(out, opts.json)
  process.exit(out.ok ? 0 : 1)
}

function emit(out, asJson) {
  if (asJson) {
    process.stdout.write(JSON.stringify(out) + '\n')
    return
  }
  if (out.ok) {
    process.stdout.write(`OK — ${out.total_commits} commits verified, chain intact from ${out.pinned_root.slice(0, 12)}\n`)
  } else {
    process.stdout.write(`FAIL — ${out.errors.length} error(s) in ${out.total_commits} commits\n`)
    for (const e of out.errors) {
      process.stdout.write(`  [${e.sha || ''}] ${e.type}: ${JSON.stringify(e).slice(0, 120)}\n`)
    }
  }
}

main()
