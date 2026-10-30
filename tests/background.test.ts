import { test } from "node:test";
import assert from "node:assert/strict";
import { rippleStrength } from "../src/lib/background.ts";

test("the ripple travels outward and fades instead of flashing the entire grid", () => {
  assert.ok(rippleStrength(160, 0.5) > rippleStrength(0, 0.5));
  assert.ok(rippleStrength(320, 1) > rippleStrength(160, 1));
  assert.ok(rippleStrength(320, 1) < rippleStrength(160, 0.5));
  assert.equal(rippleStrength(0, -1), 0);
  assert.equal(rippleStrength(960, 3), 0);
});

test("a staggered second ripple stays quiet until its scheduled start", () => {
  const secondStartsAt = 0.65;
  assert.equal(rippleStrength(0, 0.4 - secondStartsAt), 0);
  assert.ok(rippleStrength(160, 1.15 - secondStartsAt) > 0.7);
  assert.equal(rippleStrength(0, 3.5 - secondStartsAt), 0);
});
