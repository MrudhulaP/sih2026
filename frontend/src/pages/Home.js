import React from "react";

function Home({ onStart }) {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">AI-POWERED MARINE MONITORING</div>

          <h1>
            AquaVision
            <span> AI</span>
          </h1>

          <h2>Intelligent Underwater Debris Detection</h2>

          <p>
            Detect, segment and analyze marine debris from side-scan sonar
            imagery using artificial intelligence.
          </p>

          <button className="hero-button" onClick={onStart}>
            Start Analysis →
          </button>
        </div>

        <div className="hero-visual">
          <div className="sonar-circle">
            <div className="sonar-sweep" />
            <div className="sonar-dot dot-one" />
            <div className="sonar-dot dot-two" />
            <div className="sonar-dot dot-three" />
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div>📡</div>
          <h3>Sonar Processing</h3>
          <p>Normalize and denoise side-scan sonar imagery.</p>
        </div>

        <div className="feature-card">
          <div>🤖</div>
          <h3>AI Detection</h3>
          <p>Automatically identify candidate underwater objects.</p>
        </div>

        <div className="feature-card">
          <div>🗺️</div>
          <h3>Localization</h3>
          <p>Visualize detected objects geographically when metadata is available.</p>
        </div>

        <div className="feature-card">
          <div>📊</div>
          <h3>Actionable Results</h3>
          <p>View class, confidence, dimensions and detection data.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
