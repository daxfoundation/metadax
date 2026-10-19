import { test } from 'node:test';
import assert from 'node:assert/strict';

const { thinPool } = await import(process.env.IMPL_PATH);

test('promise 50 of 100 GiB → not over_committed', () => {
  const r = thinPool(100, [{ type: 'promise', gib: 50 }]);
  assert.strictEqual(r.promised_gib, 50);
  assert.strictEqual(r.written_gib, 0);
  assert.strictEqual(r.physical_used_gib, 0);
  assert.strictEqual(r.over_committed, false);
});

test('promise 120 of 100 GiB → over_committed', () => {
  const r = thinPool(100, [{ type: 'promise', gib: 120 }]);
  assert.strictEqual(r.over_committed, true);
});

test('write 40 GiB → physical_used_gib = 40', () => {
  const r = thinPool(100, [{ type: 'write', gib: 40 }]);
  assert.strictEqual(r.written_gib, 40);
  assert.strictEqual(r.physical_used_gib, 40);
});

test('write 40, free 10 → written=30, physical still 40', () => {
  const r = thinPool(100, [
    { type: 'write', gib: 40 },
    { type: 'free',  gib: 10 }
  ]);
  assert.strictEqual(r.written_gib, 30);
  assert.strictEqual(r.physical_used_gib, 40);
  assert.strictEqual(r.freed_gib, 10);
});

test('write 40, discard 15 → physical_used = 25', () => {
  const r = thinPool(100, [
    { type: 'write',   gib: 40 },
    { type: 'discard', gib: 15 }
  ]);
  assert.strictEqual(r.physical_used_gib, 25);
});

test('trim behaves like discard', () => {
  const r = thinPool(100, [
    { type: 'write', gib: 30 },
    { type: 'trim',  gib: 10 }
  ]);
  assert.strictEqual(r.physical_used_gib, 20);
});

test('physical_used_gib > totalGib → over_full', () => {
  const r = thinPool(10, [{ type: 'write', gib: 15 }]);
  assert.strictEqual(r.over_full, true);
});
