(function (global) {
  "use strict";

  // ── Contrast utilities ────────────────────────────────────────────────────
  function hexToRgb(h) {
    var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h);
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
  }
  function srgbLin(c) {
    var v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }
  function luminance(rgb) {
    return 0.2126 * srgbLin(rgb[0]) + 0.7152 * srgbLin(rgb[1]) + 0.0722 * srgbLin(rgb[2]);
  }
  function contrastRatio(h1, h2) {
    var r1 = hexToRgb(h1), r2 = hexToRgb(h2);
    if (!r1 || !r2) return null;
    var L1 = luminance(r1), L2 = luminance(r2);
    var hi = Math.max(L1, L2), lo = Math.min(L1, L2);
    return (hi + 0.05) / (lo + 0.05);
  }

  // ── Walk all string values in an object ──────────────────────────────────
  // side tracks "guide" | "learner" | "" depending on which branch we are in
  function walkStrings(obj, cb, path, side) {
    if (typeof obj === "string") {
      cb(obj, path || "", side || "");
    } else if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        walkStrings(obj[i], cb, (path || "") + "[" + i + "]", side);
      }
    } else if (obj && typeof obj === "object") {
      var keys = Object.keys(obj);
      for (var ki = 0; ki < keys.length; ki++) {
        var k = keys[ki];
        var nextSide = k === "guide" ? "guide" : k === "learner" ? "learner" : side;
        walkStrings(obj[k], cb, (path ? path + "." : "") + k, nextSide || side);
      }
    }
  }

  // ── Block / section helpers ───────────────────────────────────────────────
  var GAME_TYPES = { quiz: 1, sort: 1, sequence: 1, build: 1 };
  var GUIDE_ORDER = ["upnext", "learned", "steps", "tricky", "tellus"];
  // Canonical age bands (shared with the sample index). Mixed-age families use
  // these on learners[] and on per-item for_age tags.
  var AGE_BANDS = { "4-6": 1, "4-9": 1, "7-9": 1, "10-12": 1, "13-15": 1, "16-18": 1 };

  // Visit every object that carries a who/for_age "job" tag (a lead, a step, a
  // quiz level, or a game item). Used only for the optional multi-learner split;
  // a package with no such tags is never touched.
  function walkJobs(obj, cb, path) {
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) walkJobs(obj[i], cb, (path || "") + "[" + i + "]");
    } else if (obj && typeof obj === "object") {
      if (obj.who !== undefined || obj.for_age !== undefined) cb(obj, path || "");
      var keys = Object.keys(obj);
      for (var k = 0; k < keys.length; k++) {
        walkJobs(obj[keys[k]], cb, (path ? path + "." : "") + keys[k]);
      }
    }
  }

  function allBlocks(sections) {
    var out = [];
    for (var i = 0; i < (sections || []).length; i++) {
      var blks = sections[i].blocks || [];
      for (var j = 0; j < blks.length; j++) out.push(blks[j]);
    }
    return out;
  }

  function hasType(sections, type) {
    var blks = allBlocks(sections);
    for (var i = 0; i < blks.length; i++) if (blks[i].type === type) return true;
    return false;
  }

  function hasGame(sections) {
    var blks = allBlocks(sections);
    for (var i = 0; i < blks.length; i++) if (GAME_TYPES[blks[i].type]) return true;
    return false;
  }

  function hasTwoLevelFaq(sections) {
    var blks = allBlocks(sections);
    for (var i = 0; i < blks.length; i++) {
      var b = blks[i];
      if (b.type === "faq" && Array.isArray(b.more)) {
        for (var j = 0; j < b.more.length; j++) {
          if (Array.isArray(b.more[j].more) && b.more[j].more.length > 0) return true;
        }
      }
    }
    return false;
  }

  function checkChoiceErrors(sections, errors, sideLabel) {
    for (var si = 0; si < (sections || []).length; si++) {
      var sec = sections[si];
      var sp = sideLabel + ".sections[" + sec.id + "]";
      var blks = sec.blocks || [];
      for (var bi = 0; bi < blks.length; bi++) {
        var b = blks[bi];
        if (b.type === "quiz") {
          var mids = {};
          if (b.mistakes) {
            var mk = Object.keys(b.mistakes);
            for (var m = 0; m < mk.length; m++) mids[mk[m]] = 1;
          }
          var levels = b.levels || [];
          for (var li = 0; li < levels.length; li++) {
            var items = levels[li].items || [];
            for (var ii = 0; ii < items.length; ii++) {
              var choices = items[ii].choices || [];
              for (var ci = 0; ci < choices.length; ci++) {
                var c = choices[ci];
                var p = sp + ".quiz[" + b.id + "].l" + li + ".i" + ii + ".c" + ci;
                if (!c.correct && !c.mistake) {
                  errors.push({ path: p, msg: "choice has neither correct:true nor a mistake id" });
                } else if (c.mistake && !mids[c.mistake]) {
                  errors.push({ path: p, msg: "choice refers to undefined mistake id: " + c.mistake });
                }
              }
            }
          }
        } else if (b.type === "sequence") {
          var steps = b.steps || [];
          for (var sti = 0; sti < steps.length; sti++) {
            var sch = steps[sti].choices || [];
            for (var sci = 0; sci < sch.length; sci++) {
              var sc = sch[sci];
              var sp2 = sp + ".sequence[" + b.id + "].s" + sti + ".c" + sci;
              if (!sc.correct && !sc.mistake) {
                errors.push({ path: sp2, msg: "choice has neither correct:true nor a mistake id" });
              }
            }
          }
        }
      }
    }
  }

  // ── Text pattern checks ───────────────────────────────────────────────────
  var RE_EMOJI = /\p{Extended_Pictographic}/u;
  var RE_HTTP = /https?:\/\/|www\./i;
  var RE_SHORTENER = /\b(bit\.ly|t\.co|goo\.gl|ow\.ly|tinyurl\.com|is\.gd|buf\.ly|dlvr\.it|short\.link|ift\.tt|rb\.gy)\b/i;
  var RE_BARE_DOMAIN = /\b[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:com|org|net|ca|fr|io|co|ly|gl|app|ai|dev|edu|gov|me)\b/i;

  var RE_ROLE = /\b(role|roles|rôle|rôles)\b/i;
  var RE_DATE = new RegExp(
    "\\b\\d{4}[-\\/]\\d{1,2}[-\\/]\\d{1,2}\\b" +
    "|\\b\\d{1,2}[-\\/]\\d{1,2}[-\\/]\\d{2,4}\\b" +
    "|\\b(?:January|February|March|April|May|June|July|August|September|October|November|December" +
    "|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\\s+\\d{1,2}\\b" +
    "|\\b\\d{1,2}\\s+(?:January|February|March|April|May|June|July|August|September|October|November|December" +
    "|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\\b",
    "i"
  );
  var RE_DURATION = /\b\d+\s*(?:minutes?|heures?|hours?|mins?\b|hrs?\b)/i;
  var RE_EMAIL = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/;
  var RE_PHONE = /(?:\+?1[\s\-.])?\(?\d{3}\)?[\s\-.]\d{3}[\s\-.]\d{4}\b|\b\d{3}[\s\-]\d{4}\b/;
  var RE_INCL_DOT = /\w[·‧]\w/;

  // Structural fields whose string values should not be text-checked
  var SKIP_PATH_SUFFIX = /\.(format|type|id|tone|bin|mistake|lang|tab|format|word|v|who|for_age|age_band)$|\.v$/;

  function hasLink(s) {
    return RE_HTTP.test(s) || RE_SHORTENER.test(s) || RE_BARE_DOMAIN.test(s);
  }

  function buildWordRe(words) {
    if (!words || !words.length) return null;
    var parts = words.map(function (w) {
      return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });
    return new RegExp("(?:^|[^a-zA-ZÀ-ɏ])(?:" + parts.join("|") + ")(?:[^a-zA-ZÀ-ɏ]|$)", "i");
  }

  function buildTitleRe(titles) {
    if (!titles || !titles.length) return null;
    var parts = titles.map(function (t) {
      return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\.?";
    });
    return new RegExp("(?:^|\\s)(?:" + parts.join("|") + ")\\s+[A-ZÀ-ÖØ-Þ]", "");
  }

  // ── checkPackage ──────────────────────────────────────────────────────────
  function checkPackage(pkg, lists) {
    var errors = [], warnings = [];
    var L = lists || {};

    // format / version
    if (!pkg || pkg.format !== "metadax-package") {
      errors.push({ path: "format", msg: 'expected "metadax-package", got: ' + (pkg && pkg.format) });
    }
    if (!pkg || pkg.v !== 1) {
      errors.push({ path: "v", msg: "expected 1, got: " + (pkg && pkg.v) });
    }
    if (!pkg) return { errors: errors, warnings: warnings };

    var guide = pkg.guide || {};
    var learner = pkg.learner || {};
    var gs = guide.sections || [];
    var ls = learner.sections || [];

    // guide sections: required ids present and in order
    var foundIds = gs.map(function (s) { return s.id; });
    for (var ri = 0; ri < GUIDE_ORDER.length; ri++) {
      if (foundIds.indexOf(GUIDE_ORDER[ri]) === -1) {
        errors.push({ path: "guide.sections", msg: "missing required section: " + GUIDE_ORDER[ri] });
      }
    }
    var lastIdx = -1;
    for (var oi = 0; oi < GUIDE_ORDER.length; oi++) {
      var idx = foundIds.indexOf(GUIDE_ORDER[oi]);
      if (idx >= 0) {
        if (idx <= lastIdx) {
          errors.push({ path: "guide.sections", msg: "section out of order: " + GUIDE_ORDER[oi] });
        }
        lastIdx = idx;
      }
    }

    // learner: at least one game block
    if (!hasGame(ls)) {
      errors.push({ path: "learner.sections", msg: "no game block on learner side" });
    }

    // game choice validity
    checkChoiceErrors(gs, errors, "guide");
    checkChoiceErrors(ls, errors, "learner");

    // required block types
    if (!hasType(gs, "human")) errors.push({ path: "guide.sections", msg: "no human block on guide side" });
    if (!hasType(gs, "lead"))  errors.push({ path: "guide.sections", msg: "no lead block on guide side" });
    if (!hasType(ls, "lead"))  errors.push({ path: "learner.sections", msg: "no lead block on learner side" });
    if (!hasTwoLevelFaq(gs))   errors.push({ path: "guide.sections", msg: "no two-level faq on guide side" });
    if (!hasTwoLevelFaq(ls))   errors.push({ path: "learner.sections", msg: "no two-level faq on learner side" });
    if (hasType(ls, "copy"))   errors.push({ path: "learner.sections", msg: "copy block not allowed on learner side" });

    // contrast: text on bg and text on surface, both themes, both sides
    var sides = [["guide", guide], ["learner", learner]];
    for (var si = 0; si < sides.length; si++) {
      var sideName = sides[si][0], sideObj = sides[si][1];
      var themes = ["light", "dark"];
      for (var ti = 0; ti < themes.length; ti++) {
        var tname = themes[ti];
        var th = sideObj.theme && sideObj.theme[tname];
        if (!th) continue;
        var r1 = contrastRatio(th.text, th.bg);
        var r2 = contrastRatio(th.text, th.surface);
        if (r1 !== null && r1 < 4.5) {
          errors.push({ path: sideName + ".theme." + tname, msg: "text/bg contrast " + r1.toFixed(2) + " < 4.5:1" });
        }
        if (r2 !== null && r2 < 4.5) {
          errors.push({ path: sideName + ".theme." + tname, msg: "text/surface contrast " + r2.toFixed(2) + " < 4.5:1" });
        }
      }
    }

    // build pattern-check regexes from lists
    var titleRe    = buildTitleRe(L.titles);
    var vendorRe   = buildWordRe(L.vendor_words);
    var aiRe       = buildWordRe(L.ai_words);
    var brandRe    = buildWordRe(L.brands);

    // walk all text strings
    walkStrings(pkg, function (str, path, side) {
      if (SKIP_PATH_SUFFIX.test(path)) return;

      if (RE_EMOJI.test(str))                              errors.push({ path: path, msg: "emoji or pictograph" });
      if (hasLink(str))                                    errors.push({ path: path, msg: "link or bare domain" });
      if (titleRe && titleRe.test(str))                    errors.push({ path: path, msg: "title before a name" });
      if (RE_ROLE.test(str))                               errors.push({ path: path, msg: 'word "role/rôle" not allowed' });
      if (vendorRe && vendorRe.test(str))                  errors.push({ path: path, msg: "vendor or AI brand name" });
      if (side === "learner" && aiRe && aiRe.test(str))    errors.push({ path: path, msg: "AI word on learner side" });

      if (RE_DATE.test(str))                               warnings.push({ path: path, msg: "looks like a date" });
      if (RE_DURATION.test(str))                           warnings.push({ path: path, msg: "duration in minutes/hours" });
      if (brandRe && brandRe.test(str))                    warnings.push({ path: path, msg: "brand word" });
      if (RE_INCL_DOT.test(str))                           warnings.push({ path: path, msg: "inclusive dot form" });
      if (RE_EMAIL.test(str))                              warnings.push({ path: path, msg: "looks like an email address" });
      if (RE_PHONE.test(str))                              warnings.push({ path: path, msg: "looks like a phone number" });
    });

    // size warning
    try {
      var bytes = (typeof TextEncoder !== "undefined")
        ? new TextEncoder().encode(JSON.stringify(pkg)).length
        : Buffer.byteLength(JSON.stringify(pkg), "utf8");
      if (bytes > 60000) warnings.push({ path: "", msg: "package size " + Math.round(bytes / 1024) + " KB exceeds 60 KB" });
    } catch (e) { /* ignore */ }

    // quiz level/item count warnings
    var allSections = [["guide", gs], ["learner", ls]];
    for (var asi = 0; asi < allSections.length; asi++) {
      var asLabel = allSections[asi][0], asSecs = allSections[asi][1];
      var ablks = allBlocks(asSecs);
      for (var abi = 0; abi < ablks.length; abi++) {
        var ab = ablks[abi];
        if (ab.type === "quiz") {
          var lvls = ab.levels || [];
          if (lvls.length < 3) {
            warnings.push({ path: asLabel + ".quiz[" + ab.id + "]", msg: "fewer than 3 levels" });
          }
          for (var lvi = 0; lvi < lvls.length; lvi++) {
            if ((lvls[lvi].items || []).length < 4) {
              warnings.push({ path: asLabel + ".quiz[" + ab.id + "].level[" + lvls[lvi].level + "]", msg: "fewer than 4 items" });
            }
          }
        }
      }
    }

    // ── multi-learner split (all optional, fully backward compatible) ───────
    // A package with no learners[] and no who/for_age tags is not touched by any
    // check below, so single-learner packages validate exactly as before.
    var learnerNames = { all: 1 };
    var haveLearners = false;
    if (pkg.learners !== undefined) {
      if (!Array.isArray(pkg.learners) || pkg.learners.length === 0) {
        errors.push({ path: "learners", msg: "learners, when present, must be a non-empty array" });
      } else {
        haveLearners = true;
        for (var pli = 0; pli < pkg.learners.length; pli++) {
          var lr = pkg.learners[pli] || {};
          var lrp = "learners[" + pli + "]";
          if (typeof lr.nickname !== "string" || !lr.nickname.trim()) {
            errors.push({ path: lrp + ".nickname", msg: "each learner needs a non-empty nickname" });
          } else {
            learnerNames[lr.nickname] = 1;
          }
          if (lr.age_band === undefined) {
            errors.push({ path: lrp + ".age_band", msg: "each learner needs an age_band" });
          } else if (!AGE_BANDS[lr.age_band]) {
            errors.push({ path: lrp + ".age_band", msg: "age_band not a canonical band: " + lr.age_band });
          }
        }
      }
    }

    // who / for_age job tags, wherever they appear (lead, step, quiz level, item)
    walkJobs(pkg, function (o, p) {
      if (o.who !== undefined) {
        if (typeof o.who !== "string" || !o.who.trim()) {
          errors.push({ path: p + ".who", msg: 'who must be a non-empty string (a learner nickname or "all")' });
        } else if (haveLearners && !learnerNames[o.who]) {
          errors.push({ path: p + ".who", msg: 'who matches no learner nickname or "all": ' + o.who });
        } else if (!haveLearners && o.who !== "all") {
          warnings.push({ path: p + ".who", msg: "who set but no learners[] declared; add learners[] so the split can render" });
        }
      }
      if (o.for_age !== undefined && !AGE_BANDS[o.for_age]) {
        warnings.push({ path: p + ".for_age", msg: "for_age not a canonical band: " + o.for_age });
      }
    });

    return { errors: errors, warnings: warnings };
  }

  // ── parseNote ─────────────────────────────────────────────────────────────
  var LABEL_MAP = {
    "called": "called", "age": "age", "subject": "subject",
    "stuck on": "stuck", "a real wrong answer": "wrong",
    "loves": "loves", "knows more than me about": "ahead",
    "already tried": "tried", "learns best": "learns",
    "also": "learns_more", "sessions": "sessions",
    "uses the page on": "device", "this subject for me": "comfort",
    "explain things to me": "explain", "language": "lang",
    "region": "region",
    "keep this note to improve metadax": "keep",
    "use my page as a public sample": "sample",
    "ref": "ref", "session": "session"
  };

  function parseNote(text) {
    if (!text || typeof text !== "string") return null;
    var lines = text.split(/\r?\n/);
    if (!lines.length) return null;

    var headerLine = lines[0].trim();
    var format, v;
    var intakeM = /^MetaDAX intake v(\d+)$/i.exec(headerLine);
    var nextM   = /^MetaDAX next v(\d+)$/i.exec(headerLine);
    if (intakeM)     { format = "metadax-intake"; v = parseInt(intakeM[1], 10); }
    else if (nextM)  { format = "metadax-next";   v = parseInt(nextM[1],   10); }
    else return null;

    var fields = {};
    var sections = [];
    var curSection = null;

    for (var i = 1; i < lines.length; i++) {
      var trimmed = lines[i].trim();
      if (!trimmed) continue;

      if (trimmed.slice(0, 3) === "-- ") {
        curSection = { name: trimmed.slice(3).trim(), lines: [] };
        sections.push(curSection);
        continue;
      }

      var colon = trimmed.indexOf(": ");
      if (colon > 0) {
        var label = trimmed.slice(0, colon).trim().toLowerCase();
        var val   = trimmed.slice(colon + 2).trim();
        var key   = LABEL_MAP[label];
        if (key) fields[key] = val;
      }

      if (curSection) curSection.lines.push(trimmed);
    }

    return { format: format, v: v, fields: fields, sections: sections };
  }

  // ── base64url helpers ─────────────────────────────────────────────────────
  function bufToBase64url(buf) {
    var s;
    if (typeof Buffer !== "undefined") {
      s = Buffer.from(buf).toString("base64");
    } else {
      var bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
      var raw = "";
      for (var i = 0; i < bytes.length; i++) raw += String.fromCharCode(bytes[i]);
      s = btoa(raw);
    }
    return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function base64urlToBuf(s) {
    var b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    var padded = b64 + "===".slice(0, (4 - b64.length % 4) % 4);
    if (typeof Buffer !== "undefined") return Buffer.from(padded, "base64");
    var raw = atob(padded);
    var bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return bytes;
  }

  function strToUtf8(s) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(s);
    if (typeof Buffer !== "undefined")     return Buffer.from(s, "utf8");
    throw new Error("No UTF-8 encoder available");
  }

  function utf8ToStr(buf) {
    if (typeof TextDecoder !== "undefined") return new TextDecoder().decode(buf);
    if (typeof Buffer !== "undefined")      return Buffer.from(buf).toString("utf8");
    throw new Error("No UTF-8 decoder available");
  }

  async function deflateRawBrowser(data) {
    var cs = new CompressionStream("deflate-raw");
    var writer = cs.writable.getWriter();
    await writer.write(data);
    await writer.close();
    var chunks = [], reader = cs.readable.getReader();
    while (true) {
      var res = await reader.read();
      if (res.done) break;
      chunks.push(res.value);
    }
    var total = chunks.reduce(function (a, c) { return a + c.length; }, 0);
    var out = new Uint8Array(total);
    var off = 0;
    for (var i = 0; i < chunks.length; i++) { out.set(chunks[i], off); off += chunks[i].length; }
    return out;
  }

  async function inflateRawBrowser(data) {
    var ds = new DecompressionStream("deflate-raw");
    var writer = ds.writable.getWriter();
    await writer.write(data instanceof Uint8Array ? data : new Uint8Array(data));
    await writer.close();
    var chunks = [], reader = ds.readable.getReader();
    while (true) {
      var res = await reader.read();
      if (res.done) break;
      chunks.push(res.value);
    }
    var total = chunks.reduce(function (a, c) { return a + c.length; }, 0);
    var out = new Uint8Array(total);
    var off = 0;
    for (var i = 0; i < chunks.length; i++) { out.set(chunks[i], off); off += chunks[i].length; }
    return out;
  }

  // ── encodePackage / decodePackage ─────────────────────────────────────────
  async function encodePackage(pkg, impl) {
    var json = JSON.stringify(pkg);
    var utf8 = strToUtf8(json);
    var compressed;
    if (impl && typeof impl.deflateRaw === "function") {
      var r = impl.deflateRaw(utf8);
      compressed = (r && typeof r.then === "function") ? await r : r;
    } else if (typeof CompressionStream !== "undefined") {
      compressed = await deflateRawBrowser(utf8);
    } else {
      throw new Error("No deflate-raw implementation available. Pass impl or use a browser with CompressionStream.");
    }
    return bufToBase64url(compressed);
  }

  async function decodePackage(str, impl) {
    var buf = base64urlToBuf(str);
    var decompressed;
    if (impl && typeof impl.inflateRaw === "function") {
      var r = impl.inflateRaw(buf);
      decompressed = (r && typeof r.then === "function") ? await r : r;
    } else if (typeof DecompressionStream !== "undefined") {
      decompressed = await inflateRawBrowser(buf);
    } else {
      throw new Error("No inflate-raw implementation available. Pass impl or use a browser with DecompressionStream.");
    }
    return JSON.parse(utf8ToStr(decompressed));
  }

  global.MetaDAXCheck = {
    checkPackage: checkPackage,
    parseNote: parseNote,
    encodePackage: encodePackage,
    decodePackage: decodePackage
  };

})(globalThis);
