import { CARD_H, CARD_W } from "./art";

/**
 * Champagne-gold foil, spread across the whole card in user space so every
 * gilded line on a card catches the same "light" like a single foil sheet.
 */
export default function GoldFoil({ id }: { id: string }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={CARD_W} y2={CARD_H}>
      <stop offset="0" stopColor="#8a672a" />
      <stop offset="0.14" stopColor="#d4b062" />
      <stop offset="0.28" stopColor="#f7e8b6" />
      <stop offset="0.42" stopColor="#c99f4f" />
      <stop offset="0.58" stopColor="#8c6a2d" />
      <stop offset="0.74" stopColor="#e3c47c" />
      <stop offset="0.88" stopColor="#f4e2a6" />
      <stop offset="1" stopColor="#9e7a34" />
    </linearGradient>
  );
}
