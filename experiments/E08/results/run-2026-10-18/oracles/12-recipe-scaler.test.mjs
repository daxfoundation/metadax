import { test } from 'node:test';
import assert from 'node:assert/strict';

const { scaleRecipe } = await import(process.env.IMPL_PATH);

const approx = (a, b, tol = 0.001) => Math.abs(a - b) <= tol;

test('scale flour 2 cup × 1.5 → 3 cup', () => {
  const r = scaleRecipe([{ name: 'flour', amount: 2, unit: 'cup' }], 1.5);
  assert.ok(approx(r[0].amount, 3), `got ${r[0].amount}`);
  assert.strictEqual(r[0].unit, 'cup');
});

test('scale egg 3 whole × 2 → 6', () => {
  const r = scaleRecipe([{ name: 'egg', amount: 3, unit: 'whole' }], 2);
  assert.strictEqual(r[0].amount, 6);
});

test('scale milk 1 cup × 0.333 → 0.25 (nearest 0.25)', () => {
  const r = scaleRecipe([{ name: 'milk', amount: 1, unit: 'cup' }], 0.333);
  assert.ok(approx(r[0].amount, 0.25), `got ${r[0].amount}`);
});

test('scale butter 100g × 1.5 → 150g', () => {
  const r = scaleRecipe([{ name: 'butter', amount: 100, unit: 'g' }], 1.5);
  assert.ok(approx(r[0].amount, 150), `got ${r[0].amount}`);
});

test('scale baking powder 1 tsp × 0.5 → 0.5 (nearest 0.25)', () => {
  const r = scaleRecipe([{ name: 'baking powder', amount: 1, unit: 'tsp' }], 0.5);
  assert.ok(approx(r[0].amount, 0.5), `got ${r[0].amount}`);
});

test('scale 3 items: all scaled', () => {
  const ings = [
    { name: 'flour',  amount: 2, unit: 'cup'   },
    { name: 'egg',    amount: 2, unit: 'whole'  },
    { name: 'butter', amount: 50, unit: 'g'     }
  ];
  const r = scaleRecipe(ings, 2);
  assert.strictEqual(r.length, 3);
  assert.ok(approx(r[0].amount, 4));
  assert.strictEqual(r[1].amount, 4);
  assert.ok(approx(r[2].amount, 100));
});

test('factor 1 leaves amounts unchanged (with rounding)', () => {
  const r = scaleRecipe([{ name: 'water', amount: 1, unit: 'L' }], 1);
  assert.ok(approx(r[0].amount, 1), `got ${r[0].amount}`);
});
