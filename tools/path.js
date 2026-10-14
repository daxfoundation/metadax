#!/usr/bin/env node
'use strict';
// path.js -- MetaDAX id/slug/path helpers (SCHEMAS section 1, ID-FORMAT v0.3).
// Zero deps beyond node's crypto.
//
// v0.3: a follow-up id is a short opaque id ("n_" + 26 Crockford-base32 chars,
// 128 random bits) minted by this stamping step -- NOT a breadcrumb. Depth is a
// stored field equal to parent.depth + 1; it is never derived by counting "/".
// A legacy parser (depthOfV02 / ancestorIdsV02) still reads v0.2 breadcrumb ids.
//
// CLI:
//   node tools/path.js slug "<title>"
//   node tools/path.js mint                         # one fresh opaque node id
//   node tools/path.js child <parent-id> "<title>" --course <dir>
//   node tools/path.js ancestors <node-id> --course <dir> [--from-node <file>]
//   node tools/path.js depth <id> [--parent-depth <n>]

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const lib = require('./lib.js');

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'of', 'in', 'on', 'for', 'to', 'and', 'or', 'with',
  'how', 'what', 'why', 'which', 'does', 'do', 'is', 'are', 'by', 'from',
  'its', 'their',
]);

const MAX_SLUG = 32;
// v0.2 carried MAX_ID = 200 (the breadcrumb cap). v0.3 removes it: the opaque
// id is fixed-length and encodes nothing about depth, so there is no cap.

// Crockford base32 alphabet (lowercase): 0-9 a-z minus i, l, o, u.
const CROCKFORD = '0123456789abcdefghjkmnpqrstvwxyz';
const ID_PREFIX = 'n_';
const ID_CHARS = 26; // 26 * 5 = 130 bits >= 128 bits of entropy
const OPAQUE_ID_RE = /^n_[0-9a-hjkmnp-tv-z]{26}$/;
const OBJECTIVE_ID_RE = /^L\d\d\.M\d\d\.O\d\d$/;

// SCHEMAS section 1 slug rule. The slug is a display-only field in v0.3; it is
// no longer part of identity, so no collision suffix is required for identity.
function slug(title) {
  const lower = String(title).toLowerCase();
  // Keep only ASCII letters, digits and spaces; drop every other character.
  let kept = '';
  for (const ch of lower) {
    const o = ch.codePointAt(0);
    const isAsciiAlnum = (o >= 0x30 && o <= 0x39) || (o >= 0x61 && o <= 0x7a);
    if (isAsciiAlnum || ch === ' ') kept += ch;
  }
  let words = kept.split(/\s+/).filter(function (w) {
    return w && !STOP_WORDS.has(w);
  });
  words = words.slice(0, 5);
  return fit(words, MAX_SLUG);
}

// Join words with '-' keeping only whole words that fit within limit.
function fit(words, limit) {
  let result = '';
  for (const w of words) {
    const cand = result ? result + '-' + w : w;
    if (cand.length <= limit) {
      result = cand;
    } else {
      if (!result) return w.slice(0, limit); // single leading long word: hard cut
      break;
    }
  }
  return result || 'node';
}

// Mint a fresh opaque node id. 128 random bits, big-endian, encoded as 26
// Crockford base32 chars (the low 2 bits of the 130-bit field are zero).
function mintNodeId() {
  const bytes = crypto.randomBytes(16); // 128 bits
  let big = 0n;
  for (const b of bytes) big = (big << 8n) | BigInt(b);
  big <<= 2n; // pad 128 -> 130 bits (26 * 5)
  let out = '';
  for (let i = 0; i < ID_CHARS; i++) {
    const shift = BigInt((ID_CHARS - 1 - i) * 5);
    out += CROCKFORD[Number((big >> shift) & 31n)];
  }
  return ID_PREFIX + out;
}

function isOpaqueId(id) {
  return OPAQUE_ID_RE.test(String(id));
}

function isObjectiveId(id) {
  return OBJECTIVE_ID_RE.test(String(id));
}

// A v0.2 id is a breadcrumb: an objective id followed by one or more "/slug".
function isV02Id(id) {
  return String(id).indexOf('/') >= 0;
}

// Legacy (v0.2) depth: 1 + count("/") in the breadcrumb id. v0.3 ids carry no
// slashes, so this only applies to legacy data.
function depthOfV02(id) {
  return 1 + (String(id).split('/').length - 1);
}

// Legacy (v0.2) ancestry derived from the breadcrumb id: every "/"-prefix.
function ancestorIdsV02(nodeId) {
  const parts = String(nodeId).split('/');
  const ids = [];
  for (let i = 1; i < parts.length; i++) {
    ids.push(parts.slice(0, i).join('/'));
  }
  return ids;
}

