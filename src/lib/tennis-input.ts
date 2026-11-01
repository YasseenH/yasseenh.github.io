export interface TouchServe {
  x: number;
  y: number;
  at: number;
  lastX: number;
  lastY: number;
}

export function thumbstick(dx: number, dy: number, radius: number) {
  const distance = Math.hypot(dx, dy);
  const strength =
    (Math.max(0, Math.min(1, distance / radius) - 0.18) / 0.82) ** 2;
  return strength
    ? { x: (dx / distance) * strength, y: (dy / distance) * strength }
    : { x: 0, y: 0 };
}

export function finishTouch(t: TouchServe, x: number, y: number, at: number) {
  if (Math.hypot(x - t.x, y - t.y) > 20) {
    t.at = 0;
    return false;
  }
  if (
    t.at &&
    at - t.at > 0 &&
    at - t.at < 350 &&
    Math.hypot(x - t.lastX, y - t.lastY) < 30
  ) {
    t.at = 0;
    return true;
  }
  t.at = at;
  t.lastX = x;
  t.lastY = y;
  return false;
}
