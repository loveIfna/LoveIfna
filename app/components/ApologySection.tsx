// app/components/ApologySection.tsx
"use client";

import { useState } from 'react';

export default function ApologySection() {
  const [promises, setPromises] = useState([
    { id: 1, text: "I will never raise my hand to you again", completed: false },
    { id: 2, text: "I will never use hurtful words", completed: false },
    { id: 3, text: "I will listen to you with patience", completed: false },
    { id: 4, text: "I will respect your feelings always", completed: false },
    { id: 5, text: "I will work on my anger every day", completed: false },
    { id: 6, text: "I will cherish and protect you", completed: false },
  ]);

  const togglePromise = (id: number) => {
    setPromises(promises.map(promise => 
      promise.id === id ? { ...promise, completed: !promise.completed } : promise
    ));
  };

  return (
    <section className="apology-section">
      <div className="section-header">
        <h2>My Sincere Apology</h2>
        <p className="section-subtitle">From Lateef to Amna - with deep regret and love</p>
      </div>
      
      <div className="apology-container">
        <div className="apology-letter">
          <div className="apology-header">
            <div className="apology-heart">💔</div>
            <div className="apology-date">Today, with a heavy heart</div>
          </div>
          
          <div className="apology-content">
            <p className="apology-greeting">My Dearest Amna,</p>
            
            <p>
              I am writing this with tears in my eyes and immense regret in my heart. 
              I am deeply, truly sorry for every hurtful word, every moment of anger, 
              and every time I failed to treat you with the love and respect you deserve.
            </p>
            
            <p>
              You are the most precious person in my life, and I have failed you. 
              There is no excuse for my behavior. The slap, the beatings, the swearing - 
              none of it should have ever happened. You deserve only kindness, respect, 
              and unconditional love.
            </p>
            
            <div className="apology-highlight">
              "I was wrong. I hurt you. And for that, I am truly, deeply sorry."
            </div>
            
            <p>
              I know words alone cannot erase the pain I've caused. But I want you to know 
              that I recognize my mistakes, and I am committed to changing. You deserve 
              someone who treats you like the queen you are - with gentleness, patience, 
              and unwavering respect.
            </p>
            
            <p>
              I am working on myself every day to become the man you deserve. 
              A man who protects you, not hurts you. A man who builds you up, 
              not tears you down. A man who cherishes every moment with you.
            </p>
            
            <p className="apology-closing">
              With deepest regret and hope for forgiveness,
            </p>
            
            <div className="apology-signature">
              <div className="signature-line"></div>
              <p className="signature-name">Lateef</p>
            </div>
          </div>
        </div>
        
        <div className="promises-section">
          <h3>My Promises to You</h3>
          <p className="promises-subtitle">Click each promise to mark my commitment</p>
          
          <div className="promises-list">
            {promises.map(promise => (
              <div 
                key={promise.id} 
                className={`promise-item ${promise.completed ? 'completed' : ''}`}
                onClick={() => togglePromise(promise.id)}
              >
                <div className="promise-checkbox">
                  {promise.completed ? '✅' : '⬜'}
                </div>
                <div className="promise-text">
                  <p>{promise.text}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="commitment-note">
            <p>These are not just words, Amna. These are my commitments to you.</p>
            <p>I will prove through my actions that I am changing.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
