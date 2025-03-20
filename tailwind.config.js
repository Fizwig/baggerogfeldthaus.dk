/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-pink': '#ff00ff',
        'hot-pink': '#ff69b4',
        'dark-pink': '#b300b3',
        'light-pink': '#ffdbf8',
        'terminal-black': '#0a0a0a',
        'terminal-dark': '#1a1a1a',
        'terminal-gray': '#2a2a2a',
        'terminal-text': '#f0f0f0',
        'neupink': {
          50: '#fff0fb',
          100: '#ffe0f7',
          200: '#ffc1ee',
          300: '#ffa2e6',
          400: '#ff73d7',
          500: '#ff44c8',
          600: '#ff25b9',
          700: '#e706a0',
          800: '#c10a84',
          900: '#9f106d',
          950: '#5f0040',
        },
        'neugray': {
          50: '#f8f8f8',
          100: '#f0f0f0',
          200: '#e4e4e4',
          300: '#c9c9c9',
          400: '#a8a8a8',
          500: '#8c8c8c',
          600: '#707070',
          700: '#5e5e5e',
          800: '#4f4f4f',
          900: '#3f3f3f',
          950: '#262626',
        }
      },
      boxShadow: {
        'neon': '0 0 5px rgba(255, 0, 255, 0.5), 0 0 20px rgba(255, 0, 255, 0.3)',
        'terminal': '0 0 10px rgba(0, 0, 0, 0.5) inset',
        'neu-flat': '5px 5px 10px #b8b8b8, -5px -5px 10px #ffffff',
        'neu-flat-dark': '5px 5px 10px #151515, -5px -5px 10px #353535',
        'neu-pressed': 'inset 5px 5px 10px #b8b8b8, inset -5px -5px 10px #ffffff',
        'neu-pressed-dark': 'inset 5px 5px 10px #151515, inset -5px -5px 10px #353535',
        'neu-pink': '5px 5px 10px #9f106d, -5px -5px 10px #ff44c8',
        'neu-pink-pressed': 'inset 5px 5px 10px #9f106d, inset -5px -5px 10px #ff44c8',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
        'terminal': ['VT323', 'monospace'],
      },
      animation: {
        'typing': 'typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite',
        'blink-caret': 'blink-caret 0.75s step-end infinite',
        'glitch': 'glitch 1s linear infinite',
        'pulse-neu': 'pulse-neu 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'typing': {
          'from': { width: '0' },
          'to': { width: '100%' }
        },
        'blink-caret': {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: '#ff00ff' }
        },
        'glitch': {
          '2%, 64%': { transform: 'translate(2px, 0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px, 0) skew(0deg)' },
          '62%': { transform: 'translate(0, 0) skew(5deg)' }
        },
        'pulse-neu': {
          '0%, 100%': {
            boxShadow: '5px 5px 10px #b8b8b8, -5px -5px 10px #ffffff',
          },
          '50%': {
            boxShadow: '3px 3px 6px #b8b8b8, -3px -3px 6px #ffffff',
          },
        }
      },
      backgroundImage: {
        'neu-gradient': 'linear-gradient(145deg, #ffffff, #e6e6e6)',
        'neu-gradient-pink': 'linear-gradient(145deg, #ff90de, #ff44c8)',
      },
    },
  },
  plugins: [],
} 