export interface TouchServe {
  x: number;
  y: number;
  at: number;
  lastX: number;
  lastY: number;
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
