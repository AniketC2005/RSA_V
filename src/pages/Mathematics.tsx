import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { AlgorithmFlow } from '../components/AlgorithmFlow';
import {
  Sigma,
  BookOpen,
  HelpCircle,
  Binary,
  Layers,
  KeyRound,
  Lock,
  Unlock,
  ShieldAlert,
  History,
  CheckCircle2,
} from 'lucide-react';

export const Mathematics: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="pb-4 border-b border-lab-border">
        <h2 className="text-xl sm:text-2xl font-bold text-lab-text flex items-center space-x-2">
          <Sigma className="w-6 h-6 text-lab-accent" />
          <span>RSA Mathematical & Theoretical Foundations</span>
        </h2>
        <p className="text-xs sm:text-sm text-lab-muted mt-1">
          A rigorous yet accessible cryptographic curriculum tailored for Computer Science undergraduates and cybersecurity engineers.
        </p>
      </div>

      {/* Visual Workflow Diagram */}
      <AlgorithmFlow />

      {/* Core Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Cryptography & Asymmetric Paradigm */}
        <DashboardCard
          title="1. Cryptography & Asymmetric Encryption"
          subtitle="The shift from shared secrets to dual-key systems"
          icon={BookOpen}
          badge="Foundations"
          badgeColor="cyan"
        >
          <div className="space-y-3 text-xs text-lab-muted leading-relaxed">
            <p>
              <strong className="text-lab-text">Cryptography</strong> is the discipline of securing
              information and communications through mathematical techniques to guarantee
              confidentiality, integrity, authenticity, and non-repudiation.
            </p>
            <p>
              For millennia, all cryptography was <strong className="text-lab-accent">symmetric</strong>:
              sender and recipient shared the same secret key. This introduced the notorious{' '}
              <em>key-distribution dilemma</em>—how do two parties safely exchange the key over an
              insecure channel?
            </p>
            <p>
              In 1976, Whitfield Diffie and Martin Hellman introduced the concept of{' '}
              <strong className="text-lab-emerald">asymmetric cryptography</strong> (public-key
              cryptography): using two mathematically related keys. One key is publicly announced
              to everyone for encryption, while the corresponding private key is kept confidential
              by the owner for decryption.
            </p>
          </div>
        </DashboardCard>

        {/* 2. History & Invention of RSA */}
        <DashboardCard
          title="2. History of RSA (1977)"
          subtitle="Ron Rivest, Adi Shamir, and Leonard Adleman at MIT"
          icon={History}
          badge="Milestone"
          badgeColor="amber"
        >
          <div className="space-y-3 text-xs text-lab-muted leading-relaxed">
            <p>
              In 1977, mathematicians <strong className="text-lab-text">Ron Rivest</strong>,{' '}
              <strong className="text-lab-text">Adi Shamir</strong>, and{' '}
              <strong className="text-lab-text">Leonard Adleman</strong> at MIT formulated the first
              practical public-key cryptosystem: <strong className="text-lab-amber font-mono">RSA</strong>.
            </p>
            <p>
              Their breakthrough was discovering a true <strong className="text-lab-accent">trapdoor one-way permutation</strong>:
              a mathematical function that is easy to compute in one direction, but practically
              impossible to invert without a specific piece of auxiliary data called the "trapdoor"
              (the prime factors $p$ and $q$, and totient $\phi(n)$).
            </p>
            <p>
              British intelligence agency GCHQ mathematician Clifford Cocks had secretly discovered an
              equivalent scheme in 1973, but it remained classified until 1997.
            </p>
          </div>
        </DashboardCard>

        {/* 3. Prime Numbers & Trapdoor Hardness */}
        <DashboardCard
          title="3. Prime Numbers & Integer Factorization"
          subtitle="The computational asymmetry underpinning RSA"
          icon={Binary}
          badge="Number Theory"
          badgeColor="emerald"
        >
          <div className="space-y-3 text-xs text-lab-muted leading-relaxed">
            <p>
              A <strong className="text-lab-text">prime number</strong> is an integer greater than 1
              whose only positive divisors are 1 and itself. By the Fundamental Theorem of
              Arithmetic, every positive integer can be uniquely factored into prime powers.
            </p>
            <div className="p-3 bg-lab-bg rounded-lg border border-lab-border font-mono text-xs text-lab-emerald">
              Multiplication: Easy [O(log² n)]
              <br />
              p × q ➔ n (instantaneous even for 2048-bit numbers)
              <br />
              <br />
              Factorization: Hard [Sub-exponential GNFS]
              <br />
              n ➔ find p, q (billions of CPU-years required)
            </div>
            <p>
              This computational imbalance is the core security barrier of RSA. An attacker can see
              modulus $n$ and exponent $e$, but cannot deduce private exponent $d$ without first
              factoring $n$ into $p$ and $q$.
            </p>
          </div>
        </DashboardCard>

        {/* 4. Euler's Totient Function */}
        <DashboardCard
          title="4. Euler's Totient Function φ(n)"
          subtitle="The secret multiplier that unlocks the private key"
          icon={Sigma}
          badge="Group Theory"
          badgeColor="slate"
        >
          <div className="space-y-3 text-xs text-lab-muted leading-relaxed">
            <p>
              Euler's phi function, <strong className="text-lab-text">φ(n)</strong>, counts the
              number of positive integers up to $n$ that are relatively prime (coprime) to $n$:
            </p>
            <div className="p-3 bg-lab-bg rounded-lg border border-lab-border font-mono text-xs text-lab-accent">
              φ(n) = |&#123; k ∈ ℤ : 1 ≤ k ≤ n and gcd(k, n) = 1 &#125;|
            </div>
            <p>
              For a prime $p$, every number less than $p$ is coprime to $p$, so{' '}
              <span className="font-mono text-lab-text">φ(p) = p - 1</span>.
            </p>
            <p>
              Because $\phi$ is multiplicative for coprime numbers, when $n = p \times q$:
            </p>
            <div className="p-3 bg-lab-bg rounded-lg border border-lab-border font-mono text-xs text-lab-emerald font-bold">
              φ(n) = φ(p) × φ(q) = (p - 1) × (q - 1)
            </div>
            <p>
              Computing $\phi(n)$ is trivial if you know $p$ and $q$, but strictly impossible if you
              only know $n$ without its factors!
            </p>
          </div>
        </DashboardCard>

        {/* 5. Modular Arithmetic & Bézout's Identity */}
        <DashboardCard
          title="5. Extended Euclidean Algorithm (EEA)"
          subtitle="Deriving the private modular inverse"
          icon={KeyRound}
          badge="Algorithm"
          badgeColor="cyan"
        >
          <div className="space-y-3 text-xs text-lab-muted leading-relaxed">
            <p>
              Two numbers $a$ and $b$ are coprime if $\gcd(a, b) = 1$. By Bézout's identity, there
              exist integers $x$ and $y$ such that:
            </p>
            <div className="p-3 bg-lab-bg rounded-lg border border-lab-border font-mono text-xs text-lab-text">
              (e × x) + (φ(n) × y) = gcd(e, φ(n)) = 1
            </div>
            <p>
              Reducing both sides modulo $\phi(n)$:
            </p>
            <div className="p-3 bg-lab-bg rounded-lg border border-lab-border font-mono text-xs text-lab-amber font-bold">
              (e × x) ≡ 1 (mod φ(n)) ➔ d = x mod φ(n)
            </div>
            <p>
              The Extended Euclidean Algorithm computes this modular multiplicative inverse $d$ in
              just $O(\log \phi(n))$ steps.
            </p>
          </div>
        </DashboardCard>

        {/* 6. Modular Exponentiation: Square and Multiply */}
        <DashboardCard
          title="6. Square-and-Multiply Exponentiation"
          subtitle="Evaluating m^e mod n without massive number overflow"
          icon={Binary}
          badge="Efficiency"
          badgeColor="emerald"
        >
          <div className="space-y-3 text-xs text-lab-muted leading-relaxed">
            <p>
              Computing $m^e$ directly for a 2048-bit exponent would produce an integer with hundreds
              of thousands of digits, exhausting memory and processing time.
            </p>
            <p>
              The <strong className="text-lab-emerald">square-and-multiply algorithm</strong> scans the
              binary expansion of exponent $e$:
            </p>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-lab-text">
              <li>Always square the accumulator: (acc²) mod n</li>
              <li>If the current bit is 1, multiply by the base: (acc × m) mod n</li>
            </ul>
            <p>
              Because modular reduction is applied after every step, the values never exceed n²,
              completing in fewer than 2 × bit length operations!
            </p>
          </div>
        </DashboardCard>
      </div>

      {/* Summary Table: Textbook vs OAEP vs Hybrid */}
      <DashboardCard
        title="Comparative Architectural Matrix"
        subtitle="Evolution from mathematical theory to modern cyber defense standards"
        icon={Layers}
        badge="Comparison"
        badgeColor="slate"
      >
        <div className="overflow-x-auto rounded-xl border border-lab-border font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-lab-bg text-lab-muted border-b border-lab-border uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Cryptosystem</th>
                <th className="py-3 px-4">Padding / Mode</th>
                <th className="py-3 px-4">Deterministic?</th>
                <th className="py-3 px-4">Maximum Payload</th>
                <th className="py-3 px-4">Production Suitability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lab-border/40">
              <tr className="hover:bg-lab-card/60">
                <td className="py-3 px-4 font-bold text-lab-amber">Textbook RSA</td>
                <td className="py-3 px-4 text-lab-muted">None (Raw modular)</td>
                <td className="py-3 px-4 text-red-400">Yes (Insecure)</td>
                <td className="py-3 px-4 text-lab-muted">&lt; n (integer only)</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold">
                    Educational Only
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-lab-card/60">
                <td className="py-3 px-4 font-bold text-lab-accent">RSA-OAEP</td>
                <td className="py-3 px-4 text-lab-text">SHA-256 + MGF1</td>
                <td className="py-3 px-4 text-lab-emerald">No (Random seed)</td>
                <td className="py-3 px-4 text-lab-muted">190 B (2048-bit) / 318 B (3072-bit)</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-lab-emerald/10 text-lab-emerald text-[10px] font-bold">
                    Key Exchange / Secure
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-lab-card/60">
                <td className="py-3 px-4 font-bold text-lab-emerald">Hybrid (RSA + AES)</td>
                <td className="py-3 px-4 text-lab-text">RSA-OAEP + AES-GCM</td>
                <td className="py-3 px-4 text-lab-emerald">No (Random nonce + seed)</td>
                <td className="py-3 px-4 text-lab-emerald font-bold">Unbounded (Gigabytes)</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-lab-emerald/10 text-lab-emerald text-[10px] font-bold">
                    Industry Standard (TLS / SSH)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
};
