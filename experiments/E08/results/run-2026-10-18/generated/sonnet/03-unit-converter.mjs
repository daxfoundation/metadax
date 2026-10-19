export function convert(value, fromUnit, toUnit, sigFigs = 3) {
  if (fromUnit === toUnit) {
    return roundToSigFigs(value, sigFigs);
  }

  const key = `${fromUnit}->${toUnit}`;

  let result;

  switch (key) {
    case 'm->km':
      result = value / 1000;
      break;
    case 'km->m':
      result = value * 1000;
      break;
    case 'g->kg':
      result = value / 1000;
      break;
    case 'kg->g':
      result = value * 1000;
      break;
    case 'C->F':
      result = value * 9 / 5 + 32;
      break;
    case 'F->C':
      result = (value - 32) * 5 / 9;
      break;
    case 'mL->L':
      result = value / 1000;
      break;
    case 'L->mL':
      result = value * 1000;
      break;
    default:
      return NaN;
  }

  return roundToSigFigs(result, sigFigs);
}

function roundToSigFigs(value, sigFigs) {
  if (!Number.isFinite(value)) return value;
  if (value === 0) return 0;

  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const factor = Math.pow(10, sigFigs - 1 - magnitude);
  return Math.round(value * factor) / factor;
}
