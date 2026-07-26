// app/components/lib/database.ts
import { databases, DATABASE_ID, storage, BUCKET_ID, ID } from './appwrite';
import { encryptionService, EncryptedData, EncryptedFile } from './encryption';

const DEFAULT_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || 'memories';

// Collection IDs with safe fallback to DEFAULT_COLLECTION
const COLLECTIONS = {
  LETTERS: process.env.NEXT_PUBLIC_COLLECTION_LETTERS || DEFAULT_COLLECTION,
  NOTES: process.env.NEXT_PUBLIC_COLLECTION_NOTES || DEFAULT_COLLECTION,
  MEMORIES: process.env.NEXT_PUBLIC_COLLECTION_MEMORIES || DEFAULT_COLLECTION,
  PROMISES: process.env.NEXT_PUBLIC_COLLECTION_PROMISES || DEFAULT_COLLECTION,
  PHOTOS: process.env.NEXT_PUBLIC_COLLECTION_PHOTOS || DEFAULT_COLLECTION,
  PRIVATE_LETTERS: process.env.NEXT_PUBLIC_COLLECTION_PRIVATE_LETTERS || DEFAULT_COLLECTION,
  PRIVATE_PHOTOS: process.env.NEXT_PUBLIC_COLLECTION_PRIVATE_PHOTOS || DEFAULT_COLLECTION,
};

// ============================================================
// REGULAR (NON-ENCRYPTED) FUNCTIONS - Plain Text Collections
// ============================================================

// ==================== LETTERS (Plain) ====================
export async function getLetters() {
  try {
    if (!DATABASE_ID || !COLLECTIONS.LETTERS) return [];
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LETTERS);
    return response.documents;
  } catch (error) {
    console.error('Error fetching letters:', error);
    return [];
  }
}

export async function createLetter(data: { title: string; content: string; from?: string }) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.LETTERS) throw new Error('Database or Collection not configured');
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.LETTERS, ID.unique(), {
      title: data.title,
      content: data.content,
      from: data.from || 'Lateef',
      date: new Date().toISOString().split('T')[0],
      type: 'love_letter',
    });
    return doc;
  } catch (error) {
    console.error('Error creating letter:', error);
    throw error;
  }
}

export async function updateLetter(id: string, data: Partial<{ title: string; content: string; from: string }>) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.LETTERS) throw new Error('Database or Collection not configured');
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.LETTERS, id, data);
    return doc;
  } catch (error) {
    console.error('Error updating letter:', error);
    throw error;
  }
}

export async function deleteLetter(id: string) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.LETTERS) return false;
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.LETTERS, id);
    return true;
  } catch (error) {
    console.error('Error deleting letter:', error);
    throw error;
  }
}

// ==================== NOTES (Plain) ====================
export async function getNotes() {
  try {
    if (!DATABASE_ID || !COLLECTIONS.NOTES) return [];
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.NOTES);
    return response.documents;
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
}

export async function createNote(data: { text: string; from?: string }) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.NOTES) throw new Error('Database not configured');
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.NOTES, ID.unique(), {
      text: data.text,
      from: data.from || 'Lateef',
      date: new Date().toISOString().split('T')[0],
      type: 'love_note',
    });
    return doc;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}

export async function updateNote(id: string, data: Partial<{ text: string; from: string }>) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.NOTES) throw new Error('Database not configured');
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.NOTES, id, data);
    return doc;
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
}

export async function deleteNote(id: string) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.NOTES) return false;
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.NOTES, id);
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}

// ==================== MEMORIES (Plain) ====================
export async function getMemories() {
  try {
    if (!DATABASE_ID || !COLLECTIONS.MEMORIES) return [];
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MEMORIES);
    return response.documents;
  } catch (error) {
    console.error('Error fetching memories:', error);
    return [];
  }
}

export async function createMemory(data: { title: string; description: string; emoji?: string }) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.MEMORIES) throw new Error('Database not configured');
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.MEMORIES, ID.unique(), {
      title: data.title,
      description: data.description,
      emoji: data.emoji || '🌟',
      date: new Date().toISOString().split('T')[0],
      type: 'memory',
    });
    return doc;
  } catch (error) {
    console.error('Error creating memory:', error);
    throw error;
  }
}

export async function updateMemory(id: string, data: Partial<{ title: string; description: string; emoji: string }>) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.MEMORIES) throw new Error('Database not configured');
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.MEMORIES, id, data);
    return doc;
  } catch (error) {
    console.error('Error updating memory:', error);
    throw error;
  }
}

