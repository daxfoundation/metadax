#!/usr/bin/env node
'use strict';
// assemble.js -- build the MetaDAX context stack for one operation (SCHEMAS
// section 8). Zero dependencies, Node >= 18, CommonJS. Requires the Part A
// tools (lib.js, path.js); never reimplements canon/stamp logic.
//
//   node tools/assemble.js --op MP-05 --course <dir> --learner <dir>
//     --learner-id <id> --node <id> --input "<text>" --config key=value ...
//     --prompts <dir> --out <file> [--section <id>] [--mode <mode>]
//     [--session <session-id>] [--anchor-quote "<text>"]
//
// The stack is: the MP-00 kernel body (the text inside its first ```text fence)
// + the operation prompt body (the first ```text fence of the MP-xx file)
// + the <<START X>> ... <<END X>> blocks the operation needs, in the SCHEMAS
// section 8 order. INPUT is truncated to 500 chars, ANCHOR.quote to 200.
// REGISTRY is built per SPEC S-5. PATH comes from path.js. PROGRESS is the
// latest snapshot per device merged per S-6. SESSION is the current session's
// turn files (MP-06) or event files (MP-08), in seq order.
//
// Prints {bytes, tokens_estimate: bytes/4, blocks: [...]} as JSON on stdout.

const fs = require('fs');
const path = require('path');
const lib = require('./lib.js');
const pathMod = require('./path.js');

// Canonical block order (SCHEMAS section 8).
const BLOCK_ORDER = ['CONFIG', 'COURSE', 'LESSON', 'MODULE', 'OBJECTIVE',
  'CONCEPTS', 'LEARNER', 'PATH', 'ANCHOR', 'REGISTRY', 'SOURCE', 'CONTENT',
  'PROGRESS', 'SESSION', 'INPUT'];

const ALL = new Set(BLOCK_ORDER);

// Which blocks each operation reads (each MP file's "Inputs" section is
// authoritative; this mirrors it). Optional blocks are included only when
// their data is present and non-empty.
const OP_BLOCKS = {
  'MP-01': new Set(['CONFIG', 'LEARNER', 'INPUT']),
  'MP-02': new Set(['CONFIG', 'COURSE', 'SOURCE', 'CONTENT', 'INPUT']),
  'MP-03': new Set(ALL),
  'MP-04': new Set(['CONFIG', 'COURSE', 'LESSON', 'MODULE', 'OBJECTIVE',
    'CONCEPTS', 'LEARNER', 'SOURCE', 'CONTENT']),
  'MP-05': new Set(['CONFIG', 'COURSE', 'LESSON', 'MODULE', 'OBJECTIVE',
    'CONCEPTS', 'LEARNER', 'PATH', 'ANCHOR', 'REGISTRY', 'SOURCE', 'INPUT']),
  'MP-06': new Set(['CONFIG', 'COURSE', 'OBJECTIVE', 'CONCEPTS', 'LEARNER',
    'CONTENT', 'PROGRESS', 'SESSION', 'INPUT']),
  'MP-07': new Set(['CONFIG', 'LEARNER', 'CONTENT', 'INPUT']),
  'MP-08': new Set(['CONFIG', 'COURSE', 'LEARNER', 'PROGRESS', 'SESSION']),
  'MP-09': new Set(['CONFIG', 'COURSE', 'REGISTRY', 'CONTENT', 'SESSION']),
  'MP-10': new Set(ALL),
};

// Blocks dropped when empty (an empty list/object carries no information).
const SKIP_IF_EMPTY = new Set(['COURSE', 'LESSON', 'MODULE', 'OBJECTIVE',
  'CONCEPTS', 'PATH', 'ANCHOR', 'REGISTRY', 'SOURCE', 'CONTENT', 'PROGRESS',
  'SESSION']);

// Operations that receive the full course.json (SCHEMAS section 8).
const FULL_COURSE_OPS = new Set(['MP-02', 'MP-08', 'MP-09', 'MP-10']);

const INPUT_MAX = 500;
const ANCHOR_QUOTE_MAX = 200;
const REGISTRY_CANDIDATES = 12;

// CONFIG values arrive as strings from key=value pairs; these keys are typed in
// the prompts as numbers or booleans and must serialise as JSON numbers/bools.
const NUMERIC_CONFIG = ['clarify_round', 'attempts', 'items_per_level',
  'budget_tokens', 'promote_threshold'];
