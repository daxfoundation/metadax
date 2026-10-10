#!/usr/bin/env node
'use strict';
// migrate-ids-0.2-to-0.3.js -- convert a MetaDAX v0.2 node, registry, progress,
// event, provenance or eval record from v0.2 breadcrumb ids to v0.3 opaque ids.
// Zero dependencies (node's crypto only).
//
// v0.2 ids are breadcrumbs: an objective id (L01.M01.O01) followed by one or more
// "/slug". v0.3 ids are short opaque ids (n_ + 26 Crockford base32 chars). This
// tool mints the opaque id DETERMINISTICALLY from a hash of the legacy breadcrumb,
// so the same breadcrumb always yields the same opaque id -- re-runs are stable and
// every parent/child/link reference stays consistent across files without a shared
// map. Objective ids (L01.M01.O01) are already valid v0.3 node ids and are kept.
//
// Per record it: bumps node/registry/registry-index schema to 0.3; sets the opaque
// id; records parent_id (mapped from the breadcrumb parent); stores depth as a
// field (= 1 + count("/") of the legacy id, i.e. the breadcrumb depth); keeps the
// last breadcrumb segment as a separate `slug` field; keeps the original id in
// `legacy_id`; and rewrites every id reference (parent_id, links, reuse.of,
// superseded_by, alias_of, path[] trail, practice-item "id#pNN", progress
// followups_asked / next_steps.node_id, event node_id, provenance node_id/lineage).
//
// For a course or learner repo it also relocates node directories from the nested
// breadcrumb layout (nodes/L01.M01.O01/slug/slug/) to the flat v0.3 layout
// (nodes/<id>/), since ids no longer encode a path.
//
//   node tools/migrate-ids-0.2-to-0.3.js <path> [<path>...]   # migrate in place
//   node tools/migrate-ids-0.2-to-0.3.js --check <path> [...]  # report only, write nothing (exit 1 if migration needed)
//
// A <path> is a file or a directory (recursed).

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CROCKFORD = '0123456789abcdefghjkmnpqrstvwxyz';
const OBJECTIVE_RE = /^L\d\d\.M\d\d\.O\d\d$/;
const BREADCRUMB_RE = /^L\d\d\.M\d\d\.O\d\d(\/[a-z0-9]+(-[a-z0-9]+)*)+$/;
const PRACTICE_RE = /^(.+)#p(\d\d)$/;

// Deterministic opaque id: first 128 bits of sha256(legacyId) -> 26 Crockford
// base32 chars (the field is 130 bits; the low 2 bits are zero).
function opaqueFromLegacy(legacyId) {
  const h = crypto.createHash('sha256').update(String(legacyId)).digest();
  let big = 0n;
  for (let i = 0; i < 16; i++) big = (big << 8n) | BigInt(h[i]);
  big <<= 2n;
  let out = '';
  for (let i = 0; i < 26; i++) {
    const shift = BigInt((26 - 1 - i) * 5);
    out += CROCKFORD[Number((big >> shift) & 31n)];
  }
  return 'n_' + out;
}

function isBreadcrumb(id) { return typeof id === 'string' && BREADCRUMB_RE.test(id); }

// Map an id-valued string to its v0.3 form: breadcrumb -> opaque; objective id or
// anything else (already opaque, concept id, source id) -> unchanged.
function mapId(id) { return isBreadcrumb(id) ? opaqueFromLegacy(id) : id; }

// Apply SCHEMAS.md section 1 slug rule step 5 to an already-kebab segment: if it
// is longer than 32 chars, cut back to the last whole word within 32 (a single
// word longer than 32 is cut at 32; if nothing remains, "node"). The legacy
// breadcrumb segment is already lowercase/kebab, so only the length cut applies.
function cutSlug(seg) {
  if (seg.length <= 32) return seg;
  const window = seg.slice(0, 32);
  const dash = window.lastIndexOf('-');
  const cut = dash > 0 ? window.slice(0, dash) : window;
  return cut || 'node';
}
function slugOf(id) { const p = String(id).split('/'); return cutSlug(p[p.length - 1]); }
function depthOf(id) { return 1 + (String(id).split('/').length - 1); }

