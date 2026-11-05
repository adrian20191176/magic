import { useEffect, useRef, useState } from "react";
import "./App.css";
import { cards } from "./utils/card_api";
import { useNavigate, useLocation } from "react-router-dom";
import _ from "lodash";
import AmbiencePicker from "./components/AmbiencePicker";
import AnimatedText from "./components/AnimatedText";
import Backdrop from "./components/Backdrop";
import GoldDust from "./components/GoldDust";
import type { GoldDustHandle } from "./components/GoldDust";
import MagicCard from "./components/MagicCard";
import type { MagicCardHandle } from "./components/MagicCard";
import { parseCard } from "./components/deck/cardMeta";
import { useFinePointer, useReducedMotion } from "./hooks/useMediaQuery";
import { loadAmbience, saveAmbience } from "./utils/ambience";
import type { AmbienceId } from "./utils/ambience";
import { trackPointer } from "./utils/pointer";

/** Keys a presenter's clicker (or a keyboard) can use to turn the card. */
const TURN_KEYS = new Set([" ", "Enter", "ArrowRight", "ArrowLeft", "PageDown", "PageUp"]);

function App() {
  const [cardValue, setCardValue] = useState<string>("back");
  const [count, setCount] = useState<number>(0);
  // The card printed on the face side of the 3D card. It stays put while the
  // card turns back over, so the face never changes while it can be seen.
  const [faceCard, setFaceCard] = useState<string>("as");
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname.split("/")[1] === "adrian") {
      navigate("/", { state: { data: 2 } });
    }
  }, [navigate]);

  const location = useLocation();
  const receivedData = location.state?.data ?? 200;

  const cardRef = useRef<MagicCardHandle>(null);
  const dustRef = useRef<GoldDustHandle>(null);
  const turning = useRef(false);

  async function onCardTurn() {
    // One turn at a time — a double tap can no longer skip a step of the trick.
    if (turning.current) return;
    turning.current = true;

    const nextValue = cardValue !== "back" ? "back" : count === receivedData ? "5c" : _.sample(cards) ?? "ah";
    if (nextValue !== "back") setFaceCard(nextValue);
    setCount((prev) => prev + 1);

    const card = cardRef.current;
    try {
      if (card) {
        await card.flip(() => {
          setCardValue(nextValue);
          const bounds = card.bounds();
          if (nextValue !== "back" && bounds) dustRef.current?.burst(bounds);
        });
      } else {
        setCardValue(nextValue);
      }
    } finally {
      turning.current = false;
    }
  }

  // Global keys always reach the latest turn handler.
  const turnRef = useRef(onCardTurn);
  useEffect(() => {
    turnRef.current = onCardTurn;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!TURN_KEYS.has(event.key) || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const onCard = target?.classList.contains("card-slot");
      // Other controls keep their own keys; the card's button handles Enter/Space natively.
      if (target?.closest("button, a, input, select, textarea, [role='radiogroup']") && !onCard) return;
      if (onCard && (event.key === " " || event.key === "Enter")) return;
      event.preventDefault();
      void turnRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => trackPointer(), []);

  const [ambience, setAmbience] = useState<AmbienceId>(loadAmbience);
  useEffect(() => {
    document.documentElement.dataset.ambience = ambience;
    saveAmbience(ambience);
  }, [ambience]);

  // Hold the entrance until the typefaces are ready, so nothing reflows mid-reveal.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const go = () => {
      if (!cancelled) setReady(true);
    };
    const timeout = window.setTimeout(go, 900);
    Promise.all([
      document.fonts?.load("italic 500 32px 'Cormorant Garamond Variable'"),
      document.fonts?.load("700 32px 'Cormorant Garamond Variable'"),
      document.fonts?.load("600 12px 'Cinzel Variable'"),
    ])
      .catch(() => undefined)
      .finally(go);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const isFaceDown = cardValue === "back";
  const revealed = isFaceDown ? null : parseCard(cardValue);

  const message = isFaceDown ? "Could I find your card?" : "Ta-da! Here’s the card you took.";
  const caption = revealed ? revealed.name : finePointer ? "Click to reveal" : "Tap to reveal";
  const label = revealed
    ? `${revealed.name}. Turn the card face down.`
    : "A face-down playing card. Turn it over to reveal your card.";

  return (
    <div className={`stage${ready ? " is-ready" : ""}`}>
      <Backdrop reducedMotion={reducedMotion} />
      <GoldDust ref={dustRef} reducedMotion={reducedMotion} />

      <header className="brand">
        <span className="brand__rule" aria-hidden="true" />
        <h1 className="brand__title">Magic by Adrian</h1>
        <span className="brand__rule" aria-hidden="true" />
      </header>

      <main className="performance">
        <AnimatedText className="message" text={message} initialDelay={700} swapDelay={160} />
        <MagicCard
          ref={cardRef}
          face={faceCard}
          label={label}
          onActivate={() => void onCardTurn()}
          reducedMotion={reducedMotion}
        />
        <AnimatedText className="caption" text={caption} initialDelay={1250} swapDelay={260} />
      </main>

      <footer className="controls">
        <AmbiencePicker value={ambience} onChange={setAmbience} />
      </footer>

      <div className="curtain" aria-hidden="true" />
    </div>
  );
}

export default App;
