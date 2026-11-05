import { useRef } from "react";
import { damp, useFrame } from "../hooks/useFrame";
import { pointer } from "../utils/pointer";

function Corner({ className }: { className: string }) {
  return (
    <svg className={`deco-corner ${className}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M1 46V1H46" />
      <path d="M7 30V7H30" />
      <path d="M13 13L19 13M13 13L13 19" />
      <path d="M7 7L1 1" />
      <path d="M46 1l3 3-3 3-3-3z" className="deco-corner__jewel" />
      <path d="M1 46l3 3-3 3-3-3z" className="deco-corner__jewel" />
    </svg>
  );
}

/** Velvet-dark stage: jewel-tone glow, a spotlight that follows the pointer, grain and vignette. */
export default function Backdrop({ reducedMotion }: { reducedMotion: boolean }) {
  const spotRef = useRef<HTMLDivElement>(null);
  const spot = useRef({ x: -1, y: -1, written: false });

  useFrame((_, dt) => {
    const el = spotRef.current;
    if (!el) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const s = spot.current;
    // The light leans towards the pointer but never leaves the card in the dark.
    const tx = pointer.active ? w / 2 + (pointer.x - w / 2) * 0.55 : w / 2;
    const ty = pointer.active ? h * 0.44 + (pointer.y - h * 0.44) * 0.5 : h * 0.44;
    if (s.x < 0) {
      s.x = tx;
      s.y = ty;
    }
    const k = damp(reducedMotion ? 20 : 1.8, dt);
    const nx = s.x + (tx - s.x) * k;
    const ny = s.y + (ty - s.y) * k;
    // Once the light has settled, stop touching the DOM so the compositor can rest too.
    if (Math.abs(nx - s.x) < 0.05 && Math.abs(ny - s.y) < 0.05 && s.written) return;
    s.x = nx;
    s.y = ny;
    s.written = true;
    el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
  });

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__base" />
      <div className="backdrop__spot" ref={spotRef} />
      <div className="backdrop__rays" />
      <div className="backdrop__grain" />
      <div className="backdrop__vignette" />
      <Corner className="deco-corner--tl" />
      <Corner className="deco-corner--tr" />
      <Corner className="deco-corner--br" />
      <Corner className="deco-corner--bl" />
    </div>
  );
}
