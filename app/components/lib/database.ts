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
// REGULAR (NON-ENCRYPTED) FUNCTIONS - For backward compatibility
// ============================================================

// ==================== LETTERS ====================
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
      ...data,
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

// ==================== NOTES ====================
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
      ...data,
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

// ==================== MEMORIES ====================
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
      ...data,
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

// ==================== PROMISES ====================
const PROMISES_COLLECTION = process.env.NEXT_PUBLIC_COLLECTION_PROMISES || COLLECTIONS.PROMISES || 'promises';

export async function getPromises() {
  try {
    if (!DATABASE_ID || !PROMISES_COLLECTION) {
      console.error('❌ Database or Collection not configured');
      return [];
    }
    const response = await databases.listDocuments(DATABASE_ID, PROMISES_COLLECTION);
    return response.documents;
  } catch (error: any) {
    console.error('❌ Error fetching promises:', error.message);
    return [];
  }
}

export async function createPromise(data: { text: string; completed?: boolean }) {
  try {
    if (!DATABASE_ID || !PROMISES_COLLECTION) {
      throw new Error('Database or Collection not configured');
    }
    const uniqueId = Date.now();
    const doc = await databases.createDocument(
      DATABASE_ID,
      PROMISES_COLLECTION,
      ID.unique(),
      {
        id: uniqueId,
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
    if (!DATABASE_ID || !PROMISES_COLLECTION) {
      throw new Error('Database or Collection not configured');
    }
    const doc = await databases.updateDocument(DATABASE_ID, PROMISES_COLLECTION, id, data);
    return doc;
  } catch (error: any) {
    console.error('❌ Error updating promise:', error.message);
    throw error;
  }
}

export async function deletePromise(id: string) {
  try {
    if (!DATABASE_ID || !PROMISES_COLLECTION) {
      return false;
    }
    await databases.deleteDocument(DATABASE_ID, PROMISES_COLLECTION, id);
    return true;
  } catch (error: any) {
    console.error('❌ Error deleting promise:', error.message);
    throw error;
  }
}

export async function savePromises(promises: Array<{ text: string; completed: boolean }>) {
  try {
    if (!DATABASE_ID || !PROMISES_COLLECTION) {
      return false;
    }
    const existing = await getPromises();
    for (const promise of promises) {
      const existingDoc = existing.find((p: any) => p.text === promise.text);
      if (existingDoc && existingDoc.$id) {
        await databases.updateDocument(DATABASE_ID, PROMISES_COLLECTION, existingDoc.$id, {
          text: promise.text,
          completed: promise.completed,
        });
      } else {
        await databases.createDocument(DATABASE_ID, PROMISES_COLLECTION, ID.unique(), {
          id: Date.now() + Math.floor(Math.random() * 1000),
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

// ==================== PRIVATE LETTERS (Vault) ====================
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
      ...data,
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

// ==================== PRIVATE PHOTOS (Vault) ====================
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
      ...data,
      author: data.author || 'Lateef',
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

// ==================== FILE UPLOAD ====================
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

// ============================================================
// END-TO-END ENCRYPTED FUNCTIONS
// ============================================================

// ==================== ENCRYPTED LETTERS ====================
export async function createEncryptedLetter(data: {
  title: string;
  content: string;
  from?: string
}) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.LETTERS) throw new Error('Database or Collection not configured');

    console.log('🔒 Encrypting letter...');

    const encryptedTitle = await encryptionService.encryptText(data.title);
    const encryptedContent = await encryptionService.encryptText(data.content);

    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.LETTERS, ID.unique(), {
      title_encrypted: JSON.stringify(encryptedTitle),
      content_encrypted: JSON.stringify(encryptedContent),
      from: data.from || 'Lateef',
      date: new Date().toISOString().split('T')[0],
      type: 'love_letter',
      isEncrypted: true,
      encryption_version: 1,
      algorithm: 'AES-GCM-256',
    });

    console.log('✅ Encrypted letter saved');
    return doc;
  } catch (error) {
    console.error('❌ Error creating encrypted letter:', error);
    throw error;
  }
}

export async function getEncryptedLetters() {
  try {
    if (!DATABASE_ID || !COLLECTIONS.LETTERS) return [];

    console.log('🔓 Fetching and decrypting letters...');

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LETTERS);

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
            console.error('⚠️ Failed to decrypt letter:', decryptError);
            return doc;
          }
        }
        return doc;
      })
    );

    console.log(`✅ Decrypted ${decryptedDocs.length} letters`);
    return decryptedDocs;
  } catch (error) {
    console.error('❌ Error fetching encrypted letters:', error);
    return [];
  }
}

// ==================== ENCRYPTED NOTES ====================
export async function createEncryptedNote(data: { text: string; from?: string }) {
  try {
    if (!DATABASE_ID || !COLLECTIONS.NOTES) throw new Error('Database not configured');

    console.log('🔒 Encrypting note...');

    const encryptedText = await encryptionService.encryptText(data.text);

    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.NOTES, ID.unique(), {
      text_encrypted: JSON.stringify(encryptedText),
      from: data.from || 'Lateef',
      date: new Date().toISOString().split('T')[0],
      type: 'love_note',
      isEncrypted: true,
      encryption_version: 1,
      algorithm: 'AES-GCM-256',
    });

    console.log('✅ Encrypted note saved');
    return doc;
  } catch (error) {
    console.error('❌ Error creating encrypted note:', error);
    throw error;
  }
}

