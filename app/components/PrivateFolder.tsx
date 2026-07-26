// app/components/PrivateFolder.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getEncryptedPrivateLetters,
  createEncryptedPrivateLetter,
  updateEncryptedPrivateLetter,
  deleteEncryptedPrivateLetter,
  getEncryptedPrivatePhotos,
  createEncryptedPrivatePhoto,
  updateEncryptedPrivatePhoto,
  deleteEncryptedPrivatePhoto,
  likePrivatePhoto,
  uploadEncryptedFile,
  downloadEncryptedFile,
} from '../components/lib/database';
import { encryptionService } from '../components/lib/encryption';

export interface PrivateLetter {
  $id: string;
  title: string;
  author: 'Lateef' | 'Amna';
  date: string;
  category: string;
  content: string;
}

export interface PrivatePhoto {
  $id: string;
  title: string;
  caption: string;
  author: 'Lateef' | 'Amna';
  date: string;
  url: string;
  likes: number;
  fileId?: string;
}

export default function PrivateFolder() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [shake, setShake] = useState(false);

  const [activeTab, setActiveTab] = useState<'letters' | 'photos'>('letters');

  const [letters, setLetters] = useState<PrivateLetter[]>([]);
  const [photos, setPhotos] = useState<PrivatePhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [decryptingPhotos, setDecryptingPhotos] = useState<Record<string, boolean>>({});
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const objectUrlsRef = useRef<string[]>([]);

  // Modals
  const [showWriteLetterModal, setShowWriteLetterModal] = useState(false);
  const [showPostPhotoModal, setShowPostPhotoModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<PrivateLetter | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PrivatePhoto | null>(null);
  const [editingLetter, setEditingLetter] = useState<PrivateLetter | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<PrivatePhoto | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Letter Form
  const [letterTitle, setLetterTitle] = useState('');
  const [letterAuthor, setLetterAuthor] = useState<'Lateef' | 'Amna'>('Lateef');
  const [letterCategory, setLetterCategory] = useState('Love Note');
  const [letterContent, setLetterContent] = useState('');

  // Photo Form
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoAuthor, setPhotoAuthor] = useState<'Lateef' | 'Amna'>('Lateef');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    return () => {
      revokeAllObjectUrls();
    };
  }, []);

  const revokeAllObjectUrls = () => {
    for (const url of objectUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    objectUrlsRef.current = [];
  };

  const decryptSinglePhoto = async (fileId: string) => {
    if (!fileId) return;
    if (photoUrls[fileId]) return;
    if (decryptingPhotos[fileId]) return;

    setDecryptingPhotos(prev => ({ ...prev, [fileId]: true }));

    try {
      console.log(`🔓 Decrypting photo: ${fileId}`);
      const result = await downloadEncryptedFile(fileId);
      
      const blob = new Blob([result.data], { 
        type: result.mimeType || 'image/jpeg' 
      });
      const url = URL.createObjectURL(blob);
      objectUrlsRef.current.push(url);
      
      setPhotoUrls(prev => ({ ...prev, [fileId]: url }));
      console.log(`✅ Photo decrypted: ${fileId}`);
    } catch (err) {
      console.error(`❌ Failed to decrypt photo ${fileId}:`, err);
    } finally {
      setDecryptingPhotos(prev => ({ ...prev, [fileId]: false }));
    }
  };

  const loadVaultData = async () => {
    setLoading(true);
    try {
      const [lettersData, photosData] = await Promise.all([
        getEncryptedPrivateLetters(),
        getEncryptedPrivatePhotos(),
      ]);

      const mappedLetters: PrivateLetter[] = (lettersData as any[]).map(doc => ({
        $id: doc.$id,
        title: doc.title || doc.name || 'Untitled Letter',
        author: (doc.author === 'Amna' ? 'Amna' : 'Lateef') as 'Lateef' | 'Amna',
        date: doc.date || new Date(doc.$createdAt).toISOString().split('T')[0],
        category: doc.category || 'Love Note',
        content: doc.content || doc.text || '',
      }));

      // Revoke old object URLs and reset photo URLs
      revokeAllObjectUrls();
      setPhotoUrls({});
      setDecryptingPhotos({});

      const mappedPhotos: PrivatePhoto[] = (photosData as any[]).map((doc) => {
        // Check if photo already has a URL from previous load
        const existingUrl = photoUrls[doc.fileId] || '';
        
        return {
          $id: doc.$id,
          title: doc.title || doc.name || 'Memory Photo',
          caption: doc.caption || '',
          author: (doc.author === 'Amna' ? 'Amna' : 'Lateef') as 'Lateef' | 'Amna',
          date: doc.date || new Date(doc.$createdAt).toISOString().split('T')[0],
          url: existingUrl,
          likes: doc.likes || 0,
          fileId: doc.fileId || '',
        };
      });

      setLetters(mappedLetters);
      setPhotos(mappedPhotos);

      // Auto-decrypt photos if in photos tab
      if (activeTab === 'photos') {
        for (const photo of mappedPhotos) {
          if (photo.fileId && !photoUrls[photo.fileId]) {
            await decryptSinglePhoto(photo.fileId);
          }
        }
      }

      console.log(`✅ Loaded ${mappedLetters.length} letters and ${mappedPhotos.length} photos`);
    } catch (error) {
      console.error('Error loading vault data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Decrypt photos when switching to photos tab
  useEffect(() => {
    if (activeTab === 'photos' && isAuthenticated && photos.length > 0) {
      for (const photo of photos) {
        if (photo.fileId && !photoUrls[photo.fileId]) {
          decryptSinglePhoto(photo.fileId);
        }
      }
    }
  }, [activeTab, photos, photoUrls]);

  // PIN Verification
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerifying(true);

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode.trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        encryptionService.initialize(inputCode.trim());
        setIsAuthenticated(true);
        setInputCode('');
        await loadVaultData();
      } else {
        setError(data.error || 'Incorrect passcode. Access denied.');
        triggerShake();
      }
    } catch (err) {
      setError('Verification error. Please try again.');
      triggerShake();
    } finally {
      setVerifying(false);
    }
  };

  const handleLockVault = () => {
    encryptionService.clearSensitiveData();
    revokeAllObjectUrls();
    setPhotoUrls({});
    setDecryptingPhotos({});
    setLetters([]);
    setPhotos([]);
    setIsAuthenticated(false);
    setInputCode('');
    setSelectedLetter(null);
    setSelectedPhoto(null);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // ========== LETTER CRUD ==========
  const openCreateLetterModal = () => {
    setEditingLetter(null);
    setLetterTitle('');
    setLetterAuthor('Lateef');
    setLetterCategory('Love Note');
    setLetterContent('');
    setShowWriteLetterModal(true);
  };

  const openEditLetterModal = (letter: PrivateLetter, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingLetter(letter);
    setLetterTitle(letter.title);
    setLetterAuthor(letter.author);
    setLetterCategory(letter.category);
    setLetterContent(letter.content);
    setSelectedLetter(null);
    setShowWriteLetterModal(true);
  };

  const handleSaveLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterTitle.trim() || !letterContent.trim()) {
      alert('Please enter both title and content.');
      return;
    }

    try {
      if (editingLetter) {
        await updateEncryptedPrivateLetter(editingLetter.$id, {
          title: letterTitle,
          author: letterAuthor,
          category: letterCategory,
          content: letterContent,
        });
      } else {
        await createEncryptedPrivateLetter({
          title: letterTitle,
          author: letterAuthor,
          category: letterCategory,
          content: letterContent,
        });
      }

      setShowWriteLetterModal(false);
      setEditingLetter(null);
      await loadVaultData();
    } catch (error) {
      alert('Failed to save letter. Please try again.');
    }
  };

  const handleDeleteLetter = async (letterId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await deleteEncryptedPrivateLetter(letterId);
      if (selectedLetter?.$id === letterId) setSelectedLetter(null);
      setConfirmDeleteId(null);
      await loadVaultData();
    } catch (error) {
      alert('Failed to delete letter.');
    }
  };

  // ========== PHOTO CRUD ==========
  const openCreatePhotoModal = () => {
    setEditingPhoto(null);
    setPhotoTitle('');
    setPhotoCaption('');
    setPhotoAuthor('Lateef');
    setPhotoFile(null);
    setShowPostPhotoModal(true);
  };

  const openEditPhotoModal = (photo: PrivatePhoto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPhoto(photo);
    setPhotoTitle(photo.title);
    setPhotoCaption(photo.caption);
    setPhotoAuthor(photo.author);
    setPhotoFile(null);
    setSelectedPhoto(null);
    setShowPostPhotoModal(true);
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) {
      alert('Please enter a photo title.');
      return;
    }
    if (!editingPhoto && !photoFile) {
      alert('Please choose an image file.');
      return;
    }

    setUploadingPhoto(true);

    try {
      let fileId = editingPhoto?.fileId || '';

      if (photoFile) {
        const uploaded = await uploadEncryptedFile(photoFile);
        fileId = uploaded.$id;
      }

      if (editingPhoto) {
        await updateEncryptedPrivatePhoto(editingPhoto.$id, {
          title: photoTitle,
          caption: photoCaption,
          author: photoAuthor,
        });
      } else {
        await createEncryptedPrivatePhoto({
          title: photoTitle,
          caption: photoCaption,
          author: photoAuthor,
          fileId,
        });
      }

      setShowPostPhotoModal(false);
      setEditingPhoto(null);
      setPhotoFile(null);
      await loadVaultData();
    } catch (error) {
      alert('Failed to save photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const photo = photos.find(p => p.$id === photoId);
      await deleteEncryptedPrivatePhoto(photoId, photo?.fileId);
      if (selectedPhoto?.$id === photoId) setSelectedPhoto(null);
      setConfirmDeleteId(null);
      await loadVaultData();
    } catch (error) {
      alert('Failed to delete photo.');
    }
  };

  const handleLikePhoto = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await likePrivatePhoto(photoId);
      await loadVaultData();
    } catch (error) {
      alert('Failed to like photo.');
    }
  };

  // ========== LOCK SCREEN ==========
  if (!isAuthenticated) {
    return (
      <div className="private-folder-lock">
        <div className={`lock-box ${shake ? 'shake-animation' : ''}`}>
          <div className="lock-shield-icon">🛡️</div>
          <h2>Secured Private Vault</h2>
          <p>Enter the passcode to view and manage our private letters and couple photos.</p>

          <form onSubmit={handleCodeSubmit} className="code-form">
            <div className="pin-display-group">
              <input
                type="password"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter access code"
                autoComplete="off"
                name="vault-access-code"
                className="code-input-hidden"
                disabled={verifying}
                autoFocus
              />
            </div>

            {error && <div className="code-error">{error}</div>}

            <button type="submit" className="code-btn" disabled={verifying}>
              {verifying ? 'Unlocking Vault...' : 'Unlock Private Vault 🗝️'}
            </button>
          </form>

          <div className="security-badge-footer">
            <span>🔒 AES-256-GCM • Confidential Private Space</span>
          </div>
        </div>
      </div>
    );
  }

  // ========== VAULT UI ==========
  return (
    <>
      <div className="private-folder-content" style={{ marginTop: '1.5rem' }}>
        <div className="folder-top-bar">
          <div className="folder-title-area">
            <h2>🤭 Private Vault</h2>          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="folder-tabs">
              <button
                className={`tab-btn ${activeTab === 'letters' ? 'active' : ''}`}
                onClick={() => setActiveTab('letters')}
              >
                💌 Letters ({letters.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
                onClick={() => setActiveTab('photos')}
              >
                📸 Photos ({photos.length})
              </button>
            </div>

            {activeTab === 'letters' ? (
              <button className="action-trigger-btn" onClick={openCreateLetterModal}>
                ✏️ Write Letter
              </button>
            ) : (
              <button className="action-trigger-btn" onClick={openCreatePhotoModal}>
                📷 Post Photo
              </button>
            )}

            <button className="action-trigger-btn" onClick={handleLockVault} title="Lock Vault">
              🔒 Lock
            </button>
          </div>
        </div>

        {loading && (
          <div className="skeleton-grid" style={{ marginTop: '1.5rem' }}>
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
        )}

        {/* LETTERS SECTION */}
        {activeTab === 'letters' && !loading && (
          <div className="letters-vault-grid">
            {letters.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h4>No letters in vault yet</h4>
                <p>Click "Write Letter" above to post your first private note.</p>
              </div>
            ) : (
              letters.map((letter) => (
                <div
                  key={letter.$id}
                  className="letter-vault-card"
                  onClick={() => setSelectedLetter(letter)}
                >
                  <div className="letter-card-header">
                    <span className={`letter-card-author ${letter.author === 'Amna' ? 'amna' : 'lateef'}`}>
                      {letter.author === 'Amna' ? '🌸 Amna' : '💙 Lateef'}
                    </span>
                    <span className="letter-card-date">{letter.date}</span>
                  </div>

                  <div className="letter-card-body">
                    <h3 className="letter-card-title">{letter.title}</h3>
                    <div className="letter-card-category">
                      <span className="category-tag">{letter.category}</span>
                    </div>
                    <p className="letter-card-preview">{letter.content}</p>
                  </div>

                  <div className="letter-card-footer">
                    <span className="letter-card-read">📖 Read More</span>
                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="action-icon-btn edit"
                        title="Edit Letter"
                        onClick={(e) => openEditLetterModal(letter, e)}
                      >
                        ✏️
                      </button>
                      {confirmDeleteId === letter.$id ? (
                        <div className="confirm-delete-box">
                          <span>Delete?</span>
                          <button className="confirm-yes" onClick={(e) => handleDeleteLetter(letter.$id, e)}>Yes</button>
                          <button className="confirm-no" onClick={() => setConfirmDeleteId(null)}>No</button>
                        </div>
                      ) : (
                        <button
                          className="action-icon-btn delete"
                          title="Delete Letter"
                          onClick={() => setConfirmDeleteId(letter.$id)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PHOTOS SECTION - Fixed */}
        {activeTab === 'photos' && !loading && (
          <div className="photos-vault-grid">
            {photos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">❤️</div>
                <h4>No photos in vault yet</h4>
                <p>Click "Post Photo" above to upload.</p>
              </div>
            ) : (
              photos.map((photo) => {
                const isDecrypting = decryptingPhotos[photo.fileId || ''];
                const imageUrl = photoUrls[photo.fileId || ''] || '';

                return (
                  <div
                    key={photo.$id}
                    className="photo-vault-card"
                    onClick={() => {
                      if (imageUrl) {
                        setSelectedPhoto({ ...photo, url: imageUrl });
                      }
                    }}
                  >
                    <div className="photo-wrapper">
                      {isDecrypting ? (
                        <div style={{ 
                          height: '200px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: '#f5f0ed',
                          color: 'var(--text-light)',
                          fontSize: '0.9rem'
                        }}>
                          <span>🔓 Decrypting...</span>
                        </div>
                      ) : imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={photo.title}
                          className="photo-img"
                          onError={(e) => {
                            console.error('Image failed to load:', imageUrl);
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f4ece7"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" font-size="30"%3E📸%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div style={{ 
                          height: '200px', 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: '#f5f0ed',
                          color: 'var(--text-light)',
                          fontSize: '0.9rem',
                          gap: '0.5rem'
                        }}>
                          <span>🔒 Encrypted</span>
                          <span style={{ fontSize: '0.7rem' }}>Click to decrypt</span>
                        </div>
                      )}
                      <div className="photo-overlay">
                        <span className="zoom-badge">🔍 View Full Photo</span>
                      </div>
                      <div className="photo-author-badge">
                        {photo.author === 'Amna' ? '🌸' : '💙'}
                      </div>
                    </div>

                    <div className="photo-info">
                      <div className="photo-header">
                        <h4 className="photo-title">{photo.title}</h4>
                        <div className="photo-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="action-icon-btn edit"
                            title="Edit Photo"
                            onClick={(e) => openEditPhotoModal(photo, e)}
                          >
                            ✏️
                          </button>
                          {confirmDeleteId === photo.$id ? (
                            <div className="confirm-delete-box">
                              <span>Delete?</span>
                              <button className="confirm-yes" onClick={(e) => handleDeletePhoto(photo.$id, e)}>Yes</button>
                              <button className="confirm-no" onClick={() => setConfirmDeleteId(null)}>No</button>
                            </div>
                          ) : (
                            <button
                              className="action-icon-btn delete"
                              title="Delete Photo"
                              onClick={() => setConfirmDeleteId(photo.$id)}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="photo-caption">{photo.caption}</p>

                      <div className="photo-meta">
                        <span className="photo-meta-author">By {photo.author} • {photo.date}</span>
                        <button
                          className="like-btn"
                          onClick={(e) => handleLikePhoto(photo.$id, e)}
                        >
                          <span className="like-heart">❤️</span> {photo.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* MODALS - Keep the same as before */}
      {/* CREATE / EDIT LETTER MODAL */}
      {showWriteLetterModal && (
        <div className="modal-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowWriteLetterModal(false);
            setEditingLetter(null);
          }
        }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowWriteLetterModal(false);
                setEditingLetter(null);
              }}
            >
              ✕
            </button>
            <div className="modal-header-icon">✍️</div>
            <h3 className="modal-title">{editingLetter ? 'Edit Private Letter' : 'Write a Private Letter'}</h3>
            <p className="modal-subtitle">Save a private letter in our secure vault.</p>

            <form onSubmit={handleSaveLetter} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Author</label>
                  <select
                    value={letterAuthor}
                    onChange={(e) => setLetterAuthor(e.target.value as 'Lateef' | 'Amna')}
                    className="form-select"
                  >
                    <option value="Lateef">💙 Lateef</option>
                    <option value="Amna">🌸 Amna</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={letterCategory}
                    onChange={(e) => setLetterCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="Love Note">💕 Love Note</option>
                    <option value="Promise">🤝 Promise</option>
                    <option value="Memory">✨ Memory</option>
                    <option value="Apology & Healing">🕊️ Apology & Healing</option>
                    <option value="Secret Wish">🌙 Secret Wish</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Letter Title</label>
                <input
                  type="text"
                  placeholder="e.g., To My Sunshine..."
                  value={letterTitle}
                  onChange={(e) => setLetterTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Letter Content</label>
                <textarea
                  rows={6}
                  placeholder="Write your private thoughts..."
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  className="form-textarea"
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                {editingLetter ? '💾 Save Changes' : '💌 Post Letter to Vault'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* READ LETTER MODAL */}
      {selectedLetter && (
        <div className="modal-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedLetter(null);
          }
        }}>
          <div className="modal-card letter-paper" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <button
              className="modal-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLetter(null);
              }}
            >
              ✕
            </button>

            <div className="letter-read-header">
              <div className="letter-read-author">
                <span className={`letter-card-author ${selectedLetter.author === 'Amna' ? 'amna' : 'lateef'}`}>
                  {selectedLetter.author === 'Amna' ? '🌸 Amna' : '💙 Lateef'}
                </span>
                <span className="letter-read-date">{selectedLetter.date} • {selectedLetter.category}</span>
              </div>
              <div className="letter-read-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="action-icon-btn edit"
                  title="Edit Letter"
                  onClick={() => openEditLetterModal(selectedLetter)}
                >
                  ✏️
                </button>
                <button
                  className="action-icon-btn delete"
                  title="Delete Letter"
                  onClick={() => handleDeleteLetter(selectedLetter.$id)}
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
              <p className="signature-name">- {selectedLetter.author}</p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PHOTO MODAL */}
      {showPostPhotoModal && (
        <div className="modal-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowPostPhotoModal(false);
            setEditingPhoto(null);
          }
        }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowPostPhotoModal(false);
                setEditingPhoto(null);
              }}
            >
              ✕
            </button>
            <div className="modal-header-icon">📸</div>
            <h3 className="modal-title">{editingPhoto ? 'Edit Photo Details' : 'Post Couple Photo'}</h3>
            <p className="modal-subtitle">Share a private memory in our vault. Images are encrypted before upload.</p>

            <form onSubmit={handleSavePhoto} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Posted By</label>
                  <select
                    value={photoAuthor}
                    onChange={(e) => setPhotoAuthor(e.target.value as 'Lateef' | 'Amna')}
                    className="form-select"
                  >
                    <option value="Lateef">💙 Lateef</option>
                    <option value="Amna">🌸 Amna</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Photo Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Beach Sunset"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Caption</label>
                <input
                  type="text"
                  placeholder="Describe this memory..."
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label style={{ marginBottom: '0.4rem', display: 'block' }}>
                  Image File {editingPhoto ? '(leave empty to keep current photo)' : ''}
                </label>
                <div
                  className="file-dropzone"
                  onClick={() => document.getElementById('photo-upload-input')?.click()}
                >
                  <div className="file-dropzone-icon">📁</div>
                  <p className="file-dropzone-text">
                    {photoFile ? photoFile.name : 'Click to choose image file'}
                  </p>
                  <span className="file-dropzone-hint">Supports JPG, PNG, WEBP — encrypted on upload</span>
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={uploadingPhoto}>
                {uploadingPhoto ? '⏳ Encrypting & Saving...' : editingPhoto ? '💾 Save Changes' : '📸 Post Photo to Vault'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX PHOTO MODAL */}
      {selectedPhoto && (
        <div className="modal-backdrop" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-card lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhoto(null);
              }}
            >
              ✕
            </button>

            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="lightbox-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f4ece7"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" font-size="30"%3E📸%3C/text%3E%3C/svg%3E';
              }}
            />

            <div className="lightbox-details">
              <h3>{selectedPhoto.title}</h3>
              <p className="lightbox-caption">{selectedPhoto.caption}</p>
              <p className="lightbox-meta">Posted by {selectedPhoto.author} on {selectedPhoto.date}</p>

              <div className="lightbox-actions">
                <button
                  className="action-icon-btn edit"
                  onClick={() => openEditPhotoModal(selectedPhoto)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="action-icon-btn delete"
                  onClick={() => handleDeletePhoto(selectedPhoto.$id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}