/**
 * One shared, allocation-free pointer state. Animation loops read it every
 * frame instead of each component wiring up its own listeners.
 */
export const pointer = {
  x: typeof window === "undefined" ? 0 : window.innerWidth / 2,
  y: typeof window === "undefined" ? 0 : window.innerHeight * 0.45,
  /** Pointer is over the window (or a finger is on the screen). */
  active: false,
  down: false,
  /** performance.now() of the last movement. */
  movedAt: 0,
};

export function trackPointer() {
  const move = (e: PointerEvent) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
    pointer.movedAt = performance.now();
  };
  const down = (e: PointerEvent) => {
    move(e);
    pointer.down = true;
  };
  const up = (e: PointerEvent) => {
    pointer.down = false;
    // A lifted finger leaves nothing hovering over the page.
    if (e.pointerType === "touch") pointer.active = false;
  };
  const out = (e: PointerEvent) => {
    if (!e.relatedTarget) pointer.active = false;
  };
  const blur = () => {
    pointer.active = false;
    pointer.down = false;
  };

  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerdown", down, { passive: true });
  window.addEventListener("pointerup", up, { passive: true });
  window.addEventListener("pointercancel", up, { passive: true });
  window.addEventListener("pointerout", out, { passive: true });
  window.addEventListener("blur", blur);

  return () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerdown", down);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
    window.removeEventListener("pointerout", out);
    window.removeEventListener("blur", blur);
  };
}
