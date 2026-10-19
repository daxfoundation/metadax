export function compoundTable(principal, annualRate, compoundsPerYear, years) {
  const result = [];
  let prevBalance = principal;

  for (let t = 1; t <= years; t++) {
    const balance = principal * Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear * t);
    const balanceRounded = Math.round(balance * 100) / 100;
    const interestEarned = Math.round((balanceRounded - prevBalance) * 100) / 100;
    const totalInterest = Math.round((balanceRounded - principal) * 100) / 100;

    result.push({
      year: t,
      balance: balanceRounded,
      interest_earned: interestEarned,
      total_interest: totalInterest,
    });

    prevBalance = balanceRounded;
  }

  return result;
}
