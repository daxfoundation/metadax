export function balanceEquation(equationStr) {
  // Parse the equation string: "ax + b = c" or "ax = c" etc.
  const [lhsStr, rhsStr] = equationStr.split('=').map(s => s.trim());

  const rhsValue = parseFloat(rhsStr.trim());

  // Parse LHS to extract coefficient of x and constant term
  // LHS can be: "2x + 3", "3x - 9", "-2x + 8", "x + 5", "4x", "-x", "x"
  let coeff = 0;
  let constant = 0;

  // Tokenize LHS: split by + or - while keeping the sign
  // Normalize: ensure leading sign is present
  const lhsNorm = lhsStr.replace(/^\s*/, '');
  // Add leading + if not starting with -
  const lhsWithSign = (lhsNorm[0] === '-' ? '' : '+') + lhsNorm;

  // Match terms: sign, optional number, optional 'x'
  const termRegex = /([+-])\s*(\d*\.?\d*)\s*([a-z]?)/g;
  let match;
  while ((match = termRegex.exec(lhsWithSign)) !== null) {
    const sign = match[1] === '+' ? 1 : -1;
    const numStr = match[2];
    const varPart = match[3];

    if (varPart) {
      // Term with variable
      const num = numStr === '' ? 1 : parseFloat(numStr);
      coeff += sign * num;
    } else if (numStr !== '') {
      // Constant term
      constant += sign * parseFloat(numStr);
    }
  }

  const steps = [];
  let currentLhsCoeff = coeff;
  let currentRhs = rhsValue;

  // Step 1: Move constant from LHS to RHS (if constant != 0)
  if (constant !== 0) {
    const op = constant > 0 ? 'subtract' : 'add';
    const absConst = Math.abs(constant);
    const preposition = constant > 0 ? 'from' : 'to';
    const description = `${op} ${absConst} ${preposition} both sides`;

    currentRhs = currentRhs - constant;

    // Format lhs: just the x term
    const lhsFormatted = formatXTerm(currentLhsCoeff);
    // Format rhs
    const rhsFormatted = formatNumber(currentRhs);

    steps.push({
      description,
      lhs: lhsFormatted,
      rhs: rhsFormatted,
    });
  }

  // Step 2: Divide both sides by coefficient (if coeff != 1)
  const value = currentRhs / currentLhsCoeff;

  if (currentLhsCoeff !== 1) {
    const description = `divide both sides by ${formatNumber(currentLhsCoeff)}`;
    steps.push({
      description,
      lhs: 'x',
      rhs: formatNumber(value),
    });
  }

  return {
    variable: 'x',
    value,
    steps,
  };
}

function formatXTerm(coeff) {
  if (coeff === 1) return 'x';
  if (coeff === -1) return '-x';
  return `${formatNumber(coeff)}x`;
}

function formatNumber(n) {
  // Return integer string if whole number, else decimal
  if (Number.isInteger(n)) return String(n);
  return String(n);
}
