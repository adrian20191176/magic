import { useState } from "react";
import "./App.css";
import { getCard } from "./utils/card_api";

function App() {
  const [isFlipped, setIsFlipped] = useState(true);

  function onCardTurn() {
    setIsFlipped((previousValue) => !previousValue);
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <p className="font-epunda text-2xl font-bold">
        {isFlipped
          ? "Could I find your card?"
          : "Ta-da! Here's the card you took."}
      </p>
      <img
        className="h-72 adrian"
        src={isFlipped ? `${getCard("back.png")}` : "cards/ac.png"}
        onClick={onCardTurn}
      />
    </div>
  );
}

export default App;
