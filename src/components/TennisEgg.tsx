import { useEffect, useRef, useState } from "react";
import {
  createGame,
  prepareServe,
  serve,
  step,
  clamp,
  scoreLabel,
  type Shot,
} from "../lib/tennis";
import { courtView, drawCourt } from "../lib/tennis-canvas";
import { finishTouch } from "../lib/tennis-input";

export default function TennisEgg() {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef(createGame());
  const touch = useRef({ x: 0, y: 0, at: 0, lastX: 0, lastY: 0 });
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [help, setHelp] = useState(false);
  const [selected, setSelected] = useState<Shot>("drive");
  const [view, setView] = useState({ ...game.current });

  useEffect(() => {
    if (!open) return;
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1, 2);
      el.width = Math.round(rect.width * ratio);
      el.height = Math.round(rect.height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const v = courtView(rect.width, rect.height);
      dialog.current?.style.setProperty(
        "--serve-y",
        `${v.y + 740 * v.scale}px`,
      );
      dialog.current?.style.setProperty(
        "--umpire-x",
        `${clamp(v.x + (rect.width < 600 ? 745 : 800) * v.scale, 12, rect.width - (rect.width < 600 ? 76 : 116))}px`,
      );
      dialog.current?.style.setProperty(
        "--umpire-y",
        `${v.y + 500 * v.scale}px`,
      );
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    el.focus({ preventScroll: true });
    let frame: number,
      last = 0,
      previous = "";
    const tick = (now: number) => {
      const g = game.current;
      if (!paused && !help && !document.hidden && document.hasFocus())
        step(g, last ? Math.min((now - last) / 1000, 0.04) : 0);
      last = now;
      drawCourt(ctx, g, el.clientWidth, el.clientHeight, reduced);
      const key = `${g.you}/${g.cpu}/${g.phase}/${g.rally}`;
      if (key !== previous) {
        previous = key;
        setView({ ...g });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const blur = () => {
      if (game.current.phase === "rally") setPaused(true);
    };
    window.addEventListener("blur", blur);
    const visibility = () => {
      if (document.hidden) blur();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
      document.body.style.overflow = overflow;
    };
  }, [open, paused, help]);

  const chooseShot = (kind: Shot) => {
    game.current.selected = kind;
    setSelected(kind);
    canvas.current?.focus({ preventScroll: true });
  };
  const enterCourt = () => {
    if (game.current.phase === "over") game.current = createGame();
    game.current.selected = selected;
    prepareServe(game.current);
    setView({ ...game.current });
    setPaused(false);
    canvas.current?.focus({ preventScroll: true });
  };
  const start = () => {
    if (game.current.phase !== "serve") return;
    serve(game.current);
    setView({ ...game.current });
    setPaused(false);
    setHelp(false);
    canvas.current?.focus({ preventScroll: true });
  };
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!event.isPrimary) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const v = courtView(rect.width, rect.height);
    game.current.moveX = clamp(
      (event.clientX - rect.left - v.x) / v.scale,
      210,
      690,
    );
    if (game.current.phase === "rally")
      game.current.moveY = clamp(
        (event.clientY - rect.top - v.y) / v.scale,
        550,
        890,
      );
  };
  return (
    <>
      <button
        className="tennis-discovery"
        aria-label="Play a hidden game of tennis"
        title="Play tennis"
        onClick={() => {
          if (game.current.phase === "ready") {
            prepareServe(game.current);
            setView({ ...game.current });
          }
          setOpen(true);
          setPaused(game.current.phase === "rally");
          dialog.current?.showModal();
        }}
      >
        <span className="tennis-ball" aria-hidden="true" />
      </button>
      <dialog
        ref={dialog}
        className="tennis-dialog"
        aria-label="One more rally. Tennis against the CPU."
        onClose={() => {
          setOpen(false);
          setHelp(false);
          touch.current.at = 0;
        }}
      >
        <canvas
          ref={canvas}
          tabIndex={0}
          aria-label="Tennis court. Double-click or double-tap to serve. Drag to move on touchscreens. D toggles drop shots, L toggles lobs. Press the same key again for a normal drive. Arrow keys move. Enter serves with the keyboard. P pauses. Escape exits."
          onPointerMove={move}
          onPointerDown={(event) => {
            if (!event.isPrimary) return;
            if (event.pointerType === "touch") {
              touch.current.x = event.clientX;
              touch.current.y = event.clientY;
            }
            move(event);
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.focus({ preventScroll: true });
          }}
          onPointerUp={(event) => {
            if (event.pointerType !== "touch" || !event.isPrimary) return;
            if (
              finishTouch(
                touch.current,
                event.clientX,
                event.clientY,
                event.timeStamp,
              ) &&
              !paused &&
              !help
            ) {
              start();
            }
          }}
          onPointerCancel={() => {
            touch.current.at = 0;
          }}
          onDoubleClick={() => {
            if (!paused && !help) start();
          }}
          onContextMenu={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (
              [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Enter",
              ].includes(event.key)
            )
              event.preventDefault();
            const g = game.current;
            if (event.key === "ArrowLeft")
              g.moveX = clamp(g.moveX - 30, 210, 690);
            if (event.key === "ArrowRight")
              g.moveX = clamp(g.moveX + 30, 210, 690);
            if (event.key === "ArrowUp")
              g.moveY = clamp(g.moveY - 40, 550, 890);
            if (event.key === "ArrowDown")
              g.moveY = clamp(g.moveY + 40, 550, 890);
            if (!event.repeat && event.key.toLowerCase() === "d")
              chooseShot(g.selected === "drop" ? "drive" : "drop");
            if (!event.repeat && event.key.toLowerCase() === "l")
              chooseShot(g.selected === "lob" ? "drive" : "lob");
            if (!event.repeat && event.key.toLowerCase() === "p")
              setPaused((p) => !p);
            if (!event.repeat && event.key === "Enter" && !paused && !help)
              start();
          }}
        >
          Your browser needs canvas support to play tennis.
        </canvas>
        <div
          className="court-score"
          aria-label="Score"
          aria-live="polite"
          aria-atomic="true"
        >
          <table>
            <caption className="sr-only">One game. You are serving.</caption>
            <tbody>
              <tr>
                <th scope="row">
                  <span className="server-dot" aria-hidden="true" />
                  You
                </th>
                <td>{scoreLabel(view.you, view.cpu)}</td>
              </tr>
              <tr>
                <th scope="row">
                  <span className="server-dot is-receiver" aria-hidden="true" />
                  CPU
                </th>
                <td>{scoreLabel(view.cpu, view.you)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="court-controls">
          <div
            className="court-keybinds"
            data-shot={selected}
            role="status"
            aria-label="Shot selection"
          >
            <span data-active={selected === "drop"}>
              <kbd>D</kbd> Drop
            </span>
            <span data-active={selected === "lob"}>
              <kbd>L</kbd> Lob
            </span>
            <span className="sr-only">Selected shot: {selected}</span>
          </div>
          <div className="court-touch-shots" aria-label="Touch shot selection">
            <button
              aria-pressed={selected === "drop"}
              onClick={() => chooseShot(selected === "drop" ? "drive" : "drop")}
            >
              Drop
            </button>
            <button
              aria-pressed={selected === "lob"}
              onClick={() => chooseShot(selected === "lob" ? "drive" : "lob")}
            >
              Lob
            </button>
          </div>
          <button
            aria-label={paused ? "Resume tennis" : "Pause tennis"}
            disabled={view.phase !== "rally"}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            aria-label="Tennis controls"
            aria-expanded={help}
            onClick={() => setHelp((h) => !h)}
          >
            ?
          </button>
          <button
            aria-label="Close tennis"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        {view.phase === "serve" && !paused && !help && (
          <p className="serve-prompt">
            <span className="court-mouse-hint">Double-click</span>
            <span className="court-touch-hint">Double-tap</span> to serve
          </p>
        )}

        <div className="umpire-call" role="status" aria-live="polite">
          {view.call && view.phase !== "rally" && (
            <>
              <strong>{view.call}.</strong>
              <span>{view.message}</span>
            </>
          )}
        </div>
        {(view.phase === "over" || paused || help) && (
          <div className="court-overlay">
            <div>
              <h2>
                {help
                  ? "Make your move."
                  : paused
                    ? "Time out."
                    : view.phase === "over"
                      ? view.message
                      : "One more rally."}
              </h2>
              {help && (
                <p>
                  <span className="court-mouse-hint">
                    Double-click to serve. D for drop shots. L for lobs.
                  </span>
                  <span className="court-touch-hint">
                    Double-tap to serve. Drag to move. Tap Drop or Lob to change
                    your shot.
                  </span>
                </p>
              )}
              {help && (
                <p className="court-help">
                  Move forward to pick up short balls. Hit off-center to find an
                  angle. Press D or L again to return to a normal drive.
                  <br />
                  Mouse moves your racket. Arrow keys also work. Enter is the
                  keyboard alternative to double-clicking.
                </p>
              )}
              <button
                className="court-play"
                onClick={() => {
                  if (help) {
                    setHelp(false);
                    canvas.current?.focus({ preventScroll: true });
                  } else if (paused) {
                    setPaused(false);
                    canvas.current?.focus({ preventScroll: true });
                  } else enterCourt();
                }}
              >
                {help ? "Back to court" : paused ? "Resume" : "Play again"}{" "}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
