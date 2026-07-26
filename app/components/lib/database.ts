// app/components/lib/database.ts
import { databases, DATABASE_ID, storage, BUCKET_ID, ID } from './appwrite';

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



// app/components/lib/database.ts
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
    
    // Generate a unique ID for the 'id' field
    const uniqueId = Date.now();
    
    const doc = await databases.createDocument(
      DATABASE_ID, 
      PROMISES_COLLECTION, 
      ID.unique(), 
      {
        id: uniqueId,  // Required if collection has 'id' attribute
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
      // Find existing by text or create new
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

export { COLLECTIONS };