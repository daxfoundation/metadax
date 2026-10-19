export function checkForcePairs(forces) {
  const used = new Set();
  const pairs = [];

  function directionsDiffer180(d1, d2) {
    const diff = Math.abs(((d1 - d2) % 360 + 360) % 360);
    return Math.abs(diff - 180) <= 1 || Math.abs(diff - 180) >= 359;
  }

  function magnitudesMatch(m1, m2) {
    if (m1 === 0 && m2 === 0) return true;
    const avg = (Math.abs(m1) + Math.abs(m2)) / 2;
    return Math.abs(m1 - m2) / avg <= 0.001;
  }

  for (let i = 0; i < forces.length; i++) {
    if (used.has(forces[i].id)) continue;
    const f1 = forces[i];

    for (let j = i + 1; j < forces.length; j++) {
      if (used.has(forces[j].id)) continue;
      const f2 = forces[j];

      if (
        f1.type === f2.type &&
        magnitudesMatch(f1.magnitude_N, f2.magnitude_N) &&
        directionsDiffer180(f1.direction_deg, f2.direction_deg) &&
        f1.agent === f2.patient &&
        f1.patient === f2.agent
      ) {
        pairs.push([f1.id, f2.id]);
        used.add(f1.id);
        used.add(f2.id);
        break;
      }
    }
  }

  const unpaired = forces.filter(f => !used.has(f.id)).map(f => f.id);

  return {
    pairs,
    unpaired,
    allPaired: unpaired.length === 0,
  };
}
