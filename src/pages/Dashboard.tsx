import React from 'react';
import { useRSA } from '../context/RSAContext';
import { DashboardCard } from '../components/DashboardCard';
import { AlgorithmFlow } from '../components/AlgorithmFlow';
import { KeyDisplay } from '../components/KeyDisplay';
import {
  Shield,
  KeyRound,
  Lock,
  Unlock,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  CheckCircle,
  FileCode2,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    setActiveTab,
    educationalKeyPair,
    secureKeyPair,
    loadStandardTestVector,
    generateRandomEducationalKeys,
  } = useRSA();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Hero Command Center Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lab-card via-lab-secondary to-lab-bg border border-lab-border p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lab-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-lab-accent/10 border border-lab-accent/30 text-xs font-mono text-lab-accent mb-4">
            <span className="w-2 h-2 rounded-full bg-lab-accent animate-pulse" />
            <span>CRYPTOGRAPHY ENVIRONMENT ACTIVE • WEB CRYPTO API READY</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-lab-text tracking-tight">
            RSA<span className="text-lab-accent"> LAB</span> — Asymmetric Cryptography Simulator
          </h1>
          <p className="mt-3 text-sm sm:text-base text-lab-muted leading-relaxed">
            Explore the mathematics and mechanics of the Rivest–Shamir–Adleman (RSA) cryptosystem.
            Experiment with textbook modular arithmetic, generate high-security RSA-OAEP keys,
            and inspect real-time bit-level cryptographic operations.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('keygen')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-lab-accent hover:bg-lab-accentHover text-lab-bg font-semibold text-xs sm:text-sm shadow-cyan-glow transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>Generate RSA Keys</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('visualizer')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-lab-secondary hover:bg-lab-card border border-lab-border text-lab-text font-semibold text-xs sm:text-sm transition-all"
            >
              <Cpu className="w-4 h-4 text-lab-emerald" />
              <span>Explore RSA Visualizer</span>
            </button>

            <button
              onClick={loadStandardTestVector}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-lab-amber/10 hover:bg-lab-amber/20 border border-lab-amber/30 text-lab-amber text-xs font-mono font-medium transition-all"
              title="Loads textbook example: p=61, q=53, e=17"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Standard Test Vector (p=61, q=53)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Modulus */}
        <div className="bg-lab-card p-4 rounded-xl border border-lab-border hover:border-lab-borderLight transition-all">
          <div className="flex items-center justify-between text-xs text-lab-muted mb-2 font-mono">
            <span>EDUCATIONAL MODULUS (n)</span>
            <span className="text-lab-accent font-bold">p × q</span>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-lab-text">
            {educationalKeyPair.n.toString()}
          </div>
          <div className="mt-2 text-[11px] text-lab-muted flex items-center space-x-1">
            <span>p={educationalKeyPair.p.toString()}, q={educationalKeyPair.q.toString()}</span>
          </div>
        </div>

        {/* Public Exponent */}
        <div className="bg-lab-card p-4 rounded-xl border border-lab-border hover:border-lab-borderLight transition-all">
          <div className="flex items-center justify-between text-xs text-lab-muted mb-2 font-mono">
            <span>PUBLIC EXPONENT (e)</span>
            <span className="text-lab-emerald font-bold">Coprime to φ(n)</span>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-lab-emerald">
            {educationalKeyPair.e.toString()}
          </div>
          <div className="mt-2 text-[11px] text-lab-muted">
            Totient φ(n) = {educationalKeyPair.phi.toString()}
          </div>
        </div>

        {/* Private Exponent */}
        <div className="bg-lab-card p-4 rounded-xl border border-lab-border hover:border-lab-borderLight transition-all">
          <div className="flex items-center justify-between text-xs text-lab-muted mb-2 font-mono">
            <span>PRIVATE EXPONENT (d)</span>
            <span className="text-lab-amber font-bold">d = e⁻¹ mod φ(n)</span>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-lab-amber">
            {educationalKeyPair.d.toString()}
          </div>
          <div className="mt-2 text-[11px] text-lab-muted">
            Bézout verification: (e×d) mod φ = 1
          </div>
        </div>

        {/* Web Crypto Engine */}
        <div className="bg-lab-card p-4 rounded-xl border border-lab-border hover:border-lab-borderLight transition-all">
          <div className="flex items-center justify-between text-xs text-lab-muted mb-2 font-mono">
            <span>WEB CRYPTO HARDWARE</span>
            <span className="text-lab-emerald font-bold">Active</span>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-lab-accent">
            {secureKeyPair ? `${secureKeyPair.keySize}-bit` : 'RSA-OAEP'}
          </div>
          <div className="mt-2 text-[11px] text-lab-muted flex items-center space-x-1">
            <Activity className="w-3 h-3 text-lab-emerald" />
            <span>SHA-256 MGF1 Padding</span>
          </div>
        </div>
      </div>

      {/* 3. Operational Shortcuts & Key Information Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard
            title="Active RSA Cryptographic Keys"
            subtitle="Current parameters for textbook simulation and real-world RSA-OAEP operations"
            icon={KeyRound}
            badge="In Memory"
            badgeColor="cyan"
            headerAction={
              <button
                onClick={generateRandomEducationalKeys}
                className="text-xs px-2.5 py-1 rounded bg-lab-secondary hover:bg-lab-card border border-lab-border text-lab-accent font-mono transition-colors"
              >
                Randomize Primes
              </button>
            }
          >
            <KeyDisplay educationalKey={educationalKeyPair} secureKey={secureKeyPair} mode="both" />
          </DashboardCard>

          {/* RSA Mathematical Workflow Diagram */}
          <AlgorithmFlow />
        </div>

        {/* Right Sidebar: Shortcuts & Asymmetric vs Symmetric Comparison */}
        <div className="space-y-6">
          {/* Quick Action Station */}
          <DashboardCard
            title="Quick Action Station"
            subtitle="Execute cryptographic routines"
            icon={Zap}
            badge="Instant"
            badgeColor="emerald"
          >
            <div className="space-y-2.5 font-mono text-xs">
              <button
                onClick={() => setActiveTab('keygen')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-lab-secondary hover:bg-lab-secondary/80 border border-lab-border text-left group transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <KeyRound className="w-4 h-4 text-lab-accent" />
                  <div>
                    <div className="text-lab-text font-semibold">Key Generation Studio</div>
                    <div className="text-[11px] text-lab-muted">Custom primes & 2048/3072-bit keys</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-lab-muted group-hover:text-lab-accent transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => setActiveTab('encryption')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-lab-secondary hover:bg-lab-secondary/80 border border-lab-border text-left group transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <Lock className="w-4 h-4 text-lab-emerald" />
                  <div>
                    <div className="text-lab-text font-semibold">RSA Encryption</div>
                    <div className="text-[11px] text-lab-muted">c = mᵉ mod n & RSA-OAEP SHA-256</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-lab-muted group-hover:text-lab-emerald transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => setActiveTab('decryption')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-lab-secondary hover:bg-lab-secondary/80 border border-lab-border text-left group transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <Unlock className="w-4 h-4 text-lab-amber" />
                  <div>
                    <div className="text-lab-text font-semibold">RSA Decryption</div>
                    <div className="text-[11px] text-lab-muted">m = cᵈ mod n & OAEP Decrypt</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-lab-muted group-hover:text-lab-amber transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => setActiveTab('hybrid')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-lab-secondary hover:bg-lab-secondary/80 border border-lab-border text-left group transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <Layers className="w-4 h-4 text-lab-accent" />
                  <div>
                    <div className="text-lab-text font-semibold">Hybrid Encryption</div>
                    <div className="text-[11px] text-lab-muted">RSA-OAEP + AES-256-GCM Envelope</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-lab-muted group-hover:text-lab-accent transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </DashboardCard>

          {/* RSA vs AES Comparison Card */}
          <DashboardCard
            title="RSA vs AES Comparison"
            subtitle="Asymmetric vs Symmetric Architecture"
            icon={Shield}
            badge="Fundamentals"
            badgeColor="slate"
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-lab-secondary/70 border border-lab-border">
                <div className="font-semibold text-lab-accent mb-1 flex items-center justify-between">
                  <span>RSA (Asymmetric)</span>
                  <span className="text-[10px] font-mono text-lab-muted">Rivest–Shamir–Adleman</span>
                </div>
                <ul className="text-lab-muted space-y-1 text-[11px] list-disc list-inside">
                  <li>Two distinct mathematical keys (Public & Private)</li>
                  <li>Solves key-distribution problem across insecure channels</li>
                  <li>Computationally intensive (modular exponentiation)</li>
                  <li>Best for key exchange and digital signatures</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-lab-secondary/70 border border-lab-border">
                <div className="font-semibold text-lab-emerald mb-1 flex items-center justify-between">
                  <span>AES (Symmetric)</span>
                  <span className="text-[10px] font-mono text-lab-muted">Advanced Encryption Standard</span>
                </div>
                <ul className="text-lab-muted space-y-1 text-[11px] list-disc list-inside">
                  <li>Single shared secret key for encryption & decryption</li>
                  <li>Ultra-fast hardware acceleration (AES-NI)</li>
                  <li>Ideal for bulk data encryption (gigabytes/terabytes)</li>
                  <li>Requires secure key exchange (often handled by RSA!)</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-lg bg-lab-accent/5 border border-lab-accent/20 text-[11px] text-lab-muted">
                <strong className="text-lab-accent">Industry Standard:</strong> Real-world protocols (TLS/HTTPS, SSH, PGP) combine both into <em>Hybrid Encryption</em>: RSA securely exchanges an AES key, and AES encrypts the message stream!
              </div>
            </div>
          </DashboardCard>

          {/* RSA Core Characteristics */}
          <DashboardCard
            title="Core Characteristics"
            subtitle="RSA Mathematical Properties"
            icon={FileCode2}
            badge="Specs"
            badgeColor="cyan"
          >
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center space-x-2 text-lab-muted">
                <CheckCircle className="w-3.5 h-3.5 text-lab-emerald shrink-0" />
                <span>Trapdoor one-way permutation</span>
              </div>
              <div className="flex items-center space-x-2 text-lab-muted">
                <CheckCircle className="w-3.5 h-3.5 text-lab-emerald shrink-0" />
                <span>Security relies on Integer Factorization problem</span>
              </div>
              <div className="flex items-center space-x-2 text-lab-muted">
                <CheckCircle className="w-3.5 h-3.5 text-lab-emerald shrink-0" />
                <span>Common public exponent: 65537 (Fermat prime F₄)</span>
              </div>
              <div className="flex items-center space-x-2 text-lab-muted">
                <CheckCircle className="w-3.5 h-3.5 text-lab-emerald shrink-0" />
                <span>Production key sizes: 2048-bit & 3072-bit</span>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};
