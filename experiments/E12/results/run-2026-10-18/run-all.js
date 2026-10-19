#!/usr/bin/env node
// Orchestrates the full E12 run: keygen → build course → tamper suite → scale test.
// Usage: node run-all.js

'use strict'
const { execSync } = require('child_process')
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const runDir = path.dirname(path.resolve(process.argv[1]))
const buildCourse = path.join(runDir, 'build-course.js')
const sshsig = path.join(runDir, 'sshsig.js')
const verifier = path.join(runDir, '..', 'proposed', 'tools', 'verify-chain.js')
const allowedSigners = path.join(runDir, 'allowed_signers')

function step(name) { console.log(`\n=== ${name} ===`) }

function node(script, ...args) {
  const r = spawnSync(process.execPath, [script, ...args], {
    encoding: 'utf8', stdio: 'inherit'
  })
  if (r.status !== 0 && r.status !== null) {
    console.error(`FAILED: ${path.basename(script)} (status ${r.status})`)
    process.exit(r.status || 1)
  }
}

step('1. Generate keys')
node(path.join(runDir, 'gen-keys.js'), runDir)

step('2. Build 40-commit course repo')
// build-course.js writes to <runDir>/course-repo
node(buildCourse, runDir, '40')

step('3. Tamper suite')
node(path.join(runDir, 'tamper-suite.js'), runDir)

step('4. Build 4000-commit repo (for scale test)')
const bigRepoPath = path.join(runDir, 'course-repo-4000')
if (!fs.existsSync(bigRepoPath)) {
  // We need build-course.js to write to course-repo-4000.
  // It always writes to <rundir>/course-repo. Use a workaround:
  // temporarily rename course-repo, build 4000, then rename back.
  const smallRepo = path.join(runDir, 'course-repo')
  const smallRepoBackup = path.join(runDir, 'course-repo-40')
  if (!fs.existsSync(smallRepoBackup)) {
    fs.renameSync(smallRepo, smallRepoBackup)
  } else if (fs.existsSync(smallRepo)) {
    fs.rmSync(smallRepo, { recursive: true })
  }
  node(buildCourse, runDir, '4000')
  fs.renameSync(smallRepo, bigRepoPath)
  // Save root
  const root4k = execSync(`git -C "${bigRepoPath}" log --reverse --format=%H`, { encoding: 'utf8' }).split('\n')[0].trim()
  fs.writeFileSync(path.join(runDir, 'pinned_root_4000.txt'), root4k + '\n')
  // Restore 40-commit repo
  if (fs.existsSync(smallRepoBackup)) {
    fs.renameSync(smallRepoBackup, smallRepo)
  }
} else {
  console.log('  (4000-commit repo already exists, skipping)')
}

step('5. Scale timing')
const courseRepo = path.join(runDir, 'course-repo')
const pinnedRoot = fs.readFileSync(path.join(runDir, 'pinned_root.txt'), 'utf8').trim()
const pinnedRoot4k = fs.readFileSync(path.join(runDir, 'pinned_root_4000.txt'), 'utf8').trim()

function timeVerify(repo, signers, pinned, label) {
  const start = process.hrtime.bigint()
  const r = spawnSync(process.execPath, [
    verifier, repo, signers, pinned,
    '--signing-program', sshsig, '--json'
  ], { encoding: 'utf8' })
  const elapsed = Number(process.hrtime.bigint() - start) / 1e6
  let result
  try { result = JSON.parse(r.stdout) } catch (e) { result = { ok: false } }
  console.log(`  ${label}: ${elapsed.toFixed(0)} ms, ok=${result.ok}, commits=${result.total_commits}`)
  return { label, ms: Math.round(elapsed), ok: result.ok, commits: result.total_commits }
}

const timing = []
console.log('Timing 40-commit repo:')
timing.push(timeVerify(courseRepo, allowedSigners, pinnedRoot, '40-commits'))
console.log('Timing 4000-commit repo:')
timing.push(timeVerify(bigRepoPath, allowedSigners, pinnedRoot4k, '4000-commits'))
fs.writeFileSync(path.join(runDir, 'timing.json'), JSON.stringify(timing, null, 2))

step('Done')
const rawResults = JSON.parse(fs.readFileSync(path.join(runDir, 'raw-results.json'), 'utf8'))
const correct = rawResults.cases.filter(c => c.correct).length
console.log(`  Tamper detection: ${correct}/${rawResults.cases.length}`)
console.log(`  False alarms on clean: ${rawResults.false_alarms_on_clean}`)
console.log(`  Timing: ${JSON.stringify(timing.map(t => t.label + ':' + t.ms + 'ms'))}`)
