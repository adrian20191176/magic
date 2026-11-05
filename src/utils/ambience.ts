export const AMBIENCES = [
  { id: "emerald", label: "Emerald" },
  { id: "sapphire", label: "Sapphire" },
  { id: "bordeaux", label: "Bordeaux" },
  { id: "onyx", label: "Onyx" },
] as const;

export type AmbienceId = (typeof AMBIENCES)[number]["id"];

const STORAGE_KEY = "magic:ambience";

const isAmbience = (value: unknown): value is AmbienceId => AMBIENCES.some((a) => a.id === value);

export function loadAmbience(): AmbienceId {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isAmbience(saved)) return saved;
  } catch {
    // Storage can be unavailable (private mode, blocked cookies) — fall back quietly.
  }
  return "emerald";
}

export function saveAmbience(id: AmbienceId) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Not being able to remember the choice is fine.
  }
}
