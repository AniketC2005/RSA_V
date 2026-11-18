import { describe, it, expect } from 'vitest';
import {
  generateSecureRSAKeyPair,
  encryptRsaOaep,
  decryptRsaOaep,
  getMaxOaepPlaintextLength
} from '../crypto/rsaOaep';
import { encryptHybrid, decryptHybrid } from '../crypto/hybridEncryption';

// In Node 20, globalThis.crypto is available, ensure window.crypto alias exists in test
if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
}

describe('Web Crypto RSA-OAEP & Hybrid Encryption Suite', () => {
  it('correctly calculates maximum OAEP plaintext lengths', () => {
    // 2048-bit key = 256 bytes. 256 - 2*32 - 2 = 190 bytes
    expect(getMaxOaepPlaintextLength(2048)).toBe(190);
    // 3072-bit key = 384 bytes. 384 - 2*32 - 2 = 318 bytes
    expect(getMaxOaepPlaintextLength(3072)).toBe(318);
  });

  it('generates a 2048-bit RSA-OAEP key pair and executes round-trip encryption/decryption', async () => {
    const keyPair = await generateSecureRSAKeyPair(2048);
    expect(keyPair.publicKey).toBeDefined();
    expect(keyPair.privateKey).toBeDefined();
    expect(keyPair.publicKeyPem).toContain('BEGIN PUBLIC KEY');

    const message = 'Confidential RSA-OAEP Test Message with UTF-8: 🔐';
    const encResult = await encryptRsaOaep(keyPair.publicKey!, message, 2048);
    expect(encResult.ciphertextBase64.length).toBeGreaterThan(0);
    expect(encResult.ciphertextHex.length).toBe(512); // 256 bytes * 2 hex chars = 512

    const recovered = await decryptRsaOaep(keyPair.privateKey!, encResult.ciphertextBase64);
    expect(recovered).toBe(message);
  });

  it('rejects plaintext exceeding RSA-OAEP maximum capacity', async () => {
    const keyPair = await generateSecureRSAKeyPair(2048);
    const oversizedMessage = 'A'.repeat(191); // 191 bytes > 190 bytes limit

    await expect(encryptRsaOaep(keyPair.publicKey!, oversizedMessage, 2048)).rejects.toThrow(
      /exceeds the RSA-OAEP limit/
    );
  });

  it('executes Hybrid Encryption (RSA-OAEP + AES-256-GCM) round-trip with arbitrary size payload', async () => {
    const rsaKeyPair = await generateSecureRSAKeyPair(2048);
    const largeMessage = 'Hybrid payload: ' + 'Secure large message '.repeat(100);

    const hybrid = await encryptHybrid(rsaKeyPair.publicKey!, largeMessage, 2048, 'sample.txt');
    expect(hybrid.packageData.encryptedAesKeyBase64).toBeDefined();
    expect(hybrid.packageData.ivHex.length).toBe(24); // 12 bytes IV = 24 hex chars
    expect(hybrid.packageData.algorithm).toBe('RSA-OAEP-SHA256 + AES-GCM-256');

    const result = await decryptHybrid(rsaKeyPair.privateKey!, hybrid.packageJson);
    expect(result.plaintext).toBe(largeMessage);
    expect(result.recoveredAesKeyHex).toBe(hybrid.rawAesKeyHex);
  });

  it('fails decryption if hybrid ciphertext is tampered with', async () => {
    const rsaKeyPair = await generateSecureRSAKeyPair(2048);
    const message = 'Integrity test message';
    const hybrid = await encryptHybrid(rsaKeyPair.publicKey!, message, 2048);

    // Tamper with the package ciphertext
    const tampered = { ...hybrid.packageData };
    // Corrupt base64 ciphertext
    tampered.ciphertextBase64 = 'YWJjZGVmZ2hpams=' + tampered.ciphertextBase64.slice(16);

    await expect(decryptHybrid(rsaKeyPair.privateKey!, tampered)).rejects.toThrow();
  });
});
