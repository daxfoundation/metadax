export function thinPool(totalGib, ops) {
  let promised_gib = 0;
  let written_gib = 0;
  let freed_gib = 0;
  let physical_used_gib = 0;

  for (const op of ops) {
    const gib = op.gib;
    switch (op.type) {
      case 'promise':
        promised_gib += gib;
        break;
      case 'write':
        written_gib += gib;
        physical_used_gib += gib;
        break;
      case 'free':
        written_gib -= gib;
        freed_gib += gib;
        break;
      case 'discard':
      case 'trim':
        physical_used_gib -= gib;
        break;
    }
  }

  promised_gib = Math.max(0, promised_gib);
  written_gib = Math.max(0, written_gib);
  freed_gib = Math.max(0, freed_gib);
  physical_used_gib = Math.max(0, physical_used_gib);

  const over_committed = promised_gib > totalGib;
  const over_full = physical_used_gib > totalGib;

  return {
    promised_gib,
    written_gib,
    freed_gib,
    physical_used_gib,
    over_committed,
    over_full,
  };
}