const BOOLEAN_CONFIG = ['reveal', 'named_reporting'];

function coerceConfig(config) {
  for (const k of NUMERIC_CONFIG) {
    if (k in config && config[k] !== '' && config[k] !== null
      && !Number.isNaN(Number(config[k]))) {
      config[k] = Number(config[k]);
    }
  }
  for (const k of BOOLEAN_CONFIG) {
    if (k in config) config[k] = config[k] === true || config[k] === 'true';
  }
  return config;
}

// MP-04 modes that read an existing node as CONTENT. `generate` (create the
// objective's first node) must NOT inject one, or it looks like a re-render.
const MP04_CONTENT_MODES = new Set(['render', 'extend_core']);
// MP-02 modes that take an explicit CONTENT block (a suggest request or the
// existing course.json), passed via --content. `design`/`quick` take none.
const MP02_CONTENT_MODES = new Set(['suggest', 'revise']);

function readText(p) {
  return fs.readFileSync(p, 'utf-8');
}

// The text inside the file's first ```text fence (a preceding ```mermaid or
// other fence is skipped: only a bare ```text line opens the body).
function extractFence(md) {
  let started = false;
  const body = [];
  for (const line of md.split(/\r?\n/)) {
    if (!started) {
      if (line.trim() === '```text') started = true;
      continue;
    }
    if (line.trim() === '```') break;
    body.push(line);
  }
  return body.join('\n');
}

function findMp(promptsDir, op) {
  const names = fs.readdirSync(promptsDir)
    .filter(function (n) { return n.indexOf(op + '-') === 0 && n.endsWith('.md'); })
    .sort();
  if (!names.length) {
    throw new Error('no prompt file for ' + op + ' in ' + promptsDir);
  }
  return path.join(promptsDir, names[0]);
}

function block(name, content) {
  const body = typeof content === 'string'
    ? content
    : JSON.stringify(content, null, 2);
  return '<<START ' + name + '>>\n' + body + '\n<<END ' + name + '>>';
}

// Lower-cased alnum/space token set, matching the Python reference.
function tokens(text) {
  let cleaned = '';
  for (const ch of String(text || '').toLowerCase()) {
    cleaned += /[a-z0-9 ]/.test(ch) ? ch : ' ';
  }
  return new Set(cleaned.split(/\s+/).filter(Boolean));
}

function summaryString(summary) {
  if (Array.isArray(summary)) return summary.map(String).join(' ');
  return summary == null ? '' : String(summary);
}

function findContext(course, objectiveId) {
  for (const lesson of (course.lessons || [])) {
    for (const module of (lesson.modules || [])) {
      for (const obj of (module.objectives || [])) {
        if (obj.id === objectiveId) return { lesson: lesson, module: module, objective: obj };
      }
    }
  }
  return { lesson: null, module: null, objective: null };
}

// SPEC S-5: full parent-module registry file, then up to 12 candidates from
// other modules ranked by lower-cased token overlap with INPUT.
function buildRegistry(courseDir, moduleId, inputText) {
  const entries = [];
  const seen = new Set();
  const modulePath = lib.registryFile(courseDir, moduleId);
  if (fs.existsSync(modulePath)) {
    for (const e of (lib.readJson(modulePath).nodes || [])) {
      entries.push(e);
      seen.add(e.id);
    }
  }
  const indexPath = path.join(courseDir, 'registry', 'index.json');
  if (!fs.existsSync(indexPath)) return entries;
  const query = tokens(inputText || '');
  const candidates = [];
  const modules = lib.readJson(indexPath).modules || [];
  for (let mi = 0; mi < modules.length; mi++) {
    const m = modules[mi];
    if (m.id === moduleId) continue;
    const mfile = path.join(courseDir, m.file || ('registry/' + m.id + '.json'));
    if (!fs.existsSync(mfile)) continue;
    for (const e of (lib.readJson(mfile).nodes || [])) {
      if (seen.has(e.id)) continue;
      const text = [e.title || '', e.canonical_question || '',
        (e.concepts || []).join(' ')].join(' ');
      let overlap = 0;
      const et = tokens(text);
      for (const t of query) if (et.has(t)) overlap++;
      candidates.push({ overlap: overlap, entry: e });
    }
  }
  // Stable sort by descending overlap.
  candidates.forEach(function (c, i) { c.i = i; });
  candidates.sort(function (a, b) {
    return b.overlap - a.overlap || a.i - b.i;
  });
  for (const c of candidates.slice(0, REGISTRY_CANDIDATES)) {
    const entry = Object.assign({}, c.entry);
    delete entry.reuse_count;
    entries.push(entry);
  }
  return entries;
}

