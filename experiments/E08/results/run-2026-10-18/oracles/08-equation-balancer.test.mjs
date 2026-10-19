import { test } from 'node:test';
import assert from 'node:assert/strict';

const { balanceEquation } = await import(process.env.IMPL_PATH);

test('"2x + 3 = 7" → value 2', () => {
  const r = balanceEquation('2x + 3 = 7');
  assert.strictEqual(r.value, 2);
});

test('"3x - 9 = 0" → value 3', () => {
  const r = balanceEquation('3x - 9 = 0');
  assert.strictEqual(r.value, 3);
});

test('"x + 5 = 12" → value 7', () => {
  const r = balanceEquation('x + 5 = 12');
  assert.strictEqual(r.value, 7);
});

test('"-2x + 8 = 2" → value 3', () => {
  const r = balanceEquation('-2x + 8 = 2');
  assert.strictEqual(r.value, 3);
});

test('"4x = 20" → value 5', () => {
  const r = balanceEquation('4x = 20');
  assert.strictEqual(r.value, 5);
});

test('result has variable "x"', () => {
  const r = balanceEquation('2x + 3 = 7');
  assert.strictEqual(r.variable, 'x');
});

test('steps is a non-empty array', () => {
  const r = balanceEquation('2x + 3 = 7');
  assert.ok(Array.isArray(r.steps) && r.steps.length > 0, 'steps missing or empty');
});

test('each step has description, lhs, rhs', () => {
  const r = balanceEquation('2x + 3 = 7');
  for (const s of r.steps) {
    assert.ok('description' in s, 'step missing description');
    assert.ok('lhs' in s, 'step missing lhs');
    assert.ok('rhs' in s, 'step missing rhs');
  }
});
