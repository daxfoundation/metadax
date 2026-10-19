export function scaleRecipe(ingredients, factor) {
  return ingredients.map(({ name, amount, unit }) => {
    const scaled = amount * factor;
    let rounded;

    if (['whole', 'egg', 'item', 'piece'].includes(unit)) {
      rounded = Math.max(1, Math.round(scaled));
    } else if (['g', 'ml'].includes(unit)) {
      rounded = Math.round(scaled / 5) * 5;
    } else if (['kg', 'L'].includes(unit)) {
      rounded = Math.round(scaled / 0.1) * 0.1;
      rounded = parseFloat(rounded.toFixed(1));
    } else {
      // 'cup', 'tbsp', 'tsp', 'fl oz', and anything else → nearest 0.25
      rounded = Math.round(scaled / 0.25) * 0.25;
    }

    return { name, amount: rounded, unit };
  });
}
