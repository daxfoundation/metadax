import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const context = { TextEncoder, TextDecoder, Buffer };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(readFileSync(resolve(here, "package-check.js"), "utf8"), context);

function samplePackage(withWayLine) {
  return {
    format: "metadax-package",
    v: 1,
    guide: { sections: [{ blocks: [{ type: "p", text: withWayLine ? "A way, never the way." : "A sample lesson." }] }] },
    learner: { sections: [] }
  };
}

test("warns when package text omits the guiding line", () => {
  const result = context.MetaDAXCheck.checkPackage(samplePackage(false), {});
  assert.ok(result.warnings.some((warning) => warning.msg === 'missing "a way, never the way" line'));
});

test("accepts the guiding line regardless of case", () => {
  const result = context.MetaDAXCheck.checkPackage(samplePackage(true), {});
  assert.ok(!result.warnings.some((warning) => warning.msg === 'missing "a way, never the way" line'));
});