export async function deleteMemory(id: string) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.MEMORIES) return false;
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.MEMORIES, id);
    return true;
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
}

// ==================== PROMISES (Plain) ====================
export async function getPromises() {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PROMISES) {
      console.error('❌ Database or Collection not configured');
      return [];
    }
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROMISES);
    return response.documents;
  } catch (error: any) {
    console.error('❌ Error fetching promises:', error.message);
    return [];
  }
}

export async function createPromise(data: { text: string; completed?: boolean }) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PROMISES) {
      throw new Error('Database or Collection not configured');
    }
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PROMISES,
      ID.unique(),
      {
        text: data.text,
        completed: data.completed ?? false,
        type: 'promise',
      }
    );
    return doc;
  } catch (error: any) {
    console.error('❌ Error creating promise:', error.message);
    throw error;
  }
}

export async function updatePromise(id: string, data: Partial<{ text: string; completed: boolean }>) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PROMISES) {
      throw new Error('Database or Collection not configured');
    }
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROMISES, id, data);
    return doc;
  } catch (error: any) {
    console.error('❌ Error updating promise:', error.message);
    throw error;
  }
}

export async function deletePromise(id: string) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PROMISES) {
      return false;
    }
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PROMISES, id);
    return true;
  } catch (error: any) {
    console.error('❌ Error deleting promise:', error.message);
    throw error;
  }
}

export async function savePromises(promises: Array<{ text: string; completed: boolean }>) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PROMISES) {
      return false;
    }
    const existing = await getPromises();
    for (const promise of promises) {
      const existingDoc = existing.find((p: any) => p.text === promise.text);
      if (existingDoc && existingDoc.$id) {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROMISES, existingDoc.$id, {
          text: promise.text,
          completed: promise.completed,
        });
      } else {
        await databases.createDocument(DATABASE_ID, COLLECTIONS.PROMISES, ID.unique(), {
          text: promise.text,
          completed: promise.completed,
          type: 'promise',
        });
      }
    }
    return true;
  } catch (error: any) {
    console.error('❌ Error saving promises:', error.message);
    throw error;
  }
}

// ==================== PHOTOS (Plain) ====================
export async function getPhotos() {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PHOTOS) return [];
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PHOTOS);
    return response.documents;
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
}

export async function createPhoto(data: {
  title: string;
  description?: string;
  emoji?: string;
  fileId?: string;
  url?: string;
}) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PHOTOS) throw new Error('Database not configured');
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.PHOTOS, ID.unique(), {
      title: data.title,
      description: data.description || '',
      emoji: data.emoji || '📸',
      fileId: data.fileId || '',
      url: data.url || '',
      date: new Date().toISOString().split('T')[0],
      type: 'gallery_photo',
    });
    return doc;
  } catch (error) {
    console.error('Error creating photo:', error);
    throw error;
  }
}

export async function updatePhoto(id: string, data: Partial<{
  title: string;
  description: string;
  emoji: string;
  fileId: string;
  url: string;
}>) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PHOTOS) throw new Error('Database not configured');
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.PHOTOS, id, data);
    return doc;
  } catch (error) {
    console.error('Error updating photo:', error);
    throw error;
  }
}

export async function deletePhoto(id: string) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PHOTOS) return false;
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PHOTOS, id);
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}

// ==================== PRIVATE LETTERS (Vault - Plain, Non-encrypted) ====================
export async function getPrivateLetters() {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_LETTERS) return [];
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRIVATE_LETTERS);
    return response.documents;
  } catch (error) {
    console.error('Error fetching private letters:', error);
    return [];
  }
}

export async function createPrivateLetter(data: {
  title: string;
  content: string;
  author?: string;
  category?: string;
}) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_LETTERS) throw new Error('Database not configured');
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.PRIVATE_LETTERS, ID.unique(), {
      title: data.title,
      content: data.content,
      author: data.author || 'Lateef',
      category: data.category || 'Love Note',
      date: new Date().toISOString().split('T')[0],
      type: 'private_letter',
    });
    return doc;
  } catch (error) {
    console.error('Error creating private letter:', error);
    throw error;
  }
}

export async function updatePrivateLetter(id: string, data: Partial<{
  title: string;
  content: string;
  author: string;
  category: string;
}>) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_LETTERS) throw new Error('Database not configured');
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.PRIVATE_LETTERS, id, data);
    return doc;
  } catch (error) {
    console.error('Error updating private letter:', error);
    throw error;
  }
}

