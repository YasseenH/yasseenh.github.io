export function rippleStrength(distance: number, age: number) {
  if (age < 0 || age > 2.8) return 0;
  return (
    Math.exp(-Math.pow((distance - age * 320) / 52, 2)) * Math.exp(-age * 0.6)
  );
}
