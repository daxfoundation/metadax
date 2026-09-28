#!/usr/bin/env node
'use strict';
// apply_packet.js -- apply an S-9 COMMIT PACKET to a course or learner repo.
// Zero dependencies, Node >= 18, CommonJS. Never writes outside the target repo
// roots. Requires the Part A stamp.js for the --stamp step.
//
//   node tools/apply_packet.js <packet.json | -> --course <dir> --learner <dir>
//     [--stamp] [--dry-run]
//
// Rules (SPEC S-9):
//   - op "create" fails if the path exists (no overwrite).
//   - op "update" requires the path to exist.
//   - op "append" appends an entry to a registry module file's nodes[],
//     creating the module file and its index entry when missing.
//   - refuses any path outside the allowed roots:
//       course repo:  nodes/, registry/, course.json
//       learner repo: profile.json, progress/, sessions/, manifests/, nodes/
//   - refuses a node id whose prefix is not parent_id + "/".
//   - refuses ids over 200 chars.
//   - refuses any "@" in a learner id field.
//   - stamps written files by type when --stamp is given.
// Prints the written paths.

const fs = require('fs');
const path = require('path');
const lib = require('./lib.js');
const stamp = require('./stamp.js');

const MAX_ID = 200;
const COURSE_ROOTS = ['nodes/', 'registry/'];
const COURSE_FILES = ['course.json'];
const LEARNER_ROOTS = ['progress/', 'sessions/', 'manifests/', 'nodes/'];
const LEARNER_FILES = ['profile.json'];
const LEARNER_ID_FIELDS = ['learner_id', 'created_by', 'author_id'];

function PacketError(msg) {
  const e = new Error(msg);
  e.name = 'PacketError';
  e.packet = true;
  return e;
}

function normPath(p) {
  const s = String(p).replace(/\\/g, '/');
  if (s.startsWith('/') || s.split('/').indexOf('..') >= 0) {
    throw PacketError('unsafe path: ' + p);
  }
  return s;
}

function checkRoot(rel, repo) {
  if (repo === 'course') {
    if (COURSE_FILES.indexOf(rel) >= 0
      || COURSE_ROOTS.some(function (r) { return rel.indexOf(r) === 0; })) return;
    throw PacketError('path outside course repo roots: ' + rel);
  }
  if (repo === 'learner') {
    if (LEARNER_FILES.indexOf(rel) >= 0
      || LEARNER_ROOTS.some(function (r) { return rel.indexOf(r) === 0; })) return;
    throw PacketError('path outside learner repo roots: ' + rel);
  }
  throw PacketError('unknown repo: ' + repo);
}

function checkNoAt(content) {
  if (!content || typeof content !== 'object') return;
  for (const field of LEARNER_ID_FIELDS) {
    const v = content[field];
    if (typeof v === 'string' && v.indexOf('@') >= 0) {
      throw PacketError('"@" in learner id field ' + field + ': ' + v);
    }
  }
  const cb = content.created_by;
  if (cb && typeof cb === 'object' && typeof cb.id === 'string' && cb.id.indexOf('@') >= 0) {
    throw PacketError('"@" in created_by.id: ' + cb.id);
  }
}

function checkNodeId(content) {
  if (!content || typeof content !== 'object') return;
  const nid = content.id;
  if (typeof nid !== 'string') return;
  if (nid.length > MAX_ID) throw PacketError('id over ' + MAX_ID + ' chars: ' + nid);
  const parent = content.parent_id;
  if (parent && nid.indexOf('/') >= 0 && nid.indexOf(parent + '/') !== 0) {
    throw PacketError('id ' + JSON.stringify(nid) + ' not prefixed by parent_id '
      + JSON.stringify(parent) + ' + "/"');
  }
}

function baseDir(repo, courseDir, learnerDir) {
  if (repo === 'course') {
    if (!courseDir) throw PacketError('packet repo is "course" but --course was not given');
    return courseDir;
  }
  if (repo === 'learner') {
    if (!learnerDir) throw PacketError('packet repo is "learner" but --learner was not given');
    return learnerDir;
  }
  throw PacketError('unknown repo: ' + repo);
}