export async function deletePrivateLetter(id: string) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_LETTERS) return false;
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PRIVATE_LETTERS, id);
    return true;
  } catch (error) {
    console.error('Error deleting private letter:', error);
    throw error;
  }
}

// ==================== PRIVATE PHOTOS (Vault - Plain, Non-encrypted) ====================
export async function getPrivatePhotos() {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_PHOTOS) return [];
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS);
    return response.documents;
  } catch (error) {
    console.error('Error fetching private photos:', error);
    return [];
  }
}

export async function createPrivatePhoto(data: {
  title: string;
  caption?: string;
  author?: string;
  fileId?: string;
  url?: string;
}) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_PHOTOS) throw new Error('Database not configured');
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS, ID.unique(), {
      title: data.title,
      caption: data.caption || '',
      author: data.author || 'Lateef',
      fileId: data.fileId || '',
      url: data.url || '',
      likes: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'private_photo',
    });
    return doc;
  } catch (error) {
    console.error('Error creating private photo:', error);
    throw error;
  }
}

export async function updatePrivatePhoto(id: string, data: Partial<{
  title: string;
  caption: string;
  author: string;
  likes: number;
}>) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_PHOTOS) throw new Error('Database not configured');
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS, id, data);
    return doc;
  } catch (error) {
    console.error('Error updating private photo:', error);
    throw error;
  }
}

export async function deletePrivatePhoto(id: string) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_PHOTOS) return false;
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS, id);
    return true;
  } catch (error) {
    console.error('Error deleting private photo:', error);
    throw error;
  }
}

export async function likePrivatePhoto(id: string) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_PHOTOS) return;
    const photo = await databases.getDocument(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS, id);
    const currentLikes = photo.likes || 0;
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS, id, {
      likes: currentLikes + 1,
    });
    return doc;
  } catch (error) {
    console.error('Error liking photo:', error);
    throw error;
  }
}

// ============================================================
// END-TO-END ENCRYPTED FUNCTIONS (Private Vault Only)
// ============================================================

// ==================== ENCRYPTED PRIVATE LETTERS (Vault) ====================
export async function createEncryptedPrivateLetter(data: {
  title: string;
  content: string;
  author?: string;
  category?: string;
}) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_LETTERS) throw new Error('Database not configured');

    console.log('🔒 Encrypting private letter...');

    const encryptedTitle = await encryptionService.encryptText(data.title);
    const encryptedContent = await encryptionService.encryptText(data.content);

    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.PRIVATE_LETTERS, ID.unique(), {
      title_encrypted: JSON.stringify(encryptedTitle),
      content_encrypted: JSON.stringify(encryptedContent),
      author: data.author || 'Lateef',
      category: data.category || 'Love Note',
      date: new Date().toISOString().split('T')[0],
      type: 'private_letter',
      isEncrypted: true,
    });

    console.log('✅ Encrypted private letter saved');
    return doc;
  } catch (error) {
    console.error('❌ Error creating encrypted private letter:', error);
    throw error;
  }
}

export async function getEncryptedPrivateLetters() {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_LETTERS) return [];

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRIVATE_LETTERS);

    const decryptedDocs = await Promise.all(
      response.documents.map(async (doc: any) => {
        if (doc.isEncrypted && doc.title_encrypted && doc.content_encrypted) {
          try {
            const titleData = JSON.parse(doc.title_encrypted) as EncryptedData;
            const contentData = JSON.parse(doc.content_encrypted) as EncryptedData;

            const title = await encryptionService.decryptText(titleData);
            const content = await encryptionService.decryptText(contentData);

            return { ...doc, title, content, title_encrypted: undefined, content_encrypted: undefined };
          } catch (decryptError) {
            console.error('⚠️ Failed to decrypt private letter:', decryptError);
            return doc;
          }
        }
        return doc;
      })
    );

    return decryptedDocs;
  } catch (error) {
    console.error('❌ Error fetching encrypted private letters:', error);
    return [];
  }
}

