import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  arrayBufferToHex,
  hexToArrayBuffer,
  exportSpkiToPem,
  stringToUtf8Bytes,
  utf8BytesToString
} from './encoding';
import { SecureKeyPairData } from '../types/rsa';

/**
 * Calculates maximum plaintext byte size for RSA-OAEP with SHA-256
 * Formula: k - 2*hLen - 2
 * where k is modulus size in bytes and hLen is 32 bytes for SHA-256.
 */
export function getMaxOaepPlaintextLength(keySizeBits: 2048 | 3072): number {
  const k = keySizeBits / 8;
  const hLen = 32; // SHA-256
  return k - 2 * hLen - 2;
}

/**
 * Generate cryptographically secure RSA-OAEP key pair using Web Crypto API.
 * Private key is kept in memory.
 */
export async function generateSecureRSAKeyPair(keySize: 2048 | 3072 = 2048): Promise<SecureKeyPairData> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is not supported in this browser environment.');
  }

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: keySize,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
      hash: { name: 'SHA-256' },
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  // Export public key to SPKI PEM
  const exportedSpki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyPem = exportSpkiToPem(exportedSpki);

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyPem,
    keySize,
    generatedAt: new Date(),
    algorithm: 'RSA-OAEP',
    hash: 'SHA-256',
    publicExponent: '65537 (0x10001)',
  };
}

/**
 * Encrypt plaintext using Web Crypto RSA-OAEP with SHA-256
 */
export async function encryptRsaOaep(
  publicKey: CryptoKey,
  plaintext: string,
  keySize: 2048 | 3072 = 2048
): Promise<{
  ciphertextBase64: string;
  ciphertextHex: string;
  rawBuffer: ArrayBuffer;
  byteLength: number;
}> {
  const plaintextBytes = stringToUtf8Bytes(plaintext);
  const maxBytes = getMaxOaepPlaintextLength(keySize);

  if (plaintextBytes.length > maxBytes) {
    throw new Error(
      `Plaintext size (${plaintextBytes.length} bytes) exceeds the RSA-OAEP limit of ${maxBytes} bytes for ${keySize}-bit key with SHA-256. For larger messages, use Hybrid Encryption (RSA + AES-GCM).`
    );
  }

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    plaintextBytes
  );

  return {
    ciphertextBase64: arrayBufferToBase64(encryptedBuffer),
    ciphertextHex: arrayBufferToHex(encryptedBuffer),
    rawBuffer: encryptedBuffer,
    byteLength: encryptedBuffer.byteLength,
  };
}

/**
 * Decrypt ciphertext using Web Crypto RSA-OAEP with SHA-256
 */
export async function decryptRsaOaep(
  privateKey: CryptoKey,
  ciphertextInput: string,
  isHex: boolean = false
): Promise<string> {
  let cipherBuffer: ArrayBuffer;
  try {
    cipherBuffer = isHex ? hexToArrayBuffer(ciphertextInput) : base64ToArrayBuffer(ciphertextInput);
  } catch (err: any) {
    throw new Error(`Failed to decode ciphertext input: ${err.message || 'Invalid format.'}`);
  }

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      privateKey,
      cipherBuffer
    );

    return utf8BytesToString(new Uint8Array(decryptedBuffer));
  } catch (err: any) {
    throw new Error(
      'RSA-OAEP Decryption failed: OAEP decoding error. This typically occurs when decrypting with the wrong private key, or when ciphertext/padding has been tampered with or corrupted.'
    );
  }
}
