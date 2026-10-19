'use strict';
// Bundle format: a manifest plus content-hash-named objects, delta-encoded
// against the learner's last acknowledged manifest.
//
// A cold bundle contains all objects. A delta bundle contains only objects
// absent from the acknowledged manifest — so duplicates collapse by hash and
// the wire size is strictly minimal.

const crypto = require('crypto');

function hashObject(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// Build a cold (first-sync) bundle.
// objects: { key: Buffer|string|object }
// Returns { manifest, objects: Map<hash,Buffer> }
function buildBundle(objects) {
  const manifestObj = { v: 1, objects: {} };
  const store = new Map();

  for (const [key, val] of Object.entries(objects)) {
    const buf = toBuf(val);
    const hash = hashObject(buf);
    manifestObj.objects[key] = { hash, size: buf.length };
    store.set(hash, buf);
  }

  const manifestBuf = toBuf(manifestObj);
  manifestObj.manifestHash = hashObject(manifestBuf);

  return { manifest: manifestObj, objects: store };
}

// Build a delta bundle against a previous manifest.
// prevManifest: the manifest object the learner last acknowledged.
// newObjects:   the full current set of objects for this learner.
// Returns { delta, objects: Map<hash,Buffer> } — delta.objects lists all keys;
// store contains only hashes the learner doesn't yet have.
function buildDelta(prevManifest, newObjects) {
  const prevHashes = new Set(
    Object.values(prevManifest.objects).map(o => o.hash)
  );
  const delta = { v: 1, prevManifest: prevManifest.manifestHash, objects: {} };
  const store = new Map();

  for (const [key, val] of Object.entries(newObjects)) {
    const buf = toBuf(val);
    const hash = hashObject(buf);
    delta.objects[key] = { hash, size: buf.length };
    if (!prevHashes.has(hash)) {
      store.set(hash, buf);
    }
  }

  return { delta, objects: store };
}

// Wire size of a bundle/delta envelope.
function envelopeBytes(bundleOrDelta) {
  const header = bundleOrDelta.manifest || bundleOrDelta.delta;
  let n = JSON.stringify(header).length;
  for (const buf of bundleOrDelta.objects.values()) n += buf.length;
  return n;
}

function toBuf(val) {
  if (Buffer.isBuffer(val)) return val;
  if (typeof val === 'string') return Buffer.from(val, 'utf8');
  return Buffer.from(JSON.stringify(val), 'utf8');
}

module.exports = { hashObject, buildBundle, buildDelta, envelopeBytes };
