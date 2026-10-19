#!/usr/bin/env node
// Builds a course git repo of N signed commits (default 40).
// Each commit has node.json + provenance.json, signed with one of 3 guide keys.
// Usage: node build-course.js <rundir> [n_commits]
// Output: <rundir>/course-repo/  and  <rundir>/pinned_root.txt

'use strict'
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const runDir = process.argv[2] || '.'
const N = parseInt(process.argv[3] || '40', 10)

const sshsig = path.resolve(runDir, 'sshsig.js')
const keysDir = path.resolve(runDir, 'keys')
const allowedSigners = path.resolve(runDir, 'allowed_signers')
const repoDir = path.resolve(runDir, 'course-repo')

if (!fs.existsSync(path.join(keysDir, 'alice.pem'))) {
  console.error('Keys not found — run gen-keys.js first')
  process.exit(1)
}

// Remove existing repo if present
if (fs.existsSync(repoDir)) {
  fs.rmSync(repoDir, { recursive: true })
}
fs.mkdirSync(repoDir)

function git(cmd, opts = {}) {
  return execSync(`git -C "${repoDir}" ${cmd}`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    ...opts
  }).trim()
}

function gitSigned(cmd, guide, opts = {}) {
  return execSync(
    `git -C "${repoDir}" ` +
    `-c user.name="${guide.name}" ` +
    `-c user.email="${guide.email}" ` +
    `-c gpg.format=ssh ` +
    `-c user.signingkey="${path.join(keysDir, guide.slug + '.pem')}" ` +
    `-c gpg.ssh.program="${sshsig}" ` +
    cmd,
    {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: guide.name,
        GIT_AUTHOR_EMAIL: guide.email,
        GIT_COMMITTER_NAME: guide.name,
        GIT_COMMITTER_EMAIL: guide.email
      },
      ...opts
    }
  ).trim()
}

const guides = [
  { name: 'Alice', slug: 'alice', email: 'alice@metadax.example' },
  { name: 'Bora',  slug: 'bora',  email: 'bora@metadax.example'  },
  { name: 'Clem',  slug: 'clem',  email: 'clem@metadax.example'  }
]

git('init -b main')
git(`config gpg.ssh.allowedSignersFile "${allowedSigners}"`)

console.log(`Building ${N}-commit course repo...`)

for (let i = 1; i <= N; i++) {
  const guide = guides[(i - 1) % 3]
  const nodeId = `node-${String(i).padStart(3, '0')}`
  const parentNodeId = i === 1 ? null : `node-${String(i - 1).padStart(3, '0')}`

  const node = { id: nodeId, title: `Node ${i}`, content: `Learning content for node ${i}.` }
  const prov = {
    node_id: nodeId,
    guide: guide.name,
    guide_email: guide.email,
    parent_node_id: parentNodeId,
    timestamp: `2026-10-18T${String(i % 24).padStart(2, '0')}:00:00Z`
  }

  fs.writeFileSync(path.join(repoDir, 'node.json'), JSON.stringify(node, null, 2))
  fs.writeFileSync(path.join(repoDir, 'provenance.json'), JSON.stringify(prov, null, 2))

  git(`add node.json provenance.json`)
  gitSigned(`commit -S -m "add ${nodeId}"`, guide, {
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: guide.name,
      GIT_AUTHOR_EMAIL: guide.email,
      GIT_COMMITTER_NAME: guide.name,
      GIT_COMMITTER_EMAIL: guide.email,
      GIT_AUTHOR_DATE: `2026-10-18T${String(i % 24).padStart(2, '0')}:00:00Z`,
      GIT_COMMITTER_DATE: `2026-10-18T${String(i % 24).padStart(2, '0')}:00:00Z`
    }
  })
}

const allShas = git('log --reverse --format=%H').split('\n').filter(Boolean)
const pinnedRoot = allShas[0]
fs.writeFileSync(path.join(runDir, 'pinned_root.txt'), pinnedRoot + '\n')

console.log(`  commits: ${allShas.length}`)
console.log(`  pinned root: ${pinnedRoot}`)
console.log('Done.')
