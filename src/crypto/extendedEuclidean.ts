import { EEAResult, EEAStep } from '../types/rsa';

/**
 * Extended Euclidean Algorithm implementation using BigInt.
 * Computes gcd(a, b) and coefficients x, y such that a*x + b*y = gcd(a, b).
 * Also returns the modular multiplicative inverse of a modulo b if gcd == 1.
 */
export function extendedEuclideanAlgorithm(a: bigint, b: bigint): EEAResult {
  if (b === 0n) {
    throw new Error('Modulus/second parameter cannot be zero.');
  }

  // Work with positive values for step recording
  const originalA = a;
  const originalB = b;

  let r0 = a;
  let r1 = b;
  let s0 = 1n, s1 = 0n;
  let t0 = 0n, t1 = 1n;

  const steps: EEAStep[] = [];
  let stepIndex = 1;

  // Initial step 0
  steps.push({
    step: 0,
    a: r0,
    b: r1,
    quotient: 0n,
    remainder: r0,
    x: s0,
    y: t0,
    equation: `Initial: r₀ = ${r0}, s₀ = 1, t₀ = 0`
  });

  while (r1 !== 0n) {
    const q = r0 / r1;
    const r2 = r0 % r1;
    const s2 = s0 - q * s1;
    const t2 = t0 - q * t1;

    steps.push({
      step: stepIndex++,
      a: r0,
      b: r1,
      quotient: q,
      remainder: r2,
      x: s1,
      y: t1,
      equation: `${r0} = (${q} × ${r1}) + ${r2}`
    });

    r0 = r1;
    r1 = r2;
    s0 = s1;
    s1 = s2;
    t0 = t1;
    t1 = t2;
  }

  const gcd = r0;
  const x = s0;
  const y = t0;

  let inverse: bigint | null = null;
  if (gcd === 1n || gcd === -1n) {
    // Modular inverse of a mod b
    let inv = x % originalB;
    if (inv < 0n) {
      inv += originalB;
    }
    inverse = inv;
  }

  const explanation = gcd === 1n
    ? `Since gcd(${originalA}, ${originalB}) = 1, the modular inverse exists: ${originalA}⁻¹ mod ${originalB} = ${inverse}. Verification: (${originalA} × ${inverse}) mod ${originalB} = ${(originalA * (inverse ?? 0n)) % originalB}.`
    : `gcd(${originalA}, ${originalB}) = ${gcd} ≠ 1. The modular inverse does not exist because ${originalA} and ${originalB} are not coprime.`;

  return {
    gcd,
    x,
    y,
    inverse,
    steps,
    explanation
  };
}
