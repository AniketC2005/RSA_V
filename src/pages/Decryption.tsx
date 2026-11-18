import React, { useState, useEffect } from 'react';
import { useRSA } from '../context/RSAContext';
import { DashboardCard } from '../components/DashboardCard';
import { MathStepViewer } from '../components/MathStepViewer';
import { decryptTextbookRSA, STANDARD_TEST_VECTOR } from '../crypto/rsaMath';
import { decryptRsaOaep } from '../crypto/rsaOaep';
import {
  Unlock,
  KeyRound,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  AlertCircle,
  Binary,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const Decryption: React.FC = () => {
  const {
    educationalKeyPair,
    secureKeyPair,
    lastEduEnc,
    lastEduDec,
    setLastEduDec,
    lastSecureCiphertext,
    addToast,
    setActiveTab,
  } = useRSA();

  const [activeMode, setActiveMode] = useState<'educational' | 'secure'>('educational');

  // Educational State
  const [eduCipherInput, setEduCipherInput] = useState<string>(
    lastEduEnc ? lastEduEnc.c.toString() : STANDARD_TEST_VECTOR.c.toString()
  );
  const [eduRecoveredMessage, setEduRecoveredMessage] = useState<bigint | null>(
    lastEduDec ? lastEduDec.m : null
  );
  const [eduSteps, setEduSteps] = useState<any[]>(lastEduDec ? lastEduDec.result.steps : []);
  const [eduError, setEduError] = useState<string | null>(null);

  // Secure State
  const [secureCipherInput, setSecureCipherInput] = useState<string>(lastSecureCiphertext || '');
  const [secureRecoveredPlaintext, setSecureRecoveredPlaintext] = useState<string | null>(null);
  const [isDecryptingSecure, setIsDecryptingSecure] = useState<boolean>(false);
  const [secureError, setSecureError] = useState<string | null>(null);

  // Update secure input when ciphertext arrives from Encryption tab
  useEffect(() => {
    if (lastSecureCiphertext) {
      setSecureCipherInput(lastSecureCiphertext);
    }
  }, [lastSecureCiphertext]);

  useEffect(() => {
    if (lastEduEnc) {
      setEduCipherInput(lastEduEnc.c.toString());
    }
  }, [lastEduEnc]);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Educational Decrypt Handler
  const handleEducationalDecrypt = () => {
    setEduError(null);
    try {
      const c = BigInt(eduCipherInput.trim());
      const { d, n } = educationalKeyPair;

      if (c < 0n || c >= n) {
        throw new Error(
          `Ciphertext c (${c}) must satisfy: 0 ≤ c < n (${n}). Value must be within the field ℤ_n.`
        );
      }

      const decResult = decryptTextbookRSA(c, d, n);
      setEduRecoveredMessage(decResult.result);
      setEduSteps(decResult.steps);
      setLastEduDec({ c, m: decResult.result, result: decResult });

      addToast(
        'success',
        'Textbook Decryption Completed',
        `Computed m = ${c}^${d} mod ${n} = ${decResult.result}`
      );
    } catch (err: any) {
      setEduError(err.message);
      addToast('error', 'Decryption Failed', err.message);
    }
  };

  // Load Standard Test Vector: c = 2790 -> m = 65
  const handleLoadStandardVector = () => {
    setEduCipherInput(STANDARD_TEST_VECTOR.c.toString());
    setEduError(null);
  };

  // 2. Secure RSA-OAEP Decrypt Handler
  const handleSecureDecrypt = async () => {
    setSecureError(null);
    setSecureRecoveredPlaintext(null);

    if (!secureKeyPair || !secureKeyPair.privateKey) {
      setSecureError('No active Web Crypto RSA private key in memory. Generate keys first.');
      return;
    }

    if (!secureCipherInput.trim()) {
      setSecureError('Ciphertext input cannot be empty.');
      return;
    }

    setIsDecryptingSecure(true);
    try {
      const isHex =
        /^[0-9a-fA-F]+$/.test(secureCipherInput.replace(/\s+/g, '')) &&
        secureCipherInput.length % 2 === 0 &&
        !secureCipherInput.includes('=');

      const plaintext = await decryptRsaOaep(
        secureKeyPair.privateKey,
        secureCipherInput.trim(),
        isHex
      );
      setSecureRecoveredPlaintext(plaintext);
      addToast('success', 'RSA-OAEP Decryption Succeeded', 'Recovered original UTF-8 plaintext.');
    } catch (err: any) {
      setSecureError(err.message);
      addToast('error', 'Decryption Error', err.message);
    } finally {
      setIsDecryptingSecure(false);
    }
  };

  // Convert eduSteps to MathStepViewer format
  const formattedSteps = eduSteps.map((st, i) => ({
    step: st.step || i + 1,
    title: st.operation || `Step ${i + 1}`,
    expression: `Accumulator: ${st.currentValue.toString()}`,
    details: st.explanation,
    result: st.currentValue.toString(),
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-lab-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-lab-text flex items-center space-x-2">
            <Unlock className="w-6 h-6 text-lab-amber" />
            <span>RSA Decryption Simulator</span>
          </h2>
          <p className="text-xs sm:text-sm text-lab-muted mt-1">
            Recover original plaintexts using Private Key modular exponentiation and OAEP verification.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-lab-card border border-lab-border">
          <button
            onClick={() => setActiveMode('educational')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
              activeMode === 'educational'
                ? 'bg-lab-accent text-lab-bg shadow-sm'
                : 'text-lab-muted hover:text-lab-text'
            }`}
          >
            Educational (Textbook m = cᵈ mod n)
          </button>
          <button
            onClick={() => setActiveMode('secure')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
              activeMode === 'secure'
                ? 'bg-lab-emerald text-lab-bg shadow-sm'
                : 'text-lab-muted hover:text-lab-text'
            }`}
          >
            Secure (Web Crypto RSA-OAEP)
          </button>
        </div>
      </div>

      {activeMode === 'educational' ? (
        /* EDUCATIONAL TEXTBOOK DECRYPTION */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel: Ciphertext Input (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <DashboardCard
                title="Textbook Ciphertext Input"
                subtitle="Enter numeric ciphertext c to recover m"
                icon={Unlock}
                badge="m = cᵈ mod n"
                badgeColor="amber"
                headerAction={
                  <button
                    onClick={handleLoadStandardVector}
                    className="text-xs px-2.5 py-1 rounded bg-lab-amber/10 hover:bg-lab-amber/20 border border-lab-amber/30 text-lab-amber font-mono flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Test Vector (c=2790)</span>
                  </button>
                }
              >
                <div className="space-y-4">
                  {/* Active Private Key Banner */}
                  <div className="p-3 bg-lab-bg rounded-xl border border-lab-border flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-lab-muted block text-[10px]">Active Private Key:</span>
                      <span className="text-lab-amber font-bold">
                        d = {educationalKeyPair.d.toString()}, n = {educationalKeyPair.n.toString()}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-lab-amber/10 text-lab-amber border border-lab-amber/30 font-semibold">
                      Secret Key
                    </span>
                  </div>

                  {/* Numeric Ciphertext Input */}
                  <div>
                    <label className="block text-xs font-mono text-lab-muted mb-1 font-semibold">
                      Numeric Ciphertext (c):
                    </label>
                    <input
                      type="text"
                      value={eduCipherInput}
                      onChange={(e) => setEduCipherInput(e.target.value)}
                      placeholder="e.g. 2790"
                      className="w-full px-3.5 py-2.5 bg-lab-bg rounded-xl border border-lab-border text-lab-text font-mono text-sm focus:outline-none focus:border-lab-amber"
                    />
                    <div className="flex items-center justify-between text-[11px] text-lab-muted mt-1.5">
                      <span>Condition: 0 ≤ c &lt; n</span>
                      <span>Modulus n = {educationalKeyPair.n.toString()}</span>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {eduError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2 text-xs text-red-400">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{eduError}</span>
                    </div>
                  )}

                  {/* Decrypt Button */}
                  <button
                    onClick={handleEducationalDecrypt}
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-lab-amber hover:bg-amber-400 text-lab-bg font-semibold text-xs sm:text-sm shadow-amber-glow transition-all"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Decrypt with Private Key (d, n)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </DashboardCard>
            </div>

            {/* Right Panel: Recovered Plaintext Result (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <DashboardCard
                title="Decryption Output"
                subtitle="Recovered message m"
                icon={CheckCircle2}
                badge="Plaintext"
                badgeColor="emerald"
              >
                {eduRecoveredMessage !== null ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-lab-bg border border-lab-emerald/40 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-lab-muted">Recovered Numeric Message (m):</span>
                        <button
                          onClick={() =>
                            copyToClipboard(eduRecoveredMessage.toString(), 'recoveredMsg')
                          }
                          className="text-lab-muted hover:text-lab-text p-1 flex items-center space-x-1"
                        >
                          {copiedKey === 'recoveredMsg' ? (
                            <Check className="w-3.5 h-3.5 text-lab-emerald" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[10px]">Copy</span>
                        </button>
                      </div>
                      <div className="text-2xl sm:text-3xl font-mono font-extrabold text-lab-emerald">
                        {eduRecoveredMessage.toString()}
                      </div>
                      <div className="text-[11px] font-mono text-lab-muted">
                        Equation: m = ({eduCipherInput}
                        <sup>{educationalKeyPair.d.toString()}</sup>) mod{' '}
                        {educationalKeyPair.n.toString()} = {eduRecoveredMessage.toString()}
                      </div>
                    </div>

                    {/* Educational Match Verification */}
                    {lastEduEnc && (
                      <div className="p-3 rounded-lg bg-lab-emerald/10 border border-lab-emerald/30 text-xs font-mono flex items-center justify-between">
                        <span className="text-lab-muted">Original Input Message:</span>
                        <span className="text-lab-emerald font-bold">
                          {lastEduEnc.m.toString()}{' '}
                          {lastEduEnc.m === eduRecoveredMessage ? '✓ MATCH VERIFIED' : '✗ MISMATCH'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-lab-muted font-mono text-xs">
                    No plaintext recovered yet. Click "Decrypt with Private Key" to compute.
                  </div>
                )}
              </DashboardCard>
            </div>
          </div>

          {/* Bottom Section: Step-by-Step Square-and-Multiply Trace */}
          {formattedSteps.length > 0 && (
            <MathStepViewer
              steps={formattedSteps}
              title="Square-and-Multiply Decryption Computation Trace"
              subtitle={`Detailed execution for m = (${eduCipherInput}^${educationalKeyPair.d.toString()}) mod ${educationalKeyPair.n.toString()}`}
            />
          )}
        </div>
      ) : (
        /* SECURE RSA-OAEP DECRYPTION */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Ciphertext Input (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <DashboardCard
              title="RSA-OAEP Ciphertext Input"
              subtitle="Paste Base64 or Hexadecimal ciphertext to decrypt using memory-held private key"
              icon={ShieldCheck}
              badge="Web Crypto API"
              badgeColor="emerald"
            >
              <div className="space-y-4 text-xs">
                {/* Active Key Info */}
                <div className="p-3 bg-lab-bg rounded-xl border border-lab-border space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-lab-muted">Private Key Status:</span>
                    <span className="text-lab-emerald font-semibold">
                      {secureKeyPair ? `${secureKeyPair.keySize}-bit Active in RAM` : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lab-muted">Expected Padding:</span>
                    <span className="text-lab-text font-semibold">OAEP with SHA-256 MGF1</span>
                  </div>
                </div>

                {/* Ciphertext Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 font-mono">
                    <label className="text-lab-muted font-semibold">
                      Ciphertext Input (Base64 or Hex):
                    </label>
                    {lastSecureCiphertext && (
                      <button
                        onClick={() => setSecureCipherInput(lastSecureCiphertext)}
                        className="text-lab-accent hover:underline text-[11px]"
                      >
                        Paste from Encryption
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={5}
                    value={secureCipherInput}
                    onChange={(e) => setSecureCipherInput(e.target.value)}
                    placeholder="Paste Base64 ciphertext here..."
                    className="w-full px-3.5 py-2.5 bg-lab-bg rounded-xl border border-lab-border text-lab-text font-mono text-xs focus:outline-none focus:border-lab-amber leading-relaxed"
                  />
                </div>

                {/* Error Banner */}
                {secureError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 space-y-1">
                    <div className="flex items-center space-x-1.5 font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Decryption Error</span>
                    </div>
                    <p>{secureError}</p>
                  </div>
                )}

                {/* Decrypt Button */}
                <button
                  disabled={isDecryptingSecure || !secureCipherInput.trim() || !secureKeyPair}
                  onClick={handleSecureDecrypt}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-amber-glow transition-all ${
                    isDecryptingSecure || !secureCipherInput.trim() || !secureKeyPair
                      ? 'bg-lab-border text-lab-muted cursor-not-allowed'
                      : 'bg-lab-amber hover:bg-amber-400 text-lab-bg'
                  }`}
                >
                  <Unlock className="w-4 h-4" />
                  <span>
                    {isDecryptingSecure ? 'Decrypting with Web Crypto...' : 'Decrypt Ciphertext'}
                  </span>
                </button>
              </div>
            </DashboardCard>
          </div>

          {/* Right Panel: Recovered Plaintext (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <DashboardCard
              title="Recovered Plaintext"
              subtitle="Decoded UTF-8 message verified by OAEP padding"
              icon={CheckCircle2}
              badge="Plaintext"
              badgeColor="emerald"
            >
              {secureRecoveredPlaintext !== null ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-lab-bg border border-lab-emerald/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-lab-emerald font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Decryption Successful & Verified</span>
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(secureRecoveredPlaintext, 'secureRecovered')
                        }
                        className="text-lab-muted hover:text-lab-text p-1 flex items-center space-x-1"
                      >
                        {copiedKey === 'secureRecovered' ? (
                          <Check className="w-3.5 h-3.5 text-lab-emerald" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[10px]">Copy</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-lg bg-lab-card/80 border border-lab-border font-sans text-sm text-lab-text leading-relaxed select-all">
                      {secureRecoveredPlaintext}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-lab-emerald/5 border border-lab-emerald/20 text-xs text-lab-muted leading-relaxed">
                    <strong className="text-lab-emerald">Cryptographic Authentication:</strong>{' '}
                    RSA-OAEP verifies the hash mask and padding structure during decryption. If even
                    a single bit of ciphertext is flipped or corrupted, decryption immediately fails
                    and throws an integrity exception, protecting against chosen-ciphertext attacks.
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-lab-muted font-mono text-xs">
                  Paste ciphertext and click "Decrypt Ciphertext" to reveal the original message.
                </div>
              )}
            </DashboardCard>
          </div>
        </div>
      )}
    </div>
  );
};
