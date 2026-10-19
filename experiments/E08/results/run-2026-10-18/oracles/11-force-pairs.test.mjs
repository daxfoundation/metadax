import { test } from 'node:test';
import assert from 'node:assert/strict';

const { checkForcePairs } = await import(process.env.IMPL_PATH);

const earthMoon = [
  { id: 'F1', agent: 'Earth', patient: 'Moon',  magnitude_N: 1.98e20, direction_deg: 0,   type: 'gravity' },
  { id: 'F2', agent: 'Moon',  patient: 'Earth', magnitude_N: 1.98e20, direction_deg: 180, type: 'gravity' }
];

test('valid gravity pair: allPaired = true', () => {
  const r = checkForcePairs(earthMoon);
  assert.strictEqual(r.allPaired, true);
});

test('valid gravity pair: F1-F2 in pairs', () => {
  const r = checkForcePairs(earthMoon);
  assert.strictEqual(r.pairs.length, 1);
  const pair = r.pairs[0];
  assert.ok(
    (pair.includes('F1') && pair.includes('F2')),
    `got ${JSON.stringify(pair)}`
  );
});

test('single force: unpaired', () => {
  const r = checkForcePairs([
    { id: 'F1', agent: 'A', patient: 'B', magnitude_N: 10, direction_deg: 90, type: 'normal' }
  ]);
  assert.strictEqual(r.allPaired, false);
  assert.ok(r.unpaired.includes('F1'));
});

test('mismatched magnitude: not paired', () => {
  const forces = [
    { id: 'F1', agent: 'A', patient: 'B', magnitude_N: 10, direction_deg: 0,   type: 'normal' },
    { id: 'F2', agent: 'B', patient: 'A', magnitude_N: 5,  direction_deg: 180, type: 'normal' }
  ];
  const r = checkForcePairs(forces);
  assert.strictEqual(r.pairs.length, 0);
});

test('mismatched type: not paired', () => {
  const forces = [
    { id: 'F1', agent: 'A', patient: 'B', magnitude_N: 10, direction_deg: 0,   type: 'normal'   },
    { id: 'F2', agent: 'B', patient: 'A', magnitude_N: 10, direction_deg: 180, type: 'friction' }
  ];
  const r = checkForcePairs(forces);
  assert.strictEqual(r.pairs.length, 0);
});

test('result has pairs, unpaired, allPaired fields', () => {
  const r = checkForcePairs(earthMoon);
  assert.ok('pairs' in r && 'unpaired' in r && 'allPaired' in r);
});
