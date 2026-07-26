// app/components/MemoriesGallery.tsx
"use client";

import { useState, useEffect } from 'react';
import { getMemories, createMemory, updateMemory, deleteMemory } from '../components/lib/database';

interface Memory {
  $id: string;
  title: string;
  description: string;
  emoji: string;
  date: string;
}

const DEFAULT_MEMORIES: Memory[] = [
  { $id: 'default-1', title: "Our First Meeting", description: "The day my life changed forever", emoji: "🌟", date: "Forever" },
  { $id: 'default-2', title: "That Special Smile", description: "When you laugh, the world feels right", emoji: "😊", date: "Always" },
  { $id: 'default-3', title: "Quiet Moments", description: "Just being together is everything", emoji: "🌙", date: "Forever" },
  { $id: 'default-4', title: "Adventures Together", description: "Every journey is better with you", emoji: "🗺️", date: "Eternally" },
];

export default function MemoriesGallery() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🌟');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const emojis = ['😍', '🥰', '😘', '😊', '❤️', '💕', '💖', '🎀', '💎', '✨', '🍄', '🍑', '🌸', '🌹'];

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    setLoading(true);
    setSaveStatus('idle');
    try {
      console.log('🔍 Loading memories from Appwrite...');
      const data = await getMemories();
      console.log('📦 Data from Appwrite:', data);
      
      if (data && data.length > 0) {
        const mapped = (data as any[]).map((doc) => ({
          $id: doc.$id,
          title: doc.title || doc.name || 'Untitled Memory',
          description: doc.description || doc.content || '',
          emoji: doc.emoji || '🌟',
          date: doc.date || new Date(doc.$createdAt).toLocaleDateString(),
        }));
        setMemories(mapped);
        setSelectedMemory(mapped[0] || null);
        console.log(`✅ Loaded ${mapped.length} memories from Appwrite`);
      } else {
        console.log('📝 No memories in Appwrite, using defaults');
        // ✅ Only show defaults, don't auto-save to Appwrite
        setMemories(DEFAULT_MEMORIES);
        setSelectedMemory(DEFAULT_MEMORIES[0]);
      }
    } catch (error) {
      console.error('❌ Error loading memories:', error);
      setMemories(DEFAULT_MEMORIES);
      setSelectedMemory(DEFAULT_MEMORIES[0]);
      setErrorMessage('Failed to load from Appwrite. Using local data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setEmoji('🌟');
    setShowForm(true);
    setErrorMessage('');
  };

  const handleEditClick = (memory: Memory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(memory.$id);
    setTitle(memory.title);
    setDescription(memory.description);
    setEmoji(memory.emoji);
    setShowForm(true);
    setErrorMessage('');
  };

  const handleDeleteClick = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this memory?')) return;
    
    setSaveStatus('saving');
    try {
      if (!id.startsWith('default-') && !id.startsWith('mem-')) {
        await deleteMemory(id);
        console.log(`✅ Deleted memory: ${id}`);
      }
      const remaining = memories.filter(m => m.$id !== id);
      setMemories(remaining);
      setSelectedMemory(remaining.length > 0 ? remaining[0] : null);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('❌ Delete memory error:', err);
      setSaveStatus('error');
      setErrorMessage('Failed to delete memory.');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    setSaveStatus('saving');
    setErrorMessage('');

    try {
      if (editingId && !editingId.startsWith('default-') && !editingId.startsWith('mem-')) {
        // Update existing
        await updateMemory(editingId, { title, description, emoji });
        console.log(`✅ Updated memory: ${editingId}`);
      } else {
        // Create new
        const newMemory = await createMemory({ title, description, emoji });
        console.log(`✅ Created memory: ${newMemory.$id}`);
      }
      
      setTitle('');
      setDescription('');
      setEmoji('🌟');
      setShowForm(false);
      setEditingId(null);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      await loadMemories();
    } catch (error) {
      console.error('❌ Error saving memory:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to save memory. Please try again.');
      setTimeout(() => setSaveStatus('idle'), 3000);
      
      // Fallback local update
      const updated: Memory = {
        $id: editingId || 'mem-' + Date.now(),
        title,
        description,
        emoji,
        date: new Date().toLocaleDateString(),
      };
      
      let newMemoriesList = [...memories];
      if (editingId) {
        newMemoriesList = memories.map(m => m.$id === editingId ? updated : m);
      } else {
        newMemoriesList.unshift(updated);
      }
      
      setMemories(newMemoriesList);
      setSelectedMemory(updated);
      setTitle('');
      setDescription('');
      setShowForm(false);
      setEditingId(null);
    }
  };

  return (
    <section className="memories-section">
      <div className="section-header">
        <h2>Precious Memories</h2>
        <p className="section-subtitle">Tumhare saath guzara hua waqt</p>
        <button className="action-trigger-btn" onClick={handleAddClick} style={{ marginTop: '1rem' }}>
          ✨ Add Memory
        </button>
      </div>

      {/* Save Status */}
      {saveStatus === 'saving' && (
        <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)' }}>
          ⏳ Saving to Appwrite...
        </div>
      )}
      {saveStatus === 'saved' && (
        <div style={{ textAlign: 'center', padding: '0.5rem', color: '#4CAF50' }}>
          ✅ Saved to Appwrite successfully!
        </div>
      )}
      {saveStatus === 'error' && (
        <div style={{ textAlign: 'center', padding: '0.5rem', color: '#C62828' }}>
          ❌ {errorMessage || 'Failed to save to Appwrite'}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowForm(false)}>✕</button>
            <div className="modal-header-icon">✨</div>
            <h3 className="modal-title">{editingId ? 'Edit Memory' : 'Add a Memory'}</h3>
            <p className="modal-subtitle">Capture a precious moment forever.</p>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Choose Emoji</label>
                <div className="emoji-grid">
                  {emojis.map(e => (
                    <button
                      key={e}
                      type="button"
                      className={`emoji-select-btn ${e === emoji ? 'active' : ''}`}
                      onClick={() => setEmoji(e)}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Memory title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe this precious memory..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={saveStatus === 'saving'}>
                {saveStatus === 'saving' ? 'Saving...' : editingId ? '💾 Save Changes' : '💾 Save Memory'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Skeleton Loading */}
      {loading ? (
        <div className="memories-grid">
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
          <div className="skeleton-card">
            <div className="skeleton-box skeleton-title" />
            <div className="skeleton-box skeleton-text" />
            <div className="skeleton-box skeleton-text-short" />
          </div>
        </div>
      ) : memories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h4>No memories yet</h4>
          <p>Start adding your precious moments! 💕</p>
        </div>
      ) : (
        <>
          {/* Selected Memory Detail */}
          {selectedMemory && (
            <div className="memory-detail-card">
              <div className="memory-detail-emoji">{selectedMemory.emoji}</div>
              <h3 className="memory-detail-title">{selectedMemory.title}</h3>
              <p className="memory-detail-description">{selectedMemory.description}</p>
              <div className="memory-detail-quote">
                "A memory with you is a treasure I keep in my heart forever"
              </div>
              <div className="memory-detail-actions">
                <button className="action-icon-btn edit" onClick={() => handleEditClick(selectedMemory)}>
                  ✏️ Edit
                </button>
                <button className="action-icon-btn delete" onClick={() => handleDeleteClick(selectedMemory.$id)}>
                  🗑️ Delete
                </button>
              </div>
              <p className="memory-detail-date">Added on {selectedMemory.date}</p>
            </div>
          )}
          
          {/* Memories Grid */}
          <div className="memories-grid">
            {memories.map(memory => (
              <div 
                key={memory.$id} 
                className={`memory-card ${selectedMemory?.$id === memory.$id ? 'active' : ''}`}
                onClick={() => setSelectedMemory(memory)}
              >
                <div className="memory-card-emoji">{memory.emoji}</div>
                <h4 className="memory-card-title">{memory.title}</h4>
                <p className="memory-card-description">{memory.description}</p>
                <div className="memory-card-footer">
                  <span className="memory-card-date">{memory.date}</span>
                  <div className="memory-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="action-icon-btn edit"
                      title="Edit"
                      onClick={(e) => handleEditClick(memory, e)}
                    >
                      ✏️
                    </button>
                    <button
                      className="action-icon-btn delete"
                      title="Delete"
                      onClick={(e) => handleDeleteClick(memory.$id, e)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}