import { memo } from "react";
import {
  CARD_H,
  CARD_RADIUS,
  CARD_W,
  CX,
  CY,
  EMBLEMS,
  FACE,
  PIP_LAYOUTS,
  SUIT_PATHS,
  arc,
  diamond,
  pipSize,
  sparkle,
  suitTransform,
} from "./art";
import { parseCard } from "./cardMeta";
import type { CardInfo } from "./cardMeta";
import GoldFoil from "./GoldFoil";
import { useSvgId } from "./useSvgId";

const SERIF_FONT = "'Cormorant Garamond Variable', 'Cormorant Garamond', Garamond, 'Times New Roman', serif";
const CAPS_FONT = "'Cinzel Variable', Cinzel, 'Times New Roman', serif";
/** Lining figures keep "10" legible (old-style figures read as "IO" at index size). */
const LINING = { fontVariantNumeric: "lining-nums" } as const;

type ArtProps = { card: CardInfo; ink: string; gold: string; id: string };

function CornerIndex({ card, ink }: Pick<ArtProps, "card" | "ink">) {
  const isTen = card.index === "10";
  return (
    <g>
      <text
        x="21.5"
        y="37.5"
        textAnchor="middle"
        fontFamily={SERIF_FONT}
        fontWeight={700}
        fontSize={isTen ? 25 : 29}
        letterSpacing={isTen ? -1.4 : 0}
        style={LINING}
        fill={ink}
      >
        {card.index}
      </text>
      <path d={SUIT_PATHS[card.suit]} transform={suitTransform(21.5, 52, 14.5)} fill={ink} />
    </g>
  );
}

function Pips({ card, ink }: Pick<ArtProps, "card" | "ink">) {
  const size = pipSize(card.rank);
  return (
    <g fill={ink}>
      {PIP_LAYOUTS[card.rank]?.map(([x, y], i) => (
        <path key={i} d={SUIT_PATHS[card.suit]} transform={suitTransform(x, y, size, y > CY + 0.5)} />
      ))}
    </g>
  );
}

function Ace({ card, ink, gold, id }: ArtProps) {
  if (card.suit === "s") {
    // The Ace of Spades carries the maker's mark, as tradition demands.
    const arcId = `${id}-mark`;
    return (
      <g>
        <defs>
          <path id={arcId} d={arc(CX, CY, 79, Math.PI * 1.08, Math.PI * 1.92)} />
        </defs>
        <g fill="none" stroke={gold}>
          <circle cx={CX} cy={CY} r="96" strokeWidth="0.5" />
          <path d={FACE.spadeRays} strokeWidth="0.45" />
          <circle cx={CX} cy={CY} r="86.5" strokeWidth="1.1" />
          <circle cx={CX} cy={CY} r="73" strokeWidth="0.4" />
        </g>
        {[0, 180].map((turn) => (
          <text
            key={turn}
            transform={`rotate(${turn} ${CX} ${CY})`}
            fontFamily={CAPS_FONT}
            fontWeight={700}
            fontSize="8.6"
            letterSpacing="2.4"
            fill={gold}
          >
            <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
              MAGIC · BY · ADRIAN
            </textPath>
          </text>
        ))}
        <g fill={gold}>
          <path d={sparkle(CX - 79, CY, 3.2)} />
          <path d={sparkle(CX + 79, CY, 3.2)} />
        </g>
        <path
          d={SUIT_PATHS.s}
          transform={suitTransform(CX, CY - 2, 112)}
          fill={ink}
          stroke={gold}
          strokeWidth="1.1"
          paintOrder="stroke"
        />
        <path d={sparkle(CX, CY + 4, 10)} fill={gold} />
      </g>
    );
  }

  return (
    <g>
      <g fill="none" stroke={gold}>
        <circle cx={CX} cy={CY} r="72" strokeWidth="0.45" />
        <path d={FACE.aceRays} strokeWidth="0.45" />
        <circle cx={CX} cy={CY} r="64.5" strokeWidth="1" />
        <path d={FACE.aceBraid} strokeWidth="0.35" opacity="0.9" />
        <circle cx={CX} cy={CY} r="55.5" strokeWidth="0.45" />
      </g>
      <path d={SUIT_PATHS[card.suit]} transform={suitTransform(CX, CY, 82)} fill={ink} />
    </g>
  );
}

const PANEL = { x: 44, y: 56, w: CARD_W - 88, h: CARD_H - 112 };

