// app/lib/encryption.ts
import { Buffer } from 'buffer';

export interface EncryptedData {
  encrypted: string;      // Base64 encoded encrypted data
  iv: string;            // Base64 encoded IV (12 bytes)
  salt: string;          // Base64 encoded salt (16 bytes)
  authTag: string;       // Base64 encoded authentication tag (16 bytes)
  keyId: string;         // Key identifier for rotation
  version: number;       // Encryption version
  algorithm: string;     // 'AES-GCM-256'
}

export interface EncryptedFile {
  encrypted: string;     // Base64 encoded encrypted blob
  iv: string;           // Base64 encoded IV (12 bytes)
  authTag: string;      // Base64 encoded authentication tag (16 bytes)
  salt: string;         // Base64 encoded salt (16 bytes)
  keyId: string;        // Key identifier for rotation
  version: number;      // Encryption version
  fileHash: string;     // SHA-256 hash for integrity (hex)
  algorithm: string;    // 'AES-GCM-256'
}

/**
 * Internal type for decryption operations after rehydration
 */
interface DecryptionParams {
  encrypted: ArrayBuffer;
  iv: Uint8Array;
  authTag: Uint8Array;
  salt: Uint8Array;
  keyId: string;
}

class EncryptionService {
  private static instance: EncryptionService;
  private userPassword: string = '';
  private masterKeyRaw: ArrayBuffer | null = null;
  private isInitialized: boolean = false;

  // OWASP recommended: 600,000 iterations for PBKDF2 (2024 guidance)
  // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
  private readonly PBKDF2_ITERATIONS: number = 600000;
  private readonly SALT_LENGTH: number = 16;
  private readonly IV_LENGTH: number = 12;
  private readonly AUTH_TAG_LENGTH: number = 16;
  private readonly KEY_LENGTH: number = 256;
  private readonly ENCRYPTION_VERSION: number = 2;
  private readonly ALGORITHM: string = 'AES-GCM-256';

  // Production build check - disable verbose logging in production
  private readonly isProduction: boolean = process.env.NODE_ENV === 'production';

  private constructor() {}

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Initialize encryption service with user password
   * @param password - User's password (never stored)
   */
  public initialize(password: string): void {
    this.userPassword = password;
    this.masterKeyRaw = null;
    this.isInitialized = true;
    if (!this.isProduction) {
      console.log('🔐 Encryption service initialized');
    }
  }

  /**
   * Clear sensitive data from memory
   */
  public clearSensitiveData(): void {
    this.userPassword = '';
    this.masterKeyRaw = null;
    this.isInitialized = false;
    if (!this.isProduction) {
      console.log('🧹 Sensitive data cleared from memory');
    }
  }