// PATH root->parent, inclusive of the node a follow-up attaches to (its parent).
function buildPath(courseDir, nodeId) {
  const arr = pathMod.ancestors(nodeId, courseDir); // root..parent-of-node
  const npath = path.join(lib.nodeDir(courseDir, nodeId), 'node.json');
  if (fs.existsSync(npath)) {
    const n = lib.readJson(npath);
    arr.push({
      id: n.id || nodeId,
      title: n.title || '',
      canonical_question: n.canonical_question || '',
      summary: summaryString(n.summary),
    });
  }
  return arr;
}

function buildAnchor(courseDir, nodeId, quote, sectionId) {
  const npath = path.join(lib.nodeDir(courseDir, nodeId), 'node.json');
  if (!fs.existsSync(npath)) return 'none';
  const core = lib.readJson(npath).core || {};
  let sections = core.sections || [];
  if (!sections.length) return 'none';
  if (sectionId) {
    const filtered = sections.filter(function (s) { return s.id === sectionId; });
    if (filtered.length) sections = filtered;
  }
  const anchor = {
    node_id: nodeId,
    section_id: sections[0].id,
    sections: sections,
  };
  if (quote) anchor.quote = String(quote).slice(0, ANCHOR_QUOTE_MAX);
  return anchor;
}

// CONTENT: for MP-06 the node's core sections tagged with node_id + section ids;
// for MP-04 the whole node record; for MP-07 the node as the item under review.
function buildContent(courseDir, nodeId, op) {
  if (!nodeId) return null;
  const npath = path.join(lib.nodeDir(courseDir, nodeId), 'node.json');
  if (!fs.existsSync(npath)) return null;
  const node = lib.readJson(npath);
  if (op === 'MP-04' || op === 'MP-09') return { node_id: node.id || nodeId, node: node };
  const core = node.core || {};
  return {
    node_id: node.id || nodeId,
    sections: (core.sections || []).map(function (s) {
      return { id: s.id, heading: s.heading, body_md: s.body_md };
    }),
    key_points: core.key_points || [],
  };
}

// PROGRESS: latest snapshot per device, merged per S-6 (max competency per
// concept, better level status wins, union of misconceptions/followups_asked).
function LEVEL_RANK() {
  return {
    not_started: 0, failed: 1, passed_after_help: 2, passed_first_try: 3,
  };
}

function mergeSnapshots(snaps) {
  if (!snaps.length) return null;
  const rank = LEVEL_RANK();
  const out = {
    schema: 'metadax.progress/0.2',
    learner_id: snaps[0].learner_id,
    course_id: snaps[0].course_id,
    concepts: {},
    objectives: {},
    followups_asked: [],
  };
  const followups = new Set();
  const objRank = { not_started: 0, in_progress: 1, completed: 2 };
  for (const s of snaps) {
    for (const cid of Object.keys(s.concepts || {})) {
      const c = s.concepts[cid];
      let m = out.concepts[cid];
      if (!m) {
        m = { competency: 0, levels: {}, misconceptions_seen: [], last_seen: null };
        out.concepts[cid] = m;
      }
      if ((c.competency || 0) > m.competency) m.competency = c.competency || 0;
      for (const lv of Object.keys(c.levels || {})) {
        const cur = m.levels[lv];
        if (cur === undefined || (rank[c.levels[lv]] || 0) > (rank[cur] || 0)) {
          m.levels[lv] = c.levels[lv];
        }
      }
      const ms = new Set(m.misconceptions_seen.concat(c.misconceptions_seen || []));
      m.misconceptions_seen = Array.from(ms).sort();
      if (c.last_seen && (!m.last_seen || c.last_seen > m.last_seen)) m.last_seen = c.last_seen;
    }
    for (const oid of Object.keys(s.objectives || {})) {
      const cur = out.objectives[oid];
      if (cur === undefined || (objRank[s.objectives[oid]] || 0) > (objRank[cur] || 0)) {
        out.objectives[oid] = s.objectives[oid];
      }
    }
    for (const f of (s.followups_asked || [])) followups.add(f);
  }
  out.followups_asked = Array.from(followups).sort();
  return out;
}