function Court({ card, gold, id }: ArtProps) {
  const emblem = EMBLEMS[card.rank as "j" | "q" | "k"];
  const panelFill = `url(#${id}-panel)`;
  const half = (
    <g>
      <g transform={`translate(${CX - 28} 65) scale(0.56)`}>
        <path d={emblem.body} fill={gold} />
        <path d={emblem.gems} fill={card.red ? "#5a0c1a" : "#121116"} />
      </g>
      <text
        x={CX}
        y="146"
        textAnchor="middle"
        fontFamily={SERIF_FONT}
        fontWeight={700}
        fontSize="60"
        fill={gold}
      >
        {card.index}
      </text>
      <path d={SUIT_PATHS[card.suit]} transform={suitTransform(78, 128, 17)} fill={gold} />
      <path d={SUIT_PATHS[card.suit]} transform={suitTransform(CARD_W - 78, 128, 17)} fill={gold} />
    </g>
  );

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-panel`} x1="0" y1="0" x2="0.35" y2="1">
          {card.red ? (
            <>
              <stop offset="0" stopColor="#8c1a2e" />
              <stop offset="0.5" stopColor="#6a1022" />
              <stop offset="1" stopColor="#4a0917" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#25232b" />
              <stop offset="0.5" stopColor="#16151a" />
              <stop offset="1" stopColor="#0b0a0e" />
            </>
          )}
        </linearGradient>
        <pattern
          id={`${id}-court-lattice`}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(45 ${CX} ${CY})`}
        >
          <path d="M0 0H8M0 0V8" stroke="#e2c47e" strokeWidth="0.4" fill="none" />
        </pattern>
      </defs>

      <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx="9" fill={panelFill} />
      <rect
        x={PANEL.x + 4.5}
        y={PANEL.y + 4.5}
        width={PANEL.w - 9}
        height={PANEL.h - 9}
        rx="6"
        fill={`url(#${id}-court-lattice)`}
        opacity="0.13"
      />
      <g fill="none" stroke={gold}>
        <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx="9" strokeWidth="1.4" />
        <rect
          x={PANEL.x + 4.5}
          y={PANEL.y + 4.5}
          width={PANEL.w - 9}
          height={PANEL.h - 9}
          rx="6"
          strokeWidth="0.45"
        />
        <path d={`M${PANEL.x + 12} ${CY}H${CX - 15}M${CX + 15} ${CY}H${PANEL.x + PANEL.w - 12}`} strokeWidth="0.7" />
        <path d={FACE.courtBraid} strokeWidth="0.35" />
      </g>
      <path d={diamond(CX, CY, 6, 4.2)} fill={gold} />
      <circle cx={PANEL.x + 12} cy={CY} r="1.4" fill={gold} />
      <circle cx={PANEL.x + PANEL.w - 12} cy={CY} r="1.4" fill={gold} />

      {half}
      <g transform={`rotate(180 ${CX} ${CY})`}>{half}</g>
    </g>
  );
}

/** Ivory face of any card in the deck, e.g. <CardFace code="qh" />. */
function CardFace({ code }: { code: string }) {
  const card = parseCard(code);
  const id = useSvgId("face");
  const gold = `url(#${id}-gold)`;
  const ink = `url(#${id}-${card.red ? "crimson" : "ink"})`;
  const art = { card, ink, gold, id };

  return (
    <svg
      className="card-art"
      viewBox={`0 0 ${CARD_W} ${CARD_H}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <GoldFoil id={`${id}-gold`} />
        <radialGradient id={`${id}-stock`} cx="50%" cy="40%" r="80%">
          <stop offset="0" stopColor="#fffdf6" />
          <stop offset="0.6" stopColor="#f8f1e2" />
          <stop offset="1" stopColor="#eee3cb" />
        </radialGradient>
        <linearGradient id={`${id}-crimson`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b6243b" />
          <stop offset="1" stopColor="#7f1124" />
        </linearGradient>
        <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2d2b33" />
          <stop offset="1" stopColor="#0d0c10" />
        </linearGradient>
      </defs>

      <rect width={CARD_W} height={CARD_H} rx={CARD_RADIUS} fill={`url(#${id}-stock)`} />
      <rect
        x="6.5"
        y="6.5"
        width={CARD_W - 13}
        height={CARD_H - 13}
        rx="9.5"
        fill="none"
        stroke={gold}
        strokeWidth="0.8"
      />

      <CornerIndex card={card} ink={ink} />
      <g transform={`rotate(180 ${CX} ${CY})`}>
        <CornerIndex card={card} ink={ink} />
      </g>

      {card.rank === "a" ? <Ace {...art} /> : card.court ? <Court {...art} /> : <Pips card={card} ink={ink} />}
    </svg>
  );
}

export default memo(CardFace);
