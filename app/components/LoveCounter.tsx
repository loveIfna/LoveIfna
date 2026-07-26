// app/components/LoveCounter.tsx
"use client";

import { useState, useEffect } from 'react';

export default function LoveCounter() {
  const anniversaryDate = new Date('2021-11-13');
  const [daysTogether, setDaysTogether] = useState<number>(0);
  const [smilesCaused, setSmilesCaused] = useState<number>(0);
  const [heartsBeaten, setHeartsBeaten] = useState<number>(0);
  
  useEffect(() => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - anniversaryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysTogether(diffDays);
    
    const smileInterval = setInterval(() => {
      setSmilesCaused(prev => prev + 1);
    }, 3000);
    
    const heartInterval = setInterval(() => {
      setHeartsBeaten(prev => prev + 1);
    }, 500);
    
    return () => {
      clearInterval(smileInterval);
      clearInterval(heartInterval);
    };
  }, [anniversaryDate]);
  
  return (
    <div className="love-counter">
      <h3>Our Love in Numbers</h3>
      <div className="counter-grid">
        <div className="counter-item">
          <div className="counter-number">{daysTogether}</div>
          <div className="counter-label">Days I've been lucky to know you</div>
        </div>
        <div className="counter-item">
          <div className="counter-number">{smilesCaused}</div>
          <div className="counter-label">Smiles you've caused (and counting!)</div>
        </div>
        <div className="counter-item">
          <div className="counter-number">{heartsBeaten.toLocaleString()}</div>
          <div className="counter-label">Heartbeats just for you</div>
        </div>
      </div>
      <p className="counter-note">Every moment with you is precious to me</p>
    </div>
  );
}