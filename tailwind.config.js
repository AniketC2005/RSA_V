/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lab: {
          bg: '#0B1120',         // Deep midnight navy
          secondary: '#111827',  // Dark graphite
          card: '#172033',       // Charcoal
          cardHover: '#1E293B',  // Elevated slate
          accent: '#22D3EE',     // Electric cyan
          accentHover: '#06B6D4',// Cyan darker
          emerald: '#34D399',    // Emerald green
          amber: '#FBBF24',      // Soft amber
          text: '#F8FAFC',       // Almost white
          muted: '#94A3B8',      // Cool grey
          border: '#263449',     // Dark slate border
          borderLight: '#334155',// Lighter slate border
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px -5px rgba(34, 211, 238, 0.3)',
        'emerald-glow': '0 0 20px -5px rgba(52, 211, 153, 0.3)',
        'amber-glow': '0 0 20px -5px rgba(251, 191, 36, 0.3)',
      }
    },
  },
  plugins: [],
}
