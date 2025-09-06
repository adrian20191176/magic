export const getCard = (card: string) => {
  return `${import.meta.env.VITE_CARD_API}${card}`;
};
