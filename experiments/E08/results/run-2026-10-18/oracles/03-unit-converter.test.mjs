import { test } from 'node:test';
import assert from 'node:assert/strict';

const { convert } = await import(process.env.IMPL_PATH);

const approx = (a, b, tol = 0.01) => Math.abs(a - b) < tol;

test('1000 m → km ≈ 1', () => {
  assert.ok(approx(convert(1000, 'm', 'km', 4), 1), `got ${convert(1000,'m','km',4)}`);
});

test('1 km → m = 1000', () => {
  assert.ok(approx(convert(1, 'km', 'm', 4), 1000), `got ${convert(1,'km','m',4)}`);
});

test('0 C → F = 32', () => {
  assert.ok(approx(convert(0, 'C', 'F', 3), 32), `got ${convert(0,'C','F',3)}`);
});

test('100 C → F = 212', () => {
  assert.ok(approx(convert(100, 'C', 'F', 3), 212), `got ${convert(100,'C','F',3)}`);
});

test('-40 C → F = -40 (fixed point)', () => {
  assert.ok(approx(convert(-40, 'C', 'F', 3), -40), `got ${convert(-40,'C','F',3)}`);
});

test('1 kg → g = 1000', () => {
  assert.ok(approx(convert(1, 'kg', 'g', 3), 1000), `got ${convert(1,'kg','g',3)}`);
});

test('2.5 L → mL = 2500', () => {
  assert.ok(approx(convert(2.5, 'L', 'mL', 3), 2500), `got ${convert(2.5,'L','mL',3)}`);
});

test('32 F → C = 0', () => {
  assert.ok(approx(convert(32, 'F', 'C', 3), 0), `got ${convert(32,'F','C',3)}`);
});
