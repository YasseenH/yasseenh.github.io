import { test } from "node:test";
import assert from "node:assert/strict";
import { finishTouch, type TouchServe } from "../src/lib/tennis-input.ts";

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
