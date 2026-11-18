import React, { useState } from 'react';
import { useRSA } from '../context/RSAContext';
import { DashboardCard } from '../components/DashboardCard';
import { KeyDisplay } from '../components/KeyDisplay';
import {
  generateEducationalKeyPair,
  isPrime,
  areCoprime,
  gcd,
  getCandidateExponents,
  getRandomEducationalPrime,
  STANDARD_TEST_VECTOR,
} from '../crypto/rsaMath';
import { extendedEuclideanAlgorithm } from '../crypto/extendedEuclidean';
import {
  KeyRound,
  Shield,
  Sparkles,
  RefreshCw,
  Calculator,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Sliders,
} from 'lucide-react';

export const KeyGeneration: React.FC = () => {
  const {
    educationalKeyPair,
    setEducationalKeyPair,
    secureKeyPair,
    isGeneratingSecureKey,
    generateSecureKey,
    addToast,
    setVisualizerParams,
  } = useRSA();

  // Mode tab: 'educational' or 'secure'
  const [activeMode, setActiveMode] = useState<'educational' | 'secure'>('educational');

  // Educational Form State
  const [pInput, setPInput] = useState<string>(educationalKeyPair.p.toString());
  const [qInput, setQInput] = useState<string>(educationalKeyPair.q.toString());
  const [eInput, setEInput] = useState<string>(educationalKeyPair.e.toString());
  const [autoSelectE, setAutoSelectE] = useState<boolean>(false);
  const [candidateExponents, setCandidateExponents] = useState<bigint[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Secure Keygen State
  const [selectedKeySize, setSelectedKeySize] = useState<2048 | 3072>(2048);

  // Live checks for p and q
  const pBigInt = (() => {
    try {
      return BigInt(pInput.trim());
    } catch {
      return null;
    }
  })();

  const qBigInt = (() => {
    try {
      return BigInt(qInput.trim());
    } catch {
      return null;
    }
  })();

  const eBigInt = (() => {
    try {
      return BigInt(eInput.trim());
    } catch {
      return null;
    }
  })();

  const isPPrime = pBigInt !== null && isPrime(pBigInt);
  const isQPrime = qBigInt !== null && isPrime(qBigInt);
  const arePrimesDistinct = pBigInt !== null && qBigInt !== null && pBigInt !== qBigInt;

  // Calculate phi preview if p and q are valid
  const previewPhi =
    isPPrime && isQPrime && arePrimesDistinct && pBigInt && qBigInt
      ? (pBigInt - 1n) * (qBigInt - 1n)
      : null;

  // Update candidate public exponents whenever phi preview changes
  React.useEffect(() => {
    if (previewPhi) {
      const candidates = getCandidateExponents(previewPhi);
      setCandidateExponents(candidates);
      if (autoSelectE && candidates.length > 0) {
        setEInput(candidates[0].toString());
      }
    } else {
      setCandidateExponents([]);
    }
  }, [previewPhi, autoSelectE]);

  // Handle Random Prime Generation
  const handleGenerateRandomPrimes = () => {
    const p = getRandomEducationalPrime();
    const q = getRandomEducationalPrime(p);
    setPInput(p.toString());
    setQInput(q.toString());
    setValidationError(null);

    const phi = (p - 1n) * (q - 1n);
    const candidates = getCandidateExponents(phi);
    if (candidates.length > 0) {
      setEInput(candidates[0].toString());
    }
    addToast('info', 'Random Primes Selected', `Selected p=${p}, q=${q}.`);
  };

  // Handle Standard Test Vector Load
  const handleLoadStandardVector = () => {
    setPInput(STANDARD_TEST_VECTOR.p.toString());
    setQInput(STANDARD_TEST_VECTOR.q.toString());
    setEInput(STANDARD_TEST_VECTOR.e.toString());
    setValidationError(null);
    try {
      const kp = generateEducationalKeyPair(
        STANDARD_TEST_VECTOR.p,
        STANDARD_TEST_VECTOR.q,
        STANDARD_TEST_VECTOR.e
      );
      setEducationalKeyPair(kp);
      setVisualizerParams((prev) => ({
        ...prev,
        p: kp.p,
        q: kp.q,
        e: kp.e,
      }));
      addToast('success', 'Standard Test Vector Loaded', 'p=61, q=53, e=17 applied.');
    } catch (err: any) {
      setValidationError(err.message);
    }
  };

  // Execute Educational Key Generation
  const handleCalculateEducationalKeys = () => {
    setValidationError(null);
    try {
      if (!pBigInt || !isPPrime) {
        throw new Error('Parameter p must be a valid prime number > 1.');
      }
      if (!qBigInt || !isQPrime) {
        throw new Error('Parameter q must be a valid prime number > 1.');
      }
      if (!arePrimesDistinct) {
        throw new Error('Parameters p and q must be distinct primes.');
      }

      const eToUse = autoSelectE ? undefined : eBigInt ?? undefined;
      const keyPair = generateEducationalKeyPair(pBigInt, qBigInt, eToUse);

      setEducationalKeyPair(keyPair);
      setEInput(keyPair.e.toString());
      setVisualizerParams((prev) => ({
        ...prev,
        p: keyPair.p,
        q: keyPair.q,
        e: keyPair.e,
      }));

      addToast(
        'success',
        'Key Pair Generated Successfully',
        `Modulus n=${keyPair.n}, φ(n)=${keyPair.phi}, e=${keyPair.e}, d=${keyPair.d}.`
      );
    } catch (err: any) {
      setValidationError(err.message);
      addToast('error', 'Key Generation Error', err.message);
    }
  };

  // Reset to empty
  const handleReset = () => {
    setPInput('');
    setQInput('');
    setEInput('');
    setValidationError(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-lab-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-lab-text flex items-center space-x-2">
            <KeyRound className="w-6 h-6 text-lab-accent" />
            <span>RSA Key Generation Simulator</span>
          </h2>
          <p className="text-xs sm:text-sm text-lab-muted mt-1">
            Generate educational small-number parameters or production 2048/3072-bit Web Crypto keys.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-lab-card border border-lab-border">
          <button
            onClick={() => setActiveMode('educational')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
              activeMode === 'educational'
                ? 'bg-lab-accent text-lab-bg shadow-sm'
                : 'text-lab-muted hover:text-lab-text'
            }`}
          >
            Educational Mode (BigInt)
          </button>
          <button
            onClick={() => setActiveMode('secure')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
              activeMode === 'secure'
                ? 'bg-lab-emerald text-lab-bg shadow-sm'
                : 'text-lab-muted hover:text-lab-text'
            }`}
          >
            Secure Mode (Web Crypto)
          </button>
        </div>
      </div>

      {activeMode === 'educational' ? (
        /* EDUCATIONAL KEY GENERATION WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Inputs and Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <DashboardCard
              title="Step-by-Step Educational Key Derivation"
              subtitle="Enter prime numbers p and q to compute modulus n, Euler's totient φ(n), and exponents"
              icon={Sliders}
              badge="Textbook RSA"
              badgeColor="amber"
              headerAction={
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLoadStandardVector}
                    className="text-xs px-2.5 py-1 rounded bg-lab-amber/10 hover:bg-lab-amber/20 border border-lab-amber/30 text-lab-amber font-mono flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>p=61, q=53</span>
                  </button>
                  <button
                    onClick={handleGenerateRandomPrimes}
                    className="text-xs px-2.5 py-1 rounded bg-lab-secondary hover:bg-lab-card border border-lab-border text-lab-accent font-mono flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Random Primes</span>
                  </button>
                </div>
              }
            >
              <div className="space-y-5">
                {/* Step 1: Prime inputs */}
                <div>
                  <div className="text-xs font-mono font-semibold text-lab-accent mb-2 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-lab-accent/20 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Select Two Distinct Prime Numbers (p & q)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Prime p Input */}
                    <div>
                      <label className="block text-xs font-mono text-lab-muted mb-1">
                        Prime Number p:
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={pInput}
                          onChange={(e) => setPInput(e.target.value)}
                          placeholder="e.g. 61"
                          className="w-full px-3.5 py-2.5 bg-lab-bg rounded-xl border border-lab-border text-lab-text font-mono text-sm focus:outline-none focus:border-lab-accent"
                        />
                        <div className="absolute right-3 top-2.5">
                          {pBigInt !== null && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                isPPrime
                                  ? 'bg-lab-emerald/10 text-lab-emerald border border-lab-emerald/30'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {isPPrime ? 'PRIME' : 'NOT PRIME'}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-lab-muted mt-1">First secret prime factor</p>
                    </div>

                    {/* Prime q Input */}
                    <div>
                      <label className="block text-xs font-mono text-lab-muted mb-1">
                        Prime Number q:
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={qInput}
                          onChange={(e) => setQInput(e.target.value)}
                          placeholder="e.g. 53"
                          className="w-full px-3.5 py-2.5 bg-lab-bg rounded-xl border border-lab-border text-lab-text font-mono text-sm focus:outline-none focus:border-lab-accent"
                        />
                        <div className="absolute right-3 top-2.5">
                          {qBigInt !== null && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                isQPrime
                                  ? 'bg-lab-emerald/10 text-lab-emerald border border-lab-emerald/30'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {isQPrime ? 'PRIME' : 'NOT PRIME'}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-lab-muted mt-1">Second secret prime factor</p>
                    </div>
                  </div>
                </div>

                {/* Step 2 & 3: Modulus and Totient Preview */}
                <div className="p-3.5 rounded-xl bg-lab-bg/60 border border-lab-border space-y-2">
                  <div className="text-xs font-mono font-semibold text-lab-text flex items-center justify-between">
                    <span>
                      Intermediate Derivation: Modulus n and Euler's Totient φ(n)
                    </span>
                    <span className="text-[10px] text-lab-muted font-normal">
                      Computed automatically
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-lab-card p-2.5 rounded-lg border border-lab-border/40">
                      <span className="text-lab-muted text-[11px] block">
                        Modulus n = p × q:
                      </span>
                      <span className="text-lab-accent font-bold text-sm">
                        {pBigInt && qBigInt ? (pBigInt * qBigInt).toString() : '—'}
                      </span>
                    </div>
                    <div className="bg-lab-card p-2.5 rounded-lg border border-lab-border/40">
                      <span className="text-lab-muted text-[11px] block">
                        Euler's Totient φ(n) = (p-1)(q-1):
                      </span>
                      <span className="text-lab-emerald font-bold text-sm">
                        {previewPhi !== null ? previewPhi.toString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 4: Public Exponent Selection */}
                <div>
                  <div className="text-xs font-mono font-semibold text-lab-accent mb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-lab-accent/20 flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <span>Select Public Exponent e [gcd(e, φ(n)) = 1]</span>
                    </div>
                    <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-lab-muted">
                      <input
                        type="checkbox"
                        checked={autoSelectE}
                        onChange={(e) => setAutoSelectE(e.target.checked)}
                        className="rounded bg-lab-bg border-lab-border text-lab-accent focus:ring-0"
                      />
                      <span>Auto-select e</span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      disabled={autoSelectE}
                      value={eInput}
                      onChange={(e) => setEInput(e.target.value)}
                      placeholder="e.g. 17"
                      className={`w-full px-3.5 py-2.5 bg-lab-bg rounded-xl border border-lab-border text-lab-text font-mono text-sm focus:outline-none focus:border-lab-accent ${
                        autoSelectE ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    />
                    {previewPhi !== null && eBigInt !== null && (
                      <div className="absolute right-3 top-2.5">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            areCoprime(eBigInt, previewPhi) && eBigInt > 1n && eBigInt < previewPhi
                              ? 'bg-lab-emerald/10 text-lab-emerald border border-lab-emerald/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {areCoprime(eBigInt, previewPhi) && eBigInt > 1n && eBigInt < previewPhi
                            ? 'VALID COPRIME'
                            : 'INVALID EXPONENT'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Candidate exponent suggestions */}
                  {candidateExponents.length > 0 && !autoSelectE && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-lab-muted">Valid Coprime Candidates:</span>
                      {candidateExponents.map((cand) => (
                        <button
                          key={cand.toString()}
                          type="button"
                          onClick={() => setEInput(cand.toString())}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                            eInput === cand.toString()
                              ? 'bg-lab-accent text-lab-bg border-lab-accent font-bold'
                              : 'bg-lab-secondary text-lab-muted hover:text-lab-text border-lab-border'
                          }`}
                        >
                          e = {cand.toString()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {validationError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2.5 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleCalculateEducationalKeys}
                    className="flex-1 flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-lab-accent hover:bg-lab-accentHover text-lab-bg font-semibold text-xs sm:text-sm shadow-cyan-glow transition-all"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Calculate RSA Parameters & Generate Key Pair</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="px-4 py-3 rounded-xl bg-lab-secondary hover:bg-lab-card border border-lab-border text-lab-muted hover:text-lab-text text-xs sm:text-sm font-mono transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Right Column: Live Key Output & Mathematical Steps (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <DashboardCard
              title="Active Educational Keys"
              subtitle="Derived public key (e, n) and private key (d, n)"
              icon={Lock}
              badge="BigInt"
              badgeColor="cyan"
            >
              <KeyDisplay educationalKey={educationalKeyPair} mode="educational" />

              {/* Mathematical inspection notes */}
              {educationalKeyPair.notes && educationalKeyPair.notes.length > 0 && (
                <div className="mt-4 pt-3 border-t border-lab-border/40 space-y-1.5 font-mono text-[11px] text-lab-muted">
                  <span className="text-lab-accent font-semibold block text-xs">
                    Derivation Notes:
                  </span>
                  {educationalKeyPair.notes.map((note, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5">
                      <span className="text-lab-accent">▸</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>

            {/* Warning card regarding small primes */}
            <div className="p-4 rounded-xl bg-lab-amber/10 border border-lab-amber/30 text-xs text-lab-muted space-y-1.5">
              <div className="flex items-center space-x-2 text-lab-amber font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Educational Demonstration Only</span>
              </div>
              <p>
                Small-number RSA uses tiny primes so you can inspect intermediate arithmetic step by
                step. In real-world cryptographic applications, integer factorization of small primes
                is trivial. Always use 2048-bit or 3072-bit keys for real data protection.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* SECURE WEB CRYPTO KEY GENERATION WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Generator Controls */}
          <div className="lg:col-span-6 space-y-6">
            <DashboardCard
              title="Web Crypto API Key Generator"
              subtitle="Generates cryptographically secure hardware-backed RSA-OAEP key pairs"
              icon={Shield}
              badge="FIPS / NIST"
              badgeColor="emerald"
            >
              <div className="space-y-5 text-xs">
                {/* Key Size Selector */}
                <div>
                  <label className="block font-mono text-lab-muted mb-2 font-semibold">
                    Select RSA Modulus Size:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedKeySize(2048)}
                      className={`p-3.5 rounded-xl border text-left font-mono transition-all ${
                        selectedKeySize === 2048
                          ? 'bg-lab-emerald/10 border-lab-emerald text-lab-text shadow-sm'
                          : 'bg-lab-bg border-lab-border text-lab-muted hover:text-lab-text'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-lab-emerald">RSA 2048-bit</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-lab-emerald/20 text-lab-emerald font-semibold">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-lab-muted">
                        Current industry standard minimum (NIST compliant through 2030).
                      </p>
                    </button>

                    <button
                      onClick={() => setSelectedKeySize(3072)}
                      className={`p-3.5 rounded-xl border text-left font-mono transition-all ${
                        selectedKeySize === 3072
                          ? 'bg-lab-emerald/10 border-lab-emerald text-lab-text shadow-sm'
                          : 'bg-lab-bg border-lab-border text-lab-muted hover:text-lab-text'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-lab-emerald">RSA 3072-bit</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-lab-emerald/20 text-lab-emerald font-semibold">
                          Top-Secret
                        </span>
                      </div>
                      <p className="text-[11px] text-lab-muted">
                        High-security tier (equivalent to 128-bit symmetric security level).
                      </p>
                    </button>
                  </div>
                </div>

                {/* Algorithmic Details Box */}
                <div className="p-3.5 rounded-xl bg-lab-bg border border-lab-border space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-lab-muted">Cipher Algorithm:</span>
                    <span className="text-lab-text font-semibold">RSA-OAEP (Optimal Asymmetric Encryption Padding)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lab-muted">Hash Digest:</span>
                    <span className="text-lab-text font-semibold">SHA-256 (256-bit digest)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lab-muted">Public Exponent:</span>
                    <span className="text-lab-accent font-semibold">65537 (0x10001, Fermat Prime F₄)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lab-muted">Key Storage:</span>
                    <span className="text-lab-emerald font-semibold">Volatile Non-Extractable CryptoKey</span>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  disabled={isGeneratingSecureKey}
                  onClick={() => generateSecureKey(selectedKeySize)}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-emerald-glow transition-all ${
                    isGeneratingSecureKey
                      ? 'bg-lab-emerald/50 text-lab-bg cursor-wait'
                      : 'bg-lab-emerald hover:bg-emerald-400 text-lab-bg'
                  }`}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isGeneratingSecureKey ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {isGeneratingSecureKey
                      ? 'Generating High-Entropy RSA Primes...'
                      : `Generate New ${selectedKeySize}-bit Key Pair`}
                  </span>
                </button>
              </div>
            </DashboardCard>
          </div>

          {/* Right Column: Key Details & PEM Export */}
          <div className="lg:col-span-6 space-y-6">
            <DashboardCard
              title="Secure Key Material"
              subtitle="Hardware generated key pair status & SPKI export"
              icon={Lock}
              badge="Live"
              badgeColor="emerald"
            >
              <KeyDisplay secureKey={secureKeyPair} mode="secure" />
            </DashboardCard>
          </div>
        </div>
      )}
    </div>
  );
};
