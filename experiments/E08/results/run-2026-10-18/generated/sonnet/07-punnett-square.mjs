export function punnettSquare(parent1, parent2) {
  const p1 = [parent1[0], parent1[1]];
  const p2 = [parent2[0], parent2[1]];

  function makeGenotype(a, b) {
    if (a === a.toUpperCase() && b === b.toLowerCase()) {
      return a + b;
    }
    if (b === b.toUpperCase() && a === a.toLowerCase()) {
      return b + a;
    }
    return a + b;
  }

  const grid = [
    [makeGenotype(p1[0], p2[0]), makeGenotype(p1[0], p2[1])],
    [makeGenotype(p1[1], p2[0]), makeGenotype(p1[1], p2[1])]
  ];

  const genotypeCounts = {};
  for (const row of grid) {
    for (const cell of row) {
      genotypeCounts[cell] = (genotypeCounts[cell] || 0) + 1;
    }
  }

  let dominant = 0;
  let recessive = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell === cell.toLowerCase()) {
        recessive++;
      } else {
        dominant++;
      }
    }
  }

  return {
    grid,
    genotypeCounts,
    phenotypeCounts: { dominant, recessive }
  };
}
