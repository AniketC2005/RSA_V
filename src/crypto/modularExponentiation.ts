import { ModExpResult, ModExpStep } from '../types/rsa';

/**
 * Square-and-multiply algorithm (Modular Exponentiation) with detailed step logging.
 * Calculates (base ^ exponent) mod modulus using BigInt.
 */
export function modularExponentiationWithSteps(
  base: bigint,
  exponent: bigint,
  modulus: bigint
): ModExpResult {
  if (modulus <= 0n) {
    throw new Error('Modulus must be greater than 0.');
  }
  if (exponent < 0n) {
    throw new Error('Negative exponents are not supported in basic modular exponentiation.');
  }

  // Handle edge cases
  if (modulus === 1n) {
    return {
      base,
      exponent,
      modulus,
      result: 0n,
      binaryExponent: '0',
      steps: [{
        step: 1,
        bitIndex: 0,
        bit: 0,
        operation: 'Modulus is 1',
        currentValue: 0n,
        explanation: 'Any number mod 1 is 0.'
      }]
    };
  }

  if (exponent === 0n) {
    return {
      base,
      exponent,
      modulus,
      result: 1n,
      binaryExponent: '0',
      steps: [{
        step: 1,
        bitIndex: 0,
        bit: 0,
        operation: 'Exponent is 0',
        currentValue: 1n,
        explanation: `${base}⁰ mod ${modulus} = 1`
      }]
    };
  }

  const binaryExponent = exponent.toString(2);
  const steps: ModExpStep[] = [];
  let currentValue = 1n;
  let stepCounter = 1;

  // Initial state
  steps.push({
    step: stepCounter++,
    bitIndex: -1,
    bit: -1,
    operation: 'Initialization',
    currentValue: 1n,
    explanation: `Start accumulator at 1. Exponent ${exponent} in binary is: ${binaryExponent} (${binaryExponent.length} bits).`
  });

  // Traverse bits from most significant bit to least significant bit
  for (let i = 0; i < binaryExponent.length; i++) {
    const bit = parseInt(binaryExponent[i], 10);
    const prevVal = currentValue;

    // 1. Square step
    const squaredVal = (currentValue * currentValue) % modulus;
    currentValue = squaredVal;

    steps.push({
      step: stepCounter++,
      bitIndex: i,
      bit,
      operation: 'Square',
      currentValue,
      explanation: `Bit index ${i} (${bit}): Square accumulator: (${prevVal}²) mod ${modulus} = ${currentValue}`
    });

    // 2. Multiply step if bit is 1
    if (bit === 1) {
      const beforeMult = currentValue;
      currentValue = (currentValue * (base % modulus)) % modulus;
      steps.push({
        step: stepCounter++,
        bitIndex: i,
        bit,
        operation: 'Multiply',
        currentValue,
        explanation: `Bit is 1: Multiply by base: (${beforeMult} × ${base % modulus}) mod ${modulus} = ${currentValue}`
      });
    }
  }

  return {
    base,
    exponent,
    modulus,
    result: currentValue,
    binaryExponent,
    steps
  };
}

/**
 * Fast modular exponentiation for direct calculation without full step overhead.
 */
export function fastModularExponentiation(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n;
  let result = 1n;
  let b = base % modulus;
  let exp = exponent;

  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * b) % modulus;
    }
    exp = exp / 2n;
    b = (b * b) % modulus;
  }
  return result;
}
