/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e6f0ff',
          200: '#cfe6ff',
          300: '#99d1ff',
          400: '#66b8ff',
          500: '#2f9bff',
          600: '#1687e6',
          700: '#0f63b3',
          800: '#0b4a80',
          900: '#072f4d'
        },
        accent: '#7c5cff',
        white: '#ffffff',
        black: '#000000',
        gray: {
          50: '#f7fbfe',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#364152',
          800: '#27303a',
          900: '#0f1724'
        }
      },
      boxShadow: {
        soft: '0 6px 18px rgba(15, 43, 78, 0.08)'
      },
      borderRadius: {
        xl2: '1rem'
      }
    }
  },
  plugins: [],
}

