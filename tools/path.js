#!/usr/bin/env node
'use strict';
// path.js -- MetaDAX id/slug/path helpers (SCHEMAS section 1). Zero deps.
//
// CLI:
//   node tools/path.js slug "<title>"
//   node tools/path.js child <parent-id> "<title>" --course <dir>
//   node tools/path.js ancestors <node-id> --course <dir> [--from-node <file>]
//   node tools/path.js depth <id>

const fs = require('fs');
const path = require('path');
const lib = require('./lib.js');

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'of', 'in', 'on', 'for', 'to', 'and', 'or', 'with',
  'how', 'what', 'why', 'which', 'does', 'do', 'is', 'are', 'by', 'from',
  'its', 'their',
]);

const MAX_SLUG = 32;
const MAX_ID = 200;

// SCHEMAS section 1 slug rule.
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

function depth(nodeId) {
  return lib.depthOf(nodeId);
}

function dirExists(nodesDir, nodeId) {
  const p = path.join(nodesDir, nodeId.split('/').join(path.sep));
  try {
    return fs.statSync(p).isDirectory();
  } catch (e) {
    return false;
  }
}

// New child id: 200-char cap by dropping trailing slug words, then collision
// suffix -2, -3, ... against existing nodes/ directories.
function childId(parentId, title, courseDir) {
  let words = slug(title).split('-');
  while (words.length) {
    const candidate = parentId + '/' + words.join('-');
    if (candidate.length <= MAX_ID) break;
    words = words.slice(0, -1);
  }
  if (!words.length) {
    throw new Error('id would exceed ' + MAX_ID + ' chars even with a one-word slug');
  }
  let baseSlug = words.join('-');
  const nodesDir = path.join(courseDir, 'nodes');
  const first = parentId + '/' + baseSlug;
  if (!dirExists(nodesDir, first)) return first;
  let n = 2;
  for (;;) {
    let suffixed = parentId + '/' + baseSlug + '-' + n;
    while (suffixed.length > MAX_ID && baseSlug) {
      baseSlug = baseSlug.includes('-')
        ? baseSlug.slice(0, baseSlug.lastIndexOf('-'))
        : '';
      suffixed = parentId + '/' + baseSlug + '-' + n;
    }
    if (!dirExists(nodesDir, suffixed)) return suffixed;
    n += 1;
  }
}

function summaryString(summary) {
  if (Array.isArray(summary)) return summary.map(String).join(' ');
  return summary == null ? '' : String(summary);
}

function ancestorIds(nodeId) {
  const parts = nodeId.split('/');
  const ids = [];
  for (let i = 1; i < parts.length; i++) {
    ids.push(parts.slice(0, i).join('/'));
  }
  return ids;
}

// PATH array root->parent: {id, title, canonical_question, summary(string)}.
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
  return ancestorIds(nodeId).map(function (aid) {
    const n = lib.readJson(path.join(lib.nodeDir(courseDir, aid), 'node.json'));
    return {
      id: n.id || aid,
      title: n.title || '',
      canonical_question: n.canonical_question || '',
      summary: summaryString(n.summary),
    };
  });
}

module.exports = { slug, childId, ancestors, depth };

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
  if (cmd === 'child') {
    const parentId = argv[1];
    const title = argv[2];
    const course = getOpt(argv, '--course');
    if (!parentId || title === undefined || !course) {
      throw new Error('child needs <parent-id> "<title>" --course <dir>');
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
    process.stdout.write(String(depth(argv[1])) + '\n');
    return 0;
  }
  process.stderr.write('usage: node tools/path.js slug|child|ancestors|depth ...\n');
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
