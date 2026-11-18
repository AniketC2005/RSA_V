import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EducationalKeyPair, SecureKeyPairData, TabType, HybridPackage, ModExpResult } from '../types/rsa';
import { STANDARD_TEST_VECTOR, generateEducationalKeyPair, getRandomEducationalPrime } from '../crypto/rsaMath';
import { generateSecureRSAKeyPair } from '../crypto/rsaOaep';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface RSAContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  // Educational state
  educationalKeyPair: EducationalKeyPair;
  setEducationalKeyPair: (kp: EducationalKeyPair) => void;
  loadStandardTestVector: () => void;
  generateRandomEducationalKeys: () => void;
  lastEduEnc: { m: bigint; c: bigint; result: ModExpResult } | null;
  setLastEduEnc: (val: { m: bigint; c: bigint; result: ModExpResult } | null) => void;
  lastEduDec: { c: bigint; m: bigint; result: ModExpResult } | null;
  setLastEduDec: (val: { c: bigint; m: bigint; result: ModExpResult } | null) => void;
  // Secure state
  secureKeyPair: SecureKeyPairData | null;
  isGeneratingSecureKey: boolean;
  generateSecureKey: (keySize?: 2048 | 3072) => Promise<void>;
  lastSecureCiphertext: string;
  setLastSecureCiphertext: (val: string) => void;
  lastSecurePlaintext: string;
  setLastSecurePlaintext: (val: string) => void;
  // Hybrid state
  lastHybridPackage: HybridPackage | null;
  setLastHybridPackage: (pkg: HybridPackage | null) => void;
  // Visualizer target parameters
  visualizerParams: {
    p: bigint;
    q: bigint;
    e: bigint;
    m: bigint;
  };
  setVisualizerParams: React.Dispatch<React.SetStateAction<{ p: bigint; q: bigint; e: bigint; m: bigint }>>;
  // Notifications
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const RSAContext = createContext<RSAContextType | undefined>(undefined);

export const RSAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Initialize with the standard educational test vector established in requirements
  const initialEduKey = generateEducationalKeyPair(
    STANDARD_TEST_VECTOR.p,
    STANDARD_TEST_VECTOR.q,
    STANDARD_TEST_VECTOR.e
  );
  const [educationalKeyPair, setEducationalKeyPair] = useState<EducationalKeyPair>(initialEduKey);

  const [lastEduEnc, setLastEduEnc] = useState<{ m: bigint; c: bigint; result: ModExpResult } | null>(null);
  const [lastEduDec, setLastEduDec] = useState<{ c: bigint; m: bigint; result: ModExpResult } | null>(null);

  // Secure Web Crypto state
  const [secureKeyPair, setSecureKeyPair] = useState<SecureKeyPairData | null>(null);
  const [isGeneratingSecureKey, setIsGeneratingSecureKey] = useState<boolean>(false);
  const [lastSecureCiphertext, setLastSecureCiphertext] = useState<string>('');
  const [lastSecurePlaintext, setLastSecurePlaintext] = useState<string>('');

  // Hybrid package state
  const [lastHybridPackage, setLastHybridPackage] = useState<HybridPackage | null>(null);

  // Visualizer target
  const [visualizerParams, setVisualizerParams] = useState<{ p: bigint; q: bigint; e: bigint; m: bigint }>({
    p: STANDARD_TEST_VECTOR.p,
    q: STANDARD_TEST_VECTOR.q,
    e: STANDARD_TEST_VECTOR.e,
    m: STANDARD_TEST_VECTOR.m,
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadStandardTestVector = () => {
    try {
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
      addToast(
        'info',
        'Standard Test Vector Loaded',
        'Loaded p=61, q=53, e=17 (n=3233, φ=3120, d=2753, m=65).'
      );
    } catch (err: any) {
      addToast('error', 'Error loading test vector', err.message);
    }
  };

  const generateRandomEducationalKeys = () => {
    try {
      // Pick random distinct primes from pool
      const p = getRandomEducationalPrime();
      const q = getRandomEducationalPrime(p);
      const kp = generateEducationalKeyPair(p, q);
      setEducationalKeyPair(kp);
      setVisualizerParams((prev) => ({
        ...prev,
        p: kp.p,
        q: kp.q,
        e: kp.e,
      }));
      addToast(
        'success',
        'New Key Pair Generated',
        `Generated educational keys with p=${kp.p}, q=${kp.q}, n=${kp.n}.`
      );
    } catch (err: any) {
      addToast('error', 'Key Generation Failed', err.message);
    }
  };

  const generateSecureKey = async (keySize: 2048 | 3072 = 2048) => {
    setIsGeneratingSecureKey(true);
    try {
      const keys = await generateSecureRSAKeyPair(keySize);
      setSecureKeyPair(keys);
      addToast(
        'success',
        'Secure Key Generated',
        `Generated ${keySize}-bit RSA-OAEP key pair with SHA-256 and e=65537 via Web Crypto API.`
      );
    } catch (err: any) {
      addToast('error', 'Web Crypto Generation Error', err.message);
    } finally {
      setIsGeneratingSecureKey(false);
    }
  };

  // Generate secure key pair on initial load in background so the user has immediate access to RSA-OAEP
  useEffect(() => {
    generateSecureKey(2048).catch(() => {});
  }, []);

  return (
    <RSAContext.Provider
      value={{
        activeTab,
        setActiveTab,
        educationalKeyPair,
        setEducationalKeyPair,
        loadStandardTestVector,
        generateRandomEducationalKeys,
        lastEduEnc,
        setLastEduEnc,
        lastEduDec,
        setLastEduDec,
        secureKeyPair,
        isGeneratingSecureKey,
        generateSecureKey,
        lastSecureCiphertext,
        setLastSecureCiphertext,
        lastSecurePlaintext,
        setLastSecurePlaintext,
        lastHybridPackage,
        setLastHybridPackage,
        visualizerParams,
        setVisualizerParams,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </RSAContext.Provider>
  );
};

export const useRSA = () => {
  const context = useContext(RSAContext);
  if (!context) {
    throw new Error('useRSA must be used within an RSAProvider');
  }
  return context;
};
