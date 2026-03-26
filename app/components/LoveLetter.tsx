// app/components/LoveLetter.tsx
"use client";

export default function LoveLetter() {
  return (
    <section className="letter-section">
      <div className="section-header">
        <h2>My Dearest Amna</h2>
        <p className="section-subtitle">A letter from Lateef's heart to yours</p>
      </div>
      
      <div className="letter-container">
        <div className="letter-paper">
          <div className="letter-header">
            <div className="letter-wax-seal">💌</div>
            <div className="letter-date">From Lateef, with love</div>
          </div>
          
          <div className="letter-content">
            <p className="letter-greeting">My Beautiful Amna,</p>
            
            <p>
              I created this website because sometimes words alone aren't enough to express 
              how deeply I care for you. You are the most amazing person I've ever known, 
              and every day with you feels like a blessing.
            </p>
            
            <p>
              Your smile has a way of lighting up even the darkest days. Your kindness touches 
              everyone around you, and your strength inspires me to be a better person. 
              When I'm with you, I feel at home—like I've found where I truly belong.
            </p>
            
            <p>
              I cherish our conversations, our laughter, and even our quiet moments. 
              I love how you see the world with such wonder and grace. You have a beautiful 
              soul that makes everything around you more beautiful too.
            </p>
            
            <div className="letter-highlight">
              "In your eyes, I found my favorite view. In your heart, I found my home."
            </div>
            
            <p>
              No matter what the future holds, I want you to know that my love for you is 
              constant and true. You are loved more than you could ever imagine, today and 
              every day that follows.
            </p>
            
            <p className="letter-closing">
              With all my love, forever and always,
            </p>
            
            <div className="letter-signature">
              <div className="signature-line"></div>
              <p className="signature-name">Lateef</p>
            </div>
          </div>
        </div>
        
        <div className="letter-ps">
          <p>P.S. You are my favorite thought every morning and my last thought every night.</p>
        </div>
      </div>
    </section>
  );
}
