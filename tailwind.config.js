/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        eco: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        sky: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        surface: {
          900: '#0a0f0d',
          800: '#0d1a10',
          700: '#0f2318',
          600: '#122b1d',
        },
      },
      backgroundImage: {
        'eco-gradient': 'linear-gradient(135deg, #0a0f0d 0%, #0d1f14 50%, #071218 100%)',
        'eco-radial': 'radial-gradient(ellipse at top, #0d2818 0%, #0a0f0d 70%)',
        'green-glow': 'radial-gradient(ellipse at center, rgba(34,197,94,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'eco': '0 0 30px rgba(34,197,94,0.15)',
        'eco-md': '0 0 50px rgba(34,197,94,0.2)',
        'eco-lg': '0 0 80px rgba(34,197,94,0.25)',
        'glass': '0 8px 32px rgba(0,0,0,0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fadeIn': 'fadeIn 0.5s ease-out',
        'slideUp': 'slideUp 0.4s ease-out',
        'slideInLeft': 'slideInLeft 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(34,197,94,0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(34,197,94,0.3)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
