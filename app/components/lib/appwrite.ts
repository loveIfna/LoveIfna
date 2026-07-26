// app/lib/appwrite.ts
import { Client, Account, Databases, Storage, ID } from 'appwrite';

// Initialize client
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Export services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export constants with fallback values
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || '';

// Single bucket for everything
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '';

// Export ID for unique IDs
export { ID };

// Export client if needed
export default client;