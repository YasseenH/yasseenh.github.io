import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import TennisEgg from "../src/components/TennisEgg.tsx";

test("desktop and multi-touch controller interactions", async (t) => {
  const dom = new JSDOM('<div id="root"></div>', { pretendToBeVisual: true });
  const { window } = dom;
  let coarse = false,
    width = 1280,
    height = 900,
    time = 100,
    frameId = 0;
  const frames = new Map(),
    captures = new Map(),
    mediaListeners = new Set();
  const translations = [];
  const ctx = new Proxy(
    {},
    {
      get: (target, key) =>
        target[key] ??
        (key === "translate" ? (...args) => translations.push(args) : () => {}),
    },
  );
  Object.assign(globalThis, {
    window,
    document: window.document,
    HTMLElement: window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
    devicePixelRatio: 1,
    ResizeObserver: class {
      observe() {}
      disconnect() {}
    },
    Path2D: class {
      constructor() {
        return new Proxy({}, { get: () => () => {} });
      }
    },
    requestAnimationFrame: (cb) => {
      frames.set(++frameId, cb);
      return frameId;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    matchMedia: (query) => ({
      get matches() {
        return query === "(pointer: coarse)" && coarse;
      },
      addEventListener: (_, cb) => {
        if (query === "(pointer: coarse)") mediaListeners.add(cb);
      },
      removeEventListener: (_, cb) => mediaListeners.delete(cb),
    }),
  });
  window.document.hasFocus = () => true;
  window.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  window.HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new window.Event("close"));
  };
  window.HTMLCanvasElement.prototype.getContext = () => ctx;
  Object.defineProperties(window.HTMLCanvasElement.prototype, {
    clientWidth: { get: () => width },
    clientHeight: { get: () => height },
  });
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    const stick = this.classList.contains("court-thumbstick");
    return {
      left: stick ? 16 : 0,
      top: stick ? height - 110 : 0,
      width: stick ? 96 : width,
      height: stick ? 96 : height,
    };
  };
  window.HTMLElement.prototype.setPointerCapture = function (id) {
    captures.set(id, this);
  };
  const root = createRoot(window.document.getElementById("root"));
  const find = (selector) => window.document.querySelector(selector);
  const button = (text) =>
    [...window.document.querySelectorAll("button")].find((el) =>
      el.textContent.trim().startsWith(text),
    );
  const pointer = async (target, type, options = {}) => {
    const props = {
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      clientX: 64,
      clientY: height - 62,
      buttons: 1,
      ...options,
    };
    await act(() => {
      const event = new window.Event(type, { bubbles: true, cancelable: true });
      Object.assign(event, props);
      (type === "pointerdown"
        ? target
        : (captures.get(props.pointerId) ?? target)
      ).dispatchEvent(event);
      if (type === "pointerup" || type === "pointercancel") {
        const captured = captures.get(props.pointerId);
        captures.delete(props.pointerId);
        if (captured)
          captured.dispatchEvent(
            new window.Event("lostpointercapture", { bubbles: true }),
          );
      }
    });
  };
  const click = async (target) =>
    act(() =>
      target.dispatchEvent(
        new window.MouseEvent("click", { bubbles: true, detail: 0 }),
      ),
    );
  const key = async (key) =>
    act(() =>
      find("canvas").dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key,
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
  const tick = async (count = 1) => {
    for (let i = 0; i < count; i++)
      await act(() => {
        time += 16;
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((cb) => cb(time));
      });
  };
  const player = () =>
    translations.findLast(
      ([x, y]) => x >= 210 && x <= 690 && y >= 550 && y <= 890,
    );
  try {
    await act(() => root.render(createElement(TennisEgg)));
    await click(find(".tennis-discovery"));
    await t.test(
      "mouse desktops have no mobile controller, even at phone widths",
      async () => {
        assert.equal(find(".court-gamepad"), null);
        width = 320;
        height = 568;
        await act(() => window.dispatchEvent(new window.Event("resize")));
        assert.equal(find(".court-gamepad"), null);
      },
    );
    await t.test(
      "desktop keyboard serving, shot toggles, and pause stay intact",
      async () => {
        await key("d");
        assert.equal(find(".court-keybinds").dataset.shot, "drop");
        await key("d");
        assert.equal(find(".court-keybinds").dataset.shot, "drive");
        await key("Enter");
        await tick();
        assert.equal(find(".serve-prompt"), null);
        await key("l");
        assert.equal(find(".court-keybinds").dataset.shot, "lob");
        await key("p");
        assert.match(find(".court-overlay").textContent, /Time out/);
        await key("p");
        assert.equal(find(".court-overlay"), null);
      },
    );
    await t.test(
      "touch devices get controls in landscape as well as portrait",
      async () => {
        width = 844;
        height = 390;
        coarse = true;
        await act(() => mediaListeners.forEach((cb) => cb({ matches: true })));
        assert.ok(find(".court-gamepad"));
        await click(find('[aria-label="Close tennis"]'));
        await click(find(".tennis-discovery"));
        assert.match(find(".court-overlay").textContent, /Time out/);
        await click(button("Resume"));
      },
    );
    await t.test(
      "a second thumb changes shots without releasing the moving joystick",
      async () => {
        await pointer(find(".court-thumbstick"), "pointerdown", {
          clientX: 94,
        });
        await pointer(button("Drop"), "pointerdown", {
          pointerId: 2,
          isPrimary: false,
        });
        assert.equal(button("Drop").getAttribute("aria-pressed"), "true");
        assert.notEqual(
          find(".court-thumbstick").style.getPropertyValue("--stick-x"),
          "0px",
        );
        await tick(10);
        assert.ok(
          player()[0] > 450,
          "the racket keeps moving while a shot is selected",
        );
        await pointer(button("Drop"), "pointerup", {
          pointerId: 2,
          isPrimary: false,
        });
        await pointer(find(".court-thumbstick"), "pointerup");
        const stopped = player()[0];
        await tick(5);
        assert.equal(
          player()[0],
          stopped,
          "releasing the stick stops movement",
        );
        assert.equal(
          find(".court-thumbstick").style.getPropertyValue("--stick-x"),
          "0px",
        );
      },
    );
    await t.test(
      "pointer cancellation resets the stick and pause disables shot buttons",
      async () => {
        await pointer(find(".court-thumbstick"), "pointerdown", {
          clientX: 34,
        });
        await pointer(find(".court-thumbstick"), "pointercancel");
        assert.equal(
          find(".court-thumbstick").style.getPropertyValue("--stick-x"),
          "0px",
        );
        await key("p");
        assert.equal(button("Drop").disabled, true);
        await key("p");
        assert.equal(button("Drop").disabled, false);
      },
    );
    await t.test(
      "switching back to a mouse hides the controller and closing restores scrolling",
      async () => {
        coarse = false;
        await act(() => mediaListeners.forEach((cb) => cb({ matches: false })));
        assert.equal(find(".court-gamepad"), null);
        await click(find('[aria-label="Close tennis"]'));
        assert.equal(window.document.body.style.overflow, "");
        assert.equal(find("dialog").open, false);
      },
    );
    await t.test(
      "touch Serve starts one point while a single court tap or drag never serves",
      async () => {
        coarse = true;
        width = 390;
        height = 844;
        await act(() => root.render(null));
        await act(() => root.render(createElement(TennisEgg)));
        await click(find(".tennis-discovery"));
        await pointer(find("canvas"), "pointerdown");
        await pointer(find("canvas"), "pointerup");
        assert.equal(button("Serve").disabled, false);
        await pointer(find("canvas"), "pointerdown");
        await pointer(find("canvas"), "pointermove", { clientX: 130 });
        await pointer(find("canvas"), "pointerup", { clientX: 130 });
        assert.equal(button("Serve").disabled, false);
        await pointer(button("Serve"), "pointerdown", {
          pointerId: 2,
          isPrimary: false,
        });
        assert.equal(button("Serve").disabled, true);
        assert.equal(find(".serve-prompt"), null);
      },
    );
  } finally {
    await act(() => root.unmount());
    dom.window.close();
  }
});
