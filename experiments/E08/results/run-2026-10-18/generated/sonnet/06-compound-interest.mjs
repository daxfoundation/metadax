export function compoundTable(principal, annualRate, compoundsPerYear, years) {
  const result = [];
  let prevBalance = principal;

  for (let t = 1; t <= years; t++) {
    const balance = Math.round(principal * Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear * t) * 100) / 100;
    const interest_earned = Math.round((balance - prevBalance) * 100) / 100;
    const total_interest = Math.round((balance - principal) * 100) / 100;

    result.push({ year: t, balance, interest_earned, total_interest });
    prevBalance = balance;
  }

  return result;
}
