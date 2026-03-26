// components/MemoriesGallery.tsx
"use client";

import { useState } from 'react';

interface Memory {
  id: number;
  title: string;
  description: string;
  emoji: string;
}

export default function MemoriesGallery() {
  const memories: Memory[] = [
    { id: 1, title: "Our First Meeting", description: "The day my life changed forever", emoji: "🌟" },
    { id: 2, title: "That Special Smile", description: "When you laugh, the world feels right", emoji: "😊" },
    { id: 3, title: "Quiet Moments", description: "Just being together is everything", emoji: "🌙" },
    { id: 4, title: "Adventures Together", description: "Every journey is better with you", emoji: "🗺️" },
    { id: 5, title: "Your Kindness", description: "Watching you care for others", emoji: "💖" },
    { id: 6, title: "Future Dreams", description: "All the beautiful tomorrows ahead", emoji: "🌈" },
  ];
  
  const [selectedMemory, setSelectedMemory] = useState<Memory>(memories[0]);
  
  return (
    <section className="memories-section">
      <div className="section-header">
        <h2>Precious Memories</h2>
        <p className="section-subtitle">Moments that make my heart full</p>
      </div>
      
      <div className="memories-container">
        <div className="memory-detail">
          <div className="memory-emoji">{selectedMemory.emoji}</div>
          <h3>{selectedMemory.title}</h3>
          <p className="memory-description">{selectedMemory.description}</p>
          <div className="memory-quote">
            "A memory with you is a treasure I keep in my heart forever"
          </div>
        </div>
        
        <div className="memories-grid">
          {memories.map(memory => (
            <div 
              key={memory.id} 
              className={`memory-card ${selectedMemory.id === memory.id ? 'active' : ''}`}
              onClick={() => setSelectedMemory(memory)}
            >
              <div className="memory-card-emoji">{memory.emoji}</div>
              <h4>{memory.title}</h4>
              <p>{memory.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
