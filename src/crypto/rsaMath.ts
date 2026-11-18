import { EducationalKeyPair } from '../types/rsa';
import { extendedEuclideanAlgorithm } from './extendedEuclidean';
import { modularExponentiationWithSteps, fastModularExponentiation } from './modularExponentiation';

/**
 * Prime test for BigInt.
 * Uses trial division for small numbers and Miller-Rabin test for larger numbers.
 */
export function isPrime(n: bigint): boolean {
  if (n <= 1n) return false;
  if (n <= 3n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;

  // Trial division for numbers up to 1,000,000
  if (n < 1000000n) {
    for (let i = 5n; i * i <= n; i += 6n) {
      if (n % i === 0n || n % (i + 2n) === 0n) return false;
    }
    return true;
  }

  // Miller-Rabin primality test
  return millerRabinTest(n, 10);
}

function millerRabinTest(n: bigint, iterations: number = 10): boolean {
  let d = n - 1n;
  let s = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    s += 1n;
  }

  const testBases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  const basesToUse = testBases.slice(0, Math.min(iterations, testBases.length));

  for (const a of basesToUse) {
    if (n <= a) break;
    let x = fastModularExponentiation(a, d, n);
    if (x === 1n || x === n - 1n) continue;

    let composite = true;
    for (let r = 1n; r < s; r++) {
      x = fastModularExponentiation(x, 2n, n);
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }
    if (composite) return false;
  }
  return true;
}

/**
 * Calculate Greatest Common Divisor (GCD) using Euclidean Algorithm
 */
export function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function areCoprime(a: bigint, b: bigint): boolean {
  return gcd(a, b) === 1n;
}

/**
 * Educational prime presets list
 */
export const EDUCATIONAL_PRIMES: bigint[] = [
  11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n, 73n, 79n, 83n, 89n, 97n,
  101n, 103n, 107n, 109n, 113n, 127n, 131n, 137n, 139n, 149n, 151n, 157n, 163n, 167n, 173n, 179n, 181n,
  191n, 193n, 197n, 199n, 211n, 223n, 227n, 229n, 233n, 239n, 241n, 251n, 257n, 263n, 269n, 271n, 277n
];

/**
 * Get random educational prime distinct from an optional exclude prime
 */
export function getRandomEducationalPrime(exclude?: bigint): bigint {
  const candidates = exclude ? EDUCATIONAL_PRIMES.filter(p => p !== exclude) : EDUCATIONAL_PRIMES;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}

/**
 * Find valid public exponents e coprime to phi(n)
 */
export function getCandidateExponents(phi: bigint): bigint[] {
  const commonExponents = [3n, 5n, 17n, 257n, 65537n];
  const valid: bigint[] = [];

  for (const e of commonExponents) {
    if (e < phi && areCoprime(e, phi)) {
      valid.push(e);
    }
  }

  // If none or very few, test small odd numbers
  if (valid.length < 3) {
    for (let e = 3n; e < 100n && e < phi; e += 2n) {
      if (areCoprime(e, phi) && !valid.includes(e)) {
        valid.push(e);
      }
      if (valid.length >= 6) break;
    }
  }

  return valid;
}

/**
 * Standard Educational Test Vector established by the prompt:
 * p = 61, q = 53, n = 3233, phi = 3120, e = 17, d = 2753, m = 65, c = 2790
 */
export const STANDARD_TEST_VECTOR = {
  p: 61n,
  q: 53n,
  n: 3233n,
  phi: 3120n,
  e: 17n,
  d: 2753n,
  m: 65n,
  c: 2790n,
};

/**
 * Generate full Educational Key Pair with step validations
 */
export function generateEducationalKeyPair(p: bigint, q: bigint, selectedE?: bigint): EducationalKeyPair {
  const notes: string[] = [];

  if (p <= 1n || !isPrime(p)) {
    throw new Error(`Parameter p (${p}) must be a valid prime number > 1.`);
  }
  if (q <= 1n || !isPrime(q)) {
    throw new Error(`Parameter q (${q}) must be a valid prime number > 1.`);
  }
  if (p === q) {
    throw new Error(`p and q must be distinct primes. Currently both are ${p}.`);
  }

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  notes.push(`Modulus n = p × q = ${p} × ${q} = ${n}`);
  notes.push(`Euler's totient φ(n) = (p - 1) × (q - 1) = ${p - 1n} × ${q - 1n} = ${phi}`);

  let e = selectedE;
  if (!e) {
    // Pick the best default candidate
    const candidates = getCandidateExponents(phi);
    if (candidates.length === 0) {
      throw new Error(`Unable to find a valid public exponent e coprime to φ(n) = ${phi}.`);
    }
    // Prefer 17 or 65537 if valid, else first available
    e = candidates.includes(17n) ? 17n : (candidates.includes(65537n) ? 65537n : candidates[0]);
  } else {
    if (e <= 1n || e >= phi) {
      throw new Error(`Public exponent e (${e}) must satisfy: 1 < e < φ(n) (${phi}).`);
    }
    if (!areCoprime(e, phi)) {
      throw new Error(`Public exponent e (${e}) and φ(n) (${phi}) are not coprime. gcd(${e}, ${phi}) = ${gcd(e, phi)} ≠ 1.`);
    }
  }

  notes.push(`Public exponent e = ${e} satisfies 1 < e < φ(n) and gcd(e, φ(n)) = 1.`);

  // Calculate private exponent d = e^-1 mod phi(n) using Extended Euclidean Algorithm
  const eea = extendedEuclideanAlgorithm(e, phi);
  if (eea.inverse === null) {
    throw new Error(`Failed to calculate modular inverse for e = ${e} mod φ(n) = ${phi}.`);
  }
  const d = eea.inverse;

  notes.push(`Private exponent d = ${d} calculated via Extended Euclidean Algorithm: (${e} × ${d}) mod ${phi} = ${(e * d) % phi}.`);

  return {
    p,
    q,
    n,
    phi,
    e,
    d,
    isValid: true,
    notes
  };
}

/**
 * Educational Textbook RSA Encryption:
 * c = m^e mod n
 */
export function encryptTextbookRSA(m: bigint, e: bigint, n: bigint) {
  if (m < 0n || m >= n) {
    throw new Error(`Message m (${m}) must satisfy 0 ≤ m < n (${n}).`);
  }
  return modularExponentiationWithSteps(m, e, n);
}

/**
 * Educational Textbook RSA Decryption:
 * m = c^d mod n
 */
export function decryptTextbookRSA(c: bigint, d: bigint, n: bigint) {
  if (c < 0n || c >= n) {
    throw new Error(`Ciphertext c (${c}) must satisfy 0 ≤ c < n (${n}).`);
  }
  return modularExponentiationWithSteps(c, d, n);
}
