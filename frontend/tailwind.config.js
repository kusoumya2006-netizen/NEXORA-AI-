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
        soc: {
          bg: '#0b0f19',
          card: '#111827',
          border: '#1f293d',
          sidebar: '#0d1322',
          cyan: '#06b6d4',
          cyanLight: '#22d3ee',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          darkRed: '#991b1b',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
