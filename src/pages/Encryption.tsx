import React, { useState } from 'react';
import { useRSA } from '../context/RSAContext';
import { DashboardCard } from '../components/DashboardCard';
import { MathStepViewer } from '../components/MathStepViewer';
import { encryptTextbookRSA, STANDARD_TEST_VECTOR } from '../crypto/rsaMath';
import { encryptRsaOaep, getMaxOaepPlaintextLength } from '../crypto/rsaOaep';
import { formatHexPretty, stringToUtf8Bytes } from '../crypto/encoding';
import {
  Lock,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  AlertCircle,
  Binary,
  ShieldCheck,
  Zap,
  Layers,
} from 'lucide-react';

export const Encryption: React.FC = () => {
  const {
    educationalKeyPair,
    secureKeyPair,
    lastEduEnc,
    setLastEduEnc,
    setLastSecureCiphertext,
    setLastSecurePlaintext,
    addToast,
    setActiveTab,
  } = useRSA();

  const [activeMode, setActiveMode] = useState<'educational' | 'secure'>('educational');

  // Educational State
  const [eduMessageInput, setEduMessageInput] = useState<string>('65');
  const [eduCipherResult, setEduCipherResult] = useState<bigint | null>(
    lastEduEnc ? lastEduEnc.c : null
  );
  const [eduSteps, setEduSteps] = useState<any[]>(lastEduEnc ? lastEduEnc.result.steps : []);
  const [eduError, setEduError] = useState<string | null>(null);

  // Secure State
  const [securePlaintext, setSecurePlaintext] = useState<string>(
    'Hello, RSA Cryptography! This message is protected using RSA-OAEP with SHA-256.'
  );
  const [secureResult, setSecureResult] = useState<{
    ciphertextBase64: string;
    ciphertextHex: string;
    byteLength: number;
  } | null>(null);
  const [isEncryptingSecure, setIsEncryptingSecure] = useState<boolean>(false);
  const [secureError, setSecureError] = useState<string | null>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Educational Encryption Handler
  const handleEducationalEncrypt = () => {
    setEduError(null);
    try {
      const m = BigInt(eduMessageInput.trim());
      const { e, n } = educationalKeyPair;

      if (m < 0n || m >= n) {
        throw new Error(
          `Message m (${m}) must satisfy: 0 ≤ m < n (${n}). Choose a number smaller than the modulus.`
        );
      }

      const encResult = encryptTextbookRSA(m, e, n);
      setEduCipherResult(encResult.result);
      setEduSteps(encResult.steps);
      setLastEduEnc({ m, c: encResult.result, result: encResult });

      addToast(
        'success',
        'Textbook Encryption Computed',
        `Computed c = ${m}^${e} mod ${n} = ${encResult.result}`
      );
    } catch (err: any) {
      setEduError(err.message);
      addToast('error', 'Encryption Failed', err.message);
    }
  };

  // Load Standard Test Vector: m = 65 -> c = 2790
  const handleLoadStandardVector = () => {
    setEduMessageInput(STANDARD_TEST_VECTOR.m.toString());
    setEduError(null);
  };

  // 2. Secure RSA-OAEP Handler
  const plaintextBytes = stringToUtf8Bytes(securePlaintext);
  const keySize = secureKeyPair ? secureKeyPair.keySize : 2048;
  const maxAllowedBytes = getMaxOaepPlaintextLength(keySize);
  const isOversized = plaintextBytes.length > maxAllowedBytes;

  const handleSecureEncrypt = async () => {
    setSecureError(null);
    if (!secureKeyPair || !secureKeyPair.publicKey) {
      setSecureError('No active Web Crypto RSA public key available. Generate a key pair first.');
      return;
    }

    if (isOversized) {
      setSecureError(
        `Plaintext length (${plaintextBytes.length} bytes) exceeds maximum RSA-OAEP limit (${maxAllowedBytes} bytes). Switch to Hybrid Encryption for larger payloads.`
      );
      return;
    }

    setIsEncryptingSecure(true);
    try {
      const enc = await encryptRsaOaep(secureKeyPair.publicKey, securePlaintext, keySize);
      setSecureResult(enc);
      setLastSecureCiphertext(enc.ciphertextBase64);
      setLastSecurePlaintext(securePlaintext);
      addToast(
        'success',
        'RSA-OAEP Encryption Successful',
        `Generated ${enc.byteLength}-byte ciphertext (${enc.ciphertextBase64.length} Base64 chars).`
      );
    } catch (err: any) {
      setSecureError(err.message);
      addToast('error', 'RSA-OAEP Error', err.message);
    } finally {
      setIsEncryptingSecure(false);
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
            <Lock className="w-6 h-6 text-lab-emerald" />
            <span>RSA Encryption Simulator</span>
          </h2>
          <p className="text-xs sm:text-sm text-lab-muted mt-1">
            Transform plaintext into ciphertext using Public Key modular exponentiation and OAEP padding.
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
            Educational (Textbook c = mᵉ mod n)
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
        /* EDUCATIONAL TEXTBOOK ENCRYPTION */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel: Input & Parameters (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <DashboardCard
                title="Textbook Encryption Input"
                subtitle="Enter numeric message m (where 0 ≤ m < n)"
                icon={Lock}
                badge="c = mᵉ mod n"
                badgeColor="amber"
                headerAction={
                  <button
                    onClick={handleLoadStandardVector}
                    className="text-xs px-2.5 py-1 rounded bg-lab-amber/10 hover:bg-lab-amber/20 border border-lab-amber/30 text-lab-amber font-mono flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Test Vector (m=65)</span>
                  </button>
                }
              >
                <div className="space-y-4">
                  {/* Active Public Key Banner */}
                  <div className="p-3 bg-lab-bg rounded-xl border border-lab-border flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-lab-muted block text-[10px]">Active Public Key:</span>
                      <span className="text-lab-accent font-bold">
                        e = {educationalKeyPair.e.toString()}, n = {educationalKeyPair.n.toString()}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-lab-accent/10 text-lab-accent border border-lab-accent/30 font-semibold">
                      Publicly Distributed
                    </span>
                  </div>

                  {/* Numeric Message Input */}
                  <div>
                    <label className="block text-xs font-mono text-lab-muted mb-1 font-semibold">
                      Numeric Plaintext Message (m):
                    </label>
                    <input
                      type="text"
                      value={eduMessageInput}
                      onChange={(e) => setEduMessageInput(e.target.value)}
                      placeholder="e.g. 65"
                      className="w-full px-3.5 py-2.5 bg-lab-bg rounded-xl border border-lab-border text-lab-text font-mono text-sm focus:outline-none focus:border-lab-accent"
                    />
                    <div className="flex items-center justify-between text-[11px] text-lab-muted mt-1.5">
                      <span>Condition: 0 ≤ m &lt; n</span>
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

                  {/* Encrypt Button */}
                  <button
                    onClick={handleEducationalEncrypt}
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-lab-emerald hover:bg-emerald-400 text-lab-bg font-semibold text-xs sm:text-sm shadow-emerald-glow transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Encrypt Numeric Message</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Educational Warning */}
                  <div className="p-3 rounded-xl bg-lab-amber/5 border border-lab-amber/20 text-[11px] text-lab-muted leading-relaxed">
                    <strong className="text-lab-amber">Security Note:</strong> Textbook RSA is deterministic: identical plaintexts always produce identical ciphertexts. It is susceptible to chosen-ciphertext and frequency attacks. Production systems always apply randomized OAEP padding.
                  </div>
                </div>
              </DashboardCard>
            </div>

            {/* Right Panel: Output & Ciphertext Result (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <DashboardCard
                title="Encryption Output"
                subtitle="Calculated ciphertext c"
                icon={Binary}
                badge="Result"
                badgeColor="emerald"
              >
                {eduCipherResult !== null ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-lab-bg border border-lab-emerald/40 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-lab-muted">Ciphertext (c):</span>
                        <button
                          onClick={() => copyToClipboard(eduCipherResult.toString(), 'eduCipher')}
                          className="text-lab-muted hover:text-lab-text p-1 flex items-center space-x-1"
                        >
                          {copiedKey === 'eduCipher' ? (
                            <Check className="w-3.5 h-3.5 text-lab-emerald" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[10px]">Copy</span>
                        </button>
                      </div>
                      <div className="text-2xl sm:text-3xl font-mono font-extrabold text-lab-emerald">
                        {eduCipherResult.toString()}
                      </div>
                      <div className="text-[11px] font-mono text-lab-muted">
                        Equation: c = ({eduMessageInput}
                        <sup>{educationalKeyPair.e.toString()}</sup>) mod{' '}
                        {educationalKeyPair.n.toString()} = {eduCipherResult.toString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-2.5 bg-lab-secondary rounded-lg border border-lab-border">
                        <span className="text-lab-muted text-[10px] block">Input Message m</span>
                        <span className="text-lab-text font-bold">{eduMessageInput}</span>
                      </div>
                      <div className="p-2.5 bg-lab-secondary rounded-lg border border-lab-border">
                        <span className="text-lab-muted text-[10px] block">Modulus n</span>
                        <span className="text-lab-accent font-bold">
                          {educationalKeyPair.n.toString()}
                        </span>
                      </div>
                    </div>

                    {/* Shortcut to Decrypt */}
                    <button
                      onClick={() => setActiveTab('decryption')}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-lab-secondary hover:bg-lab-card border border-lab-border text-lab-text text-xs font-semibold transition-colors"
                    >
                      <span>Proceed to Decrypt this Ciphertext</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center text-lab-muted font-mono text-xs">
                    No ciphertext generated yet. Click "Encrypt Numeric Message" to compute.
                  </div>
                )}
              </DashboardCard>
            </div>
          </div>

          {/* Bottom Section: Step-by-Step Square-and-Multiply Trace */}
          {formattedSteps.length > 0 && (
            <MathStepViewer
              steps={formattedSteps}
              title="Square-and-Multiply Modular Exponentiation Trace"
              subtitle={`Detailed execution for c = (${eduMessageInput}^${educationalKeyPair.e.toString()}) mod ${educationalKeyPair.n.toString()}`}
            />
          )}
        </div>
      ) : (
        /* SECURE RSA-OAEP ENCRYPTION */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Plaintext Input (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <DashboardCard
              title="RSA-OAEP Plaintext Input"
              subtitle="Encrypt arbitrary UTF-8 text with SHA-256 Optimal Asymmetric Encryption Padding"
              icon={ShieldCheck}
              badge="Web Crypto API"
              badgeColor="emerald"
            >
              <div className="space-y-4 text-xs">
                {/* Active Key Info */}
                <div className="p-3 bg-lab-bg rounded-xl border border-lab-border space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-lab-muted">Key Specification:</span>
                    <span className="text-lab-accent font-semibold">{keySize}-bit RSA-OAEP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lab-muted">Digest / MGF1:</span>
                    <span className="text-lab-emerald font-semibold">SHA-256</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lab-muted">Max Payload Capacity:</span>
                    <span className="text-lab-amber font-semibold">{maxAllowedBytes} bytes</span>
                  </div>
                </div>

                {/* Plaintext Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 font-mono">
                    <label className="text-lab-muted font-semibold">Plaintext Message (UTF-8):</label>
                    <span
                      className={`text-[11px] font-bold ${
                        isOversized ? 'text-red-400' : 'text-lab-accent'
                      }`}
                    >
                      {plaintextBytes.length} / {maxAllowedBytes} bytes
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={securePlaintext}
                    onChange={(e) => setSecurePlaintext(e.target.value)}
                    placeholder="Enter confidential message here..."
                    className="w-full px-3.5 py-2.5 bg-lab-bg rounded-xl border border-lab-border text-lab-text font-sans text-xs focus:outline-none focus:border-lab-emerald leading-relaxed"
                  />
                </div>

                {/* Plaintext Capacity Warning if oversized */}
                {isOversized && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 space-y-2">
                    <div className="flex items-center space-x-1.5 font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Message Exceeds RSA-OAEP Max Length</span>
                    </div>
                    <p>
                      RSA is not engineered for bulk encryption. Under OAEP with SHA-256, a{' '}
                      {keySize}-bit key can hold at most {maxAllowedBytes} bytes. Use Hybrid
                      Encryption to encrypt documents or payloads of arbitrary size!
                    </p>
                    <button
                      onClick={() => setActiveTab('hybrid')}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-mono text-[11px] flex items-center space-x-1 font-semibold"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Switch to Hybrid Encryption Studio</span>
                    </button>
                  </div>
                )}

                {/* Error Banner */}
                {secureError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{secureError}</span>
                  </div>
                )}

                {/* Encrypt Button */}
                <button
                  disabled={isEncryptingSecure || isOversized || !secureKeyPair}
                  onClick={handleSecureEncrypt}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-emerald-glow transition-all ${
                    isEncryptingSecure || isOversized || !secureKeyPair
                      ? 'bg-lab-border text-lab-muted cursor-not-allowed'
                      : 'bg-lab-emerald hover:bg-emerald-400 text-lab-bg'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isEncryptingSecure ? 'Encrypting via Web Crypto...' : 'Encrypt with RSA-OAEP'}
                  </span>
                </button>
              </div>
            </DashboardCard>
          </div>

          {/* Right Panel: Secure Ciphertext Result (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <DashboardCard
              title="Secure Ciphertext Output"
              subtitle="Encrypted with randomized OAEP SHA-256 padding"
              icon={Binary}
              badge="Base64 / Hex"
              badgeColor="emerald"
            >
              {secureResult ? (
                <div className="space-y-4">
                  {/* Base64 Output */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                      <span className="text-lab-muted">Ciphertext (Base64 Format):</span>
                      <button
                        onClick={() =>
                          copyToClipboard(secureResult.ciphertextBase64, 'base64Cipher')
                        }
                        className="flex items-center space-x-1 text-lab-accent text-[11px]"
                      >
                        {copiedKey === 'base64Cipher' ? (
                          <Check className="w-3 h-3 text-lab-emerald" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy Base64</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-lab-bg rounded-lg border border-lab-border font-mono text-[11px] text-lab-emerald break-all max-h-32 overflow-y-auto">
                      {secureResult.ciphertextBase64}
                    </pre>
                  </div>

                  {/* Hexadecimal Output */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                      <span className="text-lab-muted">Ciphertext (Hexadecimal Format):</span>
                      <button
                        onClick={() => copyToClipboard(secureResult.ciphertextHex, 'hexCipher')}
                        className="flex items-center space-x-1 text-lab-accent text-[11px]"
                      >
                        {copiedKey === 'hexCipher' ? (
                          <Check className="w-3 h-3 text-lab-emerald" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy Hex</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-lab-bg rounded-lg border border-lab-border font-mono text-[10px] text-lab-muted break-all max-h-32 overflow-y-auto">
                      {formatHexPretty(secureResult.ciphertextHex, 2, 32)}
                    </pre>
                  </div>

                  {/* Randomized Padding Note */}
                  <div className="p-3 rounded-lg bg-lab-accent/5 border border-lab-accent/20 text-[11px] text-lab-muted">
                    <strong className="text-lab-accent">OAEP Randomization Verified:</strong> If you
                    encrypt this identical message again, a new random seed is sampled by the Web
                    Crypto API, producing completely different ciphertext. This achieves IND-CCA2
                    security!
                  </div>

                  {/* Shortcut to Decrypt */}
                  <button
                    onClick={() => setActiveTab('decryption')}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-lab-secondary hover:bg-lab-card border border-lab-border text-lab-text text-xs font-semibold transition-colors"
                  >
                    <span>Proceed to Decrypt with Private Key</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center text-lab-muted font-mono text-xs">
                  Enter plaintext and click "Encrypt with RSA-OAEP" to generate ciphertext.
                </div>
              )}
            </DashboardCard>
          </div>
        </div>
      )}
    </div>
  );
};
