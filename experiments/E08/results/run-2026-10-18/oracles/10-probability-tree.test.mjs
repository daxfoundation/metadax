import { test } from 'node:test';
import assert from 'node:assert/strict';

const { probTree } = await import(process.env.IMPL_PATH);

const approx = (a, b, tol = 0.0001) => Math.abs(a - b) <= tol;

const coin = {
  name: 'flip', prob: 1,
  children: [
    { name: 'H', prob: 0.5, children: [] },
    { name: 'T', prob: 0.5, children: [] }
  ]
};

test('coin: leaves sum to 1', () => {
  const r = probTree(coin);
  assert.ok(r.sumToOne, `leaves: ${JSON.stringify(r.leaves)}`);
});

test('coin: H leaf has joint 0.5', () => {
  const r = probTree(coin);
  const h = r.leaves.find(l => l.name === 'H');
  assert.ok(h && approx(h.joint, 0.5), `got ${h?.joint}`);
});

test('coin: T leaf has joint 0.5', () => {
  const r = probTree(coin);
  const t = r.leaves.find(l => l.name === 'T');
  assert.ok(t && approx(t.joint, 0.5), `got ${t?.joint}`);
});

const weather = {
  name: 'root', prob: 1, children: [
    { name: 'sunny', prob: 0.7, children: [
        { name: 'car', prob: 0.8, children: [] },
        { name: 'bus', prob: 0.2, children: [] }
      ]
    },
    { name: 'rainy', prob: 0.3, children: [
        { name: 'car', prob: 0.4, children: [] },
        { name: 'bus', prob: 0.6, children: [] }
      ]
    }
  ]
};

test('weather tree: sumToOne', () => {
  const r = probTree(weather);
  assert.ok(r.sumToOne, `sum = ${r.leaves.reduce((s,l)=>s+l.joint,0)}`);
});

test('weather tree: 4 leaves', () => {
  const r = probTree(weather);
  assert.strictEqual(r.leaves.length, 4);
});

test('root node has joint = 1', () => {
  const r = probTree(coin);
  assert.ok(approx(r.root.joint, 1), `root joint = ${r.root.joint}`);
});
