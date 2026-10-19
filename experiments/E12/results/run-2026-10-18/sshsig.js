#!/usr/bin/env node
// Minimal drop-in for ssh-keygen SSH signing operations (git SSH signing).
// Keys are PKCS8 PEM; signatures use the SSHSIG wire format.
//
// Implements exactly what git 2.39 calls:
//   prog -Y sign -n git -f <privkey.pem> <contentfile>   → writes <contentfile>.sig
//   prog -Y find-principals -f <allowed_signers> -s <sigfile>
//                                                        → prints principals to stdout
//   prog -Y verify -n git -f <allowed_signers> -I <id> -s <sigfile>
//                                                        → stdin=content; exit 0=ok

'use strict'
const crypto = require('crypto')
const fs = require('fs')

// --- wire helpers -----------------------------------------------------------

function str(s) {
  const d = Buffer.isBuffer(s) ? s : Buffer.from(s)
  const b = Buffer.allocUnsafe(4 + d.length)
  b.writeUInt32BE(d.length, 0)
  d.copy(b, 4)
  return b
}
function u32(n) {
  const b = Buffer.allocUnsafe(4); b.writeUInt32BE(n, 0); return b
}
function readStr(buf, off) {
  const len = buf.readUInt32BE(off)
  return { value: buf.slice(off + 4, off + 4 + len), next: off + 4 + len }
}

// --- key helpers ------------------------------------------------------------

function pubWireFromPrivPem(privatePem) {
  const priv = crypto.createPrivateKey(privatePem)
  const pub = crypto.createPublicKey(priv)
  const spki = pub.export({ type: 'spki', format: 'der' })
  const rawPub = spki.slice(-32)
  return Buffer.concat([str('ssh-ed25519'), str(rawPub)])
}

function pubKeyFromWire(pubWire) {
  let off = 0
  const algR = readStr(pubWire, off); off = algR.next
  const rawR = readStr(pubWire, off)
  const spki = Buffer.concat([
    Buffer.from('302a300506032b6570032100', 'hex'),
    rawR.value
  ])
  return crypto.createPublicKey({ key: spki, type: 'spki', format: 'der' })
}

// --- SSHSIG sign ------------------------------------------------------------

function signFile(inputFile, privatePem, namespace) {
  const content = fs.readFileSync(inputFile)
  const priv = crypto.createPrivateKey(privatePem)
  const pubWire = pubWireFromPrivPem(privatePem)
  const hashAlg = 'sha512'
  const hash = crypto.createHash(hashAlg).update(content).digest()
  const tbs = Buffer.concat([
    Buffer.from('SSHSIG'), u32(1),
    str(namespace), str(''), str(hashAlg), str(hash)
  ])
  const sigBytes = crypto.sign(null, tbs, priv)
  const sigWire = Buffer.concat([str('ssh-ed25519'), str(sigBytes)])
  const blob = Buffer.concat([
    Buffer.from('SSHSIG'), u32(1),
    str(pubWire), str(namespace), str(''), str(hashAlg), str(sigWire)
  ])
  const pem = '-----BEGIN SSH SIGNATURE-----\n' +
    blob.toString('base64') + '\n-----END SSH SIGNATURE-----\n'
  fs.writeFileSync(inputFile + '.sig', pem)
}

// --- SSHSIG parse -----------------------------------------------------------

function parseSig(sigPem) {
  const b64 = sigPem.replace(
    /-----BEGIN SSH SIGNATURE-----|-----END SSH SIGNATURE-----|[\n\r]/g, '')
  const blob = Buffer.from(b64, 'base64')
  if (blob.slice(0, 6).toString() !== 'SSHSIG') throw new Error('bad magic')
  let off = 6
  off += 4 // version
  const pubWireR = readStr(blob, off); off = pubWireR.next
  const nsR = readStr(blob, off); off = nsR.next
  readStr(blob, off); off = readStr(blob, off).next // reserved
  const algR = readStr(blob, off); off = algR.next
  const sigWireR = readStr(blob, off)
  return {
    pubWire: pubWireR.value,
    namespace: nsR.value.toString(),
    hashAlg: algR.value.toString(),
    sigWire: sigWireR.value
  }
}

// --- find-principals --------------------------------------------------------

function findPrincipals(sigFile, allowedSignersPath) {
  const sigPem = fs.readFileSync(sigFile, 'utf8')
  const { pubWire } = parseSig(sigPem)
  const pubWireB64 = pubWire.toString('base64')
  const lines = fs.readFileSync(allowedSignersPath, 'utf8')
    .split('\n').filter(l => l.trim() && !l.startsWith('#'))
  const principals = []
  for (const line of lines) {
    const parts = line.trim().split(/\s+/)
    if (parts.length < 3) continue
    if (parts[1] === 'ssh-ed25519' && parts[2] === pubWireB64) principals.push(parts[0])
  }
  return principals
}

