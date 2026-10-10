#!/usr/bin/env node
'use strict';
// validate.js -- structural validation of a MetaDAX course or learner repo.
// Zero dependencies. If schemas/*.schema.json exist, also validates each record
// against the schema its `schema` field names (tools/jsonschema-lite.js);
// skipped silently when schemas/ is absent, or with --no-schema.
//
//   node tools/validate.js course <dir> [--schemas <dir>] [--no-schema]
//   node tools/validate.js learner <dir> [--course <dir>] [--schemas <dir>] [--no-schema]
// When no schemas/ is found (and --no-schema was not given) a WARN line is
// printed and only structural checks run; pass --schemas <dir> to point at a
// schemas directory outside the repo tree.
//
// Output: "ERROR path: msg" / "WARN path: msg" lines, then OK or FAIL.
// Exit 0 on OK, 1 on FAIL.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const canon = require('./canon.js');
const lib = require('./lib.js');
const jsl = require('./jsonschema-lite.js');

const SECTION_ID_RE = /^s[0-9]+$/;
const MAX_TITLE = 80;
const FORBIDDEN_PROFILE_KEYS = new Set(['email', 'name', 'school', 'diagnosis']);

function makeReport() {
  const errors = [];
  const warns = [];
  return {
    error: function (p, msg) { errors.push('ERROR ' + p + ': ' + msg); },
    warn: function (p, msg) { warns.push('WARN ' + p + ': ' + msg); },
    ok: function () { return errors.length === 0; },
    emit: function () {
      for (const l of warns) process.stdout.write(l + '\n');
      for (const l of errors) process.stdout.write(l + '\n');
      process.stdout.write((errors.length === 0 ? 'OK' : 'FAIL') + '\n');
    },
    errors: errors,
    warns: warns,
  };
}

function load(p, rep) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e) {
    if (e.code === 'ENOENT') rep.error(p, 'file not found');
    else rep.error(p, 'invalid JSON: ' + e.message);
    return null;
  }
}

function summaryString(summary) {
  if (Array.isArray(summary)) return summary.map(String).join(' ');
  return summary == null ? '' : String(summary);
}

function isPlainText(s) {
  return typeof s === 'string' && !/[\n\r]/.test(s);
}

// ---- schema index (optional) ----

function buildSchemaIndex(schemasDir, rep) {
  let names;
  try {
    names = fs.readdirSync(schemasDir).filter(function (n) {
      return n.endsWith('.schema.json');
    });
  } catch (e) { return null; }
  if (!names.length) return null;
  const index = {};
  for (const n of names) {
    const p = path.join(schemasDir, n);
    const schema = load(p, rep);
    if (!schema) continue;
    if (schema.$id) index[schema.$id] = schema;
    // Also index by the metadax.* value a record's `schema` field might carry.
    const stem = n.replace(/\.schema\.json$/, '');
    index[stem] = schema;
  }
  // Prefer schemas/index.json (a map from a record's `schema` id such as
  // "metadax.node/0.2" to a file name, written by B7) when present. These
  // entries take precedence over the $id / filename-stem fallbacks above.
  const mapPath = path.join(schemasDir, 'index.json');
  if (fs.existsSync(mapPath)) {
    const map = load(mapPath, rep);
    if (map && typeof map === 'object') {
      for (const schemaId of Object.keys(map)) {
        const fileName = map[schemaId];
        if (typeof fileName !== 'string') continue;
        const schema = load(path.join(schemasDir, fileName), rep);
        if (schema) index[schemaId] = schema;
      }
    }
  }
  return index;
}

function checkSchema(obj, p, schemaIndex, rep) {
  if (!schemaIndex || !obj || typeof obj !== 'object') return;
  const name = obj.schema;
  if (!name) return;
  const schema = schemaIndex[name] || schemaIndex[name.replace(/\//g, '-')];
  if (!schema) return; // unknown schema name: nothing to check against
  const errs = jsl.validate(obj, schema);
  for (const e of errs) rep.error(p, 'schema ' + name + ': ' + e);
}

// ---- course ----

function findRepoRoot(dir) {
  // schemas/ lives at the repo root; the course/learner dir is under fixtures/.
  let cur = path.resolve(dir);
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(cur, 'schemas'))) return cur;
    const up = path.dirname(cur);
    if (up === cur) break;
    cur = up;
  }
  return path.resolve(dir);
}

