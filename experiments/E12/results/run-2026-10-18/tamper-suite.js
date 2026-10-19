#!/usr/bin/env node
// Runs 12 tamper cases against the clean course repo.
// Each case creates a tampered copy, runs verify-chain.js, records detection.
// Usage: node tamper-suite.js <rundir>

'use strict'
const { execSync, spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const runDir = path.resolve(process.argv[2] || '.')
const repoDir = path.join(runDir, 'course-repo')
const keysDir = path.join(runDir, 'keys')
const allowedSigners = path.join(runDir, 'allowed_signers')
const pinnedRoot = fs.readFileSync(path.join(runDir, 'pinned_root.txt'), 'utf8').trim()
const sshsig = path.join(runDir, 'sshsig.js')
const verifier = path.join(runDir, '..', 'proposed', 'tools', 'verify-chain.js')
const tmpBase = path.join(runDir, 'tamper-cases')

fs.mkdirSync(tmpBase, { recursive: true })

function x(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...opts }).trim()
}

function gitS(repoPath, gitArgs, guide) {
  const kp = path.join(keysDir, guide.slug + '.pem')
  return execSync(
    `git -C "${repoPath}" ` +
    `-c user.name="${guide.name}" -c user.email="${guide.email}" ` +
    `-c gpg.format=ssh -c user.signingkey="${kp}" ` +
    `-c gpg.ssh.program="${sshsig}" ` + gitArgs,
    {
      encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: guide.name, GIT_AUTHOR_EMAIL: guide.email,
        GIT_COMMITTER_NAME: guide.name, GIT_COMMITTER_EMAIL: guide.email
      }
    }
  ).trim()
}

const guides = [
  { name: 'Alice', slug: 'alice', email: 'alice@metadax.example' },
  { name: 'Bora',  slug: 'bora',  email: 'bora@metadax.example'  },
  { name: 'Clem',  slug: 'clem',  email: 'clem@metadax.example'  }
]

function cloneRepo(dest) {
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true })
  x(`git clone "${repoDir}" "${dest}"`)
  // carry over config
  x(`git -C "${dest}" config gpg.ssh.allowedSignersFile "${allowedSigners}"`)
}

function verify(tamperRepoDir, signers = allowedSigners, pinned = pinnedRoot, note = '') {
  const r = spawnSync(
    process.execPath,
    [verifier, tamperRepoDir, signers, pinned, '--signing-program', sshsig, '--json'],
    { encoding: 'utf8' }
  )
  let result
  try { result = JSON.parse(r.stdout) } catch (e) {
    result = { ok: false, errors: [{ type: 'parse_error', detail: r.stderr }] }
  }
  return result
}

// Baseline: clean repo — expect OK (measures false-alarm rate)
const cleanResult = verify(repoDir)

const cases = []

function run(id, label, expectedError, setup) {
  const dest = path.join(tmpBase, id)
  let result
  try {
    setup(dest)
    result = verify(dest)
  } catch (e) {
    result = { ok: false, errors: [{ type: 'setup_error', detail: e.message }] }
  }
  const detected = !result.ok
  const errorTypes = result.errors ? result.errors.map(e => e.type) : []
  const correct = expectedError === null ? !detected : detected
  cases.push({
    id, label, expectedError, detected,
    errorTypes: [...new Set(errorTypes)],
    correct,
    totalErrors: (result.errors || []).length,
    totalCommits: result.total_commits || 0
  })
  const status = correct ? '✓' : '✗'
  console.log(`  ${status} ${id}: ${label} → ${detected ? 'DETECTED' : 'PASS'} [${errorTypes.slice(0,2).join(',')}]`)
}

// ─── T01: unsigned commit appended (history rewrite without resign) ─────────
run('T01', 'tip commit appended without signing', 'bad_signature', dest => {
  cloneRepo(dest)
  // Remove last signed commit and replace with unsigned one
  x(`git -C "${dest}" -c user.name="Alice" -c user.email="alice@metadax.example" ` +
    `reset --soft HEAD~1`)
  fs.writeFileSync(path.join(dest, 'tamper.txt'), 'history rewrite\n')
  x(`git -C "${dest}" add tamper.txt`)
  x(`git -C "${dest}" -c user.name="Alice" -c user.email="alice@metadax.example" ` +
    `commit --no-gpg-sign -m "rewritten tip (unsigned)"`)
})

