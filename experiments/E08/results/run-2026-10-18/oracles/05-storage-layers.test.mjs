import { test } from 'node:test';
import assert from 'node:assert/strict';

const { storageLayers } = await import(process.env.IMPL_PATH);

const layers2 = [
  { name: 'HDD',  type: 'HDD',  latency_us: 5000, throughput_mbps: 150,  capacity_gib: 10000 },
  { name: 'NVMe', type: 'NVMe', latency_us: 100,  throughput_mbps: 3000, capacity_gib: 1000  }
];

test('2-layer: sorted by latency ascending', () => {
  const r = storageLayers(layers2);
  assert.strictEqual(r[0].name, 'NVMe');
  assert.strictEqual(r[1].name, 'HDD');
});

test('2-layer: rank 1 = hot, rank 2 = cold', () => {
  const r = storageLayers(layers2);
  assert.strictEqual(r[0].role, 'hot');
  assert.strictEqual(r[1].role, 'cold');
});

test('2-layer: ranks are 1 and 2', () => {
  const r = storageLayers(layers2);
  assert.strictEqual(r[0].rank, 1);
  assert.strictEqual(r[1].rank, 2);
});

const layers3 = [
  { name: 'Tape', type: 'tape', latency_us: 300000, throughput_mbps: 100,  capacity_gib: 1000000 },
  { name: 'SSD',  type: 'SSD',  latency_us: 200,    throughput_mbps: 500,  capacity_gib: 5000    },
  { name: 'NVMe', type: 'NVMe', latency_us: 80,     throughput_mbps: 3500, capacity_gib: 500     }
];

test('3-layer: correct order NVMe, SSD, Tape', () => {
  const r = storageLayers(layers3);
  assert.strictEqual(r[0].name, 'NVMe');
  assert.strictEqual(r[1].name, 'SSD');
  assert.strictEqual(r[2].name, 'Tape');
});

test('3-layer: middle layer is warm', () => {
  const r = storageLayers(layers3);
  assert.strictEqual(r[1].role, 'warm');
});

test('original fields preserved', () => {
  const r = storageLayers(layers2);
  assert.strictEqual(r[0].throughput_mbps, 3000);
  assert.strictEqual(r[0].capacity_gib, 1000);
});