// Deep walk: rewrite any string that is a breadcrumb id (or "<breadcrumb>#pNN"
// practice id) wherever it sits. Leaves non-id strings untouched.
function mapDeep(v) {
  if (typeof v === 'string') {
    const m = v.match(PRACTICE_RE);
    if (m && isBreadcrumb(m[1])) return mapId(m[1]) + '#p' + m[2];
    return mapId(v);
  }
  if (Array.isArray(v)) return v.map(mapDeep);
  if (v && typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v)) out[k] = mapDeep(v[k]);
    return out;
  }
  return v;
}

function migrateNode(n) {
  const out = {};
  for (const k of Object.keys(n)) {
    out[k] = n[k];
    // Insert slug + legacy_id right after id so migrated files read cleanly.
    if (k === 'id' && isBreadcrumb(n.id)) {
      out.id = mapId(n.id);
      out.slug = slugOf(n.id);
      out.legacy_id = n.id;
    }
  }
  out.schema = 'metadax.node/0.3';
  if (isBreadcrumb(n.id)) out.depth = depthOf(n.id);
  if (isBreadcrumb(n.parent_id)) out.parent_id = mapId(n.parent_id);
  if (Array.isArray(n.links)) out.links = n.links.map(function (l) { return Object.assign({}, l, { id: mapId(l.id) }); });
  if (n.reuse && typeof n.reuse === 'object' && n.reuse.of != null) out.reuse = Object.assign({}, n.reuse, { of: mapId(n.reuse.of) });
  if (n.superseded_by != null) out.superseded_by = mapId(n.superseded_by);
  if (n.alias_of != null) out.alias_of = mapId(n.alias_of);
  if (Array.isArray(n.path)) {
    out.path = n.path.map(function (e) {
      if (e && e.id && e.id !== 'trail') return Object.assign({}, e, { id: mapId(e.id) });
      return e;
    });
  }
  return out;
}

function migrateRegistry(r) {
  const out = Object.assign({}, r, { schema: 'metadax.registry/0.3' });
  out.nodes = (r.nodes || []).map(function (e) {
    const o = {};
    for (const k of Object.keys(e)) {
      o[k] = e[k];
      if (k === 'id' && isBreadcrumb(e.id)) { o.id = mapId(e.id); o.legacy_id = e.id; }
    }
    if (isBreadcrumb(e.id)) o.depth = depthOf(e.id);
    if (isBreadcrumb(e.parent_id)) o.parent_id = mapId(e.parent_id);
    if (e.superseded_by != null) o.superseded_by = mapId(e.superseded_by);
    return o;
  });
  return out;
}

// Dispatch by the record's declared schema. Node / registry / registry-index move
// to 0.3; every other envelope keeps its own version but has its id references
// rewritten.
function migrateRecord(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return mapDeep(obj);
  const schema = typeof obj.schema === 'string' ? obj.schema : '';
  if (schema.indexOf('metadax.node/') === 0) return migrateNode(obj);
  if (schema.indexOf('metadax.registry/') === 0) return migrateRegistry(obj);
  if (schema.indexOf('metadax.registry-index/') === 0) return Object.assign({}, mapDeep(obj), { schema: 'metadax.registry-index/0.3' });
  return mapDeep(obj);
}

// ---- file + directory walking ----

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf-8')); }
function writeJson(p, obj) { fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n'); }
function sameJson(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function listJsonFiles(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listJsonFiles(p, acc);
    else if (e.isFile() && e.name.endsWith('.json')) acc.push(p);
  }
  return acc;
}

// Find every directory literally named "nodes" under root (course/learner node stores).
function findNodesDirs(root, acc) {
  let entries;
  try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch (e) { return acc; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const p = path.join(root, e.name);
    if (e.name === 'nodes') acc.push(p);
    else findNodesDirs(p, acc);
  }
  return acc;
}

// Collect [dir, node.json path] for every node under a nodes/ tree.
function collectNodeDirs(nodesDir) {
  const out = [];
  (function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    if (entries.some(function (x) { return x.isFile() && x.name === 'node.json'; })) out.push(dir);
    for (const x of entries) if (x.isDirectory()) walk(path.join(dir, x.name));
  })(nodesDir);
  return out;
}