// ─── T02: unsigned commit inserted in the middle ───────────────────────────
run('T02', 'unsigned commit inserted', 'bad_signature', dest => {
  cloneRepo(dest)
  fs.writeFileSync(path.join(dest, 'INJECTED.txt'), 'tamper\n')
  x(`git -C "${dest}" add INJECTED.txt`)
  x(`git -C "${dest}" -c user.name="Tamper" -c user.email="tamper@evil.example" ` +
    `commit --no-gpg-sign -m "injected unsigned commit"`)
})

// ─── T03: commit signed with unknown key ───────────────────────────────────
run('T03', 'signature from unknown key', 'bad_signature', dest => {
  cloneRepo(dest)
  // Generate a 4th key not in allowed_signers
  const { privateKey } = crypto.generateKeyPairSync('ed25519')
  const unknownPem = privateKey.export({ type: 'pkcs8', format: 'pem' })
  const unknownKey = path.join(dest, 'unknown.pem')
  fs.writeFileSync(unknownKey, unknownPem, { mode: 0o600 })
  const ghost = { name: 'Ghost', slug: 'unknown', email: 'ghost@evil.example' }
  // Write a file, commit signed with unknown key
  fs.writeFileSync(path.join(dest, 'mystery.txt'), 'unknown signer\n')
  x(`git -C "${dest}" add mystery.txt`)
  execSync(
    `git -C "${dest}" -c user.name="${ghost.name}" -c user.email="${ghost.email}" ` +
    `-c gpg.format=ssh -c user.signingkey="${unknownKey}" ` +
    `-c gpg.ssh.program="${sshsig}" ` +
    `commit -S -m "signed by unknown key"`,
    {
      encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: ghost.name, GIT_AUTHOR_EMAIL: ghost.email,
        GIT_COMMITTER_NAME: ghost.name, GIT_COMMITTER_EMAIL: ghost.email
      }
    }
  )
})

// ─── T04: key swapped in allowed_signers after the fact ────────────────────
run('T04', 'allowed_signers key swapped retroactively', 'bad_signature', dest => {
  cloneRepo(dest)
  // Replace alice's key with a new key in a modified allowed_signers
  const { privateKey } = crypto.generateKeyPairSync('ed25519')
  const pub = crypto.createPublicKey(privateKey)
  const spki = pub.export({ type: 'spki', format: 'der' })
  const raw = spki.slice(-32)
  function sshStr(s) {
    const d = Buffer.isBuffer(s) ? s : Buffer.from(s)
    const b = Buffer.allocUnsafe(4 + d.length)
    b.writeUInt32BE(d.length, 0); d.copy(b, 4); return b
  }
  const wire = Buffer.concat([sshStr('ssh-ed25519'), sshStr(raw)]).toString('base64')
  // Swap alice's line for a different key
  const lines = fs.readFileSync(allowedSigners, 'utf8').split('\n')
  const modified = lines.map(l =>
    l.startsWith('alice@') ? `alice@metadax.example ssh-ed25519 ${wire}` : l
  ).join('\n')
  const modSigners = path.join(dest, 'allowed_signers_tampered')
  fs.writeFileSync(modSigners, modified)
  // Override: verify with tampered signers file
  // (handled in the verify call below via a wrapper)
  fs.writeFileSync(path.join(dest, '.tampered_signers'), modSigners)
})

// Override T04 to use the tampered signers file
const t04 = cases.pop()
{
  const dest = path.join(tmpBase, 'T04')
  const modSigners = fs.readFileSync(path.join(dest, '.tampered_signers'), 'utf8').trim()
  const result = verify(dest, modSigners)
  const detected = !result.ok
  const errorTypes = result.errors ? [...new Set(result.errors.map(e => e.type))] : []
  const correct = detected
  cases.push({ id: 'T04', label: t04.label, expectedError: 'bad_signature', detected, errorTypes, correct, totalErrors: (result.errors||[]).length, totalCommits: result.total_commits||0 })
  const status = correct ? '✓' : '✗'
  console.log(`  ${status} T04: ${t04.label} → ${detected ? 'DETECTED' : 'PASS'} [${errorTypes.slice(0,2).join(',')}]`)
}