function validateCourse(courseDir, rep, schemaIndex) {
  const coursePath = path.join(courseDir, 'course.json');
  const course = load(coursePath, rep);
  if (course) {
    for (const key of ['schema', 'id', 'title', 'lessons']) {
      if (!(key in course)) rep.error(coursePath, 'missing required key ' + key);
    }
    if (course.updated_at === 'runtime') {
      rep.warn(coursePath, 'updated_at is "runtime" (unstamped)');
    }
    checkSchema(course, coursePath, schemaIndex, rep);
  }
  const nodesDir = path.join(courseDir, 'nodes');
  const seen = validateNodes(nodesDir, rep, schemaIndex);
  validateRegistry(courseDir, seen, rep, schemaIndex);
}

function walkNodeDirs(nodesDir) {
  const out = [];
  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch (e) { return; }
    if (entries.some(function (e) { return e.isFile() && e.name === 'node.json'; })) {
      const id = path.relative(nodesDir, dir).split(path.sep).join('/');
      out.push([id, path.join(dir, 'node.json')]);
    }
    for (const e of entries) if (e.isDirectory()) walk(path.join(dir, e.name));
  }
  walk(nodesDir);
  return out;
}

function validateNodes(nodesDir, rep, schemaIndex) {
  const seen = {};
  const paths = {};
  if (!fs.existsSync(nodesDir)) return seen;
  for (const pair of walkNodeDirs(nodesDir)) {
    const nodeId = pair[0], npath = pair[1];
    const node = load(npath, rep);
    if (!node) continue;
    seen[nodeId] = node;

    if (node.id !== nodeId) {
      rep.error(npath, 'id ' + JSON.stringify(node.id) + ' != directory path ' + JSON.stringify(nodeId));
    }
    // v0.3: ids are opaque. depth is a stored field (= parent.depth + 1) and the
    // parent_id chain -- not a breadcrumb -- is the source of ancestry. Both are
    // checked in a second pass below, once every node has been loaded into `seen`.
    const title = node.title || '';
    if (title.length > MAX_TITLE) rep.error(npath, 'title over ' + MAX_TITLE + ' chars');
    if (!isPlainText(title)) rep.error(npath, 'title is not plain text');

    const core = node.core || {};
    const secIds = [];
    for (const sec of core.sections || []) {
      const sid = sec.id;
      if (!(typeof sid === 'string' && SECTION_ID_RE.test(sid))) {
        rep.error(npath, 'core.sections id ' + JSON.stringify(sid) + ' not of the form s<n>');
      }
      secIds.push(sid);
    }
    if (secIds.length !== new Set(secIds).size) {
      rep.error(npath, 'core.sections ids not unique');
    }
    if (!summaryString(node.summary).trim()) rep.error(npath, 'summary is empty');
    paths[nodeId] = npath;

    const csha = node.content_sha256;
    if (csha === 'runtime') {
      rep.warn(npath, 'unstamped (content_sha256 is "runtime")');
    } else if (csha != null) {
      const recomputed = canon.sha256Hex(core);
      if (csha !== recomputed) {
        rep.error(npath, 'content_sha256 mismatch (recomputed ' + recomputed + ')');
      }
    }
    checkSchema(node, npath, schemaIndex, rep);
  }
  // Second pass (v0.3): depth and path[] are checked against the parent_id chain,
  // now that every node is in `seen`.
  for (const id of Object.keys(seen)) {
    const node = seen[id];
    const npath = paths[id];
    const chain = ancestorChain(node, seen); // root -> parent ids
    const expectedDepth = chain.length + 1;
    if (node.depth !== expectedDepth) {
      rep.error(npath, 'depth ' + JSON.stringify(node.depth) + ' != parent-chain depth ' + expectedDepth);
    }
    validatePath(node, chain, npath, rep);
  }
  return seen;
}

// Walk parent_id up through `seen`, returning ancestor ids root -> parent.
function ancestorChain(node, seen) {
  const chain = [];
  let pid = node.parent_id;
  const guard = new Set();
  while (pid != null && !guard.has(pid)) {
    guard.add(pid);
    chain.unshift(pid);
    const parent = seen[pid];
    pid = parent ? parent.parent_id : null;
  }
  return chain;
}

function validatePath(node, chain, npath, rep) {
  const p = node.path;
  if (p == null) return;
  const hasTrail = p.some(function (e) { return e && e.id === 'trail'; });
  if (hasTrail) return; // compressed PATH (MP-03): skip strict comparison
  const got = p.filter(function (e) { return e && e.id !== 'trail'; })
    .map(function (e) { return e.id; });
  if (JSON.stringify(got) !== JSON.stringify(chain)) {
    rep.error(npath, 'path[] ids ' + JSON.stringify(got) + ' != ancestor chain ' + JSON.stringify(chain));
  }
}

