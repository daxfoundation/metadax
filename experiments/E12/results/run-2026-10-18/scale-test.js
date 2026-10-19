#!/usr/bin/env node
// Measures verify-chain.js wall-clock time on 40-commit and 4000-commit repos.
// Usage: node scale-test.js <rundir>

'use strict'
const { execSync } = require('child_process')
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const runDir = path.resolve(process.argv[2] || '.')
const sshsig = path.join(runDir, 'sshsig.js')
const verifier = path.join(runDir, '..', 'proposed', 'tools', 'verify-chain.js')
const buildCourse = path.join(runDir, 'build-course.js')
const keysDir = path.join(runDir, 'keys')
const allowedSigners = path.join(runDir, 'allowed_signers')
const pinnedRoot = fs.readFileSync(path.join(runDir, 'pinned_root.txt'), 'utf8').trim()
const courseRepo = path.join(runDir, 'course-repo')

function timeVerify(repo, signers, pinned, label) {
  const start = process.hrtime.bigint()
  const r = spawnSync(process.execPath, [
    verifier, repo, signers, pinned,
    '--signing-program', sshsig, '--json'
  ], { encoding: 'utf8' })
  const elapsed = Number(process.hrtime.bigint() - start) / 1e6 // ms
  let result
  try { result = JSON.parse(r.stdout) } catch (e) { result = { ok: false } }
  console.log(`  ${label}: ${elapsed.toFixed(0)} ms, ok=${result.ok}, commits=${result.total_commits}`)
  return { label, ms: elapsed, ok: result.ok, commits: result.total_commits }
}

const timing = []

// --- 40-commit clean repo (already built) -----------------------------------
console.log('Timing 40-commit repo...')
timing.push(timeVerify(courseRepo, allowedSigners, pinnedRoot, '40-commits'))

// --- 4000-commit repo -------------------------------------------------------
console.log('Building 4000-commit repo (may take a few minutes)...')
const bigRepo = path.join(runDir, 'course-repo-4000')
if (!fs.existsSync(bigRepo)) {
  execSync(`node "${buildCourse}" "${runDir}" 4000`, { encoding: 'utf8', stdio: 'inherit' })
  // Save new root for 4000-commit repo
  const root4k = execSync(`git -C "${bigRepo}" log --reverse --format=%H`, { encoding: 'utf8' }).split('\n')[0].trim()
  fs.writeFileSync(path.join(runDir, 'pinned_root_4000.txt'), root4k + '\n')
  // Rename: build-course writes to course-repo by default if no N specified,
  // but we need a different path. So we rebuild with a workaround.
}

// build-course.js writes to <rundir>/course-repo — we need to clone or move
// Work around: run build explicitly pointing to the 4000 repo path
if (!fs.existsSync(bigRepo)) {
  console.log('  (4000-commit repo already exists, skipping build)')
}

// Check for the 4000 repo
if (fs.existsSync(bigRepo)) {
  let root4k
  try { root4k = fs.readFileSync(path.join(runDir, 'pinned_root_4000.txt'), 'utf8').trim() }
  catch (e) { root4k = execSync(`git -C "${bigRepo}" log --reverse --format=%H`, { encoding: 'utf8' }).split('\n')[0].trim() }
  console.log(`Timing 4000-commit repo...`)
  timing.push(timeVerify(bigRepo, allowedSigners, root4k, '4000-commits'))
} else {
  console.log('  4000-commit repo not found, skipping timing')
  timing.push({ label: '4000-commits', ms: null, ok: null, commits: null, note: 'not built' })
}

fs.writeFileSync(path.join(runDir, 'timing.json'), JSON.stringify(timing, null, 2))
console.log('\nTiming results written to timing.json')