// Depth in v0.3 is a stored field = parent.depth + 1. Pass parentDepth for a
// v0.3 node. For a legacy breadcrumb id (or when parentDepth is absent), fall
// back to the v0.2 slash count so old tooling keeps working.
function depth(nodeId, parentDepth) {
  if (parentDepth !== undefined && parentDepth !== null) {
    return Number(parentDepth) + 1;
  }
  if (isObjectiveId(nodeId)) return 1;
  if (isV02Id(nodeId)) return depthOfV02(nodeId);
  // An opaque v0.3 id reveals nothing: depth must come from the parent.
  throw new Error('v0.3 opaque id has no self-describing depth; pass --parent-depth');
}

function dirExists(nodesDir, nodeId) {
  const p = path.join(nodesDir, String(nodeId));
  try {
    return fs.statSync(p).isDirectory();
  } catch (e) {
    return false;
  }
}

// New child id (v0.3): an opaque id, independent of parent/slug/depth. A
// collision is astronomically unlikely (128 bits); if one exists on disk we
// simply re-mint. No length cap, no breadcrumb.
function childId(parentId, title, courseDir) {
  void title; // title no longer feeds the id; see slug() for the display field
  const nodesDir = courseDir ? path.join(courseDir, 'nodes') : null;
  for (;;) {
    const id = mintNodeId();
    if (!nodesDir || !dirExists(nodesDir, id)) return id;
  }
}

function summaryString(summary) {
  if (Array.isArray(summary)) return summary.map(String).join(' ');
  return summary == null ? '' : String(summary);
}

// PATH array root->parent: {id, title, canonical_question, summary(string)}.
// v0.3: the authoritative ancestry is the registry parent_id chain. Prefer
// --from-node (the node's own path[] array) or a registry walk. The id-derived
// walk only works for legacy v0.2 breadcrumb ids.
function ancestors(nodeId, courseDir, fromNodeFile) {
  if (fromNodeFile) {
    const node = lib.readJson(fromNodeFile);
    return (node.path || []).map(function (e) {
      return {
        id: e.id,
        title: e.title,
        canonical_question: e.canonical_question || '',
        summary: summaryString(e.summary),
      };
    });
  }
  if (!isV02Id(nodeId)) {
    // v0.3: ancestry is the registry parent_id chain. Walk each node's node.json
    // (flat nodes/<id>/ layout) from nodeId up to the root (parent_id null),
    // collecting root->parent (the node itself is excluded; buildPath appends it).
    const chain = [];
    let cur = nodeId;
    let guard = 0;
    while (cur && guard++ < 1000) {
      const np = path.join(lib.nodeDir(courseDir, cur), 'node.json');
      if (!fs.existsSync(np)) break;
      const n = lib.readJson(np);
      if (cur !== nodeId) {
        chain.unshift({
          id: n.id || cur,
          title: n.title || '',
          canonical_question: n.canonical_question || '',
          summary: summaryString(n.summary),
        });
      }
      cur = n.parent_id != null ? n.parent_id : null;
    }
    return chain;
  }
  return ancestorIdsV02(nodeId).map(function (aid) {
    const n = lib.readJson(path.join(lib.nodeDir(courseDir, aid), 'node.json'));
    return {
      id: n.id || aid,
      title: n.title || '',
      canonical_question: n.canonical_question || '',
      summary: summaryString(n.summary),
    };
  });
}

module.exports = {
  slug,
  mintNodeId,
  childId,
  ancestors,
  depth,
  isOpaqueId,
  isObjectiveId,
  isV02Id,
  depthOfV02,
  ancestorIdsV02,
};

function getOpt(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
}

function main(argv) {
  const cmd = argv[0];
  if (cmd === 'slug') {
    if (argv[1] === undefined) throw new Error('slug needs a title');
    process.stdout.write(slug(argv[1]) + '\n');
    return 0;
  }
  if (cmd === 'mint') {
    process.stdout.write(mintNodeId() + '\n');
    return 0;
  }
  if (cmd === 'child') {
    const parentId = argv[1];
    const title = argv[2];
    const course = getOpt(argv, '--course');
    if (!parentId || title === undefined) {
      throw new Error('child needs <parent-id> "<title>" [--course <dir>]');
    }
    process.stdout.write(childId(parentId, title, course) + '\n');
    return 0;
  }
  if (cmd === 'ancestors') {
    const nodeId = argv[1];
    const course = getOpt(argv, '--course');
    const fromNode = getOpt(argv, '--from-node');
    if (!fromNode && !course) throw new Error('ancestors needs --course or --from-node');
    const arr = ancestors(nodeId, course, fromNode);
    process.stdout.write(JSON.stringify(arr, null, 2) + '\n');
    return 0;
  }
  if (cmd === 'depth') {
    if (!argv[1]) throw new Error('depth needs an id');
    const pd = getOpt(argv, '--parent-depth');
    process.stdout.write(String(depth(argv[1], pd)) + '\n');
    return 0;
  }
  process.stderr.write('usage: node tools/path.js slug|mint|child|ancestors|depth ...\n');
  return 2;
}

if (require.main === module) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (e) {
    process.stderr.write('error: ' + e.message + '\n');
    process.exit(1);
  }
}
