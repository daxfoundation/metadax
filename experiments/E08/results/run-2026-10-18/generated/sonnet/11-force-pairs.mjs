export function checkForcePairs(forces) {
  const used = new Set();
  const pairs = [];

  for (let i = 0; i < forces.length; i++) {
    if (used.has(forces[i].id)) continue;

    for (let j = i + 1; j < forces.length; j++) {
      if (used.has(forces[j].id)) continue;

      const f1 = forces[i];
      const f2 = forces[j];

      // Condition 4: agent/patient swap
      if (f1.agent !== f2.patient || f1.patient !== f2.agent) continue;

      // Condition 1: same type
      if (f1.type !== f2.type) continue;

      // Condition 2: same magnitude within 0.1% relative tolerance
      const avg = (f1.magnitude_N + f2.magnitude_N) / 2;
      const relDiff = avg === 0 ? 0 : Math.abs(f1.magnitude_N - f2.magnitude_N) / avg;
      if (relDiff > 0.001) continue;

      // Condition 3: directions differ by 180° ± 1°
      let angleDiff = Math.abs(f1.direction_deg - f2.direction_deg) % 360;
      if (angleDiff > 180) angleDiff = 360 - angleDiff;
      if (Math.abs(angleDiff - 180) > 1) continue;

      pairs.push([f1.id, f2.id]);
      used.add(f1.id);
      used.add(f2.id);
      break;
    }
  }

  const unpaired = forces.filter(f => !used.has(f.id)).map(f => f.id);

  return {
    pairs,
    unpaired,
    allPaired: unpaired.length === 0,
  };
}
