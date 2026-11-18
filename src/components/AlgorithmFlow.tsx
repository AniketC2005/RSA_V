import React from 'react';
import { ArrowRight, Lock, KeyRound, Unlock, Shield, Binary } from 'lucide-react';

export const AlgorithmFlow: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Alice & Bob Asymmetric Communication Visual */}
      <div className="bg-lab-card rounded-xl border border-lab-border p-5">
        <h4 className="text-xs uppercase font-mono text-lab-accent font-semibold tracking-wider mb-4 flex items-center space-x-2">
          <Shield className="w-4 h-4 text-lab-accent" />
          <span>Alice & Bob Asymmetric Cryptography Protocol</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Alice (Sender) */}
          <div className="bg-lab-secondary p-4 rounded-xl border border-lab-border flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-lab-accent/10 border border-lab-accent/40 flex items-center justify-center text-lab-accent mb-2 font-mono font-bold">
              ALICE
            </div>
            <span className="text-xs font-semibold text-lab-text">Sender (Plaintext Origin)</span>
            <p className="text-[11px] text-lab-muted mt-1">
              Knows message <code className="text-lab-accent font-mono">m</code> and Bob's Public Key{' '}
              <code className="text-lab-emerald font-mono">(e, n)</code>.
            </p>
            <div className="mt-3 w-full p-2 bg-lab-bg rounded border border-lab-border/40 text-left font-mono text-[11px]">
              <div className="text-lab-muted">Encryption:</div>
              <div className="text-lab-accent font-bold">c = mᵉ mod n</div>
            </div>
          </div>

          {/* Public Insecure Transmission Channel */}
          <div className="flex flex-col items-center text-center p-3">
            <div className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-lab-amber/10 text-lab-amber border border-lab-amber/30 mb-2">
              Public / Untrusted Channel
            </div>
            <div className="w-full flex items-center justify-center my-2 space-x-2">
              <div className="h-0.5 w-full bg-gradient-to-r from-lab-accent via-lab-amber to-lab-emerald" />
              <ArrowRight className="w-5 h-5 text-lab-amber shrink-0 animate-pulse" />
            </div>
            <div className="p-2.5 rounded-lg bg-lab-bg border border-lab-border/70 text-[11px] font-mono text-lab-muted w-full">
              <span className="text-lab-text font-bold block">Ciphertext c</span>
              <span>Eavesdroppers see only c; cannot invert without d</span>
            </div>
          </div>

          {/* Bob (Recipient) */}
          <div className="bg-lab-secondary p-4 rounded-xl border border-lab-border flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-lab-emerald/10 border border-lab-emerald/40 flex items-center justify-center text-lab-emerald mb-2 font-mono font-bold">
              BOB
            </div>
            <span className="text-xs font-semibold text-lab-text">Recipient (Key Owner)</span>
            <p className="text-[11px] text-lab-muted mt-1">
              Holds confidential Private Key{' '}
              <code className="text-lab-amber font-mono">(d, n)</code> and published{' '}
              <code className="text-lab-emerald font-mono">(e, n)</code>.
            </p>
            <div className="mt-3 w-full p-2 bg-lab-bg rounded border border-lab-border/40 text-left font-mono text-[11px]">
              <div className="text-lab-muted">Decryption:</div>
              <div className="text-lab-emerald font-bold">m = cᵈ mod n</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Generation Mathematical Pipeline */}
      <div className="bg-lab-card rounded-xl border border-lab-border p-5">
        <h4 className="text-xs uppercase font-mono text-lab-emerald font-semibold tracking-wider mb-4 flex items-center space-x-2">
          <Binary className="w-4 h-4 text-lab-emerald" />
          <span>RSA Mathematical Derivation Pipeline</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Step 1 */}
          <div className="bg-lab-secondary/80 p-3 rounded-lg border border-lab-border relative">
            <span className="text-[10px] font-mono text-lab-accent font-bold block mb-1">
              STAGE 01
            </span>
            <span className="text-xs font-semibold text-lab-text block">Select Primes</span>
            <div className="mt-2 text-xs font-mono text-lab-accent bg-lab-bg p-1.5 rounded border border-lab-border/30">
              p, q ∈ ℙ (distinct)
            </div>
            <p className="text-[11px] text-lab-muted mt-1.5">
              Secret foundations. In practice, 1024+ bit random primes.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-lab-secondary/80 p-3 rounded-lg border border-lab-border relative">
            <span className="text-[10px] font-mono text-lab-accent font-bold block mb-1">
              STAGE 02
            </span>
            <span className="text-xs font-semibold text-lab-text block">Compute Modulus</span>
            <div className="mt-2 text-xs font-mono text-lab-emerald bg-lab-bg p-1.5 rounded border border-lab-border/30">
              n = p × q
            </div>
            <p className="text-[11px] text-lab-muted mt-1.5">
              Published openly. Factoring n back into p and q is computationally hard.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-lab-secondary/80 p-3 rounded-lg border border-lab-border relative">
            <span className="text-[10px] font-mono text-lab-accent font-bold block mb-1">
              STAGE 03
            </span>
            <span className="text-xs font-semibold text-lab-text block">Euler's Totient</span>
            <div className="mt-2 text-xs font-mono text-lab-text bg-lab-bg p-1.5 rounded border border-lab-border/30">
              φ(n) = (p-1)(q-1)
            </div>
            <p className="text-[11px] text-lab-muted mt-1.5">
              Order of multiplicative group (ℤ/nℤ)*. Kept strictly secret.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-lab-secondary/80 p-3 rounded-lg border border-lab-border relative">
            <span className="text-[10px] font-mono text-lab-accent font-bold block mb-1">
              STAGE 04
            </span>
            <span className="text-xs font-semibold text-lab-text block">Public Exponent</span>
            <div className="mt-2 text-xs font-mono text-lab-accent bg-lab-bg p-1.5 rounded border border-lab-border/30">
              gcd(e, φ(n)) = 1
            </div>
            <p className="text-[11px] text-lab-muted mt-1.5">
              Typically e = 65537 (2¹⁶+1) for fast encryption performance.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-lab-secondary/80 p-3 rounded-lg border border-lab-border relative">
            <span className="text-[10px] font-mono text-lab-emerald font-bold block mb-1">
              STAGE 05
            </span>
            <span className="text-xs font-semibold text-lab-text block">Private Exponent</span>
            <div className="mt-2 text-xs font-mono text-lab-amber bg-lab-bg p-1.5 rounded border border-lab-border/30">
              d = e⁻¹ mod φ(n)
            </div>
            <p className="text-[11px] text-lab-muted mt-1.5">
              Derived using Extended Euclidean Algorithm. Secret key!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
