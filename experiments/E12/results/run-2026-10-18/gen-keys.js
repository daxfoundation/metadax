#!/usr/bin/env node
// Generates ED25519 key pairs for 3 guides (PKCS8 PEM) and an allowed_signers file.
// Output: keys/{alice,bora,clem}.pem  and  allowed_signers
// Usage: node gen-keys.js <outdir>

'use strict'
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const outDir = process.argv[2] || '.'
fs.mkdirSync(path.join(outDir, 'keys'), { recursive: true })

const guides = [
  { name: 'Alice', slug: 'alice', email: 'alice@metadax.example' },
  { name: 'Bora',  slug: 'bora',  email: 'bora@metadax.example'  },
  { name: 'Clem',  slug: 'clem',  email: 'clem@metadax.example'  }
]

function sshStr(s) {
  const d = Buffer.isBuffer(s) ? s : Buffer.from(s)
  const b = Buffer.allocUnsafe(4 + d.length)
  b.writeUInt32BE(d.length, 0)
  d.copy(b, 4)
  return b
}

function pubWire(publicKey) {
  const spki = publicKey.export({ type: 'spki', format: 'der' })
  const raw = spki.slice(-32)
  return Buffer.concat([sshStr('ssh-ed25519'), sshStr(raw)])
}

const allowedLines = []

for (const g of guides) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519')
  const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' })
  fs.writeFileSync(path.join(outDir, 'keys', g.slug + '.pem'), privPem, { mode: 0o600 })
  const wire = pubWire(publicKey)
  allowedLines.push(`${g.email} ssh-ed25519 ${wire.toString('base64')}`)
  console.log(`  generated key for ${g.name} (${g.email})`)
}

fs.writeFileSync(path.join(outDir, 'allowed_signers'), allowedLines.join('\n') + '\n')
console.log(`  wrote allowed_signers (${guides.length} entries)`)
