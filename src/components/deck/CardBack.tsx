import { memo } from "react";
import { BACK, CARD_H, CARD_RADIUS, CARD_W, CX, CY, diamond, sparkle } from "./art";
import GoldFoil from "./GoldFoil";
import { useSvgId } from "./useSvgId";

/**
 * The signature back: black lacquer, champagne-gold foil, art-deco geometry and
 * an engraved guilloché medallion. Point-symmetric, so it reads the same both ways up.
 */
function CardBack() {
  const id = useSvgId("back");
  const gold = `url(#${id}-gold)`;

  return (
    <svg
      className="card-art"
      viewBox={`0 0 ${CARD_W} ${CARD_H}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <GoldFoil id={`${id}-gold`} />
        <radialGradient id={`${id}-lacquer`} cx="50%" cy="44%" r="78%">
          <stop offset="0" stopColor="#1f1d24" />
          <stop offset="0.55" stopColor="#111015" />
          <stop offset="1" stopColor="#060608" />
        </radialGradient>
        <pattern
          id={`${id}-lattice`}
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(45 ${CX} ${CY})`}
        >
          <path d="M0 0H9M0 0V9" stroke="#d8b56b" strokeWidth="0.45" fill="none" />
        </pattern>
        <clipPath id={`${id}-burst`}>
          <path d={BACK.diamondInner} />
        </clipPath>
      </defs>

      {/* Lacquered stock */}
      <rect width={CARD_W} height={CARD_H} rx={CARD_RADIUS} fill={`url(#${id}-lacquer)`} />

      {/* Fine diamond lattice */}
      <rect x="12" y="12" width={CARD_W - 24} height={CARD_H - 24} rx="5.5" fill={`url(#${id}-lattice)`} opacity="0.2" />

      {/* Frames & corner fans */}
      <g fill="none" stroke={gold} strokeLinecap="round">
        <rect x="8" y="8" width={CARD_W - 16} height={CARD_H - 16} rx="8.5" strokeWidth="1.4" />
        <rect x="12" y="12" width={CARD_W - 24} height={CARD_H - 24} rx="5.5" strokeWidth="0.5" />
        <path d={BACK.frame} strokeWidth="0.75" />
        <path d={BACK.fans} strokeWidth="0.5" />
      </g>

      {/* Sunburst diamond */}
      <path d={BACK.diamondInner} fill={`url(#${id}-lacquer)`} />
      <g clipPath={`url(#${id}-burst)`}>
        <path d={BACK.diamondRays} fill="none" stroke={gold} strokeWidth="0.42" opacity="0.75" />
      </g>
      <g fill="none" stroke={gold} strokeLinejoin="round">
        <path d={BACK.diamondOuter} strokeWidth="1" />
        <path d={BACK.diamondInner} strokeWidth="0.45" />
      </g>

      {/* Jewels */}
      <g fill={gold}>
        <path d={diamond(CX, 20, 4, 3)} />
        <path d={diamond(CX, CARD_H - 20, 4, 3)} />
        <path d={diamond(20, CY, 3, 4)} />
        <path d={diamond(CARD_W - 20, CY, 3, 4)} />
        <path d={sparkle(CX, CY - 141, 6.5)} />
        <path d={sparkle(CX, CY + 141, 6.5)} />
        <path d={sparkle(CX - 91, CY, 5)} />
        <path d={sparkle(CX + 91, CY, 5)} />
      </g>

      {/* Engraved medallion */}
      <circle cx={CX} cy={CY} r={BACK.medallionR} fill={`url(#${id}-lacquer)`} />
      <g fill="none" stroke={gold}>
        <circle cx={CX} cy={CY} r={BACK.medallionR} strokeWidth="1.3" />
        <circle cx={CX} cy={CY} r={BACK.medallionR - 3.2} strokeWidth="0.4" />
        <path d={BACK.braid} strokeWidth="0.42" />
        <path d={BACK.sunburst} strokeWidth="0.5" />
        <circle cx={CX} cy={CY} r="29.5" strokeWidth="0.85" />
        <path d={BACK.innerBraid} strokeWidth="0.38" />
        <circle cx={CX} cy={CY} r="20.5" strokeWidth="0.6" />
        <path d={BACK.rosette} strokeWidth="0.32" />
      </g>
      <circle cx={CX} cy={CY} r="5.2" fill={`url(#${id}-lacquer)`} />
      <path d={sparkle(CX, CY, 8)} fill={gold} />
    </svg>
  );
}

export default memo(CardBack);
