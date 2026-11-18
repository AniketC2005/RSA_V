import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  FileCheck2,
  Cpu,
  Lock,
  Unlock,
  Layers,
  Radio,
  Zap,
} from 'lucide-react';

export const Security: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="pb-4 border-b border-lab-border">
        <h2 className="text-xl sm:text-2xl font-bold text-lab-text flex items-center space-x-2">
          <ShieldAlert className="w-6 h-6 text-red-400" />
          <span>Security Architecture & Cryptanalysis Analysis</span>
        </h2>
        <p className="text-xs sm:text-sm text-lab-muted mt-1">
          In-depth threat modeling: Attack vectors, padding vulnerabilities, quantum implications, and digital signatures.
        </p>
      </div>

      {/* Critical Advisory Banner */}
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-xs text-lab-text">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-red-400 text-sm">Critical Security Warnings</h4>
          <ul className="text-lab-muted space-y-1 list-disc list-inside">
            <li>
              <strong className="text-lab-text">Never use Textbook RSA for Production:</strong> Small-number modular arithmetic lacks randomization and error-checking, exposing plaintexts to chosen-ciphertext recovery and factoring algorithms.
            </li>
            <li>
              <strong className="text-lab-text">Private Key Confidentiality:</strong> The private exponent <code className="text-lab-amber font-mono">d</code> must never leave memory, be transmitted across networks, or be stored in browser persistent storage.
            </li>
            <li>
              <strong className="text-lab-text">AES-GCM Nonce Uniqueness:</strong> Reusing an AES-GCM nonce (IV) with the same key destroys authenticity and allows adversaries to forge ciphertexts.
            </li>
            <li>
              <strong className="text-lab-text">No Algorithm is Unbreakable:</strong> RSA security relies on the current computational hardness of integer factorization; it is not mathematically impervious.
            </li>
          </ul>
        </div>
      </div>

      {/* Security Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Why RSA-OAEP Instead of Raw RSA */}
        <DashboardCard
          title="Optimal Asymmetric Encryption Padding (OAEP)"
          subtitle="Why raw textbook RSA fails real-world security standards"
          icon={ShieldCheck}
          badge="PKCS#1 v2.2"
          badgeColor="emerald"
        >
          <div className="space-y-3 text-xs text-lab-muted leading-relaxed">
            <p>
              In textbook RSA, encryption is purely deterministic: $c = m^e \pmod n$. This grants
              adversaries multiple attack vectors:
            </p>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-lab-text">
              <li>
                <strong>Dictionary / Guessing Attacks:</strong> If an adversary suspects m is either "Yes" or "No", they can encrypt both candidates with the public key and compare ciphertexts.
              </li>
              <li>
                <strong>Multiplicative Homomorphism:</strong> Given $c_1 = m_1^e \pmod n$ and $c_2 = m_2^e \pmod n$, multiplying them yields $(m_1 \cdot m_2)^e \pmod n$—a valid ciphertext of $m_1 \cdot m_2$ without knowing the private key!
              </li>
            </ul>
            <p>
              <strong className="text-lab-emerald">RSA-OAEP</strong> solves these vulnerabilities by
              combining a random seed with two cryptographic hash rounds (Feistel network). This
              transforms the plaintext into an all-or-nothing randomized block, achieving provable{' '}
              <strong className="text-lab-accent">IND-CCA2</strong> (indistinguishability under adaptive
              chosen-ciphertext attacks).
            </p>
          </div>
        </DashboardCard>

        {/* 2. Key Length Recommendations & Factoring Milestones */}
        <DashboardCard
          title="NIST Key Length Standards & Cryptanalysis"
          subtitle="Computational difficulty across historical eras"
          icon={KeyRound}
          badge="NIST SP 800-57"
          badgeColor="cyan"
        >
          <div className="space-y-3 text-xs text-lab-muted leading-relaxed">
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between items-center p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                <span>512-bit RSA:</span>
                <span className="font-bold">Factored in 1999 (Trivial today on a PC)</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                <span>768-bit RSA:</span>
                <span className="font-bold">Factored in 2009 (Broken by academic cluster)</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-lab-amber/10 border border-lab-amber/20 text-lab-amber">
                <span>1024-bit RSA:</span>
                <span className="font-bold">Deprecated by NIST since 2013</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-lab-emerald/10 border border-lab-emerald/20 text-lab-emerald">
                <span>2048-bit RSA:</span>
                <span className="font-bold">Standard Minimum (112-bit security through 2030)</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-lab-accent/10 border border-lab-accent/20 text-lab-accent">
                <span>3072-bit RSA:</span>
                <span className="font-bold">High Security (128-bit security level)</span>
              </div>
            </div>
            <p className="text-[11px]">
              The best classical factoring algorithm is the{' '}
              <strong className="text-lab-text">General Number Field Sieve (GNFS)</strong>, which runs
              in sub-exponential time $O(\exp((c + o(1))(\ln n)^{1/3} (\ln \ln n)^{2/3}))$.
            </p>
          </div>
        </DashboardCard>

        {/* 3. The Quantum Threat: Shor's Algorithm */}
        <DashboardCard
          title="The Quantum Computing Threat (Shor's Algorithm)"
          subtitle="How fault-tolerant quantum computers impact RSA"
          icon={Radio}
          badge="Post-Quantum"
          badgeColor="amber"
        >
          <div className="space-y-3 text-xs text-lab-muted leading-relaxed">
            <p>
              In 1994, Peter Shor formulated a quantum algorithm that finds the period of modular
              functions in polynomial time:
            </p>
            <div className="p-3 bg-lab-bg rounded-lg border border-lab-border font-mono text-xs text-lab-amber">
              Shor's Algorithm Complexity: O((log n)³) vs Classical GNFS Sub-exponential
            </div>
            <p>
              A sufficiently large, fault-tolerant quantum computer running with several thousand
              logical qubits could factor a 2048-bit RSA modulus in hours.
            </p>
            <p>
              In response, NIST initiated the Post-Quantum Cryptography (PQC) standardization project.
              Next-generation systems are transitioning to lattice-based schemes like{' '}
              <strong className="text-lab-emerald">ML-KEM (Kyber)</strong> and{' '}
              <strong className="text-lab-accent">ML-DSA (Dilithium)</strong>.
            </p>
          </div>
        </DashboardCard>

        {/* 4. RSA Digital Signatures vs Encryption */}
        <DashboardCard
          title="RSA Digital Signatures (Authentication & Integrity)"
          subtitle="Distinguishing signatures (RSA-PSS) from encryption (RSA-OAEP)"
          icon={FileCheck2}
          badge="Signatures"
          badgeColor="cyan"
        >
          <div className="space-y-3 text-xs text-lab-muted leading-relaxed">
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2.5 bg-lab-bg rounded-lg border border-lab-border">
                <span className="text-lab-emerald font-bold block mb-1">Confidentiality (Encryption)</span>
                <span>Sender encrypts with Bob's Public Key.</span>
                <span className="text-lab-muted block mt-1">c = mᵉ mod n</span>
                <span className="text-lab-text block mt-1">Bob decrypts with Bob's Private Key.</span>
              </div>
              <div className="p-2.5 bg-lab-bg rounded-lg border border-lab-border">
                <span className="text-lab-amber font-bold block mb-1">Authenticity (Signature)</span>
                <span>Signer signs with Alice's Private Key.</span>
                <span className="text-lab-muted block mt-1">s = Hash(m)ᵈ mod n</span>
                <span className="text-lab-text block mt-1">Anyone verifies with Alice's Public Key!</span>
              </div>
            </div>
            <p>
              <strong className="text-lab-text">The Hash-and-Sign Paradigm:</strong> Rather than signing
              the raw message directly, signers hash the document with SHA-256 and sign the digest.
            </p>
            <p>
              Modern secure RSA signatures mandate <strong className="text-lab-accent">RSA-PSS</strong>{' '}
              (Probabilistic Signature Scheme), whereas encryption mandates{' '}
              <strong className="text-lab-emerald">RSA-OAEP</strong>.
            </p>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};
