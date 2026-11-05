/**
 * Geometry for the "Maison" deck — an original, fully vector deck of cards.
 *
 * Every card is drawn on a 250 × 350 canvas (the 5:7 poker ratio). All shapes
 * are generated here once at module load, so rendering a card is cheap.
 */
import type { SuitKey } from "./cardMeta";

export const CARD_W = 250;
export const CARD_H = 350;
export const CARD_RADIUS = 14;
export const CX = CARD_W / 2;
export const CY = CARD_H / 2;

const TAU = Math.PI * 2;
const f = (n: number) => Number(n.toFixed(2));

/* -------------------------------------------------------------------------- */
/* Suits — drawn in a 100 × 100 box, centred on (50, 50)                       */
/* -------------------------------------------------------------------------- */

const circle = (cx: number, cy: number, r: number) =>
  `M${f(cx - r)} ${f(cy)}a${r} ${r} 0 1 0 ${f(r * 2)} 0a${r} ${r} 0 1 0 ${f(-r * 2)} 0Z`;

export const SUIT_PATHS: Record<SuitKey, string> = {
  h:
    "M50 89C46.4 82.6 37.2 75 27.6 66C17.2 56.2 8.6 46.2 8.6 33.6C8.6 20.4 18.4 10.6 30.6 10.6" +
    "C39.6 10.6 46.4 16 50 24.2C53.6 16 60.4 10.6 69.4 10.6C81.6 10.6 91.4 20.4 91.4 33.6" +
    "C91.4 46.2 82.8 56.2 72.4 66C62.8 75 53.6 82.6 50 89Z",
  d: "M50 5C56.4 22 67 36.6 84 50C67 63.4 56.4 78 50 95C43.6 78 33 63.4 16 50C33 36.6 43.6 22 50 5Z",
  s:
    "M50 5.5C54.6 16.4 64.4 26 75.4 35.2C85.4 43.6 91.4 51.4 91.4 61.2C91.4 72.6 82.8 80.8 71.8 80.8" +
    "C63.8 80.8 57.4 76.8 53.8 70.6C54.8 80 58.6 88.4 66 94.5L34 94.5C41.4 88.4 45.2 80 46.2 70.6" +
    "C42.6 76.8 36.2 80.8 28.2 80.8C17.2 80.8 8.6 72.6 8.6 61.2C8.6 51.4 14.6 43.6 24.6 35.2" +
    "C35.6 26 45.4 16.4 50 5.5Z",
  c:
    circle(50, 27.5, 19) +
    circle(27.8, 58, 19) +
    circle(72.2, 58, 19) +
    circle(50, 50, 13) +
    "M46.6 56C46.6 74.4 43.2 85.6 34.5 94.5L65.5 94.5C56.8 85.6 53.4 74.4 53.4 56Z",
};

/** Places a 100-unit suit path at (x, y) with the given size, optionally upside down. */
export function suitTransform(x: number, y: number, size: number, flipped = false) {
  const s = size / 100;
  const base = `translate(${f(x - size / 2)} ${f(y - size / 2)}) scale(${f(s)})`;
  return flipped ? `rotate(180 ${f(x)} ${f(y)}) ${base}` : base;
}

/* -------------------------------------------------------------------------- */
/* Pip layouts (card coordinates)                                              */
/* -------------------------------------------------------------------------- */

const COL_L = 80;
const COL_M = CX;
const COL_R = 170;
const ROW_T = 84;
const ROW_B = CARD_H - ROW_T;
const ROW_4 = [ROW_T, ROW_T + (ROW_B - ROW_T) / 3, ROW_T + ((ROW_B - ROW_T) * 2) / 3, ROW_B];

type Pip = [x: number, y: number];

