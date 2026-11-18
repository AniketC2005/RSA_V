export interface EducationalKeyPair {
  p: bigint;
  q: bigint;
  n: bigint;
  phi: bigint;
  e: bigint;
  d: bigint;
  isValid: boolean;
  notes?: string[];
}

export interface EEAStep {
  step: number;
  a: bigint;
  b: bigint;
  quotient: bigint;
  remainder: bigint;
  x: bigint;
  y: bigint;
  equation: string;
}

export interface EEAResult {
  gcd: bigint;
  x: bigint; // Bézout x
  y: bigint; // Bézout y
  inverse: bigint | null; // d such that (e * d) mod phi = 1
  steps: EEAStep[];
  explanation: string;
}

export interface ModExpStep {
  step: number;
  bitIndex: number;
  bit: number;
  operation: string;
  currentValue: bigint;
  explanation: string;
}

export interface ModExpResult {
  base: bigint;
  exponent: bigint;
  modulus: bigint;
  result: bigint;
  binaryExponent: string;
  steps: ModExpStep[];
}

export interface SecureKeyPairData {
  publicKey: CryptoKey | null;
  privateKey: CryptoKey | null;
  publicKeyPem: string;
  keySize: 2048 | 3072;
  generatedAt: Date | null;
  algorithm: string;
  hash: string;
  publicExponent: string;
}

export interface HybridPackage {
  version: string;
  algorithm: 'RSA-OAEP-SHA256 + AES-GCM-256';
  rsaKeySize: number;
  encryptedAesKeyBase64: string;
  ivHex: string;
  ciphertextBase64: string;
  tagBase64?: string;
  timestamp: string;
  metadata?: {
    plaintextBytesLength: number;
    filename?: string;
  };
}

export type TabType = 
  | 'dashboard' 
  | 'keygen' 
  | 'encryption' 
  | 'decryption' 
  | 'visualizer' 
  | 'hybrid' 
  | 'mathematics' 
  | 'security' 
  | 'about';
