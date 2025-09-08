import { useState } from "react";
import "./App.css";
import { animate } from "animejs";
import { cards } from "./utils/card_api";
import _ from "lodash";

function App() {
  const [cardValue, setCardValue] = useState<string>("back");

  async function onCardTurn() {
    animate(".magic-text", {
      opacity: 0,
      duration: 550,
      ease: "inOutSine",
    }).then(() => {
      animate(".magic-text", {
        opacity: 1,
        duration: 550,
        ease: "inOutSine",
      });
    });

    animate(".poker-card", {
      rotateY: 90,
      ease: "easeInOutQuad",
      duration: 550,
    }).then(async () => {
      setCardValue((previousValue) =>
        previousValue !== "back" ? "back" : _.sample(cards) ?? "ah"
      );

      animate(".poker-card", {
        rotateY: 0,
        duration: 550,
        ease: "easeInOutQuad",
      });
    });
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <p className="font-epunda text-2xl font-bold magic-text">
        {cardValue === "back"
          ? "Could I find your card?"
          : "Ta-da! Here's the card you took."}
      </p>
      <img
        className="h-72 poker-card"
        src={`cards/ah.png`}
        onClick={onCardTurn}
      />
    </div>
  );
}

export default App;
