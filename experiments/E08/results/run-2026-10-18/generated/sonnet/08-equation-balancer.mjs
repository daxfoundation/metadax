export function balanceEquation(equationStr) {
  // Remove all spaces
  const eq = equationStr.replace(/\s+/g, '');

  // Split on '='
  const eqIndex = eq.indexOf('=');
  const lhsRaw = eq.slice(0, eqIndex);
  const rhsRaw = eq.slice(eqIndex + 1);

  // Parse RHS constant
  const rhs = parseFloat(rhsRaw);

  // Parse LHS: coefficient of x and constant term
  // Matches: optional sign, optional digits, 'x', then optional (+/-) constant
  // e.g. "2x+3", "-2x+8", "x-9", "4x"
  const lhsMatch = lhsRaw.match(/^([+-]?\d*\.?\d*)x([+-]\d+\.?\d*)?$/);

  if (!lhsMatch) {
    throw new Error(`Cannot parse equation LHS: ${lhsRaw}`);
  }

  let coeffStr = lhsMatch[1];
  const constStr = lhsMatch[2] || null;

  // Handle implicit coefficients: '' or '+' means 1, '-' means -1
  let coeff;
  if (coeffStr === '' || coeffStr === '+') {
    coeff = 1;
  } else if (coeffStr === '-') {
    coeff = -1;
  } else {
    coeff = parseFloat(coeffStr);
  }

  const constant = constStr ? parseFloat(constStr) : 0;

  const steps = [];
  let currentLhs;
  let currentRhs = rhs;

  // Step 1: Move constant term from LHS to RHS (if there is one)
  if (constant !== 0) {
    const newRhs = currentRhs - constant;

    let description;
    if (constant > 0) {
      description = `subtract ${constant} from both sides`;
    } else {
      description = `add ${Math.abs(constant)} to both sides`;
    }

    // Format new RHS
    const newRhsStr = formatNumber(newRhs);

    // LHS after removing constant is just the x term
    if (coeff === 1) {
      currentLhs = 'x';
    } else if (coeff === -1) {
      currentLhs = '-x';
    } else {
      currentLhs = `${formatNumber(coeff)}x`;
    }

    steps.push({
      description,
      lhs: currentLhs,
      rhs: newRhsStr,
    });

    currentRhs = newRhs;
  } else {
    // No constant term, LHS is just the x term
    if (coeff === 1) {
      currentLhs = 'x';
    } else if (coeff === -1) {
      currentLhs = '-x';
    } else {
      currentLhs = `${formatNumber(coeff)}x`;
    }
  }

  // Step 2: Divide both sides by coefficient (if coeff !== 1)
  if (coeff !== 1) {
    const value = currentRhs / coeff;
    const valueStr = formatNumber(value);

    steps.push({
      description: `divide both sides by ${formatNumber(coeff)}`,
      lhs: 'x',
      rhs: valueStr,
    });

    return {
      variable: 'x',
      value,
      steps,
    };
  }

  // If coeff is 1 and no constant, just x = rhs with no steps needed,
  // but we still record implicit result
  const value = currentRhs;

  return {
    variable: 'x',
    value,
    steps,
  };
}

function formatNumber(n) {
  // Return integer string if whole number, else decimal
  if (Number.isInteger(n)) {
    return String(n);
  }
  // Trim unnecessary trailing zeros
  return String(parseFloat(n.toFixed(10)));
}