// ─── T05: working-tree provenance.json tampered (not committed) ─────────────
// Expect: NOT detected (verify-chain reads from committed objects)
run('T05', 'working-tree provenance.json tampered (should not be detected)', null, dest => {
  cloneRepo(dest)
  // Overwrite provenance.json in working tree only — do NOT commit
  const wt = path.join(dest, 'provenance.json')
  const prov = JSON.parse(fs.readFileSync(wt, 'utf8'))
  prov.guide = 'TAMPERED'
  prov.guide_email = 'tamper@evil.example'
  fs.writeFileSync(wt, JSON.stringify(prov, null, 2))
  // verify-chain reads git objects, not working tree → should pass
})

// ─── T06: forged author line (author=alice, signed by bora) ─────────────────
run('T06', 'forged author line (author≠signer)', 'provenance_author_mismatch', dest => {
  cloneRepo(dest)
  const boraKey = path.join(keysDir, 'bora.pem')
  const prov = {
    node_id: 'node-tampered',
    guide: 'Alice',
    guide_email: 'alice@metadax.example', // says alice
    parent_node_id: 'node-040',
    timestamp: '2026-10-18T12:00:00Z'
  }
  fs.writeFileSync(path.join(dest, 'provenance.json'), JSON.stringify(prov, null, 2))
  fs.writeFileSync(path.join(dest, 'node.json'), JSON.stringify({ id: 'node-tampered', title: 'Tampered' }, null, 2))
  x(`git -C "${dest}" add provenance.json node.json`)
  // Commit with author=alice but signed by bora
  execSync(
    `git -C "${dest}" ` +
    `-c user.name="Bora" -c user.email="bora@metadax.example" ` +
    `-c gpg.format=ssh -c user.signingkey="${boraKey}" ` +
    `-c gpg.ssh.program="${sshsig}" ` +
    `commit -S --author="Alice <alice@metadax.example>" -m "forged author"`,
    {
      encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        GIT_COMMITTER_NAME: 'Bora', GIT_COMMITTER_EMAIL: 'bora@metadax.example',
        GIT_AUTHOR_NAME: 'Alice', GIT_AUTHOR_EMAIL: 'alice@metadax.example'
      }
    }
  )
})

// ─── T07: full chain rewritten + re-signed with valid key ───────────────────
run('T07', 'full chain rewritten + re-signed (root-pin catches it)', 'root_mismatch', dest => {
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true })
  fs.mkdirSync(dest)
  x(`git -C "${dest}" init -b main`)
  x(`git -C "${dest}" config gpg.ssh.allowedSignersFile "${allowedSigners}"`)
  // Re-create a valid-looking chain with different initial content
  const alice = guides[0]
  const prov = {
    node_id: 'node-001', guide: 'Alice', guide_email: 'alice@metadax.example',
    parent_node_id: null, timestamp: '2099-01-01T00:00:00Z' // different timestamp → different root SHA
  }
  fs.writeFileSync(path.join(dest, 'provenance.json'), JSON.stringify(prov, null, 2))
  fs.writeFileSync(path.join(dest, 'node.json'), JSON.stringify({ id: 'node-001', title: 'Rewritten root' }, null, 2))
  x(`git -C "${dest}" add .`)
  gitS(dest, 'commit -S -m "rewritten root (re-signed)"', alice)
  // The SHA of this root differs from pinnedRoot → root_mismatch
})

// ─── T08: merge commit (non-linear history) ─────────────────────────────────
run('T08', 'merge commit (non-linear)', 'merge_commit', dest => {
  cloneRepo(dest)
  const shas = x(`git -C "${dest}" log --reverse --format=%H`).split('\n')
  const mid = shas[19] // commit 20

  // Create a branch from commit 20 — only add a NEW file (no provenance.json conflict)
  x(`git -C "${dest}" checkout -b side ${mid}`)
  fs.writeFileSync(path.join(dest, 'side-only.json'), JSON.stringify({ id: 'side-branch-node' }, null, 2))
  x(`git -C "${dest}" add side-only.json`)
  gitS(dest, 'commit -S -m "side branch node"', guides[0])

  // Merge back to main — no conflict since side only added a new file
  x(`git -C "${dest}" checkout main`)
  x(`git -C "${dest}" -c user.name="Alice" -c user.email="alice@metadax.example" ` +
    `merge side --no-edit -m "merge side into main (non-linear)"`)
  // This creates a merge commit with two parents
})

