export function punnettSquare(parent1, parent2) {
  const gametes1 = [parent1[0], parent1[1]];
  const gametes2 = [parent2[0], parent2[1]];

  const grid = gametes1.map(a1 =>
    gametes2.map(a2 => {
      const alleles = [a1, a2];
      const upper = alleles.filter(a => a === a.toUpperCase() && a !== a.toLowerCase());
      const lower = alleles.filter(a => a === a.toLowerCase() && a !== a.toUpperCase());
      if (upper.length === 2) {
        return upper[0].toUpperCase() + upper[1].toUpperCase();
      } else if (lower.length === 2) {
        return lower[0].toLowerCase() + lower[1].toLowerCase();
      } else {
        return upper[0].toUpperCase() + lower[0].toLowerCase();
      }
    })
  );

  const genotypeCounts = {};
  let dominant = 0;
  let recessive = 0;

  for (const row of grid) {
    for (const cell of row) {
      genotypeCounts[cell] = (genotypeCounts[cell] || 0) + 1;
      const isRecessive = cell === cell.toLowerCase();
      if (isRecessive) {
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
