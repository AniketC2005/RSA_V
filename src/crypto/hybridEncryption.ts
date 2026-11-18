import { HybridPackage } from '../types/rsa';
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  arrayBufferToHex,
  hexToArrayBuffer,
  stringToUtf8Bytes,
  utf8BytesToString
} from './encoding';

/**
 * Perform Hybrid Encryption:
 * 1. Generates an ephemeral AES-256 key (raw 32 bytes)
 * 2. Generates a cryptographically random 96-bit (12-byte) IV / nonce
 * 3. Encrypts plaintext with AES-GCM (which appends a 128-bit authentication tag)
 * 4. Encrypts the raw AES-256 key using the recipient's RSA public key (RSA-OAEP with SHA-256)
 * 5. Returns a structured JSON package containing all components
 */
export async function encryptHybrid(
  rsaPublicKey: CryptoKey,
  plaintext: string,
  keySizeBits: number = 2048,
  filename?: string
): Promise<{
  packageData: HybridPackage;
  packageJson: string;
  rawAesKeyHex: string;
  encryptedKeyBase64: string;
  ivHex: string;
  ciphertextBase64: string;
}> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available.');
  }

  // 1. Generate random AES-GCM 256-bit key
  const aesKey = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable so we can export raw bytes and wrap with RSA
    ['encrypt', 'decrypt']
  );

  // 2. Generate 96-bit (12 bytes) random nonce/IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // 3. Encrypt plaintext using AES-GCM
  const plaintextBytes = stringToUtf8Bytes(plaintext);
  const encryptedCiphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128, // 16-byte authentication tag included at the end of buffer
    },
    aesKey,
    plaintextBytes
  );

  // 4. Export raw AES key (32 bytes)
  const rawAesKeyBuffer = await window.crypto.subtle.exportKey('raw', aesKey);
  const rawAesKeyHex = arrayBufferToHex(rawAesKeyBuffer);

  // 5. Encrypt raw AES key using RSA-OAEP
  const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    rsaPublicKey,
    rawAesKeyBuffer
  );

  const encryptedKeyBase64 = arrayBufferToBase64(encryptedAesKeyBuffer);
  const ciphertextBase64 = arrayBufferToBase64(encryptedCiphertextBuffer);
  const ivHex = arrayBufferToHex(iv.buffer);

  const packageData: HybridPackage = {
    version: '1.0',
    algorithm: 'RSA-OAEP-SHA256 + AES-GCM-256',
    rsaKeySize: keySizeBits,
    encryptedAesKeyBase64: encryptedKeyBase64,
    ivHex: ivHex,
    ciphertextBase64: ciphertextBase64,
    timestamp: new Date().toISOString(),
    metadata: {
      plaintextBytesLength: plaintextBytes.length,
      filename: filename || 'secret-document.txt',
    },
  };

  return {
    packageData,
    packageJson: JSON.stringify(packageData, null, 2),
    rawAesKeyHex,
    encryptedKeyBase64,
    ivHex,
    ciphertextBase64,
  };
}

/**
 * Decrypt a Hybrid Package:
 * 1. Decrypts the encapsulated AES key using RSA private key (RSA-OAEP)
 * 2. Imports the recovered 256-bit AES key
 * 3. Decrypts and authenticates the ciphertext using AES-GCM with the stored nonce
 * 4. Returns the verified plaintext and metadata
 */
export async function decryptHybrid(
  rsaPrivateKey: CryptoKey,
  hybridPackage: HybridPackage | string
): Promise<{
  plaintext: string;
  recoveredAesKeyHex: string;
  metadata?: {
    plaintextBytesLength: number;
    filename?: string;
  };
}> {
  let pkg: HybridPackage;
  if (typeof hybridPackage === 'string') {
    try {
      pkg = JSON.parse(hybridPackage);
    } catch {
      throw new Error('Invalid JSON format for Hybrid Encryption package.');
    }
  } else {
    pkg = hybridPackage;
  }

  if (!pkg.encryptedAesKeyBase64 || !pkg.ivHex || !pkg.ciphertextBase64) {
    throw new Error('Malformed hybrid package: Missing required encrypted fields (key, iv, or ciphertext).');
  }

  // 1. Decrypt AES key with RSA-OAEP
  let encryptedAesKeyBuffer: ArrayBuffer;
  try {
    encryptedAesKeyBuffer = base64ToArrayBuffer(pkg.encryptedAesKeyBase64);
  } catch {
    throw new Error('Failed to decode Base64 of encrypted AES key.');
  }

  let rawAesKeyBuffer: ArrayBuffer;
  try {
    rawAesKeyBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      rsaPrivateKey,
      encryptedAesKeyBuffer
    );
  } catch (err: any) {
    throw new Error('Failed to decrypt AES key with RSA private key. The private key does not match or the key package is corrupted.');
  }

  const recoveredAesKeyHex = arrayBufferToHex(rawAesKeyBuffer);

  // 2. Import decrypted AES key
  const aesKey = await window.crypto.subtle.importKey(
    'raw',
    rawAesKeyBuffer,
    {
      name: 'AES-GCM',
    },
    false,
    ['decrypt']
  );

  // 3. Decrypt ciphertext using AES-GCM
  const ivBuffer = hexToArrayBuffer(pkg.ivHex);
  const ciphertextBuffer = base64ToArrayBuffer(pkg.ciphertextBase64);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(ivBuffer),
        tagLength: 128,
      },
      aesKey,
      ciphertextBuffer
    );

    const plaintext = utf8BytesToString(new Uint8Array(decryptedBuffer));
    return {
      plaintext,
      recoveredAesKeyHex,
      metadata: pkg.metadata,
    };
  } catch (err: any) {
    throw new Error('AES-GCM authentication failed! The ciphertext or nonce has been altered, or data integrity was compromised.');
  }
}
