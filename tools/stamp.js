#!/usr/bin/env node
'use strict';
// stamp.js -- the MetaDAX stamping step (SPEC S-2, S-6, S-7). The model never
// computes timestamps, hashes, byte counts or ids; this tool does. Zero deps.
//
// CLI:
//   node tools/stamp.js node <node.json> [--by <id>] [--role author|learner|curator|client] [--lineage '<json>']
//   node tools/stamp.js course <course.json>
//   node tools/stamp.js profile <profile.json>
//   node tools/stamp.js snapshot <file>
//   node tools/stamp.js event <file>
//   node tools/stamp.js turn <file>
//   node tools/stamp.js manifest <learner-dir> --device <dev-id> [--week YYYY-Www] [--all]
//   node tools/stamp.js registry <course-dir> --module <module-id>
//   node tools/stamp.js index <course-dir>
//   node tools/stamp.js reuse <course-dir> <node-id>
//   node tools/stamp.js id learner|device|session
//
// `course` and `node` accept either the JSON file or the directory holding it
// (course.json / node.json are found inside a directory argument).

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const canon = require('./canon.js');
const lib = require('./lib.js');

const MANIFEST_SOFT_CAP = 600 * 1024;

function stampNode(p, by, role, lineageArg) {
  const node = lib.readJson(p);
  const now = lib.nowIso();
  if (node.created_at === 'runtime' || node.created_at === undefined) {
    node.created_at = now;
  }
  node.updated_at = now;
  const core = node.core || {};
  const contentHash = canon.sha256Hex(core);
  node.content_sha256 = contentHash;
  lib.writeJson(p, node);

  const dir = path.dirname(path.resolve(p));
  const provPath = path.join(dir, 'provenance.json');
  const createdBy = by || node.created_by || 'anonymous';
  const chainRole = role || 'client';

  let lineage;
  if (lineageArg != null) {
    lineage = typeof lineageArg === 'string' ? JSON.parse(lineageArg) : lineageArg;
  } else {
    lineage = [];
    if (node.parent_id) {
      lineage.push({ node_id: node.parent_id, relation: 'parent' });
    }
    for (const link of node.links || []) {
      if (link && link.id) {
        lineage.push({ node_id: link.id, relation: link.relation });
      }
    }
  }

  // Preserve ts on re-stamp so the provenance record is idempotent.
  let ts = lib.nowIso();
  if (fs.existsSync(provPath)) {
    try {
      const prev = lib.readJson(provPath);
      if (prev.ts) ts = prev.ts;
    } catch (e) { /* ignore */ }
  }
  const prov = {
    schema: 'metadax.provenance/0.2',
    node_id: node.id,
    content_hash: contentHash,
    created_by: { id: createdBy, key_id: null, chain_role: chainRole },
    lineage: lineage,
    constraints: { constraint_decl_ref: null },
    spec_version: '0.2',
    ts: ts,
  };
  lib.writeJson(provPath, prov);
  return { stamped: [p, provPath], content_sha256: contentHash, updated_at: now };
}

function stampTimes(p) {
  const obj = lib.readJson(p);
  const now = lib.nowIso();
  if (obj.created_at === 'runtime' || obj.created_at === undefined) {
    obj.created_at = now;
  }
  obj.updated_at = now;
  lib.writeJson(p, obj);
  return { stamped: [p], updated_at: now };
}

function stampSnapshot(p) {
  const obj = lib.readJson(p);
  const now = lib.nowIso();
  obj.updated_at = now;
  const concepts = obj.concepts || {};
  for (const k of Object.keys(concepts)) {
    const c = concepts[k];
    if (c && typeof c === 'object' && c.last_seen === 'runtime') {
      c.last_seen = now;
    }
  }
  lib.writeJson(p, obj);
  return { stamped: [p], updated_at: now };
}

function stampTs(p) {
  const obj = lib.readJson(p);
  const now = lib.nowIso();
  obj.ts = now;
  lib.writeJson(p, obj);
  return { stamped: [p], ts: now };
}

function walkFiles(root) {
  const out = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) { return; }
    for (const e of entries) {
      if (e.name === '.git') continue;
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) walk(fp);
      else if (e.isFile()) out.push(fp);
    }
  }
  walk(root);
  return out;
}