// ─── T09: one commit missing provenance.json ────────────────────────────────
run('T09', 'missing provenance.json in one commit', 'missing_provenance', dest => {
  cloneRepo(dest)
  // Remove provenance.json and commit
  fs.writeFileSync(path.join(dest, 'node.json'), JSON.stringify({ id: 'node-no-prov', title: 'No provenance' }, null, 2))
  x(`git -C "${dest}" rm --cached provenance.json 2>/dev/null || true`)
  fs.unlinkSync(path.join(dest, 'provenance.json'))
  x(`git -C "${dest}" add node.json`)
  gitS(dest, 'commit -S -m "commit without provenance"', guides[2])
})

// ─── T10: provenance.guide_email does not match signer ──────────────────────
run('T10', 'provenance guide_email mismatch', 'provenance_signer_mismatch', dest => {
  cloneRepo(dest)
  // Write provenance that claims alice, but sign with bora
  const prov = {
    node_id: 'node-mismatch', guide: 'Alice', guide_email: 'alice@metadax.example',
    parent_node_id: 'node-040', timestamp: '2026-10-18T13:00:00Z'
  }
  fs.writeFileSync(path.join(dest, 'provenance.json'), JSON.stringify(prov, null, 2))
  fs.writeFileSync(path.join(dest, 'node.json'), JSON.stringify({ id: 'node-mismatch', title: 'Mismatch' }, null, 2))
  x(`git -C "${dest}" add .`)
  gitS(dest, 'commit -S -m "prov says alice, signed by bora"', guides[1]) // bora signs
})

// ─── T11: provenance.json is invalid JSON ───────────────────────────────────
run('T11', 'invalid JSON in provenance.json', 'invalid_provenance_json', dest => {
  cloneRepo(dest)
  fs.writeFileSync(path.join(dest, 'provenance.json'), '{ broken json !!!')
  fs.writeFileSync(path.join(dest, 'node.json'), JSON.stringify({ id: 'node-invalid-prov' }, null, 2))
  x(`git -C "${dest}" add .`)
  gitS(dest, 'commit -S -m "invalid provenance JSON"', guides[0])
})

// ─── T12: duplicate node_id across two commits ──────────────────────────────
run('T12', 'duplicate node_id', 'duplicate_node_id', dest => {
  cloneRepo(dest)
  // Add a commit that reuses node-001's ID
  const prov = {
    node_id: 'node-001', // duplicate!
    guide: 'Clem', guide_email: 'clem@metadax.example',
    parent_node_id: 'node-040', timestamp: '2026-10-18T14:00:00Z'
  }
  fs.writeFileSync(path.join(dest, 'provenance.json'), JSON.stringify(prov, null, 2))
  fs.writeFileSync(path.join(dest, 'node.json'), JSON.stringify({ id: 'node-001-dup', title: 'Duplicate ID' }, null, 2))
  x(`git -C "${dest}" add .`)
  gitS(dest, 'commit -S -m "duplicate node_id"', guides[2])
})

// ─── Summary ────────────────────────────────────────────────────────────────

const output = {
  run_date: '2026-10-18',
  clean_repo: cleanResult,
  false_alarms_on_clean: cleanResult.ok ? 0 : cleanResult.errors.length,
  cases
}

fs.writeFileSync(path.join(runDir, 'raw-results.json'), JSON.stringify(output, null, 2))

console.log('\nSummary:')
console.log(`  Clean repo: ${cleanResult.ok ? 'PASS (no false alarms)' : 'FAIL (false alarms: ' + cleanResult.errors.length + ')'}`)
const correct = cases.filter(c => c.correct).length
console.log(`  Detection: ${correct}/${cases.length} cases correctly handled`)
console.log(`  Results written to raw-results.json`)
