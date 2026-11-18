import React, { useState } from 'react';
import { useRSA } from '../context/RSAContext';
import { DashboardCard } from '../components/DashboardCard';
import { MathStepViewer, ViewerStep } from '../components/MathStepViewer';
import { extendedEuclideanAlgorithm } from '../crypto/extendedEuclidean';
import { modularExponentiationWithSteps } from '../crypto/modularExponentiation';
import { generateEducationalKeyPair, STANDARD_TEST_VECTOR } from '../crypto/rsaMath';
import {
  Cpu,
  Binary,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  GitCommit,
  CheckCircle2,
  Table,
  Sigma,
} from 'lucide-react';

export const RSAVisualizer: React.FC = () => {
  const {
    educationalKeyPair,
    visualizerParams,
    setVisualizerParams,
    setEducationalKeyPair,
    addToast,
  } = useRSA();

  // Active visualization sub-tab: 'keygen' | 'eea' | 'modexp' | 'comparison'
  const [activeSubTab, setActiveSubTab] = useState<'keygen' | 'eea' | 'modexp' | 'comparison'>('keygen');

  // Input states for custom visualizer parameters
  const [inputP, setInputP] = useState<string>(visualizerParams.p.toString());
  const [inputQ, setInputQ] = useState<string>(visualizerParams.q.toString());
  const [inputE, setInputE] = useState<string>(visualizerParams.e.toString());
  const [inputM, setInputM] = useState<string>(visualizerParams.m.toString());

  // Calculate live parameters from inputs
  let p = visualizerParams.p;
  let q = visualizerParams.q;
  let e = visualizerParams.e;
  let m = visualizerParams.m;

  const handleApplyParams = () => {
    try {
      const parsedP = BigInt(inputP.trim());
      const parsedQ = BigInt(inputQ.trim());
      const parsedE = BigInt(inputE.trim());
      const parsedM = BigInt(inputM.trim());

      const kp = generateEducationalKeyPair(parsedP, parsedQ, parsedE);
      setEducationalKeyPair(kp);
      setVisualizerParams({ p: parsedP, q: parsedQ, e: parsedE, m: parsedM });
      addToast('success', 'Visualizer Parameters Updated', `p=${parsedP}, q=${parsedQ}, e=${parsedE}, m=${parsedM}`);
    } catch (err: any) {
      addToast('error', 'Invalid Parameters', err.message);
    }
  };

  const handleLoadStandardVector = () => {
    setInputP(STANDARD_TEST_VECTOR.p.toString());
    setInputQ(STANDARD_TEST_VECTOR.q.toString());
    setInputE(STANDARD_TEST_VECTOR.e.toString());
    setInputM(STANDARD_TEST_VECTOR.m.toString());

    const kp = generateEducationalKeyPair(
      STANDARD_TEST_VECTOR.p,
      STANDARD_TEST_VECTOR.q,
      STANDARD_TEST_VECTOR.e
    );
    setEducationalKeyPair(kp);
    setVisualizerParams({
      p: STANDARD_TEST_VECTOR.p,
      q: STANDARD_TEST_VECTOR.q,
      e: STANDARD_TEST_VECTOR.e,
      m: STANDARD_TEST_VECTOR.m,
    });
    addToast('info', 'Loaded Standard Test Vector', 'p=61, q=53, e=17, m=65');
  };

  // Derive values for active visualization
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  const eeaResult = extendedEuclideanAlgorithm(e, phi);
  const d = eeaResult.inverse ?? 0n;

  // Run encryption modular exponentiation
  const encModExp = modularExponentiationWithSteps(m, e, n);
  const c = encModExp.result;

  // Run decryption modular exponentiation
  const decModExp = modularExponentiationWithSteps(c, d, n);

  // 1. Convert Keygen Steps for MathStepViewer
  const keygenViewerSteps: ViewerStep[] = [
    {
      step: 1,
      title: 'Step 1: Choose Two Distinct Primes',
      expression: `p = ${p}, q = ${q}`,
      details: `Primes p and q are the secret foundational factors. In real RSA, they are generated using cryptographically secure pseudo-random number generators and verified with Miller-Rabin primality tests.`,
      result: `Primes chosen`,
    },
    {
      step: 2,
      title: 'Step 2: Calculate RSA Modulus n',
      expression: `n = p × q = ${p} × ${q} = ${n}`,
      details: `The modulus n forms part of both the public key and private key. It is published openly. The security of RSA relies on the assumption that factoring n into p and q is computationally infeasible for 2048-bit or 3072-bit integers.`,
      result: `n = ${n}`,
    },
    {
      step: 3,
      title: "Step 3: Calculate Euler's Totient φ(n)",
      expression: `φ(n) = (p - 1) × (q - 1) = (${p - 1n}) × (${q - 1n}) = ${phi}`,
      details: `Euler's totient function φ(n) counts positive integers up to n that are relatively prime to n. This value must remain strictly confidential because anyone who knows φ(n) can compute the private key d!`,
      result: `φ(n) = ${phi}`,
    },
    {
      step: 4,
      title: 'Step 4: Select Public Exponent e',
      expression: `gcd(e, φ(n)) = gcd(${e}, ${phi}) = 1`,
      details: `The public exponent e must satisfy 1 < e < φ(n) and must be coprime to φ(n). The most common real-world choice is 65537 (2¹⁶ + 1), which has only two binary 1-bits, enabling fast encryption.`,
      result: `e = ${e}`,
    },
    {
      step: 5,
      title: 'Step 5: Calculate Private Exponent d',
      expression: `d = e⁻¹ mod φ(n) = ${e}⁻¹ mod ${phi} = ${d}`,
      details: `Using the Extended Euclidean Algorithm, solve for d such that (e × d) ≡ 1 (mod φ(n)). Verification: (${e} × ${d}) mod ${phi} = ${(e * d) % phi}.`,
      result: `d = ${d}`,
    },
    {
      step: 6,
      title: 'Step 6: Assemble Public and Private Key Pairs',
      expression: `Public Key = (e, n) = (${e}, ${n}) | Private Key = (d, n) = (${d}, ${n})`,
      details: `The public key (e, n) is distributed to senders to encrypt messages. The private key (d, n) is kept confidential by the receiver to decrypt messages.`,
      result: `Keys Active`,
    },
  ];

  // 2. Convert Modular Exponentiation Encryption Steps
  const modExpViewerSteps: ViewerStep[] = encModExp.steps.map((st, i) => ({
    step: st.step || i + 1,
    title: st.operation,
    expression: `Bit index ${st.bitIndex >= 0 ? st.bitIndex : 'init'} (Bit: ${st.bit >= 0 ? st.bit : '-'}): Accumulator = ${st.currentValue.toString()}`,
    details: st.explanation,
    result: st.currentValue.toString(),
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-lab-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-lab-text flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-lab-accent" />
            <span>RSA Mathematical Visualizer</span>
          </h2>
          <p className="text-xs sm:text-sm text-lab-muted mt-1">
            Step through real computations: Extended Euclidean Algorithm, Square-and-Multiply, and Key Derivation.
          </p>
        </div>

        {/* Preset Button */}
        <button
          onClick={handleLoadStandardVector}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-lab-amber/10 hover:bg-lab-amber/20 border border-lab-amber/30 text-lab-amber text-xs font-mono font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Standard Test Vector (p=61, q=53, e=17, m=65)</span>
        </button>
      </div>

      {/* Parameter Control Bar */}
      <div className="bg-lab-card rounded-2xl border border-lab-border p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 pb-2 border-b border-lab-border/40 gap-2">
          <span className="text-xs font-mono font-semibold text-lab-accent flex items-center space-x-2">
            <Binary className="w-4 h-4" />
            <span>Visualizer Input Parameters (BigInt Engine)</span>
          </span>
          <span className="text-[11px] font-mono text-lab-muted">
            All tables dynamically compute from these live inputs
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <label className="text-lab-muted text-[11px] block mb-1">Prime p:</label>
            <input
              type="text"
              value={inputP}
              onChange={(e) => setInputP(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-lab-bg rounded-lg border border-lab-border text-lab-text focus:outline-none focus:border-lab-accent"
            />
          </div>
          <div>
            <label className="text-lab-muted text-[11px] block mb-1">Prime q:</label>
            <input
              type="text"
              value={inputQ}
              onChange={(e) => setInputQ(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-lab-bg rounded-lg border border-lab-border text-lab-text focus:outline-none focus:border-lab-accent"
            />
          </div>
          <div>
            <label className="text-lab-muted text-[11px] block mb-1">Public Exponent e:</label>
            <input
              type="text"
              value={inputE}
              onChange={(e) => setInputE(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-lab-bg rounded-lg border border-lab-border text-lab-text focus:outline-none focus:border-lab-accent"
            />
          </div>
          <div>
            <label className="text-lab-muted text-[11px] block mb-1">Numeric Message m:</label>
            <input
              type="text"
              value={inputM}
              onChange={(e) => setInputM(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-lab-bg rounded-lg border border-lab-border text-lab-text focus:outline-none focus:border-lab-accent"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={handleApplyParams}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-lab-accent hover:bg-lab-accentHover text-lab-bg font-semibold text-xs font-mono transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Update Visualizer Computations</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-lab-border space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('keygen')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-mono font-semibold rounded-t-xl transition-all ${
            activeSubTab === 'keygen'
              ? 'bg-lab-card text-lab-accent border-t-2 border-x border-lab-accent/50 border-b-0 shadow-sm'
              : 'text-lab-muted hover:text-lab-text hover:bg-lab-card/30'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>1. Key Generation Stages</span>
        </button>

        <button
          onClick={() => setActiveSubTab('eea')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-mono font-semibold rounded-t-xl transition-all ${
            activeSubTab === 'eea'
              ? 'bg-lab-card text-lab-accent border-t-2 border-x border-lab-accent/50 border-b-0 shadow-sm'
              : 'text-lab-muted hover:text-lab-text hover:bg-lab-card/30'
          }`}
        >
          <Table className="w-4 h-4 text-lab-emerald" />
          <span>2. Extended Euclidean Algorithm (EEA)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('modexp')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-mono font-semibold rounded-t-xl transition-all ${
            activeSubTab === 'modexp'
              ? 'bg-lab-card text-lab-accent border-t-2 border-x border-lab-accent/50 border-b-0 shadow-sm'
              : 'text-lab-muted hover:text-lab-text hover:bg-lab-card/30'
          }`}
        >
          <Binary className="w-4 h-4 text-lab-amber" />
          <span>3. Modular Exponentiation (Square & Multiply)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('comparison')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-mono font-semibold rounded-t-xl transition-all ${
            activeSubTab === 'comparison'
              ? 'bg-lab-card text-lab-accent border-t-2 border-x border-lab-accent/50 border-b-0 shadow-sm'
              : 'text-lab-muted hover:text-lab-text hover:bg-lab-card/30'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>4. Encryption vs Decryption Duality</span>
        </button>
      </div>

      {/* Sub-Tab 1: Key Generation Stages */}
      {activeSubTab === 'keygen' && (
        <div className="space-y-6">
          <MathStepViewer
            steps={keygenViewerSteps}
            title="RSA Key Generation Step-by-Step Walkthrough"
            subtitle="Navigate each mathematical phase from prime selection to public/private key pairs"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-lab-card border border-lab-border text-xs font-mono space-y-1.5">
              <span className="text-lab-muted text-[10px] block">Public Modulus:</span>
              <span className="text-lab-text font-bold text-base">{n.toString()}</span>
              <span className="text-lab-muted block text-[11px]">
                Product of {p.toString()} × {q.toString()}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-lab-card border border-lab-border text-xs font-mono space-y-1.5">
              <span className="text-lab-muted text-[10px] block">Euler's Totient φ(n):</span>
              <span className="text-lab-emerald font-bold text-base">{phi.toString()}</span>
              <span className="text-lab-muted block text-[11px]">
                ({(p - 1n).toString()}) × ({(q - 1n).toString()})
              </span>
            </div>
            <div className="p-4 rounded-xl bg-lab-card border border-lab-border text-xs font-mono space-y-1.5">
              <span className="text-lab-muted text-[10px] block">Modular Inverse d:</span>
              <span className="text-lab-amber font-bold text-base">{d.toString()}</span>
              <span className="text-lab-muted block text-[11px]">
                ({e.toString()} × {d.toString()}) mod {phi.toString()} = 1
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Extended Euclidean Algorithm */}
      {activeSubTab === 'eea' && (
        <div className="space-y-6">
          <DashboardCard
            title="Extended Euclidean Algorithm (EEA) Execution Trace"
            subtitle={`Finding private exponent d = ${e}⁻¹ mod ${phi} such that (${e} × d) ≡ 1 (mod ${phi})`}
            icon={Table}
            badge="Modular Inverse"
            badgeColor="emerald"
          >
            <div className="space-y-5">
              {/* EEA Explanation Box */}
              <div className="p-3.5 rounded-xl bg-lab-bg border border-lab-border text-xs text-lab-muted leading-relaxed font-mono">
                <span className="text-lab-accent font-semibold block mb-1">
                  Bézout's Identity:
                </span>
                <span>
                  The EEA computes integers x and y satisfying:{' '}
                  <strong className="text-lab-text font-bold">
                    ({e.toString()} × x) + ({phi.toString()} × y) = gcd({e.toString()}, {phi.toString()}) = {eeaResult.gcd.toString()}
                  </strong>
                  .
                </span>
                <p className="mt-1">
                  When gcd is 1, reducing both sides modulo φ(n) yields:{' '}
                  <span className="text-lab-emerald font-bold">
                    ({e.toString()} × x) ≡ 1 (mod {phi.toString()})
                  </span>
                  . Thus, private exponent{' '}
                  <span className="text-lab-amber font-bold">d = {d.toString()}</span>.
                </p>
              </div>

              {/* EEA Steps Table */}
              <div className="overflow-x-auto rounded-xl border border-lab-border">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-lab-bg text-lab-muted border-b border-lab-border uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Step</th>
                      <th className="py-2.5 px-3">Dividend (a)</th>
                      <th className="py-2.5 px-3">Divisor (b)</th>
                      <th className="py-2.5 px-3">Quotient (q)</th>
                      <th className="py-2.5 px-3">Remainder (r)</th>
                      <th className="py-2.5 px-3">Bézout x</th>
                      <th className="py-2.5 px-3">Bézout y</th>
                      <th className="py-2.5 px-3">Division Equation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lab-border/40">
                    {eeaResult.steps.map((st) => (
                      <tr
                        key={st.step}
                        className={`hover:bg-lab-card/80 transition-colors ${
                          st.remainder === 0n ? 'bg-lab-emerald/10 font-bold' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-lab-muted">{st.step}</td>
                        <td className="py-2 px-3 text-lab-text">{st.a.toString()}</td>
                        <td className="py-2 px-3 text-lab-text">{st.b.toString()}</td>
                        <td className="py-2 px-3 text-lab-accent">{st.quotient.toString()}</td>
                        <td className="py-2 px-3 text-lab-emerald">{st.remainder.toString()}</td>
                        <td className="py-2 px-3 text-lab-amber">{st.x.toString()}</td>
                        <td className="py-2 px-3 text-lab-muted">{st.y.toString()}</td>
                        <td className="py-2 px-3 text-lab-muted text-[11px]">{st.equation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Final Verification banner */}
              <div className="p-3 rounded-xl bg-lab-emerald/10 border border-lab-emerald/30 font-mono text-xs text-lab-text flex items-center justify-between">
                <span>Verification Check:</span>
                <span className="text-lab-emerald font-bold">
                  ({e.toString()} × {d.toString()}) mod {phi.toString()} = {((e * d) % phi).toString()} ≡ 1 (mod φ(n)) ✓
                </span>
              </div>
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Sub-Tab 3: Modular Exponentiation (Square & Multiply) */}
      {activeSubTab === 'modexp' && (
        <div className="space-y-6">
          <DashboardCard
            title="Square-and-Multiply Algorithm (Binary Modular Exponentiation)"
            subtitle={`Calculating c = (${m}^${e}) mod ${n} in O(log e) steps instead of O(e) operations`}
            icon={Binary}
            badge="O(log n) Efficiency"
            badgeColor="amber"
          >
            <div className="space-y-5">
              {/* Binary Exponent Banner */}
              <div className="p-3.5 rounded-xl bg-lab-bg border border-lab-border font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-lab-muted">Exponent:</span>
                  <span className="text-lab-accent font-bold">e = {e.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lab-muted">Binary Representation:</span>
                  <span className="text-lab-emerald font-bold tracking-widest">
                    {encModExp.binaryExponent} ({encModExp.binaryExponent.length} bits)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lab-muted">Modulus:</span>
                  <span className="text-lab-text font-bold">n = {n.toString()}</span>
                </div>
              </div>

              {/* Interactive Step-by-Step Viewer */}
              <MathStepViewer
                steps={modExpViewerSteps}
                title="Bit-by-Bit Execution Animation"
                subtitle="Watch the accumulator update at every square and multiply operation"
              />

              {/* Complete Step Table */}
              <div className="overflow-x-auto rounded-xl border border-lab-border">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-lab-bg text-lab-muted border-b border-lab-border uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Step</th>
                      <th className="py-2.5 px-3">Bit Index</th>
                      <th className="py-2.5 px-3">Bit Value</th>
                      <th className="py-2.5 px-3">Operation</th>
                      <th className="py-2.5 px-3">Accumulator Value</th>
                      <th className="py-2.5 px-3">Mathematical Transformation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lab-border/40">
                    {encModExp.steps.map((st) => (
                      <tr key={st.step} className="hover:bg-lab-card/80 transition-colors">
                        <td className="py-2 px-3 text-lab-muted">{st.step}</td>
                        <td className="py-2 px-3 text-lab-text">
                          {st.bitIndex >= 0 ? st.bitIndex : '-'}
                        </td>
                        <td className="py-2 px-3">
                          {st.bit >= 0 ? (
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                st.bit === 1
                                  ? 'bg-lab-emerald/20 text-lab-emerald'
                                  : 'bg-lab-secondary text-lab-muted'
                              }`}
                            >
                              {st.bit}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              st.operation === 'Square'
                                ? 'bg-lab-accent/10 text-lab-accent'
                                : st.operation === 'Multiply'
                                ? 'bg-lab-amber/10 text-lab-amber'
                                : 'bg-lab-secondary text-lab-muted'
                            }`}
                          >
                            {st.operation}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-lab-text font-bold">
                          {st.currentValue.toString()}
                        </td>
                        <td className="py-2 px-3 text-lab-muted text-[11px]">{st.explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Result Summary */}
              <div className="p-3 rounded-xl bg-lab-emerald/10 border border-lab-emerald/30 font-mono text-xs flex items-center justify-between">
                <span className="text-lab-muted">Final Ciphertext Result:</span>
                <span className="text-lab-emerald font-bold text-sm">c = {c.toString()}</span>
              </div>
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Sub-Tab 4: Side-by-Side Encryption vs Decryption Duality */}
      {activeSubTab === 'comparison' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Encryption Workflow */}
            <DashboardCard
              title="Encryption Pipeline"
              subtitle="Plaintext m → Ciphertext c using Public Key (e, n)"
              icon={Binary}
              badge="c = mᵉ mod n"
              badgeColor="emerald"
            >
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 bg-lab-bg rounded-lg border border-lab-border space-y-1">
                  <span className="text-lab-muted text-[10px] block">Input Plaintext (m):</span>
                  <span className="text-lab-text font-bold text-base">{m.toString()}</span>
                </div>

                <div className="flex items-center justify-center space-x-2 text-lab-accent">
                  <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                  <span className="text-[11px]">Raise to Public Exponent e = {e.toString()}</span>
                </div>

                <div className="p-3 bg-lab-bg rounded-lg border border-lab-border space-y-1">
                  <span className="text-lab-muted text-[10px] block">
                    Modular Reduction (mod {n.toString()}):
                  </span>
                  <span className="text-lab-emerald font-bold text-base">
                    c = ({m.toString()}
                    <sup>{e.toString()}</sup>) mod {n.toString()} = {c.toString()}
                  </span>
                </div>
              </div>
            </DashboardCard>

            {/* Decryption Workflow */}
            <DashboardCard
              title="Decryption Pipeline"
              subtitle="Ciphertext c → Plaintext m using Private Key (d, n)"
              icon={Cpu}
              badge="m = cᵈ mod n"
              badgeColor="amber"
            >
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 bg-lab-bg rounded-lg border border-lab-border space-y-1">
                  <span className="text-lab-muted text-[10px] block">Ciphertext (c):</span>
                  <span className="text-lab-emerald font-bold text-base">{c.toString()}</span>
                </div>

                <div className="flex items-center justify-center space-x-2 text-lab-amber">
                  <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                  <span className="text-[11px]">Raise to Private Exponent d = {d.toString()}</span>
                </div>

                <div className="p-3 bg-lab-bg rounded-lg border border-lab-border space-y-1">
                  <span className="text-lab-muted text-[10px] block">
                    Modular Reduction (mod {n.toString()}):
                  </span>
                  <span className="text-lab-text font-bold text-base">
                    m = ({c.toString()}
                    <sup>{d.toString()}</sup>) mod {n.toString()} = {decModExp.result.toString()}
                  </span>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Mathematical Proof Box */}
          <div className="p-5 rounded-2xl bg-lab-card border border-lab-accent/30 space-y-3 font-mono text-xs">
            <h4 className="text-sm font-bold text-lab-accent flex items-center space-x-2">
              <Sigma className="w-4 h-4" />
              <span>Why Does Decryption Invert Encryption? (Euler's Theorem Proof)</span>
            </h4>
            <div className="space-y-2 text-lab-muted leading-relaxed font-sans text-xs">
              <p>
                By construction, the private exponent satisfies{' '}
                <code className="text-lab-accent font-mono">e × d ≡ 1 (mod φ(n))</code>.
                Therefore, there exists some integer <code className="font-mono">k</code> such that{' '}
                <code className="text-lab-accent font-mono">e × d = k · φ(n) + 1</code>.
              </p>
              <p>
                When decrypting the ciphertext{' '}
                <code className="text-lab-text font-mono">c = mᵉ mod n</code>:
              </p>
              <div className="p-3 rounded-lg bg-lab-bg border border-lab-border font-mono text-lab-text text-xs">
                cᵈ ≡ (mᵉ)ᵈ ≡ m^(e·d) ≡ m^(k·φ(n) + 1) ≡ (m^φ(n))^k × m¹ (mod n)
              </div>
              <p>
                By Euler's Totient Theorem, for any integer <code className="font-mono">m</code> coprime
                to <code className="font-mono">n</code>:{' '}
                <code className="text-lab-emerald font-mono">m^φ(n) ≡ 1 (mod n)</code>.
              </p>
              <div className="p-3 rounded-lg bg-lab-bg border border-lab-border font-mono text-lab-emerald text-xs">
                (1)^k × m ≡ 1 × m ≡ m (mod n)
              </div>
              <p>
                Hence, raising ciphertext <code className="font-mono">c</code> to power{' '}
                <code className="font-mono">d</code> invariably reconstructs the exact original message{' '}
                <code className="text-lab-emerald font-mono">m</code>!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
