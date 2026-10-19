export function simplifyFraction(numerator, denominator) {
  const steps = [];

  steps.push({
    description: "Original fraction",
    num: numerator,
    den: denominator,
  });

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  const divisor = gcd(numerator, denominator);

  steps.push({
    description: `GCD found: ${divisor}`,
    num: divisor,
    den: divisor,
  });

  const simplifiedNum = numerator / divisor;
  const simplifiedDen = denominator / divisor;

  steps.push({
    description: `Result after dividing by GCD (${divisor})`,
    num: simplifiedNum,
    den: simplifiedDen,
  });

  return {
    num: simplifiedNum,
    den: simplifiedDen,
    steps,
  };
}