export const PIP_LAYOUTS: Record<string, Pip[]> = {
  "2": [
    [COL_M, ROW_T],
    [COL_M, ROW_B],
  ],
  "3": [
    [COL_M, ROW_T],
    [COL_M, CY],
    [COL_M, ROW_B],
  ],
  "4": [
    [COL_L, ROW_T],
    [COL_R, ROW_T],
    [COL_L, ROW_B],
    [COL_R, ROW_B],
  ],
  "5": [
    [COL_L, ROW_T],
    [COL_R, ROW_T],
    [COL_M, CY],
    [COL_L, ROW_B],
    [COL_R, ROW_B],
  ],
  "6": [
    [COL_L, ROW_T],
    [COL_R, ROW_T],
    [COL_L, CY],
    [COL_R, CY],
    [COL_L, ROW_B],
    [COL_R, ROW_B],
  ],
  "7": [
    [COL_L, ROW_T],
    [COL_R, ROW_T],
    [COL_M, (ROW_T + CY) / 2],
    [COL_L, CY],
    [COL_R, CY],
    [COL_L, ROW_B],
    [COL_R, ROW_B],
  ],
  "8": [
    [COL_L, ROW_T],
    [COL_R, ROW_T],
    [COL_M, (ROW_T + CY) / 2],
    [COL_L, CY],
    [COL_R, CY],
    [COL_M, (CY + ROW_B) / 2],
    [COL_L, ROW_B],
    [COL_R, ROW_B],
  ],
  "9": [
    [COL_L, ROW_4[0]],
    [COL_R, ROW_4[0]],
    [COL_L, ROW_4[1]],
    [COL_R, ROW_4[1]],
    [COL_M, CY],
    [COL_L, ROW_4[2]],
    [COL_R, ROW_4[2]],
    [COL_L, ROW_4[3]],
    [COL_R, ROW_4[3]],
  ],
  "10": [
    [COL_L, ROW_4[0]],
    [COL_R, ROW_4[0]],
    [COL_M, (ROW_4[0] + ROW_4[1]) / 2],
    [COL_L, ROW_4[1]],
    [COL_R, ROW_4[1]],
    [COL_L, ROW_4[2]],
    [COL_R, ROW_4[2]],
    [COL_M, (ROW_4[2] + ROW_4[3]) / 2],
    [COL_L, ROW_4[3]],
    [COL_R, ROW_4[3]],
  ],
};

export const pipSize = (rank: string) => (rank === "9" || rank === "10" ? 33 : 36);

/* -------------------------------------------------------------------------- */
/* Ornament generators                                                         */
/* -------------------------------------------------------------------------- */

/** Braided guilloché band: several phase-shifted sine rings woven together. */
export function guilloche(
  cx: number,
  cy: number,
  radius: number,
  amplitude: number,
  lobes: number,
  strands: number,
  samples = 480
) {
  let d = "";
  for (let k = 0; k < strands; k++) {
    const phase = (k / strands) * TAU;
    for (let i = 0; i < samples; i++) {
      const t = (i / samples) * TAU;
      const r = radius + amplitude * Math.sin(lobes * t + phase);
      d += `${i === 0 ? "M" : "L"}${f(cx + r * Math.cos(t))} ${f(cy + r * Math.sin(t))}`;
    }
    d += "Z";
  }
  return d;
}

/** Spirograph rosette (hypotrochoid) — the engraved "watch dial" centre. */
export function rosette(cx: number, cy: number, R: number, r: number, d: number, turns: number, samples = 900) {
  let path = "";
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * TAU * turns;
    const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
    path += `${i === 0 ? "M" : "L"}${f(cx + x)} ${f(cy + y)}`;
  }
  return `${path}Z`;
}

/** Radiating lines, optionally alternating between two outer radii. */
export function rays(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  count: number,
  { altOuter, from = 0, to = TAU, offset = 0 }: { altOuter?: number; from?: number; to?: number; offset?: number } = {}
) {
  const full = Math.abs(to - from - TAU) < 1e-6;
  const steps = full ? count : count - 1;
  let d = "";
  for (let i = 0; i < count; i++) {
    const a = from + offset + ((to - from) * i) / steps;
    const o = altOuter !== undefined && i % 2 === 1 ? altOuter : outer;
    d += `M${f(cx + inner * Math.cos(a))} ${f(cy + inner * Math.sin(a))}L${f(cx + o * Math.cos(a))} ${f(cy + o * Math.sin(a))}`;
  }
  return d;
}

