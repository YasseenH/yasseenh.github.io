import { useEffect, useRef } from "react";
import { rippleStrength } from "../lib/background";

// Adapted from Aceternity's background-ripple demo.
export default function RippleBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const hero = el.closest<HTMLElement>(".home-hero")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0,
      height = 0,
      frame = 0,
      last = 0,
      elapsed = 0,
      nextAmbient = 4500,
      paired = false,
      visible = true;
    let hover: { x: number; y: number } | null = null;
    let waves: { x: number; y: number; at: number }[] = [];
    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const gap = 52;
      waves = waves.filter((w) => time - w.at < 2.8);
      for (let y = gap / 2; y < height; y += gap) {
        for (let x = gap / 2; x < width; x += gap) {
          const fade = Math.max(
            0,
            1 -
              Math.hypot(
                (x - width * 0.6) / (width * 0.9),
                (y - height * 0.45) / height,
              ),
          );
          let strength = 0;
          for (const wave of waves)
            strength = Math.max(
              strength,
              rippleStrength(
                Math.hypot(x - wave.x, y - wave.y),
                time - wave.at,
              ),
            );
          const hovered =
            hover &&
            Math.abs(x - hover.x) < gap / 2 &&
            Math.abs(y - hover.y) < gap / 2;
          ctx.globalAlpha = fade;
          ctx.fillStyle = `rgba(78,132,198,${0.018 + strength * 0.3 + (hovered ? 0.08 : 0)})`;
          ctx.fillRect(x - gap / 2 + 1, y - gap / 2 + 1, gap - 2, gap - 2);
          ctx.strokeStyle = `rgba(105,148,198,${0.12 + strength * 0.32})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(
            x - gap / 2 + 0.5,
            y - gap / 2 + 0.5,
            gap - 1,
            gap - 1,
          );
        }
      }
      ctx.globalAlpha = 1;
    };
    const ripple = (x = width * 0.6, y = height * 0.42, delay = 0) => {
      if (!reduced.matches)
        waves = [...waves.slice(-3), { x, y, at: elapsed / 1000 + delay }];
    };
    const tick = (now: number) => {
      if (now - last >= 1000 / 30) {
        const delta = last ? Math.min(now - last, 100) : 0;
        last = now;
        if (!document.querySelector("dialog[open]")) {
          elapsed += delta;
          if (elapsed >= nextAmbient) {
            for (let i = 0; i < (paired ? 2 : 1); i++)
              ripple(
                width * (0.2 + Math.random() * 0.6),
                height * (0.2 + Math.random() * 0.6),
                i * 0.65,
              );
            paired = !paired;
            nextAmbient = elapsed + 5500;
          }
          draw(elapsed / 1000);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      last = 0;
      el.dataset.motion = reduced.matches
        ? "reduced"
        : visible && !document.hidden
          ? "running"
          : "paused";
      draw(reduced.matches ? 0 : elapsed / 1000);
      if (visible && !document.hidden && !reduced.matches)
        frame = requestAnimationFrame(tick);
    };
    const resize = () => {
      const bounds = hero.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      el.width = Math.round(width * ratio);
      el.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (!waves.length) ripple();
      el.parentElement!.dataset.ready = "true";
      sync();
    };
    const point = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const move = (event: PointerEvent) => {
      hover = point(event);
    };
    const leave = () => {
      hover = null;
    };
    const click = (event: PointerEvent) => {
      if ((event.target as Element).closest("dialog,button,a,input,textarea,select"))
        return;
      const p = point(event);
      ripple(p.x, p.y);
    };
    const sizes = new ResizeObserver(resize);
    sizes.observe(hero);
    resize();
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    intersection.observe(hero);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", leave);
    hero.addEventListener("pointerdown", click);
    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
      intersection.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      hero.removeEventListener("pointerdown", click);
    };
  }, []);

  return (
    <div className="hero-effect" data-effect="ripple" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}