// --- verify -----------------------------------------------------------------

function verifySig(content, sigFile, allowedSignersPath, identity, namespace) {
  const sigPem = fs.readFileSync(sigFile, 'utf8')
  const { pubWire, namespace: sigNs, hashAlg, sigWire } = parseSig(sigPem)
  if (sigNs !== namespace) throw new Error(`namespace mismatch: ${sigNs} vs ${namespace}`)

  const hash = crypto.createHash(hashAlg).update(content).digest()
  const tbs = Buffer.concat([
    Buffer.from('SSHSIG'), u32(1),
    str(namespace), str(''), str(hashAlg), str(hash)
  ])
  const pubKey = pubKeyFromWire(pubWire)
  let soff = 0
  readStr(sigWire, soff); soff = readStr(sigWire, soff).next
  const sigBytesR = readStr(sigWire, soff)
  if (!crypto.verify(null, tbs, pubKey, sigBytesR.value)) throw new Error('bad signature')

  const pubWireB64 = pubWire.toString('base64')
  const lines = fs.readFileSync(allowedSignersPath, 'utf8')
    .split('\n').filter(l => l.trim() && !l.startsWith('#'))
  let found = false
  for (const line of lines) {
    const parts = line.trim().split(/\s+/)
    if (parts.length < 3) continue
    if (parts[0] === identity && parts[1] === 'ssh-ed25519' && parts[2] === pubWireB64) {
      found = true; break
    }
  }
  if (!found) throw new Error(`${identity} not in allowed_signers with this key`)

  const spki = pubKey.export({ type: 'spki', format: 'der' })
  const fp = crypto.createHash('sha256').update(spki.slice(-32)).digest('base64')
  return `Good "git" signature for ${identity} with ED25519 key SHA256:${fp}`
}

// --- arg parsing & dispatch -------------------------------------------------

const argv = process.argv.slice(2)
const p = {}
const positional = []
let i = 0
while (i < argv.length) {
  if (argv[i] === '-Y') { p.Y = argv[++i]; i++ }
  else if (argv[i] === '-f') { p.f = argv[++i]; i++ }
  else if (argv[i] === '-n') { p.n = argv[++i]; i++ }
  else if (argv[i] === '-I') { p.I = argv[++i]; i++ }
  else if (argv[i] === '-s') { p.s = argv[++i]; i++ }
  else if (argv[i] === '-O' && i + 1 < argv.length && !argv[i + 1].startsWith('-')) { i += 2 }
  else if (argv[i].startsWith('-O')) { i++ } // -Ofoo=bar
  else if (!argv[i].startsWith('-')) { positional.push(argv[i]); i++ }
  else { i++ }
}

const ns = p.n || 'git'

if (p.Y === 'sign') {
  const inputFile = positional[positional.length - 1]
  if (!inputFile) { process.stderr.write('sign: no input file\n'); process.exit(1) }
  try {
    const privPem = fs.readFileSync(p.f, 'utf8')
    signFile(inputFile, privPem, ns)
  } catch (e) {
    process.stderr.write('sign error: ' + e.message + '\n'); process.exit(1)
  }

} else if (p.Y === 'find-principals') {
  try {
    const principals = findPrincipals(p.s, p.f)
    if (principals.length === 0) {
      process.stderr.write('No principals found\n'); process.exit(1)
    }
    process.stdout.write(principals.join('\n') + '\n')
    process.exit(0)
  } catch (e) {
    process.stderr.write('find-principals error: ' + e.message + '\n'); process.exit(1)
  }

} else if (p.Y === 'verify') {
  const chunks = []
  process.stdin.on('data', c => chunks.push(c))
  process.stdin.on('end', () => {
    try {
      const content = Buffer.concat(chunks)
      const msg = verifySig(content, p.s, p.f, p.I, ns)
      process.stderr.write(msg + '\n')
      process.exit(0)
    } catch (e) {
      process.stderr.write('Signature verification failed: ' + e.message + '\n')
      process.exit(1)
    }
  })

} else if (p.Y === 'check-novalidate') {
  const chunks = []
  process.stdin.on('data', c => chunks.push(c))
  process.stdin.on('end', () => {
    try {
      parseSig(fs.readFileSync(p.s, 'utf8'))
      process.exit(0)
    } catch (e) {
      process.stderr.write('Invalid structure: ' + e.message + '\n'); process.exit(1)
    }
  })

} else {
  process.stderr.write('Usage: sshsig.js -Y sign|find-principals|verify|check-novalidate ...\n')
  process.exit(1)
}