// Relocate a nodes/ tree to the flat v0.3 layout and migrate each record. Returns
// {changed:[...], relocated:[...]}. In check mode nothing is written.
function relocateNodesDir(nodesDir, check, res) {
  const dirs = collectNodeDirs(nodesDir);
  const plan = []; // {oldDir, newName, node, prov}
  for (const d of dirs) {
    const node = readJson(path.join(d, 'node.json'));
    const newNode = migrateNode(node);
    const newName = String(newNode.id);
    let prov = null, newProv = null;
    const provPath = path.join(d, 'provenance.json');
    if (fs.existsSync(provPath)) { prov = readJson(provPath); newProv = migrateRecord(prov); }
    const relOld = path.relative(nodesDir, d).split(path.sep).join('/');
    if (relOld !== newName || !sameJson(node, newNode) || (prov && !sameJson(prov, newProv))) {
      res.changed.push(path.join(d, 'node.json'));
      if (prov) res.changed.push(provPath);
    }
    if (relOld !== newName) res.relocated.push(relOld + ' -> ' + newName);
    plan.push({ newName: newName, newNode: newNode, newProv: newProv });
  }
  if (check) return;
  // Rebuild the tree in a temp dir, then swap, to avoid nested-move collisions.
  const tmp = nodesDir + '.v03tmp';
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  for (const item of plan) {
    const nd = path.join(tmp, item.newName);
    fs.mkdirSync(nd, { recursive: true });
    writeJson(path.join(nd, 'node.json'), item.newNode);
    if (item.newProv) writeJson(path.join(nd, 'provenance.json'), item.newProv);
  }
  fs.rmSync(nodesDir, { recursive: true, force: true });
  fs.renameSync(tmp, nodesDir);
}

function migrateFileInPlace(file, check, res) {
  let obj;
  try { obj = readJson(file); } catch (e) { return; }
  const migrated = migrateRecord(obj);
  if (sameJson(obj, migrated)) return;
  res.changed.push(file);
  if (!check) writeJson(file, migrated);
}

function processTarget(target, check, res) {
  const st = fs.statSync(target);
  if (st.isFile()) { migrateFileInPlace(target, check, res); return; }
  // Directory: relocate every nodes/ tree first, then migrate remaining json files
  // that are not inside a nodes/ tree (registry, index, progress, events, etc.).
  const nodesDirs = findNodesDirs(target, []);
  for (const nd of nodesDirs) relocateNodesDir(nd, check, res);
  const files = listJsonFiles(target, []);
  for (const f of files) {
    if (f.split(path.sep).indexOf('nodes') >= 0 || f.split(path.sep).indexOf('nodes.v03tmp') >= 0) continue;
    migrateFileInPlace(f, check, res);
  }
}

function main(argv) {
  const check = argv.indexOf('--check') >= 0 || argv.indexOf('--dry-run') >= 0;
  const targets = argv.filter(function (a) { return a !== '--check' && a !== '--dry-run'; });
  if (!targets.length) {
    process.stderr.write('usage: node tools/migrate-ids-0.2-to-0.3.js [--check] <path> [<path>...]\n');
    return 2;
  }
  const res = { changed: [], relocated: [] };
  for (const t of targets) processTarget(t, check, res);
  const uniq = Array.from(new Set(res.changed));
  if (check) {
    for (const f of uniq) process.stdout.write('WOULD-CHANGE ' + f + '\n');
    for (const r of res.relocated) process.stdout.write('WOULD-RELOCATE ' + r + '\n');
    process.stdout.write((uniq.length ? 'MIGRATION-NEEDED' : 'UP-TO-DATE') + ' (' + uniq.length + ' files, ' + res.relocated.length + ' relocations)\n');
    return uniq.length ? 1 : 0;
  }
  for (const f of uniq) process.stdout.write('CHANGED ' + f + '\n');
  for (const r of res.relocated) process.stdout.write('RELOCATED ' + r + '\n');
  process.stdout.write('DONE (' + uniq.length + ' files, ' + res.relocated.length + ' relocations)\n');
  return 0;
}

module.exports = { opaqueFromLegacy, mapId, migrateNode, migrateRegistry, migrateRecord, isBreadcrumb, slugOf, depthOf };

if (require.main === module) {
  try { process.exit(main(process.argv.slice(2))); }
  catch (e) { process.stderr.write('error: ' + e.message + '\n'); process.exit(1); }
}
