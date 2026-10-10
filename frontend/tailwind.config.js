/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          50: '#f7f6f3',
          100: '#eceae2',
          200: '#d8d5c6',
          300: '#b7b19b',
          400: '#8a846c',
          500: '#5f5a46',
          600: '#403c2f',
          700: '#2d2a20',
          800: '#1c1a14',
          900: '#0f0d0a',
        },
        accent: {
          500: '#b4531a',
          600: '#9a4316',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};
