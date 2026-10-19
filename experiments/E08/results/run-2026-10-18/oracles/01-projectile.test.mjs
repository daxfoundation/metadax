import { test } from 'node:test';
import assert from 'node:assert/strict';

const { range } = await import(process.env.IMPL_PATH);

const EPS = 0.01;

test('range(10, 45, 9.81) ≈ 10.193', () => {
  const r = range(10, 45, 9.81);
  assert.ok(Math.abs(r - 10.193) < EPS, `got ${r}`);
});

test('range(20, 30, 9.81) ≈ 35.304', () => {
  const r = range(20, 30, 9.81);
  assert.ok(Math.abs(r - 35.304) < EPS, `got ${r}`);
});

test('range(15, 60, 9.81) ≈ 19.858', () => {
  const r = range(15, 60, 9.81);
  assert.ok(Math.abs(r - 19.858) < EPS, `got ${r}`);
});

test('range(0, 45, 9.81) === 0', () => {
  assert.strictEqual(range(0, 45, 9.81), 0);
});

test('range(10, 0, 9.81) === 0', () => {
  assert.strictEqual(range(10, 0, 9.81), 0);
});

test('range(10, 90, 9.81) ≈ 0', () => {
  const r = range(10, 90, 9.81);
  assert.ok(Math.abs(r) < EPS, `got ${r}`);
});

test('range(10, 45, 1.62) ≈ 61.728 (Moon)', () => {
  const r = range(10, 45, 1.62);
  assert.ok(Math.abs(r - 61.728) < 0.1, `got ${r}`);
});
