'use strict';
// Deferred queue: items that don't fit in today's bandwidth window wait here.
// The learner's next objective always has priority 0; everything else is 1.
// Within a priority tier items are FIFO. Idempotent: re-enqueueing an existing
// id is a no-op.

class DeferredQueue {
  constructor() {
    this._items = [];  // [{ id, priority, seq, bytes, payload }]
    this._seen = new Set();
    this._seq = 0;
  }

  // Enqueue an item. priority 0 = next-objective (highest), 1 = background.
  // Returns false if the item was already seen (idempotent).
  enqueue(id, bytes, payload, priority = 1) {
    if (this._seen.has(id)) return false;
    this._seen.add(id);
    this._items.push({ id, priority, seq: this._seq++, bytes, payload });
    this._items.sort((a, b) => a.priority - b.priority || a.seq - b.seq);
    return true;
  }

  // Drain up to bytesBudget bytes from the front of the queue.
  // Returns { drained: item[], bytesUsed, remaining: number }.
  drain(bytesBudget) {
    const drained = [];
    let used = 0;
    const keep = [];

    for (const item of this._items) {
      if (used + item.bytes <= bytesBudget) {
        drained.push(item);
        used += item.bytes;
      } else {
        keep.push(item);
      }
    }
    this._items = keep;
    return { drained, bytesUsed: used, remaining: keep.length };
  }

  size() { return this._items.length; }
  empty() { return this._items.length === 0; }

  // Total bytes waiting in the queue.
  pendingBytes() { return this._items.reduce((s, i) => s + i.bytes, 0); }
}

module.exports = { DeferredQueue };