function writeJson(p, obj, dryRun) {
  if (dryRun) return;
  fs.mkdirSync(path.dirname(p) || '.', { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf-8');
}

function courseIdOf(base) {
  const cpath = path.join(base, 'course.json');
  if (fs.existsSync(cpath)) {
    try { return lib.readJson(cpath).id || ''; } catch (e) { /* ignore */ }
  }
  return '';
}

function addIndexEntry(base, moduleId, moduleRel, dryRun) {
  const indexPath = path.join(base, 'registry', 'index.json');
  let index;
  if (fs.existsSync(indexPath)) {
    index = lib.readJson(indexPath);
  } else {
    index = {
      schema: 'metadax.registry-index/0.2',
      course_id: courseIdOf(base),
      updated_at: 'runtime',
      modules: [],
    };
  }
  if (!index.modules) index.modules = [];
  if (!index.modules.some(function (m) { return m.id === moduleId; })) {
    index.modules.push({
      id: moduleId,
      file: moduleRel,
      node_count: 0,
      updated_at: 'runtime',
    });
  }
  writeJson(indexPath, index, dryRun);
}

function appendRegistry(abspath, base, rel, entry, dryRun) {
  const moduleId = path.basename(rel).replace(/\.json$/, '');
  let reg;
  if (fs.existsSync(abspath)) {
    reg = lib.readJson(abspath);
  } else {
    reg = {
      schema: 'metadax.registry/0.2',
      course_id: courseIdOf(base),
      module_id: moduleId,
      updated_at: 'runtime',
      nodes: [],
    };
    addIndexEntry(base, moduleId, rel, dryRun);
  }
  if (!reg.nodes) reg.nodes = [];
  const eid = entry && typeof entry === 'object' ? entry.id : null;
  reg.nodes = reg.nodes.filter(function (n) { return n.id !== eid; });
  reg.nodes.push(entry);
  writeJson(abspath, reg, dryRun);
}

function maybeStamp(rel, abspath, base) {
  try {
    if (rel.endsWith('node.json')) stamp.stampNode(abspath);
    else if (rel === 'course.json' || rel === 'profile.json') stamp.stampTimes(abspath);
    else if (rel.indexOf('progress/') === 0) stamp.stampSnapshot(abspath);
    else if (rel.indexOf('registry/') === 0 && path.basename(rel) !== 'index.json') {
      stamp.stampRegistry(base, path.basename(rel).replace(/\.json$/, ''));
    } else if (rel.indexOf('event-') >= 0) stamp.stampTs(abspath);
    // turn-*.json carry no ts (the metadax.tutor-turn/0.2 schema has no ts
    // property and forbids additional properties); the state object is the
    // checkpoint, so turns are never stamped.
  } catch (e) {
    process.stderr.write('WARN stamp ' + rel + ': ' + e.message + '\n');
  }
}

function applyPacket(packet, courseDir, learnerDir, doStamp, dryRun) {
  const repo = packet.repo;
  const base = baseDir(repo, courseDir, learnerDir);
  const written = [];
  for (const entry of (packet.files || [])) {
    const rel = normPath(entry.path);
    checkRoot(rel, repo);
    const op = entry.op;
    const content = entry.content;
    checkNoAt(content);
    checkNodeId(content);
    const abspath = path.join(base, rel);

    if (op === 'create') {
      if (fs.existsSync(abspath)) throw PacketError('create refused, path exists: ' + rel);
      writeJson(abspath, content, dryRun);
      written.push(rel);
    } else if (op === 'update') {
      if (!fs.existsSync(abspath) && !dryRun) {
        throw PacketError('update refused, path does not exist: ' + rel);
      }
      writeJson(abspath, content, dryRun);
      written.push(rel);
    } else if (op === 'append') {
      appendRegistry(abspath, base, rel, content, dryRun);
      written.push(rel);
    } else {
      throw PacketError('unknown op: ' + op);
    }

    if (doStamp && !dryRun) maybeStamp(rel, abspath, base);
  }
  return written;
}

function getOpt(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
}

function main(argv) {
  const src = argv[0];
  if (!src || src.indexOf('--') === 0) {
    process.stderr.write('usage: node tools/apply_packet.js <packet.json | -> '
      + '--course <dir> --learner <dir> [--stamp] [--dry-run]\n');
    return 2;
  }
  const courseDir = getOpt(argv, '--course');
  const learnerDir = getOpt(argv, '--learner');
  const doStamp = argv.indexOf('--stamp') >= 0;
  const dryRun = argv.indexOf('--dry-run') >= 0;

  const text = src === '-' ? fs.readFileSync(0, 'utf-8') : fs.readFileSync(src, 'utf-8');
  let written;
  try {
    const packet = JSON.parse(text);
    written = applyPacket(packet, courseDir, learnerDir, doStamp, dryRun);
  } catch (e) {
    if (e.packet) {
      process.stderr.write('refused: ' + e.message + '\n');
    } else {
      process.stderr.write('error: ' + e.message + '\n');
    }
    return 1;
  }
  for (const w of written) {
    process.stdout.write((dryRun ? 'would write ' : 'wrote ') + w + '\n');
  }
  return 0;
}

module.exports = { applyPacket };

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}
