/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'hub-bg': '#020617', // deep slate
        'hub-surface': '#020617',
        'hub-surface-soft': '#020617',
        'hub-accent': '#16a34a', // emerald
        'hub-accent-soft': '#22c55e',
        'hub-gold': '#eab308', // amber
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

