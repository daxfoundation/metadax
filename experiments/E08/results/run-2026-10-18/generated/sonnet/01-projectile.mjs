export function range(v0, angleDeg, g = 9.81) {
  if (v0 === 0 || angleDeg === 0 || angleDeg === 90) return 0;
  const theta = angleDeg * (Math.PI / 180);
  return (v0 * v0 * Math.sin(2 * theta)) / g;
}