function buildProgress(learnerDir, courseId) {
  const root = path.join(learnerDir, 'progress', courseId);
  if (!fs.existsSync(root)) return null;
  const snaps = [];
  let devices;
  try { devices = fs.readdirSync(root, { withFileTypes: true }); }
  catch (e) { return null; }
  for (const d of devices) {
    if (!d.isDirectory()) continue;
    const devDir = path.join(root, d.name);
    const files = fs.readdirSync(devDir)
      .filter(function (n) { return n.endsWith('.json'); }).sort();
    if (!files.length) continue;
    // The last name sorts to the latest date (YYYY-MM-DD.json).
    snaps.push(lib.readJson(path.join(devDir, files[files.length - 1])));
  }
  return mergeSnapshots(snaps);
}

// SESSION: turn files (MP-06) or event files (MP-08/other), in seq order, from
// the named session or the latest session directory.
function buildSession(learnerDir, sessionId, op) {
  const sessionsRoot = path.join(learnerDir, 'sessions');
  if (!fs.existsSync(sessionsRoot)) return null;
  let sid = sessionId;
  if (!sid) {
    const dirs = fs.readdirSync(sessionsRoot, { withFileTypes: true })
      .filter(function (e) { return e.isDirectory(); })
      .map(function (e) { return e.name; }).sort();
    if (!dirs.length) return null;
    sid = dirs[dirs.length - 1];
  }
  const sdir = path.join(sessionsRoot, sid);
  if (!fs.existsSync(sdir)) return null;
  const prefix = op === 'MP-06' ? 'turn-' : 'event-';
  const items = fs.readdirSync(sdir)
    .filter(function (n) { return n.indexOf(prefix) === 0 && n.endsWith('.json'); })
    .sort()
    .map(function (n) { return lib.readJson(path.join(sdir, n)); });
  items.sort(function (a, b) { return (a.seq || 0) - (b.seq || 0); });
  return items;
}