  /**
   * Derive a master key raw bits from the password once and cache it
   */
  private async getMasterKeyRaw(): Promise<ArrayBuffer> {
    if (this.masterKeyRaw) {
      return this.masterKeyRaw;
    }
    this.ensureInitialized();

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.userPassword),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const staticSalt = encoder.encode('love-app-master-salt-v2');

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: staticSalt,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    this.masterKeyRaw = derivedBits;
    return derivedBits;
  }

  /**
   * Derive a document subkey using HKDF from cached master key bits (extremely fast, <1ms)
   */
  private async deriveSubkeyHKDF(keyId: string, salt: Uint8Array): Promise<CryptoKey> {
    const rawMasterKey = await this.getMasterKeyRaw();
    const masterKey = await crypto.subtle.importKey(
      'raw',
      rawMasterKey,
      'HKDF',
      false,
      ['deriveKey']
    );

    const encoder = new TextEncoder();
    return await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: salt as BufferSource,
        info: encoder.encode(keyId),
      },
      masterKey,
      {
        name: 'AES-GCM',
        length: this.KEY_LENGTH,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate random bytes using Web Crypto API
   */
  private generateRandomBytes(length: number): Uint8Array {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  }

  private generateSalt(): Uint8Array {
    return this.generateRandomBytes(this.SALT_LENGTH);
  }

  private generateIV(): Uint8Array {
    return this.generateRandomBytes(this.IV_LENGTH);
  }

  private generateKeyId(): string {
    const timestamp = Date.now().toString(36);
    const random = this.generateRandomBytes(4);
    const hex = Array.from(random)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `key-${timestamp}-${hex}`;
  }

  /**
   * Convert a Buffer/Uint8Array to a "clean" ArrayBuffer that starts at
   * byte 0 and has a length exactly matching the view.
   *
   * IMPORTANT: Buffer.from(base64, 'base64') can allocate from Node's/the
   * browser polyfill's shared internal memory pool. In that case `.buffer`
   * returns the ENTIRE underlying pool ArrayBuffer (which can be larger
   * than this Buffer, with a nonzero byteOffset) — not just the bytes you
   * actually decoded. Passing that directly to crypto.subtle.* silently
   * includes surrounding garbage bytes, which corrupts encryption/
   * decryption and integrity checks. Always go through this helper
   * instead of reading `.buffer` off a Buffer/Uint8Array directly.
   */
  private toExactArrayBuffer(view: Uint8Array): ArrayBuffer {
    // TS 5.7+ types Uint8Array as generic (Uint8Array<ArrayBufferLike>), so
    // .buffer.slice() is typed as ArrayBuffer | SharedArrayBuffer even
    // though it will only ever be a real ArrayBuffer at runtime here.
    return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer;
  }

  /**
   * Validate base64 input and convert to Uint8Array
   * @throws Error with descriptive message if validation fails
   */
  private validateAndDecodeBase64(base64: string, expectedLength: number, fieldName: string): Uint8Array {
    if (!base64 || typeof base64 !== 'string') {
      throw new Error(`Invalid ${fieldName}: expected non-empty base64 string, got ${typeof base64}`);
    }

    let decoded: Buffer;
    try {
      decoded = Buffer.from(base64, 'base64');
    } catch (error) {
      throw new Error(`Invalid ${fieldName}: failed to decode base64 - ${error instanceof Error ? error.message : 'unknown error'}`);
    }

    if (decoded.length !== expectedLength) {
      throw new Error(
        `Invalid ${fieldName}: expected ${expectedLength} bytes, got ${decoded.length} bytes`
      );
    }

    // new Uint8Array(decoded) copies into a fresh, exactly-sized ArrayBuffer
    // (the TypedArray constructor copies when given another TypedArray),
    // so this is already safe — unlike reading `.buffer` directly.
    return new Uint8Array(decoded);
  }

  /**
   * Decode an arbitrary-length base64 payload (the ciphertext itself) into
   * a Uint8Array backed by an exactly-sized ArrayBuffer.
   */
  private decodeBase64Payload(base64: string, fieldName: string): Uint8Array {
    if (!base64 || typeof base64 !== 'string') {
      throw new Error(`Invalid ${fieldName}: missing or invalid base64 string`);
    }
    let decoded: Buffer;
    try {
      decoded = Buffer.from(base64, 'base64');
    } catch (error) {
      throw new Error(`Invalid ${fieldName}: failed to decode - ${error instanceof Error ? error.message : 'unknown error'}`);
    }
    return new Uint8Array(decoded);
  }

  /**
   * Validate and rehydrate encrypted data for decryption
   * @throws Error with descriptive message if validation fails
   */
  private rehydrateEncryptedData(encryptedData: EncryptedData): DecryptionParams {
    const iv = this.validateAndDecodeBase64(encryptedData.iv, this.IV_LENGTH, 'IV');
    const salt = this.validateAndDecodeBase64(encryptedData.salt, this.SALT_LENGTH, 'salt');
    const authTag = this.validateAndDecodeBase64(encryptedData.authTag, this.AUTH_TAG_LENGTH, 'authTag');

    if (!encryptedData.encrypted || typeof encryptedData.encrypted !== 'string') {
      throw new Error('Invalid encrypted data: missing or invalid encrypted field');
    }

    const encryptedView = this.decodeBase64Payload(encryptedData.encrypted, 'encrypted');

    return {
      encrypted: this.toExactArrayBuffer(encryptedView),
      iv,
      authTag,
      salt,
      keyId: encryptedData.keyId,
    };
  }

  /**
   * Validate and rehydrate encrypted file data for decryption
   * @throws Error with descriptive message if validation fails
   */
  private rehydrateEncryptedFile(encryptedFile: EncryptedFile): DecryptionParams {
    const iv = this.validateAndDecodeBase64(encryptedFile.iv, this.IV_LENGTH, 'IV');
    const salt = this.validateAndDecodeBase64(encryptedFile.salt, this.SALT_LENGTH, 'salt');
    const authTag = this.validateAndDecodeBase64(encryptedFile.authTag, this.AUTH_TAG_LENGTH, 'authTag');

    if (!encryptedFile.encrypted || typeof encryptedFile.encrypted !== 'string') {
      throw new Error('Invalid encrypted file: missing or invalid encrypted field');
    }

    const encryptedView = this.decodeBase64Payload(encryptedFile.encrypted, 'encrypted');

    return {
      encrypted: this.toExactArrayBuffer(encryptedView),
      iv,
      authTag,
      salt,
      keyId: encryptedFile.keyId,
    };
  }

  /**
   * Derive a key from password using PBKDF2 (Web Crypto API)
   * OWASP recommended: 600,000 iterations (2024)
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: this.KEY_LENGTH,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data with AES-GCM
   */
  private async encryptWithAES(data: Uint8Array, key: CryptoKey, iv: Uint8Array): Promise<{ encrypted: ArrayBuffer; authTag: Uint8Array }> {
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      data as BufferSource
    );

    // Extract auth tag (last 16 bytes for AES-GCM)
    const encryptedArray = new Uint8Array(encrypted);
    const authTag = encryptedArray.slice(encryptedArray.length - this.AUTH_TAG_LENGTH);
    const encryptedData = encryptedArray.slice(0, encryptedArray.length - this.AUTH_TAG_LENGTH);

    // Note: TypedArray.prototype.slice() always copies into a fresh,
    // exactly-sized ArrayBuffer, so `.buffer` here is safe (unlike Buffer
    // instances created via Buffer.from(), see toExactArrayBuffer above).
    return {
      encrypted: encryptedData.buffer,
      authTag: authTag,
    };
  }

  /**
   * Decrypt data with AES-GCM
   */
  private async decryptWithAES(
    encrypted: ArrayBuffer,
    key: CryptoKey,
    iv: Uint8Array,
    authTag: Uint8Array
  ): Promise<ArrayBuffer> {
    // Combine encrypted data with auth tag
    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(encryptedArray.length + authTag.length);
    combined.set(encryptedArray);
    combined.set(authTag, encryptedArray.length);

    return await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      combined as BufferSource
    );
  }

  /**
   * Check if encryption is available and initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.userPassword) {
      throw new Error('Encryption service not initialized. Call initialize() with your password first.');
    }
  }

  /**
   * Encrypt text data
   * @param text - Plain text to encrypt
   * @returns EncryptedData with all fields as base64 strings (JSON-serializable)
   */
  public async encryptText(text: string): Promise<EncryptedData> {
    this.ensureInitialized();

    const salt = this.generateSalt();
    const iv = this.generateIV();
    const keyId = this.generateKeyId();

    // Derive subkey fast using HKDF
    const key = await this.deriveSubkeyHKDF(keyId, salt);

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const { encrypted, authTag } = await this.encryptWithAES(data, key, iv);

    return {
      encrypted: Buffer.from(encrypted).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
      salt: Buffer.from(salt).toString('base64'),
      authTag: Buffer.from(authTag).toString('base64'),
      keyId: keyId,
      version: this.ENCRYPTION_VERSION,
      algorithm: this.ALGORITHM,
    };
  }

  /**
   * Decrypt text data
   * @param encryptedData - Encrypted data (from encryptText)
   * @returns Decrypted plain text
   */
  public async decryptText(encryptedData: EncryptedData): Promise<string> {
    this.ensureInitialized();

    // Validate and rehydrate data
    const { encrypted, iv, authTag, salt, keyId } = this.rehydrateEncryptedData(encryptedData);

    // Support both Version 2 (HKDF) and Version 1 (PBKDF2)
    const key = (encryptedData.version === 2)
      ? await this.deriveSubkeyHKDF(keyId, salt)
      : await this.deriveKey(this.userPassword + keyId, salt);

    const decrypted = await this.decryptWithAES(encrypted, key, iv, authTag);

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Encrypt a file
   * @param file - File object or ArrayBuffer
   * @returns EncryptedFile with all fields as base64 strings (JSON-serializable)
   */
  public async encryptFile(file: File | ArrayBuffer): Promise<EncryptedFile> {
    this.ensureInitialized();

    let data: Uint8Array;
    let fileHash: string;

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      data = new Uint8Array(arrayBuffer);
      fileHash = await this.calculateHash(arrayBuffer);
    } else {
      data = new Uint8Array(file);
      fileHash = await this.calculateHash(file);
    }

    const salt = this.generateSalt();
    const iv = this.generateIV();
    const keyId = this.generateKeyId();

    // Derive subkey fast using HKDF
    const key = await this.deriveSubkeyHKDF(keyId, salt);

    const { encrypted, authTag } = await this.encryptWithAES(data, key, iv);

    return {
      encrypted: Buffer.from(encrypted).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
      authTag: Buffer.from(authTag).toString('base64'),
      salt: Buffer.from(salt).toString('base64'),
      keyId: keyId,
      version: this.ENCRYPTION_VERSION,
      fileHash: fileHash,
      algorithm: this.ALGORITHM,
    };
  }

  /**
   * Decrypt a file
   * @param encryptedFile - Encrypted file (from encryptFile)
   * @returns Decrypted file data as ArrayBuffer
   */
  public async decryptFile(encryptedFile: EncryptedFile): Promise<ArrayBuffer> {
    this.ensureInitialized();

    // Validate and rehydrate data
    const { encrypted, iv, authTag, salt, keyId } = this.rehydrateEncryptedFile(encryptedFile);

    // Support both Version 2 (HKDF) and Version 1 (PBKDF2)
    const key = (encryptedFile.version === 2)
      ? await this.deriveSubkeyHKDF(keyId, salt)
      : await this.deriveKey(this.userPassword + keyId, salt);

    const decrypted = await this.decryptWithAES(encrypted, key, iv, authTag);

    // Verify integrity
    const isValid = await this.verifyIntegrity(decrypted, encryptedFile.fileHash);
    if (!isValid) {
      throw new Error('File integrity check failed! The file may have been tampered with or corrupted.');
    }

    return decrypted;
  }

  /**
   * Calculate SHA-256 hash for integrity verification
   */
  public async calculateHash(data: ArrayBuffer | Uint8Array): Promise<string> {
    const hash = await crypto.subtle.digest('SHA-256', data as BufferSource);
    return Buffer.from(hash).toString('hex');
  }

  /**
   * Verify data integrity
   */
  public async verifyIntegrity(data: ArrayBuffer | Uint8Array, hash: string): Promise<boolean> {
    const calculatedHash = await this.calculateHash(data);
    return calculatedHash === hash;
  }

  /**
   * Encrypt an object (JSON)
   * @param obj - Object to encrypt
   * @returns EncryptedData with all fields as base64 strings
   */
  public async encryptObject(obj: any): Promise<EncryptedData> {
    const json = JSON.stringify(obj);
    return await this.encryptText(json);
  }

  /**
   * Decrypt an object (JSON)
   * @param encryptedData - Encrypted data (from encryptObject)
   * @returns Decrypted object
   */
  public async decryptObject(encryptedData: EncryptedData): Promise<any> {
    const json = await this.decryptText(encryptedData);
    return JSON.parse(json);
  }

  /**
   * Check if encryption is available
   */
  public isAvailable(): boolean {
    return typeof window !== 'undefined' &&
           !!window.crypto &&
           !!window.crypto.subtle &&
           this.isInitialized &&
           !!this.userPassword;
  }

  /**
   * Get encryption status
   */
  public getStatus(): {
    available: boolean;
    initialized: boolean;
    version: number;
    algorithm: string;
    iterations: number;
  } {
    return {
      available: this.isAvailable(),
      initialized: this.isInitialized && !!this.userPassword,
      version: this.ENCRYPTION_VERSION,
      algorithm: this.ALGORITHM,
      iterations: this.PBKDF2_ITERATIONS,
    };
  }

  /**
   * Get the current PBKDF2 iteration count (OWASP recommended)
   */
  public getIterations(): number {
    return this.PBKDF2_ITERATIONS;
  }
}

export const encryptionService = EncryptionService.getInstance();