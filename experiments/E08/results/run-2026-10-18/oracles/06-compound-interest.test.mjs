import { test } from 'node:test';
import assert from 'node:assert/strict';

const { compoundTable } = await import(process.env.IMPL_PATH);

const approx = (a, b, tol = 0.02) => Math.abs(a - b) <= tol;

test('compoundTable length equals years', () => {
  assert.strictEqual(compoundTable(1000, 0.05, 1, 3).length, 3);
});

test('5%, annual, 3yr: year 1 balance = 1050', () => {
  const t = compoundTable(1000, 0.05, 1, 3);
  assert.ok(approx(t[0].balance, 1050), `got ${t[0].balance}`);
});

test('5%, annual, 3yr: year 3 balance ≈ 1157.63', () => {
  const t = compoundTable(1000, 0.05, 1, 3);
  assert.ok(approx(t[2].balance, 1157.63), `got ${t[2].balance}`);
});

test('5%, annual, 3yr: total_interest in year 3 ≈ 157.63', () => {
  const t = compoundTable(1000, 0.05, 1, 3);
  assert.ok(approx(t[2].total_interest, 157.63, 0.05), `got ${t[2].total_interest}`);
});

test('10%, monthly, 1yr: balance ≈ 1104.71', () => {
  const t = compoundTable(1000, 0.10, 12, 1);
  assert.ok(approx(t[0].balance, 1104.71), `got ${t[0].balance}`);
});

test('0% rate: all balances = principal', () => {
  const t = compoundTable(1000, 0, 1, 3);
  for (const row of t) {
    assert.ok(approx(row.balance, 1000), `got ${row.balance}`);
  }
});

test('rows are 1-indexed', () => {
  const t = compoundTable(1000, 0.05, 1, 3);
  assert.strictEqual(t[0].year, 1);
  assert.strictEqual(t[2].year, 3);
});