export async function updateEncryptedPrivateLetter(id: string, data: Partial<{
  title: string;
  content: string;
  author: string;
  category: string;
}>) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_LETTERS) throw new Error('Database not configured');

    const updatePayload: Record<string, any> = {};

    if (data.title !== undefined) {
      const encryptedTitle = await encryptionService.encryptText(data.title);
      updatePayload.title_encrypted = JSON.stringify(encryptedTitle);
    }
    if (data.content !== undefined) {
      const encryptedContent = await encryptionService.encryptText(data.content);
      updatePayload.content_encrypted = JSON.stringify(encryptedContent);
    }
    if (data.author !== undefined) updatePayload.author = data.author;
    if (data.category !== undefined) updatePayload.category = data.category;

    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.PRIVATE_LETTERS, id, updatePayload);
    return doc;
  } catch (error) {
    console.error('❌ Error updating encrypted private letter:', error);
    throw error;
  }
}

export async function deleteEncryptedPrivateLetter(id: string) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_LETTERS) return false;
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PRIVATE_LETTERS, id);
    return true;
  } catch (error) {
    console.error('❌ Error deleting encrypted private letter:', error);
    throw error;
  }
}

// ==================== ENCRYPTED PRIVATE PHOTOS (Vault) ====================
export async function createEncryptedPrivatePhoto(data: {
  title: string;
  caption?: string;
  author?: string;
  fileId?: string;
  url?: string;
}) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_PHOTOS) throw new Error('Database not configured');

    console.log('🔒 Encrypting private photo...');

    const encryptedTitle = await encryptionService.encryptText(data.title);
    const encryptedCaption = data.caption ? await encryptionService.encryptText(data.caption) : '';

    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS, ID.unique(), {
      title_encrypted: JSON.stringify(encryptedTitle),
      caption_encrypted: encryptedCaption ? JSON.stringify(encryptedCaption) : '',
      author: data.author || 'Lateef',
      fileId: data.fileId || '',
      url: data.url || '',
      likes: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'private_photo',
      isEncrypted: true,
    });

    console.log('✅ Encrypted private photo saved');
    return doc;
  } catch (error) {
    console.error('❌ Error creating encrypted private photo:', error);
    throw error;
  }
}

export async function getEncryptedPrivatePhotos() {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_PHOTOS) return [];

    console.log('🔓 Fetching encrypted private photos...');

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS);

    const decryptedDocs = await Promise.all(
      response.documents.map(async (doc: any) => {
        if (doc.isEncrypted && doc.title_encrypted) {
          try {
            const titleData = JSON.parse(doc.title_encrypted) as EncryptedData;
            const title = await encryptionService.decryptText(titleData);

            let caption = '';
            if (doc.caption_encrypted) {
              try {
                const captionData = JSON.parse(doc.caption_encrypted) as EncryptedData;
                caption = await encryptionService.decryptText(captionData);
              } catch (e) {
                caption = doc.caption || '';
              }
            }

            return { 
              ...doc, 
              title, 
              caption, 
              title_encrypted: undefined, 
              caption_encrypted: undefined 
            };
          } catch (decryptError) {
            console.error('⚠️ Failed to decrypt private photo:', decryptError);
            return doc;
          }
        }
        return doc;
      })
    );

    console.log(`✅ Decrypted ${decryptedDocs.length} private photos`);
    return decryptedDocs;
  } catch (error) {
    console.error('❌ Error fetching encrypted private photos:', error);
    return [];
  }
}

export async function updateEncryptedPrivatePhoto(id: string, data: Partial<{
  title: string;
  caption: string;
  author: string;
  likes: number;
}>) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_PHOTOS) throw new Error('Database not configured');

    const updatePayload: Record<string, any> = {};

    if (data.title !== undefined) {
      const encryptedTitle = await encryptionService.encryptText(data.title);
      updatePayload.title_encrypted = JSON.stringify(encryptedTitle);
    }
    if (data.caption !== undefined) {
      const encryptedCaption = await encryptionService.encryptText(data.caption);
      updatePayload.caption_encrypted = JSON.stringify(encryptedCaption);
    }
    if (data.author !== undefined) updatePayload.author = data.author;
    if (data.likes !== undefined) updatePayload.likes = data.likes;

    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS, id, updatePayload);
    return doc;
  } catch (error) {
    console.error('❌ Error updating encrypted private photo:', error);
    throw error;
  }
}

export async function deleteEncryptedPrivatePhoto(id: string, fileId?: string) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.PRIVATE_PHOTOS) return false;

    if (fileId) {
      try {
        if (BUCKET_ID) await storage.deleteFile(BUCKET_ID, fileId);
      } catch (e) {
        console.error('⚠️ Failed to delete encrypted file from storage:', e);
      }
      try {
        await databases.deleteDocument(DATABASE_ID, 'encrypted_metadata', fileId);
      } catch (e) {
        try {
          await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS, fileId);
        } catch (e2) {
          // not fatal — orphaned metadata doc, not the user-facing photo doc
        }
      }
    }

    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS, id);
    return true;
  } catch (error) {
    console.error('❌ Error deleting encrypted private photo:', error);
    throw error;
  }
}

