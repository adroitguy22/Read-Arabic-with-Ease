/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'hub-bg': '#020617', // deep slate
        'hub-surface': '#020617',
        'hub-surface-soft': '#020617',
        'hub-accent': '#16a34a', // emerald
        'hub-accent-soft': '#22c55e',
        'hub-gold': '#eab308', // amber
        // Semantic theme tokens mapped to CSS variables
        'th-bg': 'var(--th-bg)',
        'th-surface': 'var(--th-surface)',
        'th-elevated': 'var(--th-elevated)',
        'th-input': 'var(--th-input)',
        'th-border': 'var(--th-border)',
        'th-text': 'var(--th-text)',
        'th-text-2': 'var(--th-text-2)',
        'th-muted': 'var(--th-muted)',
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        arabic: ['"Amiri"', '"Scheherazade New"', '"Noto Naskh Arabic"', 'serif'],
      },
    },
  },
  plugins: [],
}

