/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
