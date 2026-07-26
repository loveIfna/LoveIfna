// app/components/LoveNotes.tsx
"use client";

import { useState, useEffect } from 'react';
import { getNotes, createNote, updateNote, deleteNote } from '../components/lib/database';

interface Note {
  $id: string;
  text: string;
  from: string;
  date: string;
}

const DEFAULT_NOTES: Note[] = [
  { $id: 'default-1', text: "Your smile is my favorite thing in the world", date: "Always", from: "Lateef" },
  { $id: 'default-2', text: "I fall for you more every single day", date: "Always", from: "Lateef" },
  { $id: 'default-3', text: "You make ordinary moments extraordinary", date: "Forever", from: "Lateef" },
];

export default function LoveNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [from, setFrom] = useState('Lateef');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await getNotes();
      const mapped = (data as any[]).map((doc) => ({
        $id: doc.$id || 'id-' + Date.now(),
        text: doc.text || doc.content || '',
        from: doc.from || doc.author || 'Lateef',
        date: doc.date || new Date(doc.$createdAt).toLocaleDateString(),
      }));
      setNotes(mapped.length > 0 ? mapped : DEFAULT_NOTES);
    } catch (error) {
      setNotes(DEFAULT_NOTES);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) {
      alert('Please write something.');
      return;
    }

    try {
      await createNote({ text: newNote, from });
      setNewNote('');
      await loadNotes();
    } catch (error) {
      // Fallback local update if Appwrite collections aren't configured yet
      const fallback: Note = {
        $id: 'note-' + Date.now(),
        text: newNote,
        from,
        date: new Date().toLocaleDateString(),
      };
      setNotes(prev => [fallback, ...prev]);
      setNewNote('');
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note.$id);
    setEditText(note.text);
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) {
      alert('Note text cannot be empty.');
      return;
    }

    try {
      if (!id.startsWith('default-') && !id.startsWith('note-')) {
        await updateNote(id, { text: editText });
      }
      setNotes(prev => prev.map(note => note.$id === id ? { ...note, text: editText } : note));
      setEditingId(null);
    } catch (error) {
      alert('Failed to update note.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this note?')) {
      try {
        if (!id.startsWith('default-') && !id.startsWith('note-')) {
          await deleteNote(id);
        }
      } catch (error) {
        console.log('Delete notice:', error);
      } finally {
        setNotes(prev => prev.filter(note => note.$id !== id));
      }
    }
  };

  return (
    <section className="notes-section">
      <div className="section-header">
        <span className="title-badge">💕 From the Heart</span>
        <h2>Love Notes</h2>
        <p className="section-subtitle">Little reminders of my love for you</p>
      </div>
      
      {/* Add Note Card */}
      <div className="add-note-card">
        <div className="add-note-header">
          <span className="add-note-icon">✍️</span>
          <h3>Write a New Note</h3>
        </div>
        <div className="add-note-form">
          <select 
            value={from} 
            onChange={(e) => setFrom(e.target.value)} 
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="Lateef">💙 From Lateef</option>
            <option value="Amna">🌸 From Amna</option>
          </select>
          <textarea
            className="form-textarea"
            placeholder="Write a sweet love note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <button className="submit-btn" onClick={addNote} style={{ alignSelf: 'flex-end' }}>
            💌 Add Love Note
          </button>
        </div>
      </div>
      
      {/* Notes Grid */}
      {loading ? (
        <div className="skeleton-grid">
          <div className="skeleton-card">
            <div className="skeleton-box skeleton-text" />
            <div className="skeleton-box skeleton-text-short" />
          </div>
          <div className="skeleton-card">
            <div className="skeleton-box skeleton-text" />
            <div className="skeleton-box skeleton-text-short" />
          </div>
          <div className="skeleton-card">
            <div className="skeleton-box skeleton-text" />
            <div className="skeleton-box skeleton-text-short" />
          </div>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h4>No notes yet</h4>
              <p>Write your first love note! 💕</p>
            </div>
          ) : (
            notes.map(note => (
              <div key={note.$id} className="note-card">
                {editingId === note.$id ? (
                  // Edit Mode
                  <div className="note-edit-mode">
                    <div className="note-edit-header">
                      <span className="note-edit-icon">✏️</span>
                      <span>Editing note</span>
                    </div>
                    <textarea
                      className="form-textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      autoFocus
                    />
                    <div className="note-edit-actions">
                      <button className="action-icon-btn edit" onClick={() => saveEdit(note.$id)}>💾 Save</button>
                      <button className="action-icon-btn delete" onClick={() => setEditingId(null)}>✕ Cancel</button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="note-card-header">
                      <span className={`note-card-author ${note.from === 'Amna' ? 'amna' : 'lateef'}`}>
                        {note.from === 'Amna' ? '🌸 Amna' : '💙 Lateef'}
                      </span>
                      <span className="note-card-date">{note.date}</span>
                    </div>
                    
                    <div className="note-card-body">
                      <p className="note-card-text">{note.text}</p>
                    </div>
                    
                    <div className="note-card-footer">
                      <span className="note-card-heart">❤️</span>
                      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="action-icon-btn edit"
                          title="Edit Note"
                          onClick={() => startEdit(note)}
                        >
                          ✏️
                        </button>
                        <button
                          className="action-icon-btn delete"
                          title="Delete Note"
                          onClick={() => handleDelete(note.$id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}