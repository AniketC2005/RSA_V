import React, { useState } from 'react';
import { EducationalKeyPair, SecureKeyPairData } from '../types/rsa';
import { KeyRound, Lock, ShieldCheck, Copy, Check, Eye, EyeOff, Download } from 'lucide-react';

interface KeyDisplayProps {
  educationalKey?: EducationalKeyPair;
  secureKey?: SecureKeyPairData | null;
  mode?: 'educational' | 'secure' | 'both';
}

export const KeyDisplay: React.FC<KeyDisplayProps> = ({
  educationalKey,
  secureKey,
  mode = 'both',
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadPem = (pem: string, filename: string = 'public_key.pem') => {
    const blob = new Blob([pem], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Educational Key Display */}
      {(mode === 'educational' || mode === 'both') && educationalKey && (
        <div className="bg-lab-secondary/80 rounded-xl border border-lab-border p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-lab-border/40">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-lab-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-lab-accent font-semibold">
                Educational RSA Parameters (BigInt)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lab-amber/10 text-lab-amber border border-lab-amber/30">
              Mathematical Model
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Public Key Card */}
            <div className="bg-lab-card/80 p-3.5 rounded-lg border border-lab-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-lab-emerald flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Public Key (e, n) — Encryption Key</span>
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(`e=${educationalKey.e}, n=${educationalKey.n}`, 'pubKeyEdu')
                  }
                  className="text-lab-muted hover:text-lab-text p-1 text-xs flex items-center space-x-1"
                  title="Copy Public Key"
                >
                  {copiedField === 'pubKeyEdu' ? (
                    <Check className="w-3.5 h-3.5 text-lab-emerald" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center bg-lab-bg/50 px-2.5 py-1.5 rounded border border-lab-border/30">
                  <span className="text-lab-muted">e (Public Exponent):</span>
                  <span className="text-lab-accent font-bold">{educationalKey.e.toString()}</span>
                </div>
                <div className="flex justify-between items-center bg-lab-bg/50 px-2.5 py-1.5 rounded border border-lab-border/30">
                  <span className="text-lab-muted">n (Modulus = p × q):</span>
                  <span className="text-lab-text font-bold">{educationalKey.n.toString()}</span>
                </div>
              </div>
            </div>

            {/* Private Key Card */}
            <div className="bg-lab-card/80 p-3.5 rounded-lg border border-lab-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-lab-amber flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Private Key (d, n) — Decryption Key</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="text-lab-muted hover:text-lab-text p-1 text-xs"
                    title={showPrivateKey ? 'Hide Private Exponent' : 'Show Private Exponent'}
                  >
                    {showPrivateKey ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      copyToClipboard(`d=${educationalKey.d}, n=${educationalKey.n}`, 'privKeyEdu')
                    }
                    className="text-lab-muted hover:text-lab-text p-1 text-xs flex items-center space-x-1"
                    title="Copy Private Key"
                  >
                    {copiedField === 'privKeyEdu' ? (
                      <Check className="w-3.5 h-3.5 text-lab-emerald" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center bg-lab-bg/50 px-2.5 py-1.5 rounded border border-lab-border/30">
                  <span className="text-lab-muted">d (Private Exponent):</span>
                  <span className="text-lab-amber font-bold">
                    {showPrivateKey ? educationalKey.d.toString() : '•••••••• (Click eye to reveal)'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-lab-bg/50 px-2.5 py-1.5 rounded border border-lab-border/30">
                  <span className="text-lab-muted">n (Modulus):</span>
                  <span className="text-lab-text font-bold">{educationalKey.n.toString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Parameters breakdown bar */}
          <div className="mt-3 pt-2 border-t border-lab-border/30 grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="bg-lab-bg/30 p-1.5 rounded">
              <span className="text-lab-muted text-[10px] block">Prime p</span>
              <span className="text-lab-text font-bold">{educationalKey.p.toString()}</span>
            </div>
            <div className="bg-lab-bg/30 p-1.5 rounded">
              <span className="text-lab-muted text-[10px] block">Prime q</span>
              <span className="text-lab-text font-bold">{educationalKey.q.toString()}</span>
            </div>
            <div className="bg-lab-bg/30 p-1.5 rounded">
              <span className="text-lab-muted text-[10px] block">Totient φ(n)</span>
              <span className="text-lab-text font-bold">{educationalKey.phi.toString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Secure Web Crypto Display */}
      {(mode === 'secure' || mode === 'both') && secureKey && (
        <div className="bg-lab-secondary/80 rounded-xl border border-lab-border p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-lab-border/40">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-lab-emerald" />
              <span className="font-mono text-xs uppercase tracking-wider text-lab-emerald font-semibold">
                Web Crypto Production RSA-OAEP
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lab-emerald/10 text-lab-emerald border border-lab-emerald/30">
              {secureKey.keySize}-Bit Secure Hardware/API
            </span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-lab-card/80 p-2 rounded border border-lab-border/50">
                <span className="text-lab-muted text-[10px] block">Algorithm</span>
                <span className="text-lab-text font-semibold">{secureKey.algorithm}</span>
              </div>
              <div className="bg-lab-card/80 p-2 rounded border border-lab-border/50">
                <span className="text-lab-muted text-[10px] block">Key Size</span>
                <span className="text-lab-accent font-semibold">{secureKey.keySize} bits</span>
              </div>
              <div className="bg-lab-card/80 p-2 rounded border border-lab-border/50">
                <span className="text-lab-muted text-[10px] block">Hash Digest</span>
                <span className="text-lab-emerald font-semibold">{secureKey.hash}</span>
              </div>
              <div className="bg-lab-card/80 p-2 rounded border border-lab-border/50">
                <span className="text-lab-muted text-[10px] block">Public Exponent</span>
                <span className="text-lab-amber font-semibold">{secureKey.publicExponent}</span>
              </div>
            </div>

            {/* Public Key PEM */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-lab-muted font-mono">Exported SPKI Public Key (PEM format):</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(secureKey.publicKeyPem, 'spkiPem')}
                    className="flex items-center space-x-1 px-2 py-1 rounded bg-lab-card hover:bg-lab-cardHover border border-lab-border text-lab-muted hover:text-lab-text text-[11px]"
                  >
                    {copiedField === 'spkiPem' ? (
                      <>
                        <Check className="w-3 h-3 text-lab-emerald" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy PEM</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => downloadPem(secureKey.publicKeyPem, `rsa_${secureKey.keySize}_public.pem`)}
                    className="flex items-center space-x-1 px-2 py-1 rounded bg-lab-card hover:bg-lab-cardHover border border-lab-border text-lab-accent hover:text-lab-accent text-[11px]"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <pre className="p-3 bg-lab-bg rounded-lg border border-lab-border font-mono text-[11px] text-lab-muted overflow-x-auto max-h-36 selection:bg-lab-accent/20">
                {secureKey.publicKeyPem}
              </pre>
            </div>

            {/* Security note */}
            <div className="p-2.5 rounded bg-lab-emerald/5 border border-lab-emerald/20 flex items-start space-x-2 text-[11px] text-lab-muted">
              <ShieldCheck className="w-4 h-4 text-lab-emerald shrink-0 mt-0.5" />
              <span>
                <strong className="text-lab-emerald">Cryptographic Sandbox Isolation:</strong> The RSA private key handle is held exclusively in volatile memory via Web Crypto API. Private key material cannot be leaked into localStorage, session storage, or external networks.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
