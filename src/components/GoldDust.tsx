import { useEffect, useImperativeHandle, useRef } from "react";
import type { Ref } from "react";
import { createDust } from "../utils/dust";
import type { DustSystem } from "../utils/dust";
import type { CardBounds } from "./MagicCard";

export type GoldDustHandle = {
  /** Scatter glints outwards from the edges of the given box. */
  burst: (bounds: CardBounds) => void;
};

type Props = { ref?: Ref<GoldDustHandle>; reducedMotion: boolean };

export default function GoldDust({ ref, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const system = useRef<DustSystem | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dust = createDust(canvas, { reducedMotion });
    system.current = dust;
    return () => {
      dust.destroy();
      system.current = null;
    };
  }, [reducedMotion]);

  useImperativeHandle(
    ref,
    () => ({
      burst: ({ x, y, width, height }) => system.current?.burst(x, y, width, height),
    }),
    []
  );

  return <canvas ref={canvasRef} className="gold-dust" aria-hidden="true" />;
}
