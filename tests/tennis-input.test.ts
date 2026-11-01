import { test } from "node:test";
import assert from "node:assert/strict";
import { courtView } from "../src/lib/tennis-canvas.ts";
import {
  finishTouch,
  thumbstick,
  type TouchServe,
} from "../src/lib/tennis-input.ts";

test("touch courts stay between the toolbar and portrait controller", () => {
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [568, 320],
  ]) {
    const v = courtView(width, height, true);
    assert.ok(v.scale > 0);
    assert.ok(v.x + 210 * v.scale >= 0);
    assert.ok(v.x + 690 * v.scale <= width);
    assert.ok(v.y >= (height >= width ? 84 : 44));
    assert.ok(
      v.y + 1000 * v.scale <= height - (height >= width ? 176 : 24) + 0.001,
    );
  }
});

test("the thumbstick filters resting jitter and limits diagonal movement", () => {
  assert.deepEqual(thumbstick(0, 0, 32), { x: 0, y: 0 });
  assert.deepEqual(thumbstick(2, -1, 32), { x: 0, y: 0 });
  assert.deepEqual(thumbstick(5, 0, 32), { x: 0, y: 0 });
  assert.ok(
    thumbstick(16, 0, 32).x < 0.2,
    "half travel should give precise, gentle movement",
  );
  const diagonal = thumbstick(100, -100, 32);
  assert.ok(diagonal.x > 0 && diagonal.y < 0);
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 1e-10);
  assert.ok(thumbstick(16, 0, 32).x < thumbstick(32, 0, 32).x);
});

test("touch serves require two nearby taps and reset after a serve", () => {
  const t: TouchServe = { x: 100, y: 200, at: 0, lastX: 0, lastY: 0 };
  assert.equal(finishTouch(t, 100, 200, 1000), false);
  assert.equal(finishTouch(t, 103, 202, 1200), true);
  assert.equal(finishTouch(t, 100, 200, 1400), false);
});

test("dragging, distant taps, and slow taps never serve", () => {
  const t: TouchServe = { x: 100, y: 200, at: 0, lastX: 0, lastY: 0 };
  finishTouch(t, 100, 200, 1000);
  assert.equal(finishTouch(t, 150, 240, 1200), false);
  assert.equal(t.at, 0);
  assert.equal(finishTouch(t, 100, 200, 1300), false);
  assert.equal(finishTouch(t, 100, 200, 1800), false);
  t.x = 200;
  assert.equal(finishTouch(t, 200, 200, 1900), false);
});