function stampManifest(learnerDir, device, week, all) {
  learnerDir = path.resolve(learnerDir);
  const targetWeek = week || lib.isoWeek(new Date());
  let profile = {};
  const ppath = path.join(learnerDir, 'profile.json');
  if (fs.existsSync(ppath)) {
    try { profile = lib.readJson(ppath); } catch (e) { profile = {}; }
  }
  const manifestsDir = path.join(learnerDir, 'manifests');
  const outPath = path.join(manifestsDir, targetWeek + '.json');

  // Only files under progress/, sessions/, nodes/ and profile.json.
  const roots = ['progress', 'sessions', 'nodes'].map(function (r) {
    return path.join(learnerDir, r);
  });
  let candidates = [];
  for (const r of roots) candidates = candidates.concat(walkFiles(r));
  if (fs.existsSync(ppath)) candidates.push(ppath);

  const files = [];
  let total = 0;
  for (const fp of candidates) {
    if (path.resolve(fp) === path.resolve(outPath)) continue;
    let st;
    try { st = fs.statSync(fp); } catch (e) { continue; }
    if (!all) {
      const mtimeWeek = lib.isoWeek(new Date(st.mtime));
      if (mtimeWeek !== targetWeek) continue;
    }
    const data = fs.readFileSync(fp);
    files.push({
      path: path.relative(learnerDir, fp).split(path.sep).join('/'),
      sha256: crypto.createHash('sha256').update(data).digest('hex'),
      bytes: data.length,
    });
    total += data.length;
  }
  files.sort(function (a, b) { return a.path < b.path ? -1 : a.path > b.path ? 1 : 0; });
  const manifest = {
    schema: 'metadax.manifest/0.2',
    learner_id: profile.learner_id || '',
    week: targetWeek,
    device_id: device,
    files: files,
    bytes_total: total,
    ts: lib.nowIso(),
  };
  fs.mkdirSync(manifestsDir, { recursive: true });
  lib.writeJson(outPath, manifest);
  const result = { stamped: [outPath], bytes_total: total, file_count: files.length };
  if (total > MANIFEST_SOFT_CAP) {
    result.warnings = ['manifest ' + total + ' bytes exceeds 600 KB soft cap'];
  }
  return result;
}

function stampRegistry(courseDir, moduleId) {
  const now = lib.nowIso();
  const indexPath = path.join(courseDir, 'registry', 'index.json');
  const modulePath = lib.registryFile(courseDir, moduleId);
  let nodeCount = 0;
  if (fs.existsSync(modulePath)) {
    const mod = lib.readJson(modulePath);
    nodeCount = (mod.nodes || []).length;
    mod.updated_at = now;
    lib.writeJson(modulePath, mod);
  }
  const index = lib.readJson(indexPath);
  index.updated_at = now;
  let found = false;
  for (const m of index.modules || []) {
    if (m.id === moduleId) {
      m.node_count = nodeCount;
      m.updated_at = now;
      found = true;
    }
  }
  if (!found) {
    if (!index.modules) index.modules = [];
    index.modules.push({
      id: moduleId,
      file: 'registry/' + moduleId + '.json',
      node_count: nodeCount,
      updated_at: now,
    });
  }
  lib.writeJson(indexPath, index);
  return { stamped: [indexPath], module_id: moduleId, node_count: nodeCount };
}

// Stamp registry/index.json: recount every module's node_count, re-stamp
// updated_at, create the index when missing, and fill course_id from course.json
// when it is the "my-course" placeholder or empty.
function stampIndex(courseDir) {
  const now = lib.nowIso();
  const indexPath = path.join(courseDir, 'registry', 'index.json');
  let index;
  if (fs.existsSync(indexPath)) {
    index = lib.readJson(indexPath);
  } else {
    index = {
      schema: 'metadax.registry-index/0.2',
      course_id: '',
      updated_at: now,
      modules: [],
    };
  }
  if (!index.course_id || index.course_id === 'my-course') {
    const cpath = path.join(courseDir, 'course.json');
    if (fs.existsSync(cpath)) {
      try {
        const c = lib.readJson(cpath);
        if (c.id) index.course_id = c.id;
      } catch (e) { /* ignore */ }
    }
  }
  for (const m of index.modules || []) {
    const mfile = path.join(courseDir, m.file || ('registry/' + m.id + '.json'));
    if (fs.existsSync(mfile)) {
      m.node_count = (lib.readJson(mfile).nodes || []).length;
    }
  }
  index.updated_at = now;
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  lib.writeJson(indexPath, index);
  return { stamped: [indexPath], course_id: index.course_id, updated_at: now };
}

