export function scaleRecipe(ingredients, factor) {
  return ingredients.map(({ name, amount, unit }) => {
    const scaled = amount * factor;
    const rounded = roundByUnit(scaled, unit);
    return { name, amount: rounded, unit };
  });
}

function roundToNearest(value, step) {
  return Math.round(value / step) * step;
}

function roundByUnit(value, unit) {
  const integerUnits = new Set(['whole', 'egg', 'item', 'piece']);
  const quarterUnits = new Set(['cup', 'tbsp', 'tsp', 'fl oz']);
  const fiveUnits = new Set(['g', 'ml']);
  const tenthUnits = new Set(['kg', 'L']);

  if (integerUnits.has(unit)) {
    return Math.max(1, Math.round(value));
  } else if (quarterUnits.has(unit)) {
    return roundToNearest(value, 0.25);
  } else if (fiveUnits.has(unit)) {
    return roundToNearest(value, 5);
  } else if (tenthUnits.has(unit)) {
    return roundToNearest(value, 0.1);
  } else {
    return roundToNearest(value, 0.25);
  }
}
