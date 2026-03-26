// app/page.tsx
"use client";

import { useState, useEffect } from "react";

import LoveNotes from "./components/LoveNotes";
import MemoriesGallery from "./components/MemoriesGallery";
import LoveLetter from "./components/LoveLetter";
import HeartAnimation from "./components/HeartAnimation";
import LoveCounter from "./components/LoveCounter";

type SectionType = "home" | "letter" | "memories" | "notes";

export default function Home() {
  const [currentSection, setCurrentSection] = useState<SectionType>("home");
  const [showFlowers, setShowFlowers] = useState<boolean>(false);

  // Trigger flower animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFlowers(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container">
      {/* Background elements */}
      <div className="background-hearts">
        <HeartAnimation count={15} />
      </div>

      {showFlowers && (
        <div className="flower-animation">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`flower flower-${i}`}>
              🌸
            </div>
          ))}
        </div>
      )}

      {/* Header with navigation */}
      <header className="header">
        <div className="header-content">
          <h1 className="title">
            For My Beautiful <span className="highlight">Amna</span>
          </h1>
          <p className="subtitle">Every moment with you is a treasure</p>

          <nav className="nav">
            <button
              className={`nav-btn ${currentSection === "home" ? "active" : ""}`}
              onClick={() => setCurrentSection("home")}
            >
              Home
            </button>
            <button
              className={`nav-btn ${currentSection === "letter" ? "active" : ""}`}
              onClick={() => setCurrentSection("letter")}
            >
              Love Letter
            </button>
            <button
              className={`nav-btn ${currentSection === "memories" ? "active" : ""}`}
              onClick={() => setCurrentSection("memories")}
            >
              Memories
            </button>
            <button
              className={`nav-btn ${currentSection === "notes" ? "active" : ""}`}
              onClick={() => setCurrentSection("notes")}
            >
              Love Notes
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {/* Home Section */}
        {currentSection === "home" && (
          <section className="home-section">
            <div className="welcome-card">
              <div className="heart-icon">❤️</div>
              <h2>Welcome to Your Special Place, Amna</h2>
              <p className="welcome-text">
                This website is a small token of my endless love for you. Every
                line of code, every animation, and every word is dedicated to
                you.
              </p>
              <div className="personal-message">
                <p>You are the most beautiful person I know, inside and out.</p>
                <p>
                  Your smile lights up my world, and your heart makes it a
                  better place.
                </p>
              </div>

              <div className="qualities">
                <h3>What Makes You Amazing</h3>
                <div className="qualities-grid">
                  <div className="quality-card">
                    <div className="quality-icon">💖</div>
                    <h4>Kind Heart</h4>
                    <p>Your compassion touches everyone around you</p>
                  </div>
                  <div className="quality-card">
                    <div className="quality-icon">😊</div>
                    <h4>Beautiful Smile</h4>
                    <p>It brightens even the darkest days</p>
                  </div>
                  <div className="quality-card">
                    <div className="quality-icon">🌟</div>
                    <h4>Incredible Spirit</h4>
                    <p>Your strength and grace inspire me daily</p>
                  </div>
                  <div className="quality-card">
                    <div className="quality-icon">🎨</div>
                    <h4>Creative Soul</h4>
                    <p>You bring beauty to everything you touch</p>
                  </div>
                </div>
              </div>
            </div>

            <LoveCounter />
          </section>
        )}

        {/* Love Letter Section */}
        {currentSection === "letter" && <LoveLetter />}

        {/* Memories Section */}
        {currentSection === "memories" && <MemoriesGallery />}

        {/* Love Notes Section */}
        {currentSection === "notes" && <LoveNotes />}
      </main>

      {/* Footer with personal message */}
      <footer className="footer">
        <p>
          Made with <span className="heart-beat">❤️</span> for Amna
        </p>
        <p className="footer-note">You are loved more than words can express</p>
      </footer>

      {/* Floating love button */}
      <button
        className="floating-love-btn"
        onClick={() => {
          const messages = [
            "I love you, Amna!",
            "You're amazing!",
            "My heart is yours",
            "Thinking of you always",
            "You make me so happy",
          ];
          const randomMsg =
            messages[Math.floor(Math.random() * messages.length)];
          alert(randomMsg);
        }}
      >
        💝 Click for Love
      </button>
    </div>
  );
}