// ==================== ENCRYPTED FILE UPLOAD ====================
export async function uploadEncryptedFile(file: File, metadata?: any) {
  try {
    if (!BUCKET_ID) throw new Error('Storage bucket not configured');
    if (!DATABASE_ID) throw new Error('Database not configured');

    console.log('🔒 Encrypting file before upload...');

    const encryptedFile: EncryptedFile = await encryptionService.encryptFile(file);

    const encryptedBytes = Buffer.from(encryptedFile.encrypted, 'base64');
    const encryptedBlob = new Blob([encryptedBytes]);
    const encryptedFileObj = new File(
      [encryptedBlob],
      `${file.name}.encrypted`,
      { type: 'application/octet-stream' }
    );

    const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), encryptedFileObj);

    const encryptedData = {
      fileId: uploaded.$id,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      iv: encryptedFile.iv,
      authTag: encryptedFile.authTag,
      salt: encryptedFile.salt,
      keyId: encryptedFile.keyId,
      version: encryptedFile.version || 1,
      fileHash: encryptedFile.fileHash,
      algorithm: encryptedFile.algorithm || 'AES-GCM-256',
      metadata: metadata ? JSON.stringify(metadata) : '',
      isEncrypted: true,
    };

    await databases.createDocument(
      DATABASE_ID, 
      'encrypted_metadata',
      uploaded.$id,    
      encryptedData
    );

    console.log('✅ Encrypted file uploaded');
    return uploaded;
  } catch (error) {
    console.error('❌ Error uploading encrypted file:', error);
    throw error;
  }
}

export async function downloadEncryptedFile(fileId: string) {
  try {
    if (!BUCKET_ID) throw new Error('Storage bucket not configured');
    if (!DATABASE_ID) throw new Error('Database not configured');

    console.log('🔓 Downloading and decrypting file...');

    let metadata: any = null;
    
    try {
      metadata = await databases.getDocument(DATABASE_ID, 'encrypted_metadata', fileId);
      console.log('📦 Metadata found in encrypted_metadata');
    } catch {
      try {
        const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS);
        metadata = docs.documents.find((d: any) => d.fileId === fileId || d.$id === fileId);
        if (metadata) {
          console.log('📦 Metadata found in private_photos');
        }
      } catch (e) {
        console.log('📦 Metadata not found in private_photos either');
      }
    }

    if (!metadata || !metadata.isEncrypted) {
      throw new Error('File is not encrypted or metadata not found');
    }

    for (const field of ['iv', 'authTag', 'salt', 'fileHash', 'keyId'] as const) {
      if (!metadata[field] || typeof metadata[field] !== 'string') {
        throw new Error(`Missing or invalid field: ${field}`);
      }
    }

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    const response = await fetch(
      `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/download?project=${projectId}`,
      { credentials: 'include' }
    );

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const encryptedArrayBuffer = await response.arrayBuffer();

    const encryptedFile: EncryptedFile = {
      encrypted: Buffer.from(encryptedArrayBuffer).toString('base64'),
      iv: metadata.iv,
      authTag: metadata.authTag,
      salt: metadata.salt,
      keyId: metadata.keyId,
      version: metadata.version || 1,
      fileHash: metadata.fileHash,
      algorithm: metadata.algorithm || 'AES-GCM-256',
    };

    const decryptedData = await encryptionService.decryptFile(encryptedFile);

    console.log('✅ File decrypted successfully');

    return {
      data: decryptedData,
      originalName: metadata.originalName || 'file',
      mimeType: metadata.mimeType || 'application/octet-stream',
      isValid: true,
    };
  } catch (error) {
    console.error('❌ Error downloading encrypted file:', error);
    throw error;
  }
}

// ==================== FILE UPLOAD (Plain - For non-encrypted files) ====================
export async function uploadFile(file: File) {
  try {
    if (!BUCKET_ID) throw new Error('Storage bucket ID not configured');
    const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export function getFileUrl(fileId: string) {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${projectId}`;
}

export async function deleteFile(fileId: string) {
  try {
    if (!BUCKET_ID || !fileId) return false;
    await storage.deleteFile(BUCKET_ID, fileId);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export { COLLECTIONS };