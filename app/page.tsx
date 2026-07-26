// app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { account } from './components/lib/appwrite';
import { getLetters, getPromises, getMemories, getNotes } from './components/lib/database';
import LoveNotes from './components/LoveNotes';
import MemoriesGallery from './components/MemoriesGallery';
import LoveLetter from './components/LoveLetter';
import LoveCounter from './components/LoveCounter';
import ApologySection from './components/ApologySection';
import LoginPage from './components/LoginPage';
import PrivateFolder from './components/PrivateFolder';
import { encryptionService } from './components/lib/encryption';

type SectionType = 'home' | 'letter' | 'memories' | 'notes' | 'apology' | 'private';

interface TimelineEvent {
  id: number;
  date: string;
  title: string;
  description: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 1,
    date: 'The Beginning',
    title: 'The First Spark 💎',
    description: 'The day our paths crossed and my world became so much brighter.'
  },
  {
    id: 2,
    date: 'Unforgettable Memory',
    title: 'Late Night Conversations 😍',
    description: 'Talking for hours about life, dreams, and everything in between.'
  },
  {
    id: 3,
    date: 'Growing Together',
    title: 'Learning & Healing ❤️‍🩹',
    description: 'Understanding each other deeper and committing to always grow together.'
  },
  {
    id: 4,
    date: 'Today & Always',
    title: 'Our Private Sanctuary 😉',
    description: 'Building a safe, loving space dedicated entirely to us.'
  }
];

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionType>('home');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Featured Homepage Highlights Data
  const [featuredLetters, setFeaturedLetters] = useState<any[]>([]);
  const [featuredPromises, setFeaturedPromises] = useState<any[]>([]);
  const [featuredMemories, setFeaturedMemories] = useState<any[]>([]);
  const [featuredNotes, setFeaturedNotes] = useState<any[]>([]);
  const [highlightsLoading, setHighlightsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (isLoggedIn && currentSection === 'home') {
      loadHomepageHighlights();
    }
  }, [isLoggedIn, currentSection]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [mobileMenuOpen]);

  const checkSession = async () => {
    const storedAuth = localStorage.getItem('love_app_logged_in');
    if (storedAuth === 'true') {
      setIsLoggedIn(true);
      setLoading(false);
      return;
    }

    try {
      const getSessionPromise = account.get();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Appwrite timeout')), 1500)
      );

      const session = await Promise.race([getSessionPromise, timeoutPromise]);
      if (session) {
        setIsLoggedIn(true);
        localStorage.setItem('love_app_logged_in', 'true');
      }
    } catch (error) {
      console.log('Session check notice:', error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const loadHomepageHighlights = async () => {
    setHighlightsLoading(true);
    try {
      const [lettersData, promisesData, memoriesData, notesData] = await Promise.all([
        getLetters(),
        getPromises(),
        getMemories(),
        getNotes()
      ]);

      const letterItems = (lettersData.length > 0 ? lettersData : [
        { title: 'My Dearest Amna', content: 'Words alone cannot express how deeply I care for you...', from: 'Lateef', date: 'Forever' },
        { title: 'A Promise of Forever', content: 'In your eyes I found my favorite view...', from: 'Lateef', date: 'Always' }
      ]).slice(0, 2);

      const promiseItems = (promisesData.length > 0 ? promisesData : [
        { text: 'I will listen to you with patience and gentle care', completed: true },
        { text: 'I will respect your feelings always and build you up', completed: true }
      ]).slice(0, 2);

      const memoryItems = (memoriesData.length > 0 ? memoriesData : [
        { title: 'Pehli dafa mile', description: 'Jabhse meri zindagi badal gyi', emoji: '🌟' },
        { title: 'Usdin ka din', description: 'Mera favourite din 7-dec, 2021', emoji: '😊' }
      ]).slice(0, 2);

      const noteItems = (notesData.length > 0 ? notesData : [
        { text: 'Mujhe tumhare saath hi rehna h hamesha', from: 'Lateef', date: 'Always' },
        { text: 'mujhe aapke saath hi rehna h hamesha', from: 'Amna', date: 'Always' }
      ]).slice(0, 2);

      setFeaturedLetters(letterItems);
      setFeaturedPromises(promiseItems);
      setFeaturedMemories(memoryItems);
      setFeaturedNotes(noteItems);
    } catch (e) {
      console.log('Highlights fetch notice:', e);
    } finally {
      setHighlightsLoading(false);
    }
  };

  // Add this useEffect in your page.tsx
useEffect(() => {
  // Check if any modal is open
  const checkModal = () => {
    const modal = document.querySelector('.modal-backdrop');
    if (modal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  };

  // Check on mount and on any DOM change
  checkModal();
  
  // Observer for modal changes
  const observer = new MutationObserver(checkModal);
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });

  return () => {
    observer.disconnect();
    document.body.classList.remove('modal-open');
  };
}, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

 // In page.tsx, update handleLogout:
const handleLogout = async () => {
  try {
    // 🧹 Clear encryption keys from memory
    encryptionService.clearSensitiveData();
    
    localStorage.removeItem('love_app_logged_in');
    sessionStorage.removeItem('private_vault_unlocked');
    await account.deleteSession('current');
  } catch (error) {
    console.log('Logout notice:', error);
  } finally {
    setIsLoggedIn(false);
  }
};

  const navigateTo = (section: SectionType) => {
    setCurrentSection(section);
    setMobileMenuOpen(false);
  };

  const triggerLoveToast = () => {
    const messages = [
      "I love you more than words can express! 💕",
      "You are the most incredible person in my life! ✨",
      "My heart belongs to you forever 🌹",
      "Thinking of your sweet smile right now 😊",
      "You bring endless warmth and joy to my world ☀️",
      "I cherish every second we share together 💖",
      "You deserve all the happiness in the world 🌎",
      "Forever & always by your side 🔒"
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setToastMessage(randomMsg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF7F5',
        fontFamily: "'Cormorant Garamond', serif",
        color: '#2C2625'
      }}>
        <div style={{ fontSize: '2.5rem', animation: 'pulse 1.5s infinite' }}>🕊️</div>
        <p style={{ fontSize: '1.3rem', marginTop: '1rem', letterSpacing: '1px' }}>Loading our space...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="container">
      {/* Optimized Sticky Glass Navbar with Hamburger */}
      <nav className="nav-header-sticky">
<div className="nav-header-content" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>          <div className="nav-brand" onClick={() => navigateTo('home')}>
      
            <span className="brand-highlight">Ifna</span>
          </div>

          {/* Hamburger Button - Mobile */}
          <button 
            className={`hamburger-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Navigation Links */}
          <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <button 
              className={`nav-btn ${currentSection === 'home' ? 'active' : ''}`}
              onClick={() => navigateTo('home')}
            >
              🏡 Home
            </button>
            <button 
              className={`nav-btn ${currentSection === 'letter' ? 'active' : ''}`}
              onClick={() => navigateTo('letter')}
            >
              🥰 Love Letter
            </button>
            <button 
              className={`nav-btn ${currentSection === 'memories' ? 'active' : ''}`}
              onClick={() => navigateTo('memories')}
            >
              💕 Memories
            </button>
            <button 
              className={`nav-btn ${currentSection === 'notes' ? 'active' : ''}`}
              onClick={() => navigateTo('notes')}
            >
              💌 Love Notes
            </button>
            <button 
              className={`nav-btn ${currentSection === 'apology' ? 'active' : ''}`}
              onClick={() => navigateTo('apology')}
            >
              ☺️ My Apology
            </button>
            <button 
              className={`nav-btn private-btn ${currentSection === 'private' ? 'active' : ''}`}
              onClick={() => navigateTo('private')}
            >
              😉 Private Vault
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Title Header - ONLY on Home Page */}
      {currentSection === 'home' && (
        <header className="header-hero">
          <h1 className="title">For My Beautiful <span className="highlight">Amna</span></h1>
          <p className="subtitle">Meri jaan ke liye chota sa Gift</p>
        </header>
      )}
      
      <main className="main-content">
        {currentSection === 'home' && (
          <section className="home-section">
            {/* Daily Love Reflection Banner */}
            <div className="daily-reflection-card">
              <div className="reflection-icon-box">🤭</div>
              <div className="reflection-content">
                <h3>Hamesha</h3>
                <p>"I LOVE YOU SO MUCH MERI JAAN AMNA, TUMHARA PYARA LATEEF."</p>
              </div>
            </div>

            {/* Main Welcome Card */}
            <div className="welcome-card">
              <div className="welcome-badge-icon">🌹</div>
              <h2>Welcome to Your Special Place</h2>
              <p className="welcome-text">
                This space is dedicated entirely to you. Every line of code, every note, 
                and every memory stored here was crafted to express how deeply you are loved.
              </p>

              <div className="personal-message">
                <p>"Tumse khoobsurat cheez mene kabhi nhi dekhi, tumhare gusse se bhi mujhe pyaar h.. or hamesha hum saath rahenge..."</p>
                <p className="signature">- Lateef</p>
              </div>

              {/* Qualities Grid */}
              <div className="qualities">
                <h3>What Makes you so special</h3>
                <div className="qualities-grid">
                  <div className="quality-card">
                    <div className="quality-icon">🎀</div>
                    <h4>Meri Jaan</h4>
                    <p>Tumhari muskurahat se hi toh me zinda hu</p>
                  </div>
                  <div className="quality-card">
                    <div className="quality-icon">❤️</div>
                    <h4>Mera Dil</h4>
                    <p>Tum mere dil ki dhadkan ho, sukoon ho or puri qaynat ho</p>
                  </div>
                  <div className="quality-card">
                    <div className="quality-icon">🌹</div>
                    <h4>Meri Zindagi</h4>
                    <p>Tumhara gussa, tumhari adaa, tumhari khamoshi sabh kuch mujhe zinda rakhti hai</p>
                  </div>
                  <div className="quality-card">
                    <div className="quality-icon">💎</div>
                    <h4>Meri Raajkumari </h4>
                    <p>Tumhe me alfazo me bayaan nhi kar sakta, tum meri zidd ho jo me pa kar rahunga</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURED HIGHLIGHTS */}
            <div className="home-highlights-section">
              <h3>Highlights of Us ✨</h3>
              <p className="home-highlights-subtitle">A glimpse into our letters, promises, memories, and love notes</p>

              {highlightsLoading ? (
                <div className="skeleton-grid">
                  <div className="skeleton-card">
                    <div className="skeleton-box skeleton-title" />
                    <div className="skeleton-box skeleton-text" />
                    <div className="skeleton-box skeleton-text-short" />
                  </div>
                  <div className="skeleton-card">
                    <div className="skeleton-box skeleton-title" />
                    <div className="skeleton-box skeleton-text" />
                    <div className="skeleton-box skeleton-text-short" />
                  </div>
                </div>
              ) : (
                <>
                  {/* 1. Love Letters Preview */}
                  <div className="highlights-category-block">
                    <div className="category-block-header">
                      <div className="category-block-title">📜 Love Letters</div>
                      <span className="view-all-link" onClick={() => setCurrentSection('letter')}>
                        View All Letters →
                      </span>
                    </div>

                    <div className="highlights-cards-grid">
                      {featuredLetters.map((letter, idx) => (
                        <div 
                          key={idx} 
                          className="preview-card"
                          onClick={() => setCurrentSection('letter')}
                        >
                          <div>
                            <div className="preview-card-header">
                              <span className="preview-badge">From {letter.from || 'Lateef'}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{letter.date || 'Forever'}</span>
                            </div>
                            <h4 className="preview-card-title">{letter.title || 'Love Letter'}</h4>
                            <p className="preview-card-excerpt">
                              {(letter.content || '').slice(0, 110)}...
                            </p>
                          </div>
                          <div className="preview-card-footer">
                            <span>Read Full Letter</span>
                            <span>📜</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Promises Preview */}
                  <div className="highlights-category-block">
                    <div className="category-block-header">
                      <div className="category-block-title">🕊️ My Promises & Commitments</div>
                      <span className="view-all-link" onClick={() => setCurrentSection('apology')}>
                        View Apology Section →
                      </span>
                    </div>

                    <div className="highlights-cards-grid">
                      {featuredPromises.map((promise, idx) => (
                        <div 
                          key={idx} 
                          className="preview-card"
                          onClick={() => setCurrentSection('apology')}
                        >
                          <div>
                            <div className="preview-card-header">
                              <span className="preview-badge" style={{ background: 'var(--accent-rose-light)', color: 'var(--accent-rose-dark)' }}>
                                {promise.completed ? '✅ Commitment Honored' : '🕊️ Sacred Promise'}
                              </span>
                            </div>
                            <p className="preview-card-excerpt" style={{ fontSize: '1.05rem', fontStyle: 'italic', margin: '0.5rem 0 1rem' }}>
                              "{promise.text}"
                            </p>
                          </div>
                          <div className="preview-card-footer">
                            <span>Click to view commitments</span>
                            <span>🤝</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Memories Preview */}
                  <div className="highlights-category-block">
                    <div className="category-block-header">
                      <div className="category-block-title">✨ Precious Memories</div>
                      <span className="view-all-link" onClick={() => setCurrentSection('memories')}>
                        View Gallery →
                      </span>
                    </div>

                    <div className="highlights-cards-grid">
                      {featuredMemories.map((mem, idx) => (
                        <div 
                          key={idx} 
                          className="preview-card"
                          onClick={() => setCurrentSection('memories')}
                        >
                          <div>
                            <div className="preview-card-header">
                              <span style={{ fontSize: '2rem' }}>{mem.emoji || '🌟'}</span>
                              <span className="preview-badge">Memory</span>
                            </div>
                            <h4 className="preview-card-title">{mem.title}</h4>
                            <p className="preview-card-excerpt">{mem.description}</p>
                          </div>
                          <div className="preview-card-footer">
                            <span>Open in Gallery</span>
                            <span>✨</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Love Notes Preview */}
                  <div className="highlights-category-block">
                    <div className="category-block-header">
                      <div className="category-block-title">💌 Love Notes</div>
                      <span className="view-all-link" onClick={() => setCurrentSection('notes')}>
                        View Love Notes →
                      </span>
                    </div>

                    <div className="highlights-cards-grid">
                      {featuredNotes.map((note, idx) => (
                        <div 
                          key={idx} 
                          className="preview-card"
                          onClick={() => setCurrentSection('notes')}
                        >
                          <div>
                            <div className="preview-card-header">
                              <span className="preview-badge">From {note.from || 'Lateef'}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{note.date || 'Today'}</span>
                            </div>
                            <p className="preview-card-excerpt" style={{ fontSize: '1.05rem', margin: '0.6rem 0' }}>
                              "{note.text}"
                            </p>
                          </div>
                          <div className="preview-card-footer">
                            <span>Read all notes</span>
                            <span>💌</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Our Story Timeline */}
            <div className="timeline-section">
              <h3>Milestones of Us</h3>
              <div className="timeline-container">
                {TIMELINE_EVENTS.map(event => (
                  <div key={event.id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-card">
                      <div className="timeline-date">{event.date}</div>
                      <h4>{event.title}</h4>
                      <p>{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <LoveCounter />
          </section>
        )}
        
        {currentSection === 'letter' && <LoveLetter />}
        {currentSection === 'memories' && <MemoriesGallery />}
        {currentSection === 'notes' && <LoveNotes />}
        {currentSection === 'apology' && <ApologySection />}
        {currentSection === 'private' && <PrivateFolder />}
      </main>
      
      {/* Footer with Logout Button */}
      <footer className="footer">
        <button onClick={handleLogout} className="footer-logout-btn">
          Logout 🚪
        </button>
        <p>Made with <span className="heart-beat">🤍</span> for Amna by Lateef</p>
        <p className="footer-note">You are loved and cherished more than words can ever express</p>
      </footer>
      
      {/* Floating Love Button */}
      <button 
        className="floating-love-btn"
        onClick={triggerLoveToast} 
      >
        🎀
      </button>

      {/* Love Toast Banner */}
      {toastMessage && (
        <div className="toast-message">
          {toastMessage}
        </div>
      )}
    </div>
  );
}