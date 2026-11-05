import { useEffect, useImperativeHandle, useRef } from "react";
import type { Ref } from "react";
import CardBack from "./deck/CardBack";
import CardFace from "./deck/CardFace";
import { damp, useFrame } from "../hooks/useFrame";
import { pointer } from "../utils/pointer";
import { EDGE_KEYFRAMES, FLIP, LIFT_KEYFRAMES, SHADOW_KEYFRAMES } from "../utils/motion";

export type CardBounds = { x: number; y: number; width: number; height: number };

export type MagicCardHandle = {
  /** Turns the card over. `onReveal` fires the moment the other face comes into view. */
  flip: (onReveal?: () => void) => Promise<void>;
  /** Centre and size of the card in viewport pixels. */
  bounds: () => CardBounds | null;
};

type Props = {
  ref?: Ref<MagicCardHandle>;
  /** Card code printed on the face side, e.g. "5c". */
  face: string;
  label: string;
  onActivate: () => void;
  reducedMotion: boolean;
};

const TILT = 11; // degrees when the pointer is over the card
const LOOK = 6; // degrees when the pointer is elsewhere on the page

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function MagicCard({ ref, face, label, onActivate, reducedMotion }: Props) {
  const slotRef = useRef<HTMLButtonElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const liftRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const frontSheenRef = useRef<HTMLDivElement>(null);
  const glareRefs = useRef<Array<HTMLDivElement | null>>([]);

  const angle = useRef(0);
  const rect = useRef<DOMRect | null>(null);
  const motion = useRef({ rx: 0, ry: 0, scale: 1, sway: 1, glare: 0 });

  // The slot never transforms, so its box is a stable reference for pointer maths.
  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const measure = () => {
      rect.current = slot.getBoundingClientRect();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, []);

  useFrame((now, dt) => {
    const box = rect.current;
    const tilt = tiltRef.current;
    if (!box || !tilt) return;

    const m = motion.current;
    const t = now / 1000;
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const nx = (pointer.x - cx) / (box.width / 2);
    const ny = (pointer.y - cy) / (box.height / 2);
    const over = pointer.active && Math.abs(nx) <= 1 && Math.abs(ny) <= 1;

    let targetX = 0;
    let targetY = 0;
    if (!reducedMotion && pointer.active) {
      if (over) {
        targetY = nx * TILT;
        targetX = -ny * TILT;
      } else {
        targetY = clamp(((pointer.x - cx) / window.innerWidth) * 16, -LOOK, LOOK);
        targetX = clamp((-(pointer.y - cy) / window.innerHeight) * 14, -LOOK, LOOK);
      }
    }

    // A slow, living sway whenever nobody is steering the card.
    const swayTarget = reducedMotion ? 0 : !pointer.active ? 1 : over ? 0 : 0.45;
    m.sway += (swayTarget - m.sway) * damp(1.6, dt);
    targetY += Math.sin(t * 0.62) * 4.2 * m.sway;
    targetX += Math.cos(t * 0.47) * 2.6 * m.sway;

    const follow = damp(over ? 9 : 4.5, dt);
    m.rx += (targetX - m.rx) * follow;
    m.ry += (targetY - m.ry) * follow;

    const targetScale = over ? (pointer.down ? 0.975 : 1.035) : 1;
    m.scale += (targetScale - m.scale) * damp(12, dt);
    m.glare += ((over ? 1 : 0.5) - m.glare) * damp(6, dt);

    const float = reducedMotion ? 0 : Math.sin(t * 0.9) * 5;
    tilt.style.transform = `translate3d(0, ${float.toFixed(2)}px, 0) rotateX(${m.rx.toFixed(3)}deg) rotateY(${m.ry.toFixed(
      3
    )}deg) scale(${m.scale.toFixed(4)})`;

    // The glare is a soft light that sits wherever the card is tilted towards.
    const gx = clamp(m.ry / TILT, -1.2, 1.2) * 25;
    const gy = clamp(-m.rx / TILT, -1.2, 1.2) * 25;
    for (const glare of glareRefs.current) {
      if (!glare) continue;
      glare.style.transform = `translate3d(${gx.toFixed(2)}%, ${gy.toFixed(2)}%, 0)`;
      glare.style.opacity = m.glare.toFixed(3);
    }

    const floor = floorRef.current;
    if (floor) {
      const lift = (m.scale - 1) * 6 - float / 40;
      floor.style.transform = `translate3d(${(-m.ry * 1.6).toFixed(2)}px, 0, 0) scale(${(1 + lift * 0.6).toFixed(4)})`;
      floor.style.opacity = (1 - lift * 1.5).toFixed(3);
    }
  });

  useImperativeHandle(ref, () => {
    /** A light sweep across the freshly revealed face and a pulse of the halo behind it. */
    const celebrate = () => {
      frontSheenRef.current?.animate(
        [
          { transform: "translate3d(-120%, 0, 0)", opacity: 0 },
          { opacity: 1, offset: 0.25 },
          { transform: "translate3d(120%, 0, 0)", opacity: 0 },
        ],
        { duration: 1300, delay: 120, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
      );
      haloRef.current?.animate(
        [
          { transform: "scale(0.92)", opacity: 0 },
          { transform: "scale(1.04)", opacity: 1, offset: 0.35 },
          { transform: "scale(1.12)", opacity: 0 },
        ],
        { duration: 1600, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    };

    return {
      bounds() {
        const box = slotRef.current?.getBoundingClientRect();
        return box ? { x: box.left + box.width / 2, y: box.top + box.height / 2, width: box.width, height: box.height } : null;
      },

      async flip(onReveal) {
        const flipEl = flipRef.current;
        const liftEl = liftRef.current;
        let revealed = false;
        const reveal = () => {
          if (revealed) return;
          revealed = true;
          onReveal?.();
        };
        if (!flipEl || !liftEl) {
          reveal();
          return;
        }

        const from = angle.current;
        const to = from + 180;
        angle.current = to % 360;
        const toFront = to % 360 === 180;

        if (reducedMotion) {
          // A quiet cross-fade instead of a spin.
          const out = liftEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-in", fill: "forwards" });
          await out.finished.catch(() => undefined);
          flipEl.style.transform = `rotateY(${to % 360}deg)`;
          reveal();
          const back = liftEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: "ease-out" });
          out.cancel();
          await back.finished.catch(() => undefined);
          return;
        }

        const turn = flipEl.animate([{ transform: `rotateY(${from}deg)` }, { transform: `rotateY(${to}deg)` }], {
          duration: FLIP.duration,
          easing: FLIP.easing,
          fill: "forwards",
        });
        liftEl.animate(LIFT_KEYFRAMES, { duration: FLIP.liftDuration });
        shadowRef.current?.animate(SHADOW_KEYFRAMES, { duration: FLIP.liftDuration });
        edgeRef.current?.animate(EDGE_KEYFRAMES, { duration: FLIP.duration, easing: FLIP.easing });

        // Watch the real rotation so the reveal lands exactly when the card is edge-on.
        const startSide = Math.cos((from * Math.PI) / 180) >= 0;
        const watch = () => {
          if (revealed) return;
          const transform = getComputedStyle(flipEl).transform;
          if (transform && transform !== "none") {
            const facingBack = new DOMMatrixReadOnly(transform).m11 >= 0;
            if (facingBack !== startSide) {
              reveal();
              if (toFront) celebrate();
              return;
            }
          }
          requestAnimationFrame(watch);
        };
        requestAnimationFrame(watch);

        await turn.finished.catch(() => undefined);
        reveal();
        flipEl.style.transform = `rotateY(${to % 360}deg)`;
        turn.cancel();
      },
    };
  }, [reducedMotion]);

  const setGlare = (index: number) => (node: HTMLDivElement | null) => {
    glareRefs.current[index] = node;
  };

  return (
    <button ref={slotRef} type="button" className="card-slot" aria-label={label} onClick={onActivate}>
      <span className="card-halo" ref={haloRef} aria-hidden="true" />
      <span className="card-floor" ref={floorRef} aria-hidden="true">
        <span className="card-floor__shadow" ref={shadowRef} />
      </span>
      <span className="card-intro" aria-hidden="true">
        <span className="card-tilt" ref={tiltRef}>
          <span className="card-lift" ref={liftRef}>
            <span className="card-flip" ref={flipRef}>
              <span className="card-face card-face--back">
                <CardBack />
                <span className="card-sheen card-sheen--idle" />
                <span className="card-glare">
                  <span className="card-glare__light" ref={setGlare(0)} />
                </span>
              </span>
              <span className="card-edge" ref={edgeRef} />
              <span className="card-face card-face--front">
                <CardFace code={face} />
                <span className="card-sheen" ref={frontSheenRef} />
                <span className="card-glare">
                  <span className="card-glare__light" ref={setGlare(1)} />
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
