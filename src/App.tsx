import { useEffect, useState } from "react";
import "./App.css";
import { animate } from "animejs";
import { cards } from "./utils/card_api";
import { useNavigate, useLocation } from "react-router-dom";
import _ from "lodash";

function App() {
  const [cardValue, setCardValue] = useState<string>("back");
  const [count, setCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname.split("/")[1] === "adrian") {
      navigate("/", { state: { data: 2 } });
    }
  }, [navigate]);

  const location = useLocation();
  const receivedData = location.state?.data ?? 200;
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
        previousValue !== "back"
          ? "back"
          : count === receivedData
          ? "5c"
          : _.sample(cards) ?? "ah"
      );
      setCount((prev) => prev + 1);

      animate(".poker-card", {
        rotateY: 0,
        duration: 550,
        delay: 500,
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
        src={`cards/${cardValue}.png`}
        onClick={onCardTurn}
      />
    </div>
  );
}

export default App;