export function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const large = Math.abs(to - from) > Math.PI ? 1 : 0;
  const sweep = to > from ? 1 : 0;
  return `M${f(cx + r * Math.cos(from))} ${f(cy + r * Math.sin(from))}A${r} ${r} 0 ${large} ${sweep} ${f(
    cx + r * Math.cos(to)
  )} ${f(cy + r * Math.sin(to))}`;
}

export const ring = circle;

/** Four-pointed sparkle with concave sides. */
export function sparkle(cx: number, cy: number, r: number, waist = 0.16) {
  const w = r * waist;
  return (
    `M${f(cx)} ${f(cy - r)}C${f(cx + w)} ${f(cy - w)} ${f(cx + w)} ${f(cy - w)} ${f(cx + r)} ${f(cy)}` +
    `C${f(cx + w)} ${f(cy + w)} ${f(cx + w)} ${f(cy + w)} ${f(cx)} ${f(cy + r)}` +
    `C${f(cx - w)} ${f(cy + w)} ${f(cx - w)} ${f(cy + w)} ${f(cx - r)} ${f(cy)}` +
    `C${f(cx - w)} ${f(cy - w)} ${f(cx - w)} ${f(cy - w)} ${f(cx)} ${f(cy - r)}Z`
  );
}

export function diamond(cx: number, cy: number, rx: number, ry = rx) {
  return `M${f(cx)} ${f(cy - ry)}L${f(cx + rx)} ${f(cy)}L${f(cx)} ${f(cy + ry)}L${f(cx - rx)} ${f(cy)}Z`;
}

/* -------------------------------------------------------------------------- */
/* Court emblems — drawn in a 100 × 64 box, centred on x = 50                  */
/* -------------------------------------------------------------------------- */

export type Emblem = {
  /** Gold body of the emblem */
  body: string;
  /** Small "gem" cut-outs filled with the panel colour */
  gems: string;
};

export const EMBLEMS: Record<"k" | "q" | "j", Emblem> = {
  // King — five-pointed crown on a jewelled band
  k: {
    body:
      "M13 47L7 17L21 33L29.5 11L40 29L50 4L60 29L70.5 11L79 33L93 17L87 47Z" +
      "M11 49H89V58H11Z" +
      circle(7, 15.5, 3.6) +
      circle(29.5, 9.5, 3.4) +
      circle(50, 3.2, 4) +
      circle(70.5, 9.5, 3.4) +
      circle(93, 15.5, 3.6),
    gems: diamond(30, 53.5, 4.2, 2.8) + diamond(50, 53.5, 5, 3.2) + diamond(70, 53.5, 4.2, 2.8) + diamond(50, 36, 4, 6),
  },
  // Queen — arched tiara with pearls
  q: {
    body:
      "M9 49C9 35 16 24 24 24C31 24 35 31 37 38C39 24 44 12 50 9C56 12 61 24 63 38C65 31 69 24 76 24" +
      "C84 24 91 35 91 49Q50 40 9 49Z" +
      "M8 51Q50 42 92 51L92 58Q50 49 8 58Z" +
      circle(24, 19.5, 3.6) +
      circle(50, 4.6, 4.2) +
      circle(76, 19.5, 3.6) +
      circle(37, 33, 2.2) +
      circle(63, 33, 2.2),
    gems: "M50 19C53.6 24 55 28 55 31.5C55 35 52.8 37.5 50 37.5C47.2 37.5 45 35 45 31.5C45 28 46.4 24 50 19Z",
  },
  // Jack — fleur-de-lis
  j: {
    body:
      // centre petal
      "M50 1C58.5 9 62 20 59 32C57.8 37 54.6 41 50 45C45.4 41 42.2 37 41 32C38 20 41.5 9 50 1Z" +
      // left petal
      "M44.5 46C34 48 20 46 14 36C9.5 28 12 18.5 20.5 17.5C26.5 16.8 30 21.5 27.5 26C26 28.6 22.5 28.6 21.5 26" +
      "C20.5 31 25.6 35.6 32 37C37.4 38.2 41.6 40.8 44.5 46Z" +
      // right petal
      "M55.5 46C66 48 80 46 86 36C90.5 28 88 18.5 79.5 17.5C73.5 16.8 70 21.5 72.5 26C74 28.6 77.5 28.6 78.5 26" +
      "C79.5 31 74.4 35.6 68 37C62.6 38.2 58.4 40.8 55.5 46Z" +
      // band
      "M33 45.5H67V51.5H33Z" +
      // feet
      "M46.5 51.5L50 63L53.5 51.5Z" +
      "M40 51.5C39 56.5 35 60 28.5 61C33 57.6 35 54.6 35.6 51.5Z" +
      "M60 51.5C61 56.5 65 60 71.5 61C67 57.6 65 54.6 64.4 51.5Z",
    gems: diamond(50, 48.5, 3.4, 2),
  },
};

