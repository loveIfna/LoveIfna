// app/components/LoveLetter.tsx
"use client";

import { useState, useEffect } from 'react';
import { getLetters, createLetter, updateLetter, deleteLetter } from '../components/lib/database';

interface Letter {
  $id: string;
  title: string;
  content: string;
  from: string;
  date: string;
}

const DEFAULT_LETTER: Letter = {
  $id: 'default-1',
  title: 'My Dearest Love,',
  content: `I created this website because sometimes words alone aren't enough to express how deeply I care for you. You are the most amazing person I've ever known, and every day with you feels like a blessing.

Your smile has a way of lighting up even the darkest days. Your kindness touches everyone around you, and your strength inspires me to be a better person. When I'm with you, I feel at home—like I've found where I truly belong.

No matter what the future holds, I want you to know that my love for you is constant and true. You are loved more than you could ever imagine, today and every day that follows.`,
  from: 'Lateef',
  date: 'Forever & Always',
};

export default function LoveLetter() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [from, setFrom] = useState('Lateef');
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    setLoading(true);
    try {
      const data = await getLetters();
      const mapped = (data as any[]).map((doc) => ({
        $id: doc.$id || 'id-' + Date.now(),
        title: doc.title || doc.name || 'Love Letter',
        content: doc.content || doc.text || '',
        from: doc.from || doc.author || 'Lateef',
        date: doc.date || new Date().toISOString().split('T')[0],
      }));
      setLetters(mapped.length > 0 ? mapped : [DEFAULT_LETTER]);
    } catch (err) {
      setLetters([DEFAULT_LETTER]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      if (editingId && !editingId.startsWith('default-')) {
        await updateLetter(editingId, { title, content, from });
      } else {
        await createLetter({ title, content, from });
      }
      
      setTitle('');
      setContent('');
      setFrom('Lateef');
      setShowForm(false);
      setEditingId(null);
      await loadLetters();
    } catch (error) {
      // Fallback update in state if Appwrite permissions fail
      const updated = letters.map(l => l.$id === editingId ? { ...l, title, content, from } : l);
      if (!editingId) {
        updated.unshift({
          $id: 'letter-' + Date.now(),
          title,
          content,
          from,
          date: new Date().toISOString().split('T')[0],
        });
      }
      setLetters(updated);
      setShowForm(false);
      setEditingId(null);
    }
  };

  const handleEdit = (letter: Letter) => {
    setEditingId(letter.$id);
    setTitle(letter.title);
    setContent(letter.content);
    setFrom(letter.from);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this letter?')) {
      try {
        if (!id.startsWith('default-')) {
          await deleteLetter(id);
        }
      } catch (error) {
        console.log('Delete notice:', error);
      } finally {
        setLetters(prev => prev.filter(l => l.$id !== id));
      }
    }
  };

  return (
    <section className="letter-section">
      <div className="section-header">
        <span className="title-badge">❤️‍🩹 From the Heart</span>
        <h2>Love Letters</h2>
        <p className="section-subtitle">A letter from my heart to yours</p>
        <button 
          className="action-trigger-btn" 
          onClick={() => { setShowForm(true); setEditingId(null); setTitle(''); setContent(''); }}
          style={{ marginTop: '1rem' }}
        >
          ✍️ Write New Letter
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowForm(false)}>✕</button>
            <div className="modal-header-icon">💌</div>
            <h3 className="modal-title">{editingId ? 'Edit Love Letter' : 'Write a Love Letter'}</h3>
            <p className="modal-subtitle">{editingId ? 'Update your heartfelt message.' : 'Share your feelings from the heart.'}</p>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>From</label>
                <select 
                  value={from} 
                  onChange={(e) => setFrom(e.target.value)}
                  className="form-select"
                >
                  <option value="Lateef">💙 Lateef</option>
                  <option value="Amna">🌸 Amna</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="e.g., My Promise to You"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  rows={6}
                  placeholder="Write your heartfelt message..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="form-textarea"
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                {editingId ? '💾 Save Changes' : '💌 Send Letter'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Read Letter Modal */}
      {selectedLetter && (
        <div className="modal-backdrop" onClick={() => setSelectedLetter(null)}>
          <div className="modal-card letter-paper" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <button className="modal-close-btn" onClick={() => setSelectedLetter(null)}>✕</button>

            <div className="letter-read-header">
              <div className="letter-read-author">
                <span className={`letter-card-author ${selectedLetter.from === 'Amna' ? 'amna' : 'lateef'}`}>
                  {selectedLetter.from === 'Amna' ? '🌸 Amna' : '💙 Lateef'}
                </span>
                <span className="letter-read-date">{selectedLetter.date}</span>
              </div>
              <div className="letter-read-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="action-icon-btn edit"
                  title="Edit Letter"
                  onClick={() => handleEdit(selectedLetter)}
                >
                  ✏️
                </button>
                <button
                  className="action-icon-btn delete"
                  title="Delete Letter"
                  onClick={() => handleDelete(selectedLetter.$id)}
                >
                  🗑️
                </button>
              </div>
            </div>

            <h2 className="letter-read-title">{selectedLetter.title}</h2>

            <div className="letter-read-content">
              {selectedLetter.content.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="letter-read-signature">
              <div className="signature-line"></div>
              <p className="signature-name">- {selectedLetter.from}</p>
            </div>
          </div>
        </div>
      )}

      {/* Letters Grid */}
      <div className="letters-grid">
        {loading ? (
          <>
            <div className="skeleton-card">
              <div className="skeleton-box skeleton-title" />
              <div className="skeleton-box skeleton-text" />
              <div className="skeleton-box skeleton-text" />
              <div className="skeleton-box skeleton-text-short" />
            </div>
            <div className="skeleton-card">
              <div className="skeleton-box skeleton-title" />
              <div className="skeleton-box skeleton-text" />
              <div className="skeleton-box skeleton-text" />
              <div className="skeleton-box skeleton-text-short" />
            </div>
          </>
        ) : letters.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h4>No letters yet</h4>
            <p>Write your first love letter! 💕</p>
          </div>
        ) : (
          letters.map((letter) => (
            <div 
              key={letter.$id} 
              className="letter-card"
              onClick={() => setSelectedLetter(letter)}
            >
              {/* Card Header */}
              <div className="letter-card-header">
                <span className={`letter-card-author ${letter.from === 'Amna' ? 'amna' : 'lateef'}`}>
                  {letter.from === 'Amna' ? '🌸 Amna' : '💙 Lateef'}
                </span>
                <span className="letter-card-date">{letter.date}</span>
              </div>

              {/* Card Body */}
              <div className="letter-card-body">
                <h3 className="letter-card-title">{letter.title}</h3>
                <div className="letter-card-content">
                  {letter.content.split('\n').slice(0, 3).map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                  {letter.content.split('\n').length > 3 && (
                    <p className="letter-read-more">...</p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="letter-card-footer">
                <span className="letter-card-read">📖 Read Full Letter</span>
                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="action-icon-btn edit"
                    title="Edit Letter"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(letter);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="action-icon-btn delete"
                    title="Delete Letter"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(letter.$id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}