import React, { useState } from 'react';
import { useRSA } from '../context/RSAContext';
import { DashboardCard } from '../components/DashboardCard';
import { encryptHybrid, decryptHybrid } from '../crypto/hybridEncryption';
import { HybridPackage } from '../types/rsa';
import { formatHexPretty } from '../crypto/encoding';
import {
  Layers,
  ShieldCheck,
  Lock,
  Unlock,
  Download,
  Upload,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  FileText,
  FileCode2,
  CheckCircle2,
} from 'lucide-react';

export const HybridEncryptionPage: React.FC = () => {
  const {
    secureKeyPair,
    lastHybridPackage,
    setLastHybridPackage,
    addToast,
  } = useRSA();

  // Active submode: 'encrypt' | 'decrypt'
  const [subMode, setSubMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // Encryption Inputs
  const [hybridPlaintext, setHybridPlaintext] = useState<string>(
    `RSA & AES Hybrid Encryption Confidential Payload.
Large documents, files, or multimedia streams cannot be directly encrypted with raw RSA because of computational latency and payload size limits.
Hybrid cryptosystems generate a fresh random 256-bit symmetric AES key, encrypt the bulk data at gigabit speeds with AES-GCM, and seal the AES key using the recipient's RSA-OAEP public key.
Only the holder of the RSA private key can unseal the AES key and decrypt this payload!`
  );

  // Encryption Outputs
  const [encryptedPackage, setEncryptedPackage] = useState<HybridPackage | null>(lastHybridPackage);
  const [rawAesKeyHex, setRawAesKeyHex] = useState<string>('');
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [encError, setEncError] = useState<string | null>(null);

  // Decryption Inputs
  const [packageJsonInput, setPackageJsonInput] = useState<string>(
    lastHybridPackage ? JSON.stringify(lastHybridPackage, null, 2) : ''
  );
  const [decryptedPlaintext, setDecryptedPlaintext] = useState<string | null>(null);
  const [recoveredAesKeyHex, setRecoveredAesKeyHex] = useState<string>('');
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [decError, setDecError] = useState<string | null>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadPackage = () => {
    if (!encryptedPackage) return;
    const jsonStr = JSON.stringify(encryptedPackage, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsa_hybrid_package_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('info', 'Package Downloaded', 'Saved hybrid package as JSON.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPackageJsonInput(content);
      addToast('info', 'Package Loaded', `Loaded file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  // 1. Perform Hybrid Encryption
  const handleExecuteHybridEncrypt = async () => {
    setEncError(null);
    if (!secureKeyPair || !secureKeyPair.publicKey) {
      setEncError('No active Web Crypto RSA public key available. Generate a key pair first.');
      return;
    }
    if (!hybridPlaintext.trim()) {
      setEncError('Plaintext payload cannot be empty.');
      return;
    }

    setIsEncrypting(true);
    try {
      const res = await encryptHybrid(
        secureKeyPair.publicKey,
        hybridPlaintext,
        secureKeyPair.keySize,
        'hybrid_payload.txt'
      );
      setEncryptedPackage(res.packageData);
      setRawAesKeyHex(res.rawAesKeyHex);
      setLastHybridPackage(res.packageData);
      setPackageJsonInput(res.packageJson);
      addToast(
        'success',
        'Hybrid Encryption Complete',
        'Generated AES-256 key, encrypted payload with AES-GCM, and encapsulated key with RSA-OAEP.'
      );
    } catch (err: any) {
      setEncError(err.message);
      addToast('error', 'Hybrid Encryption Failed', err.message);
    } finally {
      setIsEncrypting(false);
    }
  };

  // 2. Perform Hybrid Decryption
  const handleExecuteHybridDecrypt = async () => {
    setDecError(null);
    setDecryptedPlaintext(null);
    if (!secureKeyPair || !secureKeyPair.privateKey) {
      setDecError('No active Web Crypto RSA private key available in memory.');
      return;
    }
    if (!packageJsonInput.trim()) {
      setDecError('Package JSON input is empty.');
      return;
    }

    setIsDecrypting(true);
    try {
      const res = await decryptHybrid(secureKeyPair.privateKey, packageJsonInput.trim());
      setDecryptedPlaintext(res.plaintext);
      setRecoveredAesKeyHex(res.recoveredAesKeyHex);
      addToast(
        'success',
        'Hybrid Decryption & Authentication Verified',
        'Decrypted AES key via RSA-OAEP and authenticated payload via AES-GCM.'
      );
    } catch (err: any) {
      setDecError(err.message);
      addToast('error', 'Decryption Failed', err.message);
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-lab-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-lab-text flex items-center space-x-2">
            <Layers className="w-6 h-6 text-lab-accent" />
            <span>Hybrid Cryptosystem (RSA-OAEP + AES-256-GCM)</span>
          </h2>
          <p className="text-xs sm:text-sm text-lab-muted mt-1">
            Real-world cryptographic envelope combining asymmetric key exchange with high-throughput authenticated symmetric cipher.
          </p>
        </div>

        {/* Sub-mode Switcher */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-lab-card border border-lab-border">
          <button
            onClick={() => setSubMode('encrypt')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
              subMode === 'encrypt'
                ? 'bg-lab-accent text-lab-bg shadow-sm'
                : 'text-lab-muted hover:text-lab-text'
            }`}
          >
            Hybrid Encrypt (Package)
          </button>
          <button
            onClick={() => setSubMode('decrypt')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
              subMode === 'decrypt'
                ? 'bg-lab-emerald text-lab-bg shadow-sm'
                : 'text-lab-muted hover:text-lab-text'
            }`}
          >
            Hybrid Decrypt (Unseal)
          </button>
        </div>
      </div>

      {/* Visual Architectural Workflow */}
      <div className="p-5 rounded-2xl bg-lab-card border border-lab-border space-y-4">
        <h4 className="text-xs uppercase font-mono font-semibold text-lab-accent tracking-wider">
          Hybrid Envelope Architecture (How TLS / PGP Operate)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-lab-secondary border border-lab-border space-y-2">
            <span className="text-lab-accent font-bold block">1. Bulk Encryption</span>
            <p className="text-lab-muted font-sans text-xs">
              Plaintext of arbitrary size is encrypted with a fresh random 256-bit symmetric AES key
              using AES-GCM (Galois/Counter Mode).
            </p>
            <div className="p-2 bg-lab-bg rounded border border-lab-border/40 text-[11px] text-lab-text">
              Plaintext + Nonce ➔ AES-GCM ➔ Ciphertext + Auth Tag
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-lab-secondary border border-lab-border space-y-2">
            <span className="text-lab-emerald font-bold block">2. Key Encapsulation</span>
            <p className="text-lab-muted font-sans text-xs">
              The 32-byte ephemeral AES key is encrypted using the recipient's public RSA key via
              RSA-OAEP SHA-256.
            </p>
            <div className="p-2 bg-lab-bg rounded border border-lab-border/40 text-[11px] text-lab-text">
              AES-256 Key ➔ RSA-OAEP (Public Key) ➔ Encrypted AES Key
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-lab-secondary border border-lab-border space-y-2">
            <span className="text-lab-amber font-bold block">3. Secure Unsealing</span>
            <p className="text-lab-muted font-sans text-xs">
              The recipient unwraps the AES key using their private RSA key, then decrypts the bulk
              ciphertext with hardware AES acceleration.
            </p>
            <div className="p-2 bg-lab-bg rounded border border-lab-border/40 text-[11px] text-lab-text">
              Encrypted Key ➔ RSA Private Key ➔ AES Key ➔ Plaintext
            </div>
          </div>
        </div>
      </div>

      {subMode === 'encrypt' ? (
        /* HYBRID ENCRYPTION WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Plaintext Input (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <DashboardCard
              title="Hybrid Envelope Generator"
              subtitle="Encrypt unbounded payload with AES-256-GCM sealed by RSA-OAEP"
              icon={Lock}
              badge="AES-256-GCM + RSA"
              badgeColor="cyan"
            >
              <div className="space-y-4 text-xs">
                {/* Active Key Status */}
                <div className="p-3 bg-lab-bg rounded-xl border border-lab-border space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-lab-muted">Recipient Public Key:</span>
                    <span className="text-lab-accent font-semibold">
                      {secureKeyPair ? `${secureKeyPair.keySize}-bit RSA-OAEP` : 'No Key'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lab-muted">Symmetric Cipher:</span>
                    <span className="text-lab-emerald font-semibold">AES-256-GCM (96-bit Nonce)</span>
                  </div>
                </div>

                {/* Plaintext Textarea */}
                <div>
                  <label className="block font-mono text-lab-muted mb-1 font-semibold">
                    Payload Text / Data (No Size Restriction):
                  </label>
                  <textarea
                    rows={6}
                    value={hybridPlaintext}
                    onChange={(e) => setHybridPlaintext(e.target.value)}
                    placeholder="Enter document or message..."
                    className="w-full px-3.5 py-2.5 bg-lab-bg rounded-xl border border-lab-border text-lab-text font-sans text-xs focus:outline-none focus:border-lab-accent leading-relaxed"
                  />
                  <span className="text-[11px] font-mono text-lab-muted mt-1 block">
                    Payload length: {new TextEncoder().encode(hybridPlaintext).length} bytes
                  </span>
                </div>

                {/* Error Banner */}
                {encError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{encError}</span>
                  </div>
                )}

                {/* Encrypt Button */}
                <button
                  disabled={isEncrypting || !secureKeyPair}
                  onClick={handleExecuteHybridEncrypt}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-cyan-glow transition-all ${
                    isEncrypting || !secureKeyPair
                      ? 'bg-lab-border text-lab-muted cursor-not-allowed'
                      : 'bg-lab-accent hover:bg-lab-accentHover text-lab-bg'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isEncrypting ? 'Generating Hybrid Package...' : 'Seal Hybrid Encrypted Package'}
                  </span>
                </button>
              </div>
            </DashboardCard>
          </div>

          {/* Right Panel: Hybrid Package Inspection (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <DashboardCard
              title="Encrypted Package Components"
              subtitle="Inspect raw AES key, RSA-encrypted key, nonce, and ciphertext"
              icon={FileCode2}
              badge="Encapsulated"
              badgeColor="emerald"
              headerAction={
                encryptedPackage && (
                  <button
                    onClick={handleDownloadPackage}
                    className="text-xs px-2.5 py-1 rounded bg-lab-emerald/10 hover:bg-lab-emerald/20 border border-lab-emerald/30 text-lab-emerald font-mono flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download JSON</span>
                  </button>
                )
              }
            >
              {encryptedPackage ? (
                <div className="space-y-4 text-xs font-mono">
                  {/* Raw AES Key */}
                  <div className="p-3 bg-lab-bg rounded-lg border border-lab-border space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-lab-muted">Generated Ephemeral AES-256 Key:</span>
                      <span className="text-lab-amber font-bold">Raw (32 bytes)</span>
                    </div>
                    <div className="text-lab-text text-[11px] break-all">
                      {formatHexPretty(rawAesKeyHex, 2, 32)}
                    </div>
                  </div>

                  {/* RSA-Encrypted AES Key */}
                  <div className="p-3 bg-lab-bg rounded-lg border border-lab-border space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-lab-muted">
                        RSA-OAEP Encrypted AES Key (Base64):
                      </span>
                      <span className="text-lab-accent font-bold">Sealed with RSA Public Key</span>
                    </div>
                    <div className="text-lab-accent text-[11px] break-all max-h-20 overflow-y-auto">
                      {encryptedPackage.encryptedAesKeyBase64}
                    </div>
                  </div>

                  {/* Nonce and Ciphertext details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-lab-bg rounded-lg border border-lab-border space-y-1">
                      <span className="text-lab-muted text-[10px] block">AES-GCM Nonce (IV):</span>
                      <span className="text-lab-text text-[11px] break-all">
                        {encryptedPackage.ivHex}
                      </span>
                    </div>
                    <div className="p-3 bg-lab-bg rounded-lg border border-lab-border space-y-1">
                      <span className="text-lab-muted text-[10px] block">Algorithm Standard:</span>
                      <span className="text-lab-emerald text-[11px]">
                        {encryptedPackage.algorithm}
                      </span>
                    </div>
                  </div>

                  {/* Ciphertext Base64 Preview */}
                  <div className="p-3 bg-lab-bg rounded-lg border border-lab-border space-y-1">
                    <span className="text-lab-muted text-[10px] block">
                      AES-GCM Ciphertext (Base64):
                    </span>
                    <div className="text-lab-text text-[11px] break-all max-h-24 overflow-y-auto">
                      {encryptedPackage.ciphertextBase64}
                    </div>
                  </div>

                  {/* Switch to Decrypt */}
                  <button
                    onClick={() => setSubMode('decrypt')}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-lab-secondary hover:bg-lab-card border border-lab-border text-lab-text text-xs font-semibold transition-colors"
                  >
                    <span>Proceed to Decrypt & Verify this Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center text-lab-muted font-mono text-xs">
                  Click "Seal Hybrid Encrypted Package" to generate an authentic cryptographic envelope.
                </div>
              )}
            </DashboardCard>
          </div>
        </div>
      ) : (
        /* HYBRID DECRYPTION WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Package JSON Input (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <DashboardCard
              title="Encrypted Package Receiver"
              subtitle="Paste package JSON or upload a downloaded file"
              icon={Unlock}
              badge="Unsealing"
              badgeColor="amber"
              headerAction={
                <label className="text-xs px-2.5 py-1 rounded bg-lab-secondary hover:bg-lab-card border border-lab-border text-lab-accent font-mono flex items-center space-x-1 cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>Upload JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              }
            >
              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-lab-muted mb-1 font-semibold">
                    Hybrid Package JSON:
                  </label>
                  <textarea
                    rows={8}
                    value={packageJsonInput}
                    onChange={(e) => setPackageJsonInput(e.target.value)}
                    placeholder="Paste package JSON here..."
                    className="w-full px-3.5 py-2.5 bg-lab-bg rounded-xl border border-lab-border text-lab-text font-mono text-xs focus:outline-none focus:border-lab-amber leading-relaxed"
                  />
                </div>

                {/* Error Banner */}
                {decError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 space-y-1">
                    <div className="flex items-center space-x-1.5 font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Decryption / Authentication Failure</span>
                    </div>
                    <p>{decError}</p>
                  </div>
                )}

                {/* Decrypt Button */}
                <button
                  disabled={isDecrypting || !packageJsonInput.trim() || !secureKeyPair}
                  onClick={handleExecuteHybridDecrypt}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-amber-glow transition-all ${
                    isDecrypting || !packageJsonInput.trim() || !secureKeyPair
                      ? 'bg-lab-border text-lab-muted cursor-not-allowed'
                      : 'bg-lab-amber hover:bg-amber-400 text-lab-bg'
                  }`}
                >
                  <Unlock className="w-4 h-4" />
                  <span>
                    {isDecrypting
                      ? 'Unsealing Envelope via Web Crypto...'
                      : 'Decrypt & Authenticate Hybrid Package'}
                  </span>
                </button>
              </div>
            </DashboardCard>
          </div>

          {/* Right Panel: Recovered Plaintext (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <DashboardCard
              title="Verified Plaintext & Recovered Key"
              subtitle="Authenticated payload with cryptographic integrity verification"
              icon={CheckCircle2}
              badge="Authenticated"
              badgeColor="emerald"
            >
              {decryptedPlaintext !== null ? (
                <div className="space-y-4 text-xs">
                  {/* Plaintext Box */}
                  <div className="p-4 rounded-xl bg-lab-bg border border-lab-emerald/40 space-y-2">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-lab-emerald font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Payload Authentication Verified (AES-GCM Tag Matched)</span>
                      </span>
                      <button
                        onClick={() => copyToClipboard(decryptedPlaintext, 'decryptedPlaintext')}
                        className="text-lab-muted hover:text-lab-text p-1 flex items-center space-x-1"
                      >
                        {copiedKey === 'decryptedPlaintext' ? (
                          <Check className="w-3.5 h-3.5 text-lab-emerald" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[10px]">Copy</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-lg bg-lab-card/80 border border-lab-border font-sans text-sm text-lab-text leading-relaxed whitespace-pre-wrap select-all">
                      {decryptedPlaintext}
                    </div>
                  </div>

                  {/* Recovered AES Key */}
                  <div className="p-3 bg-lab-bg rounded-lg border border-lab-border font-mono space-y-1">
                    <span className="text-lab-muted text-[10px] block">
                      Recovered AES-256 Symmetric Key:
                    </span>
                    <span className="text-lab-accent font-bold text-[11px] break-all">
                      {recoveredAesKeyHex}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-lab-emerald/5 border border-lab-emerald/20 text-[11px] text-lab-muted leading-relaxed">
                    <strong className="text-lab-emerald">Tamper Protection Guaranteed:</strong> If
                    an adversary attempts to alter a single byte of the package or re-use a stale
                    nonce, AES-GCM's built-in Galois message authentication code (GMAC) fails,
                    halting decryption before corrupted data is rendered.
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-lab-muted font-mono text-xs">
                  Click "Decrypt & Authenticate Hybrid Package" to reveal original payload.
                </div>
              )}
            </DashboardCard>
          </div>
        </div>
      )}
    </div>
  );
};