/* -------------------------------------------------------------------------- */
/* Card-back ornaments (pre-computed)                                          */
/* -------------------------------------------------------------------------- */

const MEDALLION_R = 50;

const FRAME_INSET = 20;
const NOTCH = 8;

export const BACK = {
  medallionR: MEDALLION_R,
  /** Art-deco inner frame with stepped (notched) corners. */
  frame: (() => {
    const a = FRAME_INSET;
    const b = CARD_W - FRAME_INSET;
    const c = CARD_H - FRAME_INSET;
    const n = NOTCH;
    return `M${a + n} ${a}H${b - n}V${a + n}H${b}V${c - n}H${b - n}V${c}H${a + n}V${c - n}H${a}V${a + n}H${a + n}Z`;
  })(),
  braid: guilloche(CX, CY, 40, 4.2, 24, 3, 540),
  innerBraid: guilloche(CX, CY, 25.5, 2.2, 18, 2, 360),
  // R / r = 16 / 6 → 8 petals, so the rosette is symmetric when the card is turned around.
  rosette: rosette(CX, CY, 16, 6, 7, 3, 900),
  sunburst: rays(CX, CY, 30.5, 34.5, 96),
  /** Nested art-deco diamonds framing the medallion. */
  diamondOuter: diamond(CX, CY, 91, 141),
  diamondInner: diamond(CX, CY, 85, 133),
  /** Starburst radiating from the medallion — clipped to the inner diamond when drawn. */
  diamondRays: rays(CX, CY, MEDALLION_R + 5, 160, 72, { offset: Math.PI / 72 }),
  /** Sunburst fans that open from each stepped corner of the inner frame. */
  fans: (() => {
    let d = "";
    const k = FRAME_INSET + NOTCH;
    const corners: Array<[x: number, y: number, a: number]> = [
      [k, k, 0],
      [CARD_W - k, k, Math.PI / 2],
      [CARD_W - k, CARD_H - k, Math.PI],
      [k, CARD_H - k, (Math.PI * 3) / 2],
    ];
    for (const [x, y, a] of corners) {
      d += arc(x, y, 18, a, a + Math.PI / 2);
      d += arc(x, y, 22.5, a, a + Math.PI / 2);
      d += rays(x, y, 4, 18, 9, { from: a, to: a + Math.PI / 2 });
    }
    return d;
  })(),
};

/* -------------------------------------------------------------------------- */
/* Face ornaments                                                              */
/* -------------------------------------------------------------------------- */

export const FACE = {
  aceBraid: guilloche(CX, CY, 60, 2.2, 40, 2, 720),
  aceRays: rays(CX, CY, 66, 70, 120, { altOuter: 68 }),
  spadeRays: rays(CX, CY, 88, 92, 160, { altOuter: 90 }),
  courtBraid: guilloche(CX, CY, 11, 1.8, 12, 2, 240),
};
