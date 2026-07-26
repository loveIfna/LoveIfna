// app/components/ApologySection.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  getPromises, 
  savePromises,
  createPromise,
  updatePromise,
  deletePromise 
} from '../components/lib/database';


interface PromiseItem {
  $id?: string;
  id?: number;  // Add this back
  text: string;
  completed: boolean;
}

const DEFAULT_PROMISES: PromiseItem[] = [
  { text: "I will never raise my hand to you again", completed: true },
  { text: "I will never use hurtful words", completed: true },
  { text: "I will listen to you with patience and tender care", completed: true },
  { text: "I will respect your feelings always and honor your voice", completed: true },
  { text: "I will work on my anger every single day", completed: true },
  { text: "I will cherish, support, and protect you forever", completed: true },
];

export default function ApologySection() {
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Add / Edit Form State
  const [newPromiseText, setNewPromiseText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadPromises();
  }, []);

  const loadPromises = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading promises from Appwrite...');
      const data = await getPromises();
      console.log('📦 Data from Appwrite:', data);
      
      if (data && data.length > 0) {
      const mapped = data.map((doc: any) => ({
  $id: doc.$id,
  id: doc.id,  // Keep the id
  text: doc.text,
  completed: doc.completed ?? true,
}));

        setPromises(mapped);
        console.log('✅ Loaded', mapped.length, 'promises from Appwrite');
      } else {
        console.log('📝 No promises in Appwrite, using defaults');
        setPromises(DEFAULT_PROMISES);
        // Save defaults to Appwrite
        await saveAllPromises(DEFAULT_PROMISES);
      }
    } catch (err) {
      console.error('❌ Error loading promises:', err);
      setPromises(DEFAULT_PROMISES);
      setErrorMessage('Failed to load from Appwrite. Using local data.');
    } finally {
      setLoading(false);
    }
  };

  const saveAllPromises = async (promisesToSave: PromiseItem[]) => {
    setSaveStatus('saving');
    setErrorMessage('');
    
    try {
      console.log('💾 Saving promises to Appwrite:', promisesToSave);
      
      let successCount = 0;
      
      // First, get existing promises
      const existing = await getPromises();
      
      for (const promise of promisesToSave) {
        try {
          // Check if this promise already exists (by text)
          const existingDoc = existing.find((p: any) => p.text === promise.text);
          
          if (existingDoc && existingDoc.$id) {
            // Update existing
            await updatePromise(existingDoc.$id, {
              text: promise.text,
              completed: promise.completed,
            });
            console.log(`✅ Updated promise: "${promise.text}"`);
          } else {
            // Create new
            await createPromise({
              text: promise.text,
              completed: promise.completed,
            });
            console.log(`✅ Created promise: "${promise.text}"`);
          }
          successCount++;
        } catch (err) {
          console.error(`❌ Error saving promise "${promise.text}":`, err);
        }
      }
      
      if (successCount === promisesToSave.length) {
        setSaveStatus('saved');
        console.log(`✅ All ${successCount} promises saved to Appwrite!`);
      } else {
        setSaveStatus('error');
        setErrorMessage(`Saved ${successCount}/${promisesToSave.length} promises. Check console for errors.`);
      }
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('❌ Error saving promises:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to save to Appwrite. Check console.');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleAddPromise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromiseText.trim()) return;

    const newPromise: PromiseItem = {
      text: newPromiseText,
      completed: false,
    };

    setPromises(prev => [...prev, newPromise]);
    setNewPromiseText('');
    
    try {
      console.log('➕ Adding promise:', newPromise);
      const created = await createPromise({
        text: newPromise.text,
        completed: newPromise.completed,
      });
      console.log('✅ Promise added to Appwrite:', created);
      
      // Update the promise with the $id from Appwrite
      if (created && created.$id) {
        setPromises(prev => prev.map(p => 
          p.text === newPromise.text ? { ...p, $id: created.$id } : p
        ));
      }
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('❌ Error adding promise:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to add to Appwrite. Saved locally.');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const startEdit = (promise: PromiseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(promise.$id || null);
    setEditText(promise.text);
  };

  const saveEdit = async (promise: PromiseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editText.trim()) return;

    try {
      if (promise.$id) {
        await updatePromise(promise.$id, { text: editText });
        console.log(`✅ Updated promise ${promise.$id} text`);
      }
      setPromises(prev => prev.map(p => p.$id === promise.$id ? { ...p, text: editText } : p));
      setEditingId(null);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('❌ Error updating promise:', error);
      // Local fallback
      setPromises(prev => prev.map(p => p.$id === promise.$id ? { ...p, text: editText } : p));
      setEditingId(null);
    }
  };

  const handleDeletePromise = async (promise: PromiseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this commitment?')) return;

    try {
      if (promise.$id) {
        await deletePromise(promise.$id);
        console.log(`✅ Deleted promise ${promise.$id}`);
      }
    } catch (error) {
      console.error('❌ Error deleting promise:', error);
    } finally {
      setPromises(prev => prev.filter(p => p.$id !== promise.$id));
    }
  };

  const togglePromise = async (promise: PromiseItem) => {
    if (editingId === promise.$id) return;

    const updated = promises.map(p => 
      p.$id === promise.$id ? { ...p, completed: !p.completed } : p
    );
    setPromises(updated);
    
    try {
      if (promise.$id) {
        await updatePromise(promise.$id, { completed: !promise.completed });
        console.log(`✅ Toggled promise ${promise.$id} to ${!promise.completed}`);
      } else {
        await savePromises(updated);
      }
    } catch (error) {
      console.error('❌ Error toggling promise:', error);
    }
  };

  const handleSaveAll = async () => {
    await saveAllPromises(promises);
  };

  const completedCount = promises.filter(p => p.completed).length;
  const progressPercent = promises.length > 0 ? Math.round((completedCount / promises.length) * 100) : 0;

  return (
    <section className="apology-section">
      <div className="section-header">
        <h2>Mujhe Maaf Karna</h2>
        <p className="section-subtitle">Mere dil se likhi gyi baat sirf or sirf Meri Jaan ke liye</p>
      </div>
      
      <div className="apology-container">
        {/* Letter Card */}
        <div className="apology-letter">
          <div className="apology-header">
            <div className="apology-date">Aaj iss bhaari dil se likhra hu</div>
          </div>
          &nbsp;

          <div className="apology-content">
            <p className="apology-greeting">Meri Jaan 🎀,</p>
            
            <p>
              Amna... mujhe pata h tum mujhse kabhi kabhi bohot naraz hojaati ho
              kabhi kabhi me tumhe bohot zyada gussa dila deta hu.. or me jaata hu tumhe isse bohot taqleef hoti h...
              par me aisa nhi hu mene kabhi bhi tumhe sachme hurt karna nhi chaha... 
            </p>
            &nbsp;
            <p>
              Tum bohot keemti ho mere liye... Tumhe me kabhi compare nhi kar sakta kisi bhi ladki se..
              Tum meri jaan ho Amna.. Tumhare alawa mera koi nhi.. na duniya me na akhirat me..
            </p>
            &nbsp;
            
            <div className="apology-highlight">
              "Me galat tha, mene tumhe taqleef di.. uss galti ke liye SORRY JAAN"
            </div>
            &nbsp;

            <p>
              Mujhe pata h tum mujhse bohot zyada pyaar karti ho.. or kabhi bhi me tumse durr rahu to yeh letter padh lena 
              toh tum mujhe feel kar paaogi.. chahe kitne bhi gusse me kuch bhi kaha rahu.. 
            </p>
            &nbsp;

            <p>
              hum hamesha ek saath rahenge tumne kaha hona ke tumhe hamesha mere saath rehna h.. toh tumhara wada hum milke nibhayege..🥰
            </p>
            &nbsp;

            <p className="apology-closing">Tumhari Jaan,</p>
            
            <div className="apology-signature">
              <div className="signature-line"></div>
              <p className="signature-name">Lateef</p>
            </div>
          </div>
        </div>
        
        {/* Promises Commitments Section */}
        <div className="promises-section" style={{marginTop:"50px"}}>
          <h3>I'll never do this again</h3>
          <p className="promises-subtitle">Click each promise to mark my progress and commitment</p>

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

          {/* Save All Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button 
              onClick={handleSaveAll}
              className="add-note-btn" 
              style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
            >
              💾 Save All to Appwrite
            </button>
          </div>

          {/* Progress Bar */}
          <div className="promise-progress-container">
            <div className="promise-progress-header">
              <span>Commitments</span>
              <span>{completedCount} of {promises.length} ({progressPercent}%)</span>
            </div>
            <div className="promise-progress-bar-bg">
              <div 
                className="promise-progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Add Promise Form */}
          <form onSubmit={handleAddPromise} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Add a new sacred commitment..."
              value={newPromiseText}
              onChange={(e) => setNewPromiseText(e.target.value)}
              style={{ flex: 1, padding: '0.65rem 0.95rem', fontSize: '0.9rem' }}
            />
            <button type="submit" className="add-note-btn" style={{ padding: '0.65rem 1.1rem', marginTop: 0, fontSize: '0.9rem' }}>
              Add 🤝
            </button>
          </form>
          
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="skeleton-box" style={{ height: '48px', width: '100%' }} />
              <div className="skeleton-box" style={{ height: '48px', width: '100%' }} />
              <div className="skeleton-box" style={{ height: '48px', width: '100%' }} />
            </div>
          ) : (
            <>
              <div className="promises-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {promises.map((promise, index) => (
                  <div 
                    key={promise.$id || index}
                    className={`promise-item ${promise.completed ? 'completed' : ''}`}
                    onClick={() => togglePromise(promise)}
                  >
                    <div className="promise-checkbox">
                      {promise.completed ? '☑️' : '⬜'}
                    </div>

                    <div className="promise-text" style={{ flex: 1 }}>
                      {editingId === promise.$id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            style={{ flex: 1, padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
                            autoFocus
                          />
                          <button className="crud-icon-btn edit-btn" onClick={(e) => saveEdit(promise, e)}>💾</button>
                          <button className="crud-icon-btn" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>✕</button>
                        </div>
                      ) : (
                        <p>{promise.text}</p>
                      )}
                    </div>

                    {editingId !== promise.$id && (
                      <div style={{ display: 'flex', gap: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
                        <button className="crud-icon-btn edit-btn" onClick={(e) => startEdit(promise, e)}>✏️</button>
                        <button className="crud-icon-btn delete-btn" onClick={(e) => handleDeletePromise(promise, e)}>🗑️</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="commitment-note" style={{ marginTop: '1.5rem' }}>
                <p>These are not just words. These are my sacred promises to you.</p>
                <p>I will prove every day through my actions that I am changing.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}