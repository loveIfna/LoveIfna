// components/LoveNotes.tsx
"use client";

import { useState } from 'react';

interface Note {
  id: number;
  text: string;
  date: string;
}

export default function LoveNotes() {
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, text: "Your smile is my favorite thing in the world", date: "Today" },
    { id: 2, text: "I fall for you more every single day", date: "Always" },
    { id: 3, text: "You make ordinary moments extraordinary", date: "Forever" },
    { id: 4, text: "My heart skips a beat when I see you", date: "Every time" },
    { id: 5, text: "You are my dream come true", date: "Since day one" },
    { id: 6, text: "Loving you is the best part of my life", date: "Eternally" },
  ]);
  
  const [newNote, setNewNote] = useState<string>('');
  
  const addNote = () => {
    if (newNote.trim()) {
      const newNoteObj: Note = {
        id: notes.length + 1,
        text: newNote,
        date: "Just now"
      };
      setNotes([newNoteObj, ...notes]);
      setNewNote('');
    }
  };
  
  return (
    <section className="notes-section">
      <div className="section-header">
        <h2>Love Notes for Amna</h2>
        <p className="section-subtitle">Small reminders of how much you mean to me</p>
      </div>
      
      <div className="add-note-container">
        <textarea
          className="note-input"
          placeholder="Write a new love note for Amna..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
        />
        <button className="add-note-btn" onClick={addNote}>
          Add Love Note 💌
        </button>
      </div>
      
      <div className="notes-grid">
        {notes.map(note => (
          <div key={note.id} className="note-card">
            <div className="note-content">
              <p className="note-text">{note.text}</p>
              <div className="note-footer">
                <span className="note-date">{note.date}</span>
                <span className="note-heart">❤️</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
