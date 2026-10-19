import { test } from 'node:test';
import assert from 'node:assert/strict';

const { sortSteps } = await import(process.env.IMPL_PATH);

const isSorted = arr => arr.every((v, i) => i === 0 || v >= arr[i - 1]);

test('bubble [3,1,2]: last step is done and sorted', () => {
  const steps = sortSteps([3, 1, 2], 'bubble');
  const last = steps[steps.length - 1];
  assert.strictEqual(last.action, 'done');
  assert.ok(isSorted(last.arr), `not sorted: ${last.arr}`);
});

test('bubble [3,1,2]: first step arr matches input', () => {
  const steps = sortSteps([3, 1, 2], 'bubble');
  assert.deepStrictEqual(steps[0].arr, [3, 1, 2]);
});

test('bubble empty array: single done step', () => {
  const steps = sortSteps([], 'bubble');
  assert.ok(steps.length >= 1);
  assert.deepStrictEqual(steps[steps.length - 1].arr, []);
  assert.strictEqual(steps[steps.length - 1].action, 'done');
});

test('bubble single element: done immediately', () => {
  const steps = sortSteps([42], 'bubble');
  assert.deepStrictEqual(steps[steps.length - 1].arr, [42]);
  assert.strictEqual(steps[steps.length - 1].action, 'done');
});

test('selection [3,1,2]: last step sorted', () => {
  const steps = sortSteps([3, 1, 2], 'selection');
  assert.ok(isSorted(steps[steps.length - 1].arr));
});

test('insertion [5,3,1,4,2]: last step sorted', () => {
  const steps = sortSteps([5, 3, 1, 4, 2], 'insertion');
  assert.ok(isSorted(steps[steps.length - 1].arr));
});

test('all steps have arr of same length as input', () => {
  const steps = sortSteps([3, 1, 2], 'bubble');
  for (const s of steps) {
    assert.strictEqual(s.arr.length, 3, `arr length mismatch at step`);
  }
});
