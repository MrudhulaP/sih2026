import React, { useState } from "react";

import Home from "./pages/Home";
import Analysis from "./pages/Analysis";

function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand" onClick={() => setPage("home")}>
          <div className="brand-icon">🌊</div>

          <div>
            <strong>AquaVision AI</strong>
            <small>Marine Intelligence</small>
          </div>
        </div>

        <nav>
          <button
            className={page === "home" ? "nav-active" : ""}
            onClick={() => setPage("home")}
          >
            Home
          </button>

          <button
            className={page === "analysis" ? "nav-active" : ""}
            onClick={() => setPage("analysis")}
          >
            Analysis
          </button>
        </nav>
      </header>

      <main>
        {page === "home" ? <Home onStart={() => setPage("analysis")} /> : <Analysis />}
      </main>

      <footer className="footer">
        <span>AquaVision AI</span>
        <span>AI-Powered Marine Debris Detection</span>
        <span>SIH 2026</span>
      </footer>
    </div>
  );
}

export default App;
