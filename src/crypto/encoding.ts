/**
 * Cryptographic encoding and format utilities
 */

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  // Strip whitespace and newlines
  const cleanBase64 = base64.replace(/\s+/g, '');
  const binary = atob(cleanBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const cleanHex = hex.replace(/\s+/g, '').replace(/^0x/i, '');
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Hexadecimal string must have an even length.');
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

export function formatHexPretty(hex: string, groupSize: number = 2, lineSize: number = 32): string {
  const cleanHex = hex.replace(/\s+/g, '');
  let result = '';
  for (let i = 0; i < cleanHex.length; i += groupSize) {
    result += cleanHex.substring(i, i + groupSize) + ' ';
    if ((i + groupSize) % lineSize === 0) {
      result += '\n';
    }
  }
  return result.trim();
}

export function stringToUtf8Bytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function utf8BytesToString(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function exportSpkiToPem(spkiBuffer: ArrayBuffer): string {
  const base64 = arrayBufferToBase64(spkiBuffer);
  const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64;
  return `-----BEGIN PUBLIC KEY-----\n${formatted}\n-----END PUBLIC KEY-----`;
}

export function pemToSpki(pem: string): ArrayBuffer {
  const cleanPem = pem
    .replace(/-----BEGIN [A-Z0-9_-]+-----/g, '')
    .replace(/-----END [A-Z0-9_-]+-----/g, '')
    .replace(/\s+/g, '');
  return base64ToArrayBuffer(cleanPem);
}
