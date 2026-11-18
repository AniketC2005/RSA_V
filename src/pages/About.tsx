import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import {
  Info,
  Shield,
  Terminal,
  Cpu,
  CheckCircle2,
  FileCode2,
  Users,
  Code2,
  Layers,
  Heart,
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="pb-4 border-b border-lab-border">
        <h2 className="text-xl sm:text-2xl font-bold text-lab-text flex items-center space-x-2">
          <Info className="w-6 h-6 text-lab-accent" />
          <span>About RSA LAB Cryptography Simulator</span>
        </h2>
        <p className="text-xs sm:text-sm text-lab-muted mt-1">
          Architectural overview, academic mission, and engineering verification report.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mission & Purpose */}
        <DashboardCard
          title="Educational Mission & Purpose"
          subtitle="Designed for academic demonstrations and cryptography education"
          icon={Shield}
          badge="Educational"
          badgeColor="cyan"
        >
          <div className="space-y-3 text-xs text-lab-muted leading-relaxed">
            <p>
              <strong className="text-lab-text font-semibold">RSA LAB</strong> was built as a
              rigorous, interactive cyber-laboratory designed for university computer science
              courses, cybersecurity workshops, and academic presentations.
            </p>
            <p>
              Traditional cryptography tools either simplify the mathematics into static diagrams or
              hide the operations behind opaque backend libraries. RSA LAB bridges this divide by
              providing:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-lab-text font-mono">
              <li>Inspectable BigInt modular arithmetic with step-by-step traces</li>
              <li>Interactive Extended Euclidean Algorithm division tables</li>
              <li>Real Web Crypto API production keys (2048 & 3072 bits)</li>
              <li>A complete RSA-OAEP + AES-256-GCM Hybrid Cryptosystem</li>
            </ul>
          </div>
        </DashboardCard>

        {/* The Pioneers */}
        <DashboardCard
          title="The Cryptographic Pioneers"
          subtitle="Ron Rivest, Adi Shamir, and Leonard Adleman"
          icon={Users}
          badge="MIT 1977"
          badgeColor="amber"
        >
          <div className="space-y-3 text-xs text-lab-muted leading-relaxed">
            <p>
              In April 1977, after spending a year attempting to prove that asymmetric encryption was
              mathematically impossible, Ron Rivest, Adi Shamir, and Leonard Adleman at the
              Massachusetts Institute of Technology (MIT) made their landmark discovery.
            </p>
            <div className="p-3 bg-lab-bg rounded-lg border border-lab-border space-y-1 font-mono text-[11px]">
              <div>
                <strong className="text-lab-accent">R — Ron Rivest:</strong> Computer scientist, Turing
                Award laureate, author of MD5, RC4, and RSA.
              </div>
              <div>
                <strong className="text-lab-emerald">S — Adi Shamir:</strong> Israeli cryptographer,
                co-inventor of Shamir's Secret Sharing and differential cryptanalysis.
              </div>
              <div>
                <strong className="text-lab-amber">A — Leonard Adleman:</strong> Theoretical computer
                scientist who coined the term "computer virus" and pioneered DNA computing.
              </div>
            </div>
            <p className="text-[11px]">
              Their algorithm secured the internet revolution, forming the foundation of SSL/TLS,
              SSH, VPN tunnels, and digital certificate authorities.
            </p>
          </div>
        </DashboardCard>

        {/* Technology Stack */}
        <DashboardCard
          title="Technology Architecture"
          subtitle="Modern browser-native engineering stack"
          icon={Code2}
          badge="Client-Side"
          badgeColor="emerald"
        >
          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-lab-bg border border-lab-border/40">
              <span className="text-lab-muted">Frontend Framework:</span>
              <span className="text-lab-text font-bold">React 18 + TypeScript</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-lab-bg border border-lab-border/40">
              <span className="text-lab-muted">Styling & Design:</span>
              <span className="text-lab-text font-bold">Tailwind CSS (Custom Dark Lab Theme)</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-lab-bg border border-lab-border/40">
              <span className="text-lab-muted">Iconography:</span>
              <span className="text-lab-text font-bold">Lucide React</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-lab-bg border border-lab-border/40">
              <span className="text-lab-muted">Mathematical Engine:</span>
              <span className="text-lab-accent font-bold">JavaScript BigInt Precision Core</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-lab-bg border border-lab-border/40">
              <span className="text-lab-muted">Cryptographic Subsystem:</span>
              <span className="text-lab-emerald font-bold">W3C Web Crypto API (crypto.subtle)</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-lab-bg border border-lab-border/40">
              <span className="text-lab-muted">Unit Testing Engine:</span>
              <span className="text-lab-amber font-bold">Vitest 2.1 (100% Automated Suite)</span>
            </div>
          </div>
        </DashboardCard>

        {/* Local Setup & Verification */}
        <DashboardCard
          title="Local Run & Build Instructions"
          subtitle="Zero external server dependencies"
          icon={Terminal}
          badge="Quickstart"
          badgeColor="slate"
        >
          <div className="space-y-3 font-mono text-xs text-lab-muted">
            <p className="font-sans text-xs">Run this laboratory on any standard computer:</p>
            <div className="p-3 bg-lab-bg rounded-lg border border-lab-border space-y-1.5 text-lab-accent text-[11px]">
              <div># 1. Install dependencies</div>
              <div className="text-lab-text">npm install</div>
              <div className="mt-2"># 2. Run automated test suite (Educational & WebCrypto)</div>
              <div className="text-lab-text">npm test</div>
              <div className="mt-2"># 3. Start local development server</div>
              <div className="text-lab-text">npm run dev</div>
              <div className="mt-2"># 4. Compile production distribution</div>
              <div className="text-lab-text">npm run build</div>
            </div>
            <div className="p-2.5 rounded bg-lab-emerald/10 border border-lab-emerald/20 text-lab-emerald text-[11px] font-sans">
              ✓ Fully functional offline. No keys, plaintexts, or ciphertexts leave your device.
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Verification Report */}
      <div className="p-5 rounded-2xl bg-lab-card border border-lab-emerald/30 space-y-3 font-mono text-xs">
        <div className="flex items-center space-x-2 text-lab-emerald font-bold text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>Cryptographic Test Vector Verification Status</span>
        </div>
        <p className="text-lab-muted font-sans text-xs leading-relaxed">
          The mathematical algorithms running inside this application were tested against the standard
          academic test vector:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 bg-lab-bg rounded border border-lab-border">
            <span className="text-lab-muted text-[10px] block">Primes</span>
            <span className="text-lab-text font-bold">p=61, q=53</span>
          </div>
          <div className="p-2 bg-lab-bg rounded border border-lab-border">
            <span className="text-lab-muted text-[10px] block">Modulus n & φ</span>
            <span className="text-lab-accent font-bold">n=3233, φ=3120</span>
          </div>
          <div className="p-2 bg-lab-bg rounded border border-lab-border">
            <span className="text-lab-muted text-[10px] block">Keys (e, d)</span>
            <span className="text-lab-emerald font-bold">e=17, d=2753</span>
          </div>
          <div className="p-2 bg-lab-bg rounded border border-lab-border">
            <span className="text-lab-muted text-[10px] block">Test m ➔ c ➔ m</span>
            <span className="text-lab-amber font-bold">65 ➔ 2790 ➔ 65 ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
};
