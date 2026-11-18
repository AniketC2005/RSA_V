import React from 'react';
import { RSAProvider, useRSA } from './context/RSAContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { Dashboard } from './pages/Dashboard';
import { KeyGeneration } from './pages/KeyGeneration';
import { Encryption } from './pages/Encryption';
import { Decryption } from './pages/Decryption';
import { RSAVisualizer } from './pages/RSAVisualizer';
import { HybridEncryptionPage } from './pages/HybridEncryptionPage';
import { Mathematics } from './pages/Mathematics';
import { Security } from './pages/Security';
import { About } from './pages/About';
import { Shield, Terminal, Heart } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useRSA();

  return (
    <div className="min-h-screen bg-lab-bg text-lab-text flex flex-col font-sans selection:bg-lab-accent/30 selection:text-lab-accent">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'keygen' && <KeyGeneration />}
        {activeTab === 'encryption' && <Encryption />}
        {activeTab === 'decryption' && <Decryption />}
        {activeTab === 'visualizer' && <RSAVisualizer />}
        {activeTab === 'hybrid' && <HybridEncryptionPage />}
        {activeTab === 'mathematics' && <Mathematics />}
        {activeTab === 'security' && <Security />}
        {activeTab === 'about' && <About />}
      </main>

      {/* Footer */}
      <footer className="border-t border-lab-border bg-lab-secondary/60 py-6 mt-12 text-xs text-lab-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-lab-card border border-lab-accent/40 flex items-center justify-center text-lab-accent">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono font-semibold text-lab-text">
              RSA LAB — Rivest–Shamir–Adleman Cryptography Simulator
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-lab-accent transition-colors"
            >
              Academic Curriculum
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('security')}
              className="hover:text-lab-accent transition-colors"
            >
              Security Policy
            </button>
            <span>•</span>
            <span className="text-lab-emerald">100% Client-Side Isolated</span>
          </div>

          <div className="text-[11px] text-lab-muted">
            Educational Cryptography Simulator • BigInt & Web Crypto API
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <RSAProvider>
      <MainContent />
    </RSAProvider>
  );
};

export default App;
