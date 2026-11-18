# RSA LAB — Rivest–Shamir–Adleman Cryptography Simulator

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)](https://tailwindcss.com/)
[![Web Crypto API](https://img.shields.io/badge/Web_Crypto_API-W3C_Standard-green.svg)](https://www.w3.org/TR/WebCryptoAPI/)
[![Tests](https://img.shields.io/badge/Vitest-Passing_100%25-brightgreen.svg)](https://vitest.dev/)

**RSA LAB** is a professional-grade, interactive educational web application demonstrating how the RSA asymmetric cryptographic algorithm works. Designed for computer science students, cryptography researchers, and cybersecurity engineers, it provides both inspectable textbook BigInt mathematics and production-grade Web Crypto API (RSA-OAEP & AES-GCM Hybrid) operations.

---

## 🚀 Key Features

### 1. Modern Cybersecurity Command Center UI
- **Dark technical laboratory theme**: Charcoal, deep midnight navy (`#0B1120`), graphite, electric cyan (`#22D3EE`), and emerald green (`#34D399`).
- **Full-width responsive layout**: Horizontal navbar, live status indicators, interactive cards, and zero cluttered light-themed SaaS templates.

### 2. Dual-Engine RSA Architecture
- **Educational BigInt Core**: Arbitrary-precision integer arithmetic for small primes ($p, q$), modulus $n = p \cdot q$, Euler's totient $\phi(n) = (p-1)(q-1)$, and public/private exponents ($e, d$).
- **Web Crypto Production Engine**: Native hardware-accelerated W3C `crypto.subtle` generation of 2048-bit and 3072-bit RSA-OAEP key pairs with SHA-256 and public exponent 65537 ($F_4$).

### 3. Interactive Mathematical Visualizer (The Core Educational Feature)
- **Extended Euclidean Algorithm (EEA) Table**: Full tabular trace displaying quotients, remainders, Bézout coefficients ($x, y$), and verification of $(e \cdot d) \equiv 1 \pmod{\phi(n)}$.
- **Square-and-Multiply Modular Exponentiation**: Bit-by-bit execution of $c = m^e \pmod n$ and $m = c^d \pmod n$ with binary breakdown, live accumulator states, play/pause animations, and step controls.
- **Key Derivation Flow**: Multi-stage visualization from prime selection through keypair generation.
- **Euler's Theorem Proof**: Side-by-side comparison explaining why public and private keys invert each other.

### 4. Interactive Encryption & Decryption Simulators
- **Textbook RSA**: $c = m^e \pmod n$ and $m = c^d \pmod n$ with BigInt validation.
- **Secure RSA-OAEP**: Real-time message length validation ($k - 2\cdot hLen - 2$), Base64 and Hexadecimal formatted outputs, and IND-CCA2 randomized padding verification.
- **Graceful Error Diagnosis**: Descriptive alerts for corrupted Base64, incorrect keys, or tampered ciphertexts.

### 5. Production Hybrid Cryptosystem (RSA-OAEP + AES-256-GCM)
- Solves RSA payload length limits using the industry standard envelope protocol (identical to TLS/HTTPS and PGP).
- Generates ephemeral 256-bit AES keys and unique 96-bit nonces.
- Encapsulates the AES key with RSA-OAEP while encrypting the unbounded payload with AES-GCM.
- Export and import authenticated packages as standardized JSON files.

### 6. Deep Theoretical Curriculum & Threat Modeling
- Comprehensive guides on number theory, modular arithmetic, trapdoor one-way permutations, and primality testing.
- Cryptanalysis analysis covering integer factorization records (GNFS), dictionary attacks on textbook RSA, Bleichenbacher padding oracle attacks, and Shor's quantum algorithm.
- Digital signatures explanation contrasting RSA-PSS with RSA-OAEP.

---

## 🧪 Educational Test Vector Verification

The application is validated against the academic textbook test vector:

| Parameter | Mathematical Symbol | Expected Value | Status |
| :--- | :--- | :--- | :--- |
| First Prime | $p$ | `61` | ✅ Verified |
| Second Prime | $q$ | `53` | ✅ Verified |
| RSA Modulus | $n = p \times q$ | `3233` | ✅ Verified |
| Euler's Totient | $\phi(n) = (p-1)(q-1)$ | `3120` | ✅ Verified |
| Public Exponent | $e$ (coprime to $\phi$) | `17` | ✅ Verified |
| Private Exponent | $d = e^{-1} \pmod{\phi(n)}$ | `2753` | ✅ Verified |
| Plaintext Message | $m$ | `65` | ✅ Verified |
| Encryption | $c = 65^{17} \pmod{3233}$ | `2790` | ✅ Verified |
| Decryption | $m = 2790^{2753} \pmod{3233}$ | `65` | ✅ Verified |

---

## 🛠️ Project Structure

```
src/
├── components/          # Reusable UI & cryptographic visual components
│   ├── AlgorithmFlow.tsx      # Alice & Bob protocol and pipeline diagrams
│   ├── DashboardCard.tsx      # Cyber command-center cards with glow effects
│   ├── KeyDisplay.tsx         # Educational and Web Crypto key formatters
│   ├── MathStepViewer.tsx     # Stepper with play, pause, and speed controls
│   ├── Navbar.tsx             # Horizontal top navigation & mobile drawer
│   └── ToastContainer.tsx     # Non-blocking notification toasts
├── context/
│   └── RSAContext.tsx         # Unified state provider across modules
├── crypto/              # Cryptographic core engines
│   ├── encoding.ts            # Base64, Hex, PEM, and UTF-8 utilities
│   ├── extendedEuclidean.ts   # EEA table and modular inverse
│   ├── hybridEncryption.ts    # AES-256-GCM + RSA-OAEP envelope
│   ├── modularExponentiation.ts # Square-and-multiply algorithm
│   ├── rsaMath.ts             # Prime tests, gcd, totient, textbook RSA
│   └── rsaOaep.ts             # Web Crypto API RSA-OAEP implementation
├── pages/               # Primary application modules
│   ├── About.tsx              # History, architecture, and verification report
│   ├── Dashboard.tsx          # Command center hero and operational telemetry
│   ├── Decryption.tsx         # Textbook & RSA-OAEP decryption studio
│   ├── Encryption.tsx         # Textbook & RSA-OAEP encryption studio
│   ├── HybridEncryptionPage.tsx # RSA + AES hybrid encryption workspace
│   ├── KeyGeneration.tsx      # Educational and Web Crypto key generators
│   ├── Mathematics.tsx        # Theory curriculum and comparative matrix
│   ├── RSAVisualizer.tsx      # Step-by-step mathematical visualizer
│   └── Security.tsx           # Threat modeling and digital signatures
├── tests/               # Automated unit test suite
│   ├── rsaMath.test.ts        # Test vector & mathematical validation
│   └── rsaOaep.test.ts        # Web Crypto & Hybrid round-trip tests
├── types/
│   └── rsa.ts                 # Cryptographic TypeScript interfaces
├── App.tsx              # Root application router
├── index.css            # Custom cyber scrollbars and animations
└── main.tsx             # React DOM entry point
```

---

## 💻 Local Setup & Execution Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Test Suite
Executes the comprehensive cryptographic test suite (including test vectors and Web Crypto round-trips):
```bash
npm test
```

### 3. Launch Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Generates an optimized, standalone distribution in the `dist/` directory.

---

## 🔒 Security Policy
- **No External Servers**: 100% of cryptographic operations execute locally in the client's browser sandbox.
- **Zero Persistent Key Leakage**: Private keys are held strictly in browser volatile RAM and are never exported to `localStorage`, `sessionStorage`, or remote APIs.
- **Educational vs Production Distinction**: Small-number RSA is strictly labeled as an educational model. Production applications must use at least 2048-bit keys with secure padding schemes (OAEP or PSS).