export async function getEncryptedNotes() {
  try {
    if (!DATABASE_ID || !COLLECTIONS.NOTES) return [];

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.NOTES);

    const decryptedDocs = await Promise.all(
      response.documents.map(async (doc: any) => {
        if (doc.isEncrypted && doc.text_encrypted) {
          try {
            const textData = JSON.parse(doc.text_encrypted) as EncryptedData;
            const text = await encryptionService.decryptText(textData);
            return { ...doc, text, text_encrypted: undefined };
          } catch (decryptError) {
            console.error('⚠️ Failed to decrypt note:', decryptError);
            return doc;
          }
        }
        return doc;
      })
    );

    return decryptedDocs;
  } catch (error) {
    console.error('❌ Error fetching encrypted notes:', error);
    return [];
  }
}

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
      encryption_version: 1,
      algorithm: 'AES-GCM-256',
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
      encryption_version: 1,
      algorithm: 'AES-GCM-256',
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

            return { ...doc, title, caption, title_encrypted: undefined, caption_encrypted: undefined };
          } catch (decryptError) {
            console.error('⚠️ Failed to decrypt private photo:', decryptError);
            return doc;
          }
        }
        return doc;
      })
    );

    return decryptedDocs;
  } catch (error) {
    console.error('❌ Error fetching encrypted private photos:', error);
    return [];
  }
}

// ==================== ENCRYPTED FILE UPLOAD ====================
// NOTE: `EncryptedFile` (from encryption.ts) now stores encrypted, iv, authTag,
// and salt as base64 STRINGS so the object is safely JSON-serializable and
// survives being written to/read from the database. Do not treat these
// fields as Buffer/Uint8Array anywhere in this file.

export async function uploadEncryptedFile(file: File, metadata?: any) {
  try {
    if (!BUCKET_ID) throw new Error('Storage bucket not configured');
    if (!DATABASE_ID) throw new Error('Database not configured');

    console.log('🔒 Encrypting file before upload...');

    // Encrypt the file before uploading. encryptedFile.encrypted is a base64 string.
    const encryptedFile: EncryptedFile = await encryptionService.encryptFile(file);

    // Convert the base64 encrypted payload back into raw bytes for upload.
    const encryptedBytes = Buffer.from(encryptedFile.encrypted, 'base64');
    const encryptedBlob = new Blob([encryptedBytes]);
    const encryptedFileObj = new File(
      [encryptedBlob],
      `${file.name}.encrypted`,
      { type: 'application/octet-stream' }
    );

    // Upload encrypted file to Appwrite Storage
    const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), encryptedFileObj);

    // Store encryption metadata in database.
    // iv / authTag / salt are already base64 strings — store as-is.
    const encryptedData = {
      fileId: uploaded.$id,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      iv: encryptedFile.iv,
      authTag: encryptedFile.authTag,
      salt: encryptedFile.salt,
      keyId: encryptedFile.keyId,
      version: encryptedFile.version,
      fileHash: encryptedFile.fileHash,
      algorithm: encryptedFile.algorithm,
      metadata: metadata ? JSON.stringify(metadata) : '',
      isEncrypted: true,
      encryption_version: 1,
    };

    // Store metadata in database (you need to create an 'encrypted_metadata' collection)
    try {
      await databases.createDocument(DATABASE_ID, 'encrypted_metadata', ID.unique(), encryptedData);
    } catch (e) {
      console.log('Metadata collection may not exist. Storing in default collection.');
      await databases.createDocument(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS, ID.unique(), {
        ...encryptedData,
        type: 'encrypted_file_metadata',
      });
    }

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

    // Get file metadata - try both collections
    let metadata: any = null;
    try {
      metadata = await databases.getDocument(DATABASE_ID, 'encrypted_metadata', fileId);
    } catch {
      // Try private_photos collection
      const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRIVATE_PHOTOS);
      metadata = docs.documents.find((d: any) => d.fileId === fileId || d.$id === fileId);
    }

    if (!metadata || !metadata.isEncrypted) {
      throw new Error('File is not encrypted or metadata not found');
    }

    // Basic sanity check before handing off to the encryption service —
    // this is what used to surface as a vague "error hash and iv".
    for (const field of ['iv', 'authTag', 'salt', 'fileHash', 'keyId'] as const) {
      if (!metadata[field] || typeof metadata[field] !== 'string') {
        throw new Error(`Encrypted file metadata is missing or malformed field: ${field}`);
      }
    }

    // Download encrypted file bytes from Appwrite
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    const response = await fetch(
      `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/download?project=${projectId}`
    );

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const encryptedArrayBuffer = await response.arrayBuffer();

    // Reconstruct EncryptedFile object — encrypted must be base64, matching
    // what encryptionService.decryptFile()/rehydrateEncryptedFile() expect.
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

    // Decrypt file (decryptFile already verifies integrity internally and
    // throws if the hash doesn't match, so no need to re-verify here).
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

export { COLLECTIONS };