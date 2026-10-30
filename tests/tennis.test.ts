import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  serve,
  step,
  awardPoint,
  scoreLabel,
  scoreCall,
  hasWon,
  aimedShot,
  hitShot,
  type Game,
} from "../src/lib/tennis.ts";

function untilPoint(g: Game, random = () => 0.5) {
  for (let i = 0; i < 2000 && g.phase === "rally"; i++)
    step(g, 1 / 120, random);
  assert.ok(g.phase === "point" || g.phase === "over", "rally must resolve");
}
test("scoring handles deuce, advantage, win by two, and umpire calls", () => {
  assert.equal(scoreLabel(1, 0), "15");
  assert.equal(scoreLabel(2, 0), "30");
  assert.equal(scoreLabel(4, 3), "AD");
  assert.equal(scoreCall(3, 3), "Deuce");
  assert.equal(scoreCall(4, 3), "Advantage you");
  assert.equal(hasWon(4, 3), false);
  const g = createGame();
  g.you = 3;
  g.cpu = 3;
  awardPoint(g, "you", "Winner");
  awardPoint(g, "cpu", "Winner");
  assert.equal(g.message, "Deuce");
  awardPoint(g, "you", "Winner");
  awardPoint(g, "you", "Winner");
  assert.equal(g.phase, "over");
  assert.equal(g.message, "Game, you.");
  serve(g);
  assert.equal(g.phase, "over");
});
test("contact position controls aim and extreme angles risk an out", () => {
  assert.equal(aimedShot(450, 450), 450);
  assert.ok(aimedShot(470, 450) > 450);
  assert.ok(aimedShot(430, 450) < 450);
  assert.ok(aimedShot(488, 450) > 646);
});
test("both players lose a point on the first out bounce", () => {
  for (const hitter of ["you", "cpu"] as const) {
    const g = createGame();
    serve(g);
    g.y = hitter === "you" ? 860 : 140;
    hitShot(g, hitter, "drive", 760);
    untilPoint(g);
    assert.equal(g[hitter === "you" ? "cpu" : "you"], 1);
    assert.equal(g.call, "Out");
  }
});
test("a centered drive produces a sustained rally with two-dimensional returns", () => {
  const g = createGame();
  serve(g);
  for (let i = 0; i < 720 && g.phase === "rally"; i++) {
    if (g.hitter === "cpu") {
      g.moveX = g.targetX;
      g.moveY = g.targetY + 14;
    }
    step(g, 1 / 120, () => 0.5);
  }
  assert.ok(g.rally >= 4);
  assert.equal(g.you + g.cpu, 0);
  assert.ok(g.playerY < 860);
});
test("drop shots land short and beat a CPU stranded across the baseline", () => {
  const g = createGame();
  serve(g);
  g.cpuX = 230;
  hitShot(g, "you", "drop", 625);
  assert.equal(g.targetY, 405);
  assert.ok(g.bounceTime < 0.4);
  untilPoint(g);
  assert.equal(g.you, 1);
  assert.equal(g.call, "Two bounces");
});
test("a CPU already near the net can reach a drop shot", () => {
  const g = createGame();
  serve(g);
  g.cpuX = 450;
  g.cpuY = 390;
  hitShot(g, "you", "drop", 450);
  for (let i = 0; i < 220 && g.rally === 2 && g.phase === "rally"; i++)
    step(g, 1 / 120, () => 0.5);
  assert.equal(g.hitter, "cpu");
  assert.equal(g.phase, "rally");
});
test("lobs have a higher arc and deeper landing than drop shots", () => {
  const g = createGame();
  serve(g);
  hitShot(g, "you", "drop", 450);
  const shortY = g.targetY,
    low = g.height,
    quick = g.duration;
  hitShot(g, "you", "lob", 450);
  assert.ok(g.targetY < shortY);
  assert.ok(g.height > low * 2);
  assert.ok(g.duration > quick);
});
test("the CPU lobs a player who has approached the net", () => {
  const g = createGame();
  serve(g);
  g.playerY = g.moveY = 650;
  for (let i = 0; i < 200 && g.hitter === "you"; i++)
    step(g, 1 / 120, () => 0.5);
  assert.equal(g.hitter, "cpu");
  assert.equal(g.kind, "lob");
  assert.equal(g.targetY, 825);
});
test("low shots catch the net and award the receiver exactly one point", () => {
  const g = createGame();
  serve(g);
  g.height = 2;
  untilPoint(g);
  assert.equal(g.cpu, 1);
  assert.equal(g.call, "Net");
  step(g, 0.1, () => 0.5);
  assert.equal(g.cpu, 1);
});
test("a complete game stops at four-love with a manual serve for each point", () => {
  const g = createGame();
  for (let point = 0; point < 4; point++) {
    if (g.phase !== "rally") serve(g);
    untilPoint(g, () => 1);
    assert.equal(g.you, point + 1);
    if (point < 3) {
      step(g, 2.3);
      assert.equal(g.phase, "serve");
    }
  }
  assert.equal(g.phase, "over");
  step(g, 10);
  assert.equal(g.you, 4);
});

test("a shot selected during a rally is used for the next player return", () => {
  for (const kind of ["drop", "lob"] as const) {
    const g = createGame();
    serve(g);
    g.y = 140;
    hitShot(g, "cpu", "drive", 450);
    g.selected = kind;
    for (let i = 0; i < 400 && g.hitter === "cpu"; i++)
      step(g, 1 / 120, () => 0.5);
    assert.equal(g.hitter, "you");
    assert.equal(g.kind, kind);
    assert.equal(g.selected, kind);
  }
});

test("idle time after a point never launches the next serve", () => {
  const g = createGame();
  serve(g);
  awardPoint(g, "you", "Winner");
  for (let i = 0; i < 1200; i++) step(g, 1 / 60);
  assert.equal(g.phase, "serve");
  assert.equal(g.rally, 0);
  assert.equal(g.you, 1);
  assert.equal(g.y, 860);
  serve(g);
  assert.equal(g.phase, "rally");
});
