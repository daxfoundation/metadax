#!/usr/bin/env node
'use strict';
// lib.js -- shared helpers for the MetaDAX Node tools. Zero dependencies.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

// Write pretty JSON: 2-space indent, trailing newline, UTF-8.
function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf-8');
}

// Every nodes/**/node.json -> the node id read from the directory path.
function listNodeIds(courseDir) {
  const nodesDir = path.join(courseDir, 'nodes');
  const out = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return;
    }
    if (entries.some(function (e) { return e.isFile() && e.name === 'node.json'; })) {
      const id = path.relative(nodesDir, dir).split(path.sep).join('/');
      out.push(id);
    }
    for (const e of entries) {
      if (e.isDirectory()) walk(path.join(dir, e.name));
    }
  }
  walk(nodesDir);
  out.sort();
  return out;
}

function nodeDir(courseDir, id) {
  return path.join(courseDir, 'nodes', id.split('/').join(path.sep));
}

// The "Lxx.Myy" module prefix of a node id.
function moduleOf(id) {
  const head = id.split('/')[0];
  const bits = head.split('.');
  if (bits.length >= 2) return bits[0] + '.' + bits[1];
  return head;
}

function depthOf(id) {
  return 1 + (id.split('/').length - 1);
}

// An objective node is depth 1 and matches the module + .Onn shape.
function isObjectiveId(id) {
  return depthOf(id) === 1 && /^L\d+\.M\d+\.O\d+$/.test(id);
}

function registryFile(courseDir, moduleId) {
  return path.join(courseDir, 'registry', moduleId + '.json');
}

// The registry module holding nodeId. v0.3 opaque ids ("n_...") carry no
// module prefix, so moduleOf() cannot name it: fall back to the module file
// whose nodes[] lists the id.
function registryModuleFor(courseDir, nodeId) {
  const direct = moduleOf(nodeId);
  if (fs.existsSync(registryFile(courseDir, direct))) return direct;
  const regDir = path.join(courseDir, 'registry');
  if (!fs.existsSync(regDir)) return direct;
  for (const f of fs.readdirSync(regDir).sort()) {
    if (f === 'index.json' || !f.endsWith('.json')) continue;
    const nodes = readJson(path.join(regDir, f)).nodes || [];
    if (nodes.some(function (e) { return e.id === nodeId; })) return f.slice(0, -'.json'.length);
  }
  return direct;
}

function registryFileFor(courseDir, nodeId) {
  return registryFile(courseDir, registryModuleFor(courseDir, nodeId));
}

// The objective a node belongs to. A v0.2 breadcrumb id starts with it; a v0.3
// opaque id ("n_...") does not, so walk the parent_id chain (nodes/<id>/node.json)
// to the first objective id or depth-1 node. v0.3 has no global max depth, so
// the walk is capped at the node's stored depth (a parent_id cycle cannot loop
// forever). Falls back to the id's first segment, as before.
const MAX_PARENT_WALK = 1000;
function objectiveOf(courseDir, nodeId) {
  const id = String(nodeId);
  const head = id.split('/')[0];
  if (!courseDir || head !== id || isObjectiveId(id)) return head;
  let cur = id;
  let cap = MAX_PARENT_WALK;
  for (let step = 0; typeof cur === 'string' && cur && step < cap; step++) {
    const np = path.join(nodeDir(courseDir, cur), 'node.json');
    if (!fs.existsSync(np)) break;
    const n = readJson(np);
    if (step === 0 && Number.isInteger(n.depth) && n.depth > 0) cap = n.depth;
    if (isObjectiveId(cur) || n.depth === 1) return cur;
    cur = n.parent_id;
  }
  return head;
}

function readRegistry(courseDir, moduleId) {
  const p = registryFile(courseDir, moduleId);
  if (!fs.existsSync(p)) return null;
  return readJson(p);
}

function pad(n, w) {
  return String(n).padStart(w, '0');
}

// RFC 3339 UTC, seconds precision, e.g. 2026-09-27T19:20:00Z.
function nowIso(d) {
  const dt = d || new Date();
  return dt.getUTCFullYear() + '-' + pad(dt.getUTCMonth() + 1, 2) + '-'
    + pad(dt.getUTCDate(), 2) + 'T' + pad(dt.getUTCHours(), 2) + ':'
    + pad(dt.getUTCMinutes(), 2) + ':' + pad(dt.getUTCSeconds(), 2) + 'Z';
}

// ISO 8601 week: "YYYY-Www". Accepts a Date (interpreted in UTC).
function isoWeek(date) {
  // Copy the date at UTC midnight.
  const d = new Date(Date.UTC(
    date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // ISO: Thursday of this week decides the year.
  const day = d.getUTCDay() || 7; // Mon=1..Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return year + '-W' + pad(week, 2);
}

function randomId(prefix, n) {
  const bytes = crypto.randomBytes(n);
  let s = '';
  for (let i = 0; i < n; i++) {
    s += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return prefix + s;
}

module.exports = {
  readJson,
  writeJson,
  listNodeIds,
  nodeDir,
  moduleOf,
  isObjectiveId,
  depthOf,
  registryFile,
  registryModuleFor,
  registryFileFor,
  objectiveOf,
  readRegistry,
  nowIso,
  isoWeek,
  randomId,
};
