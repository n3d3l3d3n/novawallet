
import { User } from '../types';

// AES-GCM Configuration
const ALGORITHM = { name: 'AES-GCM', length: 256 };
const HASH = 'SHA-256';

export const encryptionService = {
  
  /**
   * Derives a shared session key based on two user IDs.
   * In a production Signal implementation, this would use X3DH (Diffie-Hellman).
   * For this prototype, we use a deterministic derivation to ensure A and B 
   * generate the same key without a central key server.
   */
  deriveSessionKey: async (userId1: string, userId2: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    // Sort IDs to ensure both users derive the same key
    const participants = [userId1, userId2].sort().join(':');
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(participants),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('nova_secure_salt_v1'), // Fixed salt for prototype
        iterations: 100000,
        hash: HASH
      },
      keyMaterial,
      ALGORITHM,
      false, // Key is not extractable
      ['encrypt', 'decrypt']
    );
  },

  encrypt: async (text: string, sharedKey: CryptoKey): Promise<string> => {
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      sharedKey,
      encoder.encode(text)
    );

    // Convert to Base64 strings
    const ivHex = encryptionService.buf2hex(iv);
    const cipherHex = encryptionService.buf2hex(encryptedBuffer);
    
    // Return format: IV:CIPHERTEXT
    return `${ivHex}:${cipherHex}`;
  },

  decrypt: async (encryptedText: string, sharedKey: CryptoKey): Promise<string> => {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 2) return encryptedText; // Fallback for legacy plain text

      const iv = encryptionService.hex2buf(parts[0]);
      const ciphertext = encryptionService.hex2buf(parts[1]);

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        sharedKey,
        ciphertext
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (e) {
      console.warn('Decryption failed:', e);
      return '🔒 Decryption Error';
    }
  },

  // --- Utilities ---
  buf2hex: (buffer: ArrayBuffer | Uint8Array): string => {
    return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  },

  hex2buf: (hex: string): Uint8Array => {
    const bytes = new Uint8Array(Math.ceil(hex.length / 2));
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    return bytes;
  }
};
