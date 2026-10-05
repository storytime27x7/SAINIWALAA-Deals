/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saini: {
          saffron: '#F59E0B',
          'saffron-dark': '#D97706',
          rose: '#E11D48',
          gold: '#FEF3C7',
          'gold-text': '#92400E',
          dark: '#0F172A',
          surface: '#1E293B',
          pill: '#334155'
        }
      }
    },
  },
  plugins: [],
}
