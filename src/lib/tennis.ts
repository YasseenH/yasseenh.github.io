export type Side = "you" | "cpu";
export type Shot = "drive" | "drop" | "lob";
export const COURT = { left: 260, right: 640, top: 140, bottom: 860, net: 500 };
export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
export function scoreLabel(points: number, other: number): string {
  if (points >= 3 && other >= 3) return points > other ? "AD" : "40";
  return ["0", "15", "30", "40"][Math.min(points, 3)];
}
export const hasWon = (points: number, other: number) =>
  points >= 4 && points - other >= 2;
export const aimedShot = (ballX: number, racketX: number) =>
  450 + clamp((ballX - racketX) / 38, -1, 1) * 245;
export function scoreCall(you: number, cpu: number) {
  if (you >= 3 && cpu >= 3)
    return you === cpu ? "Deuce" : `Advantage ${you > cpu ? "you" : "CPU"}`;
  const words = ["Love", "Fifteen", "Thirty", "Forty"];
  return `${words[Math.min(you, 3)]}, ${words[Math.min(cpu, 3)].toLowerCase()}`;
}
export function createGame() {
  return {
    you: 0,
    cpu: 0,
    playerX: 450,
    playerY: 860,
    moveX: 450,
    moveY: 860,
    cpuX: 450,
    cpuY: 140,
    x: 450,
    y: 860,
    z: 0,
    fromX: 450,
    fromY: 860,
    targetX: 450,
    targetY: 190,
    endX: 450,
    endY: 100,
    progress: 0,
    duration: 1,
    bounceTime: 0.46,
    height: 85,
    hitter: "you" as Side,
    kind: "drive" as Shot,
    selected: "drive" as Shot,
    phase: "ready" as "ready" | "serve" | "rally" | "point" | "over",
    message: "",
    call: "",
    pointTimer: 0,
    rally: 0,
    bounced: false,
    bounceX: 450,
    bounceY: 190,
    bounceAge: 10,
    swingYou: 0,
    swingCpu: 0,
  };
}
export type Game = ReturnType<typeof createGame>;
export function awardPoint(g: Game, winner: Side, reason: string) {
  g[winner]++;
  g.phase = hasWon(g[winner], g[winner === "you" ? "cpu" : "you"])
    ? "over"
    : "point";
  g.call = reason;
  g.message =
    g.phase === "over"
      ? `Game, ${winner === "you" ? "you" : "CPU"}.`
      : scoreCall(g.you, g.cpu);
  g.pointTimer = 0;
}
export function hitShot(g: Game, hitter: Side, kind: Shot, targetX: number) {
  g.hitter = hitter;
  g.kind = kind;
  g.fromX = g.x;
  g.fromY = g.y;
  g.targetX = targetX;
  g.targetY =
    hitter === "you"
      ? kind === "drop"
        ? 405
        : kind === "lob"
          ? 175
          : 205
      : kind === "drop"
        ? 595
        : kind === "lob"
          ? 825
          : 795;
  const carry = kind === "drop" ? 0.09 : kind === "lob" ? 0.25 : 0.33;
  g.endX = targetX + (targetX - g.x) * carry;
  g.endY = g.targetY + (g.targetY - g.y) * carry;
  const distance = Math.hypot(g.targetX - g.x, g.targetY - g.y);
  g.duration = Math.max(
    0.55,
    distance /
      (kind === "drop"
        ? 470
        : kind === "lob"
          ? 400
          : Math.min(850, 620 + g.rally * 12)),
  );
  g.bounceTime = kind === "drop" ? 0.32 : 0.54;
  const edge = Math.abs(g.x - (hitter === "you" ? g.playerX : g.cpuX)) / 44;
  g.height = kind === "lob" ? 170 : kind === "drop" ? 58 - edge * 26 : 85;
  g.progress = 0;
  g.bounced = false;
  g.z = 0;
  g.rally++;
  if (hitter === "you") g.swingYou = 0.24;
  else g.swingCpu = 0.24;
}
export const serveTargetX = (g: Game) => clamp(900 - g.playerX, 285, 615);
export function prepareServe(g: Game) {
  g.playerX = g.moveX = 450;
  g.playerY = g.moveY = 860;
  g.cpuX = 450;
  g.cpuY = 140;
  g.x = g.playerX;
  g.y = g.playerY;
  g.z = 0;
  g.rally = 0;
  g.phase = "serve";
}
export function serve(g: Game) {
  if (g.phase === "over" || g.phase === "rally") return;
  if (g.phase !== "serve") prepareServe(g);
  g.moveX = g.playerX;
  g.moveY = g.playerY = 860;
  g.x = g.playerX;
  g.y = g.playerY;
  g.phase = "rally";
  g.call = "";
  g.message = "";
  hitShot(g, "you", "drive", serveTargetX(g));
}
function moveToward(
  x: number,
  y: number,
  tx: number,
  ty: number,
  distance: number,
) {
  const length = Math.hypot(tx - x, ty - y);
  const fraction = length ? Math.min(1, distance / length) : 0;
  return [x + (tx - x) * fraction, y + (ty - y) * fraction];
}
export function step(g: Game, dt: number, random = Math.random) {
  g.swingYou = Math.max(0, g.swingYou - dt);
  g.swingCpu = Math.max(0, g.swingCpu - dt);
  g.bounceAge += dt;
  if (g.phase === "point") {
    g.pointTimer += dt;
    if (g.pointTimer >= 1.4) prepareServe(g);
    return;
  }
  if (g.phase === "serve") {
    g.playerX += clamp(g.moveX - g.playerX, -dt * 650, dt * 650);
    g.x = g.playerX;
    return;
  }
  if (g.phase !== "rally") return;
  [g.playerX, g.playerY] = moveToward(
    g.playerX,
    g.playerY,
    g.moveX,
    g.moveY,
    dt * 650,
  );
  const receiving = g.hitter === "you";
  const reacted = g.progress * g.duration > (g.kind === "drop" ? 0.32 : 0.2);
  const cx = receiving && reacted ? g.targetX : 450;
  const cy = receiving && reacted ? clamp(g.targetY - 14, 100, 440) : 140;
  [g.cpuX, g.cpuY] = moveToward(
    g.cpuX,
    g.cpuY,
    clamp(cx, 210, 690),
    cy,
    dt * 245,
  );
  const previousY = g.y;
  g.progress += dt / (g.bounced ? g.bounceTime : g.duration);
  let t = Math.min(g.progress, 1);
  if (!g.bounced) {
    g.x = g.fromX + (g.targetX - g.fromX) * t;
    g.y = g.fromY + (g.targetY - g.fromY) * t;
    g.z = 4 * g.height * t * (1 - t);
    if ((previousY - COURT.net) * (g.y - COURT.net) <= 0 && previousY !== g.y) {
      const atNet = (COURT.net - g.fromY) / (g.targetY - g.fromY);
      if (4 * g.height * atNet * (1 - atNet) < 22) {
        awardPoint(g, receiving ? "cpu" : "you", "Net");
        return;
      }
    }
    if (t < 1) return;
    g.bounceX = g.x;
    g.bounceY = g.y;
    g.bounceAge = 0;
    if (
      g.x < COURT.left - 6 ||
      g.x > COURT.right + 6 ||
      g.y < COURT.top - 6 ||
      g.y > COURT.bottom + 6
    ) {
      awardPoint(g, receiving ? "cpu" : "you", "Out");
      return;
    }
    g.bounced = true;
    g.progress = 0;
    t = 0;
  } else {
    g.x = g.targetX + (g.endX - g.targetX) * t;
    g.y = g.targetY + (g.endY - g.targetY) * t;
    g.z = Math.sin(t * Math.PI) * (g.kind === "drop" ? 15 : 36);
  }
  const rx = receiving ? g.cpuX : g.playerX;
  const ry = receiving ? g.cpuY : g.playerY;
  if (Math.abs(g.x - rx) <= 40 && Math.abs(g.y - ry) <= 47 && g.z < 48) {
    const receiver: Side = receiving ? "cpu" : "you";
    const roll = receiving ? random() : 1;
    const kind = receiving
      ? g.playerY < 720
        ? "lob"
        : roll < 0.14
          ? "drop"
          : "drive"
      : g.selected;
    const target = receiving
      ? 450 + (random() - 0.5) * 420
      : aimedShot(g.x, rx);
    hitShot(g, receiver, kind, target);
    return;
  }
  if (g.bounced && t >= 1)
    awardPoint(g, g.hitter, g.kind === "drop" ? "Two bounces" : "Winner");
}
