export function storageLayers(layers) {
  const sorted = [...layers].sort((a, b) => a.latency_us - b.latency_us);
  const total = sorted.length;
  return sorted.map((layer, index) => {
    const rank = index + 1;
    let role;
    if (rank === 1) {
      role = 'hot';
    } else if (rank === total) {
      role = 'cold';
    } else {
      role = 'warm';
    }
    return { ...layer, role, rank };
  });
}
