// app/components/HeartAnimation.tsx
"use client";

import { useEffect, useState } from 'react';

interface Heart {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

interface HeartAnimationProps {
  count?: number;
}

export default function HeartAnimation({ count = 10 }: HeartAnimationProps) {
  const [hearts, setHearts] = useState<Heart[]>([]);
  
  useEffect(() => {
    // Create initial hearts
    const initialHearts: Heart[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 20 + Math.random() * 30,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4
    }));
    
    setHearts(initialHearts);
    
    // Add new hearts periodically
    const interval = setInterval(() => {
      setHearts(prev => {
        const newHeart: Heart = {
          id: Date.now(),
          left: Math.random() * 100,
          size: 20 + Math.random() * 30,
          delay: 0,
          duration: 3 + Math.random() * 4
        };
        
        // Keep only last 20 hearts
        return [...prev.slice(-19), newHeart];
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [count]);
  
  return (
    <div className="heart-container">
      {hearts.map(heart => (
        <div 
          key={heart.id}
          className="floating-heart"
          style={{
            left: `${heart.left}%`,
            width: `${heart.size}px`,
            height: `${heart.size}px`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
}
