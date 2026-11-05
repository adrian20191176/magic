import { eases, waapi } from "animejs";

/**
 * Card-flip choreography. All of it runs through the Web Animations API on
 * transforms/opacity only, so the browser can keep it on the compositor thread —
 * the flip stays silky even if the main thread is busy.
 */

const weighted = eases.cubicBezier(0.6, 0.02, 0.2, 1);
const SPLIT = 0.7;
const OVERSHOOT = 1.017;

/** A weighted turn that glides ~3° past flat, then settles like real card stock. */
export function flipEase(t: number) {
  if (t <= SPLIT) return OVERSHOOT * weighted(t / SPLIT);
  return OVERSHOOT - (OVERSHOOT - 1) * eases.inOutSine((t - SPLIT) / (1 - SPLIT));
}

const supportsLinearEasing =
  typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("animation-timing-function", "linear(0, 1)");

/** Progress (0–1) at which the card is edge-on — when the other face starts to show. */
const EDGE_ON = (() => {
  let lo = 0;
  let hi = SPLIT;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (flipEase(mid) < 0.5) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
})();

const DURATION = 1150;
const LIFT_DURATION = Math.round(DURATION * SPLIT * 1.12);
const PEAK = Math.min(0.6, (EDGE_ON * DURATION) / LIFT_DURATION);

export const FLIP = {
  duration: DURATION,
  easing: supportsLinearEasing ? waapi.convertEase(flipEase, 120) : "cubic-bezier(0.6, 0.02, 0.2, 1)",
  edgeOn: EDGE_ON,
  liftDuration: LIFT_DURATION,
};

/** The card is pressed, lifted towards the viewer while it turns, then set down. */
export const LIFT_KEYFRAMES: Keyframe[] = [
  { transform: "translate3d(0, 0, 0) scale(1)", easing: "cubic-bezier(0.3, 0, 0.5, 1)" },
  { transform: "translate3d(0, 2px, -14px) scale(0.985)", offset: 0.1, easing: "cubic-bezier(0.25, 0, 0.3, 1)" },
  { transform: "translate3d(0, -16px, 110px) scale(1)", offset: PEAK, easing: "cubic-bezier(0.45, 0, 0.25, 1)" },
  { transform: "translate3d(0, 0, 0) scale(1)" },
];

/** The floor shadow widens and softens as the card rises. */
export const SHADOW_KEYFRAMES: Keyframe[] = [
  { transform: "scale(1, 1)", opacity: 1, easing: "cubic-bezier(0.3, 0, 0.5, 1)" },
  { transform: "scale(0.96, 0.92)", opacity: 1, offset: 0.1, easing: "cubic-bezier(0.25, 0, 0.3, 1)" },
  { transform: "scale(1.32, 1.18)", opacity: 0.4, offset: PEAK, easing: "cubic-bezier(0.45, 0, 0.25, 1)" },
  { transform: "scale(1, 1)", opacity: 1 },
];

/** The gilded edge only catches the light while the card is close to edge-on. */
export const EDGE_KEYFRAMES: Keyframe[] = [
  { opacity: 0 },
  { opacity: 0, offset: Math.max(0, EDGE_ON - 0.1) },
  { opacity: 1, offset: EDGE_ON },
  { opacity: 0, offset: Math.min(1, EDGE_ON + 0.1) },
  { opacity: 0 },
];
