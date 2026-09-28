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
  readRegistry,
  nowIso,
  isoWeek,
  randomId,
};
