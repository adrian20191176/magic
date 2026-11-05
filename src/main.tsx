import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/cinzel";
import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "./index.css";
import App from "./App.tsx";
import { loadAmbience } from "./utils/ambience";

import { BrowserRouter } from "react-router-dom";

// Light the room in the saved ambience before the first paint.
document.documentElement.dataset.ambience = loadAmbience();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
