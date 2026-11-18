import { describe, it, expect } from 'vitest';
import {
  isPrime,
  gcd,
  areCoprime,
  generateEducationalKeyPair,
  encryptTextbookRSA,
  decryptTextbookRSA,
  STANDARD_TEST_VECTOR
} from '../crypto/rsaMath';
import { extendedEuclideanAlgorithm } from '../crypto/extendedEuclidean';
import { modularExponentiationWithSteps, fastModularExponentiation } from '../crypto/modularExponentiation';

describe('Educational RSA Mathematical Core & Test Vector', () => {
  it('strictly satisfies the prompt test vector: p=61, q=53, n=3233, phi=3120, e=17, d=2753, m=65, c=2790', () => {
    const { p, q, n, phi, e, d, m, c } = STANDARD_TEST_VECTOR;

    // Verify prime properties
    expect(isPrime(p)).toBe(true);
    expect(isPrime(q)).toBe(true);

    // Key generation
    const keyPair = generateEducationalKeyPair(p, q, e);
    expect(keyPair.n).toBe(n);
    expect(keyPair.phi).toBe(phi);
    expect(keyPair.e).toBe(e);
    expect(keyPair.d).toBe(d);

    // Verify Extended Euclidean Algorithm modular inverse
    expect((e * d) % phi).toBe(1n);

    // Encryption: 65^17 mod 3233 = 2790
    const encResult = encryptTextbookRSA(m, e, n);
    expect(encResult.result).toBe(c);

    // Decryption: 2790^2753 mod 3233 = 65
    const decResult = decryptTextbookRSA(c, d, n);
    expect(decResult.result).toBe(m);
  });

  it('validates primality test correctly', () => {
    expect(isPrime(2n)).toBe(true);
    expect(isPrime(3n)).toBe(true);
    expect(isPrime(4n)).toBe(false);
    expect(isPrime(17n)).toBe(true);
    expect(isPrime(61n)).toBe(true);
    expect(isPrime(100n)).toBe(false);
    expect(isPrime(101n)).toBe(true);
  });

  it('computes gcd and coprimality correctly', () => {
    expect(gcd(17n, 3120n)).toBe(1n);
    expect(areCoprime(17n, 3120n)).toBe(true);
    expect(gcd(15n, 25n)).toBe(5n);
    expect(areCoprime(15n, 25n)).toBe(false);
  });

  it('Extended Euclidean Algorithm correctly logs steps and computes inverse', () => {
    const eea = extendedEuclideanAlgorithm(17n, 3120n);
    expect(eea.gcd).toBe(1n);
    expect(eea.inverse).toBe(2753n);
    expect(eea.steps.length).toBeGreaterThan(0);
  });

  it('Modular exponentiation accurately handles edge cases and square-and-multiply steps', () => {
    const res = modularExponentiationWithSteps(65n, 17n, 3233n);
    expect(res.result).toBe(2790n);
    expect(res.binaryExponent).toBe((17n).toString(2)); // "10001"
    // Binary length is 5 bits -> initial step + 5 square steps + 2 multiply steps (for bit 1 at pos 0 and pos 4)
    expect(res.steps.length).toBeGreaterThan(5);

    // Fast version check
    expect(fastModularExponentiation(65n, 17n, 3233n)).toBe(2790n);
    expect(fastModularExponentiation(2790n, 2753n, 3233n)).toBe(65n);
  });

  it('rejects invalid inputs with descriptive errors', () => {
    // Non-prime
    expect(() => generateEducationalKeyPair(4n, 53n)).toThrow();
    // Same p and q
    expect(() => generateEducationalKeyPair(61n, 61n)).toThrow();
    // Non-coprime public exponent
    expect(() => generateEducationalKeyPair(61n, 53n, 15n)).toThrow();
    // Message >= modulus
    expect(() => encryptTextbookRSA(4000n, 17n, 3233n)).toThrow();
  });
});
