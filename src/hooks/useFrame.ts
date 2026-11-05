import { useEffect, useRef } from "react";

type FrameCallback = (now: number, dt: number) => void;

/**
 * Runs `callback` on every animation frame with a clamped delta (seconds), so
 * motion stays frame-rate independent and never jumps after a background tab resumes.
 */
export function useFrame(callback: FrameCallback, enabled = true) {
  const latest = useRef(callback);

  useEffect(() => {
    latest.current = callback;
  });

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      latest.current(now, dt);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [enabled]);
}

/** Exponential smoothing factor for a given responsiveness, independent of frame rate. */
export const damp = (speed: number, dt: number) => 1 - Math.exp(-speed * dt);
