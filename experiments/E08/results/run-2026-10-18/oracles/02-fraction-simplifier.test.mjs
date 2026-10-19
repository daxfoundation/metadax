import { test } from 'node:test';
import assert from 'node:assert/strict';

const { simplifyFraction } = await import(process.env.IMPL_PATH);

test('simplifyFraction(6,8) → {num:3,den:4}', () => {
  const r = simplifyFraction(6, 8);
  assert.strictEqual(r.num, 3);
  assert.strictEqual(r.den, 4);
});

test('simplifyFraction(6,8) has steps array', () => {
  const r = simplifyFraction(6, 8);
  assert.ok(Array.isArray(r.steps), 'steps not an array');
  assert.ok(r.steps.length >= 1, 'steps is empty');
});

test('simplifyFraction(12,18) → {num:2,den:3}', () => {
  const r = simplifyFraction(12, 18);
  assert.strictEqual(r.num, 2);
  assert.strictEqual(r.den, 3);
});

test('simplifyFraction(5,7) → {num:5,den:7} (already simplified)', () => {
  const r = simplifyFraction(5, 7);
  assert.strictEqual(r.num, 5);
  assert.strictEqual(r.den, 7);
});

test('simplifyFraction(100,25) → {num:4,den:1}', () => {
  const r = simplifyFraction(100, 25);
  assert.strictEqual(r.num, 4);
  assert.strictEqual(r.den, 1);
});

test('each step has description, num, den', () => {
  const r = simplifyFraction(12, 18);
  for (const step of r.steps) {
    assert.ok('description' in step, 'step missing description');
    assert.ok('num' in step, 'step missing num');
    assert.ok('den' in step, 'step missing den');
  }
});
