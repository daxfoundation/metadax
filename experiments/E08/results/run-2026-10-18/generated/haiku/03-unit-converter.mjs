export function convert(value, fromUnit, toUnit, sigFigs = 3) {
  let result;

  if (fromUnit === toUnit) {
    result = value;
  } else if (fromUnit === 'm' && toUnit === 'km') {
    result = value / 1000;
  } else if (fromUnit === 'km' && toUnit === 'm') {
    result = value * 1000;
  } else if (fromUnit === 'g' && toUnit === 'kg') {
    result = value / 1000;
  } else if (fromUnit === 'kg' && toUnit === 'g') {
    result = value * 1000;
  } else if (fromUnit === 'C' && toUnit === 'F') {
    result = value * 9 / 5 + 32;
  } else if (fromUnit === 'F' && toUnit === 'C') {
    result = (value - 32) * 5 / 9;
  } else if (fromUnit === 'mL' && toUnit === 'L') {
    result = value / 1000;
  } else if (fromUnit === 'L' && toUnit === 'mL') {
    result = value * 1000;
  } else {
    return NaN;
  }

  if (!isFinite(result)) return result;
  if (result === 0) return 0;

  const magnitude = Math.floor(Math.log10(Math.abs(result)));
  const factor = Math.pow(10, sigFigs - 1 - magnitude);
  return Math.round(result * factor) / factor;
}