function assemble(opts) {
  const op = opts.op;
  const config = {};
  for (const kv of (opts.config || [])) {
    const i = kv.indexOf('=');
    if (i >= 0) config[kv.slice(0, i)] = kv.slice(i + 1);
  }
  if (opts.mode) config.mode = opts.mode;
  coerceConfig(config);

  const course = opts.course
    ? lib.readJson(path.join(opts.course, 'course.json')) : null;
  let learner = null;
  if (opts.learner && opts.learnerId) {
    const pf = path.join(opts.learner, 'profile.json');
    if (fs.existsSync(pf)) learner = lib.readJson(pf);
  }

  const objectiveId = opts.node ? opts.node.split('/')[0] : null;
  let ctx = { lesson: null, module: null, objective: null };
  if (course && objectiveId) ctx = findContext(course, objectiveId);

  const wanted = OP_BLOCKS[op] || new Set(ALL);
  const values = {};
  values.CONFIG = config;

  if (course !== null) {
    if (FULL_COURSE_OPS.has(op)) {
      values.COURSE = course;
    } else {
      const sub = {};
      for (const k of ['schema', 'id', 'title', 'language', 'audience', 'steer', 'policy']) {
        if (k in course) sub[k] = course[k];
      }
      values.COURSE = sub;
    }
  }
  if (ctx.lesson) {
    values.LESSON = { id: ctx.lesson.id, title: ctx.lesson.title, steer: ctx.lesson.steer };
  }
  if (ctx.module) {
    values.MODULE = { id: ctx.module.id, title: ctx.module.title, steer: ctx.module.steer };
  }
  if (ctx.objective) {
    const o = {};
    for (const k of ['id', 'title', 'statement', 'concepts', 'bloom_target']) {
      if (k in ctx.objective) o[k] = ctx.objective[k];
    }
    values.OBJECTIVE = o;
    const byId = {};
    for (const c of (course.concepts || [])) byId[c.id] = c;
    values.CONCEPTS = (ctx.objective.concepts || [])
      .filter(function (c) { return byId[c]; })
      .map(function (c) { return byId[c]; });
  }
  values.LEARNER = learner !== null ? learner : 'none';

  if (opts.node && opts.course) {
    values.PATH = buildPath(opts.course, opts.node);
    values.ANCHOR = buildAnchor(opts.course, opts.node, opts.anchorQuote, opts.section);
    if (objectiveId) {
      values.REGISTRY = buildRegistry(opts.course, lib.moduleOf(opts.node), opts.input);
    }
    // MP-04 `generate` never injects an existing node as CONTENT; only `render`
    // and `extend_core` do. Other ops (MP-06/07/09) keep their CONTENT.
    const wantContent = op !== 'MP-04' || MP04_CONTENT_MODES.has(config.mode);
    if (wantContent) {
      const content = buildContent(opts.course, opts.node, op);
      if (content) values.CONTENT = content;
    }
  }
  // MP-02 suggest/revise takes an explicit CONTENT block from --content (a
  // suggest request or the existing course.json). design/quick take none.
  // MP-07 grades ONE practice item: CONTENT must be the item itself, so an
  // explicit --content wins over the node sections (finding F-L3, 2026-09-28:
  // the flag was ignored for MP-07 and the stack carried the node instead).
  if (((op === 'MP-02' && MP02_CONTENT_MODES.has(config.mode)) || op === 'MP-07') && opts.content) {
    try { values.CONTENT = lib.readJson(opts.content); }
    catch (e) { values.CONTENT = readText(opts.content); }
  }
  if (opts.learner && course) {
    const prog = buildProgress(opts.learner, course.id);
    if (prog) values.PROGRESS = prog;
    const sess = buildSession(opts.learner, opts.session, op);
    if (sess) values.SESSION = sess;
  }
  if (opts.input != null) values.INPUT = String(opts.input).slice(0, INPUT_MAX);

  const kernelBody = extractFence(readText(findMp(opts.prompts, 'MP-00')));
  const opBody = extractFence(readText(findMp(opts.prompts, op)));

  const parts = [kernelBody, opBody];
  const used = [];
  for (const name of BLOCK_ORDER) {
    if (!wanted.has(name)) continue;
    if (!(name in values)) continue;
    const val = values[name];
    if (val === null || val === undefined) continue;
    if (SKIP_IF_EMPTY.has(name)) {
      const empty = (Array.isArray(val) && val.length === 0)
        || (val && typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0);
      if (empty) continue;
    }
    parts.push(block(name, val));
    used.push(name);
  }
  return { text: parts.join('\n\n') + '\n', blocks: used };
}

function getOpt(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
}

function getAll(argv, name) {
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === name && i + 1 < argv.length) out.push(argv[i + 1]);
  }
  return out;
}

function main(argv) {
  const op = getOpt(argv, '--op');
  const prompts = getOpt(argv, '--prompts');
  if (!op || !prompts) {
    process.stderr.write('usage: node tools/assemble.js --op MP-05 --prompts <dir> '
      + '[--course <dir>] [--learner <dir>] [--learner-id <id>] [--node <id>] '
      + '[--input "<text>"] [--config k=v ...] [--section <id>] [--mode <mode>] '
      + '[--session <id>] [--anchor-quote "<text>"] [--content <file>] [--out <file>]\n');
    return 2;
  }
  const opts = {
    op: op,
    prompts: prompts,
    course: getOpt(argv, '--course'),
    learner: getOpt(argv, '--learner'),
    learnerId: getOpt(argv, '--learner-id'),
    node: getOpt(argv, '--node'),
    input: argv.indexOf('--input') >= 0 ? getOpt(argv, '--input') : null,
    config: getAll(argv, '--config'),
    section: getOpt(argv, '--section'),
    mode: getOpt(argv, '--mode'),
    session: getOpt(argv, '--session'),
    anchorQuote: getOpt(argv, '--anchor-quote'),
    content: getOpt(argv, '--content'),
  };
  const out = getOpt(argv, '--out');
  const result = assemble(opts);
  if (out) fs.writeFileSync(out, result.text, 'utf-8');
  const bytes = Buffer.byteLength(result.text, 'utf-8');
  process.stdout.write(JSON.stringify({
    bytes: bytes,
    tokens_estimate: Math.floor(bytes / 4),
    blocks: result.blocks,
  }) + '\n');
  return 0;
}

module.exports = { assemble, extractFence, buildRegistry, mergeSnapshots };

if (require.main === module) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (e) {
    process.stderr.write('error: ' + e.message + '\n');
    process.exit(1);
  }
}
