/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        dark: '#1A1A1A',
        grayish: '#2E2E2E',
        greenish: '#4A5F5D',
        accent: '#00FFCC',
        danger: '#FF6B6B',
        gold: '#FFD700',
        card: '#333333',
      },
      dropShadow: {
        'glow-green': '0 0 8px #00FFCC, 0 0 16px #00FFCC44',
        'glow-gold': '0 0 8px #FFD700, 0 0 16px #FFD70044',
        'glow-red': '0 0 8px #FF6B6B, 0 0 16px #FF6B6B44',
        'glow-white': '0 0 8px #fff, 0 0 16px #fff4',
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
    'ping-fast': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
