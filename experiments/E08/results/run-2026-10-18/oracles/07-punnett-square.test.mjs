import { test } from 'node:test';
import assert from 'node:assert/strict';

const { punnettSquare } = await import(process.env.IMPL_PATH);

test('Aa × Aa: grid is 2x2', () => {
  const r = punnettSquare('Aa', 'Aa');
  assert.strictEqual(r.grid.length, 2);
  assert.strictEqual(r.grid[0].length, 2);
  assert.strictEqual(r.grid[1].length, 2);
});

test('Aa × Aa: genotypeCounts has AA:1, Aa:2, aa:1', () => {
  const r = punnettSquare('Aa', 'Aa');
  assert.strictEqual(r.genotypeCounts['AA'], 1);
  assert.strictEqual(r.genotypeCounts['Aa'], 2);
  assert.strictEqual(r.genotypeCounts['aa'], 1);
});

test('Aa × Aa: phenotypeCounts dominant:3, recessive:1', () => {
  const r = punnettSquare('Aa', 'Aa');
  assert.strictEqual(r.phenotypeCounts.dominant, 3);
  assert.strictEqual(r.phenotypeCounts.recessive, 1);
});

test('AA × aa: all offspring Aa (dominant:4)', () => {
  const r = punnettSquare('AA', 'aa');
  const counts = Object.values(r.genotypeCounts);
  const total = counts.reduce((s, n) => s + n, 0);
  assert.strictEqual(total, 4);
  assert.strictEqual(r.phenotypeCounts.dominant, 4);
  assert.strictEqual(r.phenotypeCounts.recessive, 0);
});

test('AA × aa: grid cells all start with A', () => {
  const r = punnettSquare('AA', 'aa');
  for (const row of r.grid) for (const cell of row) {
    assert.ok(cell.includes('A'), `cell ${cell} has no A`);
  }
});

test('aa × aa: all recessive', () => {
  const r = punnettSquare('aa', 'aa');
  assert.strictEqual(r.phenotypeCounts.recessive, 4);
  assert.strictEqual(r.phenotypeCounts.dominant, 0);
});

test('total genotype count is 4', () => {
  for (const pair of [['Aa','Aa'],['AA','aa'],['aa','aa']]) {
    const r = punnettSquare(pair[0], pair[1]);
    const total = Object.values(r.genotypeCounts).reduce((s, n) => s + n, 0);
    assert.strictEqual(total, 4, `failed for ${pair}`);
  }
});
