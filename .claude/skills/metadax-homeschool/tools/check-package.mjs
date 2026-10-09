#!/usr/bin/env node
// check-package.mjs — validate a MetaDAX homeschool package with zero dependencies.
//
//   node check-package.mjs <package.json>
//
// Loads the browser-identical package-check.js in a vm sandbox (so the same
// rules run on the page, in the player, and here) and reports errors/warnings.
// Exits 1 if there are errors, 0 otherwise. No network, no install.
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import vm from "vm";

const here = dirname(fileURLToPath(import.meta.url));
const [, , pkgPath] = process.argv;
if (!pkgPath) {
  console.error("Usage: node check-package.mjs <package.json>");
  process.exit(2);
}

const checkSrc = readFileSync(resolve(here, "package-check.js"), "utf8");
const ctx = { globalThis: {}, TextEncoder, TextDecoder, Buffer };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(checkSrc, ctx);
const MetaDAXCheck = ctx.MetaDAXCheck;
if (!MetaDAXCheck) {
  console.error("package-check.js did not define MetaDAXCheck");
  process.exit(2);
}

const lists = JSON.parse(readFileSync(resolve(here, "check-lists.json"), "utf8"));
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const { errors, warnings } = MetaDAXCheck.checkPackage(pkg, lists);

if (warnings.length) {
  console.log("Warnings (the builder decides):");
  for (const w of warnings) console.log("  [warn]  " + w.path + " — " + w.msg);
}
if (errors.length) {
  console.log("Errors (the package does not go out):");
  for (const e of errors) console.log("  [error] " + e.path + " — " + e.msg);
  process.exit(1);
}
if (!warnings.length) console.log("OK — no errors or warnings.");
else console.log("OK — no errors.");
