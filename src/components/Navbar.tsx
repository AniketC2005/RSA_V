import React, { useState } from 'react';
import { useRSA } from '../context/RSAContext';
import { TabType } from '../types/rsa';
import {
  Shield,
  KeyRound,
  Lock,
  Unlock,
  Cpu,
  Layers,
  Sigma,
  ShieldAlert,
  Info,
  Menu,
  X,
  Activity,
  Terminal,
} from 'lucide-react';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Overview', icon: Terminal },
  { id: 'keygen', label: 'Key Generation', icon: KeyRound },
  { id: 'encryption', label: 'Encryption', icon: Lock },
  { id: 'decryption', label: 'Decryption', icon: Unlock },
  { id: 'visualizer', label: 'RSA Visualizer', icon: Cpu },
  { id: 'hybrid', label: 'Hybrid Module', icon: Layers },
  { id: 'mathematics', label: 'Mathematics', icon: Sigma },
  { id: 'security', label: 'Security', icon: ShieldAlert },
  { id: 'about', label: 'About Project', icon: Info },
];

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, secureKeyPair } = useRSA();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-lab-bg/90 backdrop-blur-md border-b border-lab-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div
            onClick={() => handleSelectTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-lab-card border border-lab-accent/40 flex items-center justify-center text-lab-accent group-hover:border-lab-accent shadow-cyan-glow transition-all">
              <Shield className="w-5 h-5 text-lab-accent" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-lg text-lab-text tracking-wider">
                  RSA<span className="text-lab-accent">.LAB</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-lab-accent/10 text-lab-accent border border-lab-accent/30 font-semibold">
                  v2.0 PRO
                </span>
              </div>
              <p className="text-[11px] text-lab-muted hidden sm:block">
                Asymmetric Cryptography Workspace
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-lab-card text-lab-accent border border-lab-accent/40 shadow-sm'
                      : 'text-lab-muted hover:text-lab-text hover:bg-lab-card/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-lab-accent' : 'text-lab-muted'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Pill */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-lab-card/80 border border-lab-border px-3 py-1.5 rounded-full text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lab-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lab-emerald"></span>
              </span>
              <span className="text-lab-muted font-mono text-[11px]">
                {secureKeyPair ? `${secureKeyPair.keySize}-bit RSA Ready` : 'WebCrypto Active'}
              </span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-lab-card border border-lab-border text-lab-muted hover:text-lab-text"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-lab-secondary border-b border-lab-border px-4 pt-2 pb-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-lab-card text-lab-accent border border-lab-accent/40'
                    : 'text-lab-muted hover:text-lab-text hover:bg-lab-card/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-lab-accent' : 'text-lab-muted'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-lab-border/50 flex items-center space-x-2 text-xs text-lab-muted px-2">
            <Activity className="w-3.5 h-3.5 text-lab-emerald" />
            <span>Cryptographic Environment: Armed & Ready</span>
          </div>
        </div>
      )}
    </header>
  );
};
