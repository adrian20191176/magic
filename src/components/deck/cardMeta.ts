export type SuitKey = "s" | "h" | "d" | "c";

export type CardInfo = {
  /** Normalised card code, e.g. "10h" */
  code: string;
  /** Rank part of the code: "a", "2" … "10", "j", "q", "k" */
  rank: string;
  suit: SuitKey;
  /** What is printed in the corner index, e.g. "10", "Q" */
  index: string;
  /** Human readable name, e.g. "Queen of Hearts" */
  name: string;
  red: boolean;
  court: boolean;
};

const RANK_NAMES: Record<string, string> = {
  a: "Ace",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
  "10": "Ten",
  j: "Jack",
  q: "Queen",
  k: "King",
};

const SUIT_NAMES: Record<SuitKey, string> = {
  s: "Spades",
  h: "Hearts",
  d: "Diamonds",
  c: "Clubs",
};

const isSuit = (value: string): value is SuitKey => value in SUIT_NAMES;

/** Turns a code such as "5c" or "kd" into everything the card artwork needs. */
export function parseCard(code: string): CardInfo {
  const normalised = code.trim().toLowerCase();
  const suitPart = normalised.slice(-1);
  const rankPart = normalised.slice(0, -1);

  // Anything unexpected falls back to the Ace of Spades rather than breaking the render.
  const suit: SuitKey = isSuit(suitPart) ? suitPart : "s";
  const rank = rankPart in RANK_NAMES ? rankPart : "a";

  return {
    code: `${rank}${suit}`,
    rank,
    suit,
    index: rank.toUpperCase(),
    name: `${RANK_NAMES[rank]} of ${SUIT_NAMES[suit]}`,
    red: suit === "h" || suit === "d",
    court: rank === "j" || rank === "q" || rank === "k",
  };
}
