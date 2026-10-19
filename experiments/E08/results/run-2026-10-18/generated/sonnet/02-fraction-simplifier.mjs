export function simplifyFraction(numerator, denominator) {
  const steps = [];

  steps.push({
    description: `Original fraction: ${numerator}/${denominator}`,
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
    description: `GCD(${numerator}, ${denominator}) = ${divisor}`,
    num: numerator,
    den: denominator,
  });

  const simplifiedNum = numerator / divisor;
  const simplifiedDen = denominator / divisor;

  if (divisor === 1) {
    steps.push({
      description: `GCD is 1, fraction ${numerator}/${denominator} is already simplified`,
      num: simplifiedNum,
      den: simplifiedDen,
    });
  } else {
    steps.push({
      description: `Divide both by GCD ${divisor}: ${numerator}/${divisor} = ${simplifiedNum}, ${denominator}/${divisor} = ${simplifiedDen}`,
      num: simplifiedNum,
      den: simplifiedDen,
    });
  }

  return {
    num: simplifiedNum,
    den: simplifiedDen,
    steps,
  };
}
