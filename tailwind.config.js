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
        dopamine: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        brand: {
          violet: '#8b5cf6',
          fuchsia: '#d946ef',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.6s ease-in-out 1',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(139, 92, 246, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