var OBJECTIVE_ID_RE = /^L\d\d\.M\d\d\.O\d\d$/;

// v0.3: an opaque id encodes no module. Resolve the module by walking the entry's
// parent_id chain (within the registry) up to its root objective id (L..M..O..),
// then take its L..M.. prefix. A legacy breadcrumb id still works via its head.
function moduleOf(nodeId, regMap) {
  let id = nodeId;
  const guard = new Set();
  while (id != null && !guard.has(id)) {
    guard.add(id);
    if (OBJECTIVE_ID_RE.test(id)) return id.split('.').slice(0, 2).join('.');
    const entry = regMap ? regMap[id] : null;
    if (entry && entry.parent_id != null) { id = entry.parent_id; continue; }
    break;
  }
  const head = String(nodeId).split('/')[0];
  const bits = head.split('.');
  if (bits.length >= 2) return bits[0] + '.' + bits[1];
  return head;
}

function validateRegistry(courseDir, seenNodes, rep, schemaIndex) {
  const regDir = path.join(courseDir, 'registry');
  const indexPath = path.join(regDir, 'index.json');
  const nodeIds = Object.keys(seenNodes);
  if (!fs.existsSync(indexPath)) {
    if (nodeIds.length) rep.error(indexPath, 'registry/index.json missing but nodes exist');
    return;
  }
  const index = load(indexPath, rep);
  if (!index) return;
  if (index.updated_at === 'runtime') {
    rep.warn(indexPath, 'updated_at is "runtime" (unstamped)');
  }
  checkSchema(index, indexPath, schemaIndex, rep);

  const moduleFiles = {};
  for (const m of index.modules || []) {
    const mid = m.id;
    const mfile = path.join(courseDir, m.file || ('registry/' + mid + '.json'));
    const reg = load(mfile, rep);
    if (!reg) continue;
    checkSchema(reg, mfile, schemaIndex, rep);
    moduleFiles[mid] = reg;
    const actual = (reg.nodes || []).length;
    if (m.node_count !== actual) {
      rep.error(mfile, 'node_count ' + JSON.stringify(m.node_count) + ' != actual ' + actual);
    }
  }

  const regMap = {};
  for (const mid of Object.keys(moduleFiles)) {
    for (const entry of moduleFiles[mid].nodes || []) regMap[entry.id] = entry;
  }
  const registered = {};
  for (const mid of Object.keys(moduleFiles)) {
    for (const entry of moduleFiles[mid].nodes || []) {
      const eid = entry.id;
      registered[eid] = (registered[eid] || 0) + 1;
      const expectedMid = moduleOf(eid, regMap);
      if (expectedMid !== mid) {
        rep.error(indexPath, 'node ' + eid + ' registered in module ' + mid + ' (belongs in ' + expectedMid + ')');
      }
    }
  }
  for (const nid of nodeIds) {
    const node = seenNodes[nid];
    const vis = node.visibility;
    if (vis === 'private') {
      if (registered[nid]) rep.error(indexPath, 'private node ' + nid + ' appears in a registry');
      continue;
    }
    const count = registered[nid] || 0;
    if (count === 0) {
      rep.error(indexPath, vis + ' node ' + nid + ' missing from its module registry');
    } else if (count > 1) {
      rep.error(indexPath, 'node ' + nid + ' appears ' + count + ' times in registries');
    }
  }
}

// ---- learner ----

function validateLearner(learnerDir, rep, schemaIndex) {
  const profilePath = path.join(learnerDir, 'profile.json');
  if (fs.existsSync(profilePath)) validateProfile(profilePath, rep, schemaIndex);
  parseTree(path.join(learnerDir, 'progress'), rep, schemaIndex);
  validateManifests(learnerDir, rep, schemaIndex);
  validateSessions(path.join(learnerDir, 'sessions'), rep, schemaIndex);
  const nodesDir = path.join(learnerDir, 'nodes');
  if (fs.existsSync(nodesDir)) validateNodes(nodesDir, rep, schemaIndex);
}

function validateProfile(p, rep, schemaIndex) {
  const prof = load(p, rep);
  if (!prof) return;
  if (JSON.stringify(prof).indexOf('@') >= 0) {
    rep.error(p, 'profile contains "@" (possible email)');
  }
  (function scan(obj) {
    if (Array.isArray(obj)) { obj.forEach(scan); return; }
    if (obj && typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        if (FORBIDDEN_PROFILE_KEYS.has(k.toLowerCase())) {
          rep.error(p, 'forbidden key ' + JSON.stringify(k) + ' in profile');
        }
        scan(obj[k]);
      }
    }
  })(prof);
  checkSchema(prof, p, schemaIndex, rep);
}