// Bump a node's reuse counters: the registry entry's reuse_count and the node's
// stats.reuse_count, re-stamping updated_at on both. Never touches core or
// content_sha256 (so the hash stays stable).
function stampReuse(courseDir, nodeId) {
  const now = lib.nowIso();
  const stamped = [];
  const modulePath = lib.registryFileFor(courseDir, nodeId); // v0.3 opaque ids too
  if (fs.existsSync(modulePath)) {
    const mod = lib.readJson(modulePath);
    for (const e of mod.nodes || []) {
      if (e.id === nodeId) e.reuse_count = (e.reuse_count || 0) + 1;
    }
    mod.updated_at = now;
    lib.writeJson(modulePath, mod);
    stamped.push(modulePath);
  }
  const npath = path.join(lib.nodeDir(courseDir, nodeId), 'node.json');
  if (fs.existsSync(npath)) {
    const node = lib.readJson(npath);
    // stats is all-or-nothing in node.schema (views and reuse_count are both
    // required), and MP-04/MP-05 nodes are written without it: create both.
    if (!node.stats || typeof node.stats !== 'object') node.stats = { views: 0, reuse_count: 0 };
    if (!Number.isInteger(node.stats.views)) node.stats.views = 0;
    node.stats.reuse_count = (node.stats.reuse_count || 0) + 1;
    node.updated_at = now;
    lib.writeJson(npath, node);
    stamped.push(npath);
  }
  return { stamped: stamped, node_id: nodeId };
}

// If the argument is a directory, resolve it to the named file inside it.
function resolveFile(arg, fileName) {
  try {
    if (fs.statSync(arg).isDirectory()) return path.join(arg, fileName);
  } catch (e) { /* not a dir / does not exist: treat as a file path */ }
  return arg;
}

function stampId(kind) {
  if (kind === 'learner') return lib.randomId('lrn-', 8);
  if (kind === 'device') return lib.randomId('dev-', 6);
  if (kind === 'session') {
    const d = new Date();
    const day = d.getUTCFullYear()
      + String(d.getUTCMonth() + 1).padStart(2, '0')
      + String(d.getUTCDate()).padStart(2, '0');
    return 'ses-' + day + '-' + lib.randomId('', 4);
  }
  throw new Error('unknown id kind: ' + kind);
}

module.exports = {
  stampNode, stampTimes, stampSnapshot, stampTs, stampManifest,
  stampRegistry, stampIndex, stampReuse, stampId,
};

function getOpt(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
}

function main(argv) {
  const cmd = argv[0];
  let res;
  if (cmd === 'node') {
    if (!argv[1]) throw new Error('node needs <node.json> or <node-dir>');
    res = stampNode(resolveFile(argv[1], 'node.json'), getOpt(argv, '--by'),
      getOpt(argv, '--role'), getOpt(argv, '--lineage'));
  } else if (cmd === 'course') {
    if (!argv[1]) throw new Error('course needs <course.json> or <course-dir>');
    const target = resolveFile(argv[1], 'course.json');
    res = stampTimes(target);
    // A course commit re-stamps the registry index too (S-2 / K-15).
    const idx = stampIndex(path.dirname(path.resolve(target)));
    res.stamped = res.stamped.concat(idx.stamped);
  } else if (cmd === 'profile') {
    if (!argv[1]) throw new Error('profile needs a file');
    res = stampTimes(argv[1]);
  } else if (cmd === 'index') {
    if (!argv[1]) throw new Error('index needs <course-dir>');
    res = stampIndex(argv[1]);
  } else if (cmd === 'reuse') {
    if (!argv[1] || !argv[2]) throw new Error('reuse needs <course-dir> <node-id>');
    res = stampReuse(argv[1], argv[2]);
  } else if (cmd === 'snapshot') {
    if (!argv[1]) throw new Error('snapshot needs a file');
    res = stampSnapshot(argv[1]);
  } else if (cmd === 'event' || cmd === 'turn') {
    if (!argv[1]) throw new Error(cmd + ' needs a file');
    res = stampTs(argv[1]);
  } else if (cmd === 'manifest') {
    const dir = argv[1];
    const device = getOpt(argv, '--device');
    if (!dir || !device) throw new Error('manifest needs <learner-dir> --device <id>');
    res = stampManifest(dir, device, getOpt(argv, '--week'), argv.includes('--all'));
  } else if (cmd === 'registry') {
    const dir = argv[1];
    const mod = getOpt(argv, '--module');
    if (!dir || !mod) throw new Error('registry needs <course-dir> --module <id>');
    res = stampRegistry(dir, mod);
  } else if (cmd === 'id') {
    const val = stampId(argv[1]);
    process.stdout.write(val + '\n');
    return 0;
  } else {
    process.stderr.write('usage: node tools/stamp.js node|course|profile|snapshot|event|turn|manifest|registry|index|reuse|id ...\n');
    return 2;
  }
  for (const f of res.stamped || []) process.stdout.write('stamped ' + f + '\n');
  for (const w of res.warnings || []) process.stderr.write('WARN ' + w + '\n');
  return 0;
}

if (require.main === module) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (e) {
    process.stderr.write('error: ' + e.message + '\n');
    process.exit(1);
  }
}