function parseTree(root, rep, schemaIndex) {
  if (!fs.existsSync(root)) return;
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) walk(fp);
      else if (e.name.endsWith('.json')) {
        const obj = load(fp, rep);
        if (obj) checkSchema(obj, fp, schemaIndex, rep);
      }
    }
  }
  walk(root);
}

function validateManifests(learnerDir, rep, schemaIndex) {
  const dir = path.join(learnerDir, 'manifests');
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.json')) continue;
    const mpath = path.join(dir, name);
    const manifest = load(mpath, rep);
    if (!manifest) continue;
    checkSchema(manifest, mpath, schemaIndex, rep);
    let total = 0;
    for (const entry of manifest.files || []) {
      const fp = path.join(learnerDir, entry.path.split('/').join(path.sep));
      let data;
      try { data = fs.readFileSync(fp); }
      catch (e) { rep.error(mpath, 'manifest file missing: ' + entry.path); continue; }
      const sha = crypto.createHash('sha256').update(data).digest('hex');
      if (entry.sha256 !== sha) {
        rep.error(mpath, 'sha256 mismatch for ' + entry.path + ' (recomputed ' + sha + ')');
      }
      if (entry.bytes !== data.length) {
        rep.error(mpath, 'bytes mismatch for ' + entry.path + ' (recomputed ' + data.length + ')');
      }
      total += data.length;
    }
    if (manifest.bytes_total !== undefined && manifest.bytes_total !== total) {
      rep.error(mpath, 'bytes_total ' + manifest.bytes_total + ' != sum ' + total);
    }
  }
}

function validateSessions(sessionsDir, rep, schemaIndex) {
  if (!fs.existsSync(sessionsDir)) return;
  for (const entry of fs.readdirSync(sessionsDir).sort()) {
    const sdir = path.join(sessionsDir, entry);
    if (!fs.statSync(sdir).isDirectory()) continue;
    checkSeq(sdir, 'event-', rep, schemaIndex);
    checkSeq(sdir, 'turn-', rep, schemaIndex);
  }
}

function checkSeq(sdir, prefix, rep, schemaIndex) {
  const seqs = [];
  for (const name of fs.readdirSync(sdir)) {
    if (!(name.startsWith(prefix) && name.endsWith('.json'))) continue;
    const obj = load(path.join(sdir, name), rep);
    if (!obj) continue;
    checkSchema(obj, path.join(sdir, name), schemaIndex, rep);
    let seq;
    if (typeof obj.seq === 'number') seq = obj.seq;
    else {
      const m = name.match(/(\d+)\.json$/);
      seq = m ? parseInt(m[1], 10) : null;
    }
    if (seq != null) seqs.push(seq);
  }
  if (!seqs.length) return;
  seqs.sort(function (a, b) { return a - b; });
  for (let i = 0; i < seqs.length; i++) {
    if (seqs[i] !== seqs[0] + i) {
      rep.error(sdir, prefix + 'seq has a gap or duplicate near ' + seqs[i]);
      break;
    }
  }
}

// ---- main ----

function getOpt(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
}

function main(argv) {
  const cmd = argv[0];
  const dir = argv[1];
  const noSchema = argv.includes('--no-schema');
  const schemasArg = getOpt(argv, '--schemas');
  if ((cmd !== 'course' && cmd !== 'learner') || !dir) {
    process.stderr.write('usage: node tools/validate.js course <dir> | learner <dir> [--course <dir>] [--schemas <dir>] [--no-schema]\n');
    return 2;
  }
  const rep = makeReport();
  let schemaIndex = null;
  if (!noSchema) {
    const schemasDir = schemasArg
      ? path.resolve(schemasArg)
      : path.join(findRepoRoot(dir), 'schemas');
    schemaIndex = buildSchemaIndex(schemasDir, rep);
    if (!schemaIndex) {
      rep.warns.push('WARN: schema validation skipped (no schemas/ found; pass --schemas <dir>)');
    }
  }
  if (cmd === 'course') validateCourse(dir, rep, schemaIndex);
  else validateLearner(dir, rep, schemaIndex);
  rep.emit();
  return rep.ok() ? 0 : 1;
}

module.exports = { validateCourse, validateLearner, makeReport };

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}
