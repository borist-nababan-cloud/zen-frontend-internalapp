/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zen: {
          matcha: '#889D35',    // Primary Bamboo Green
          sand: '#D2C0A7',      // Warm Accent Sand
          linen: '#F8F5F1',     // Soft Linen Background
          charcoal: '#3C3C32',  // River Stone Text
          moss: '#6E8027',      // Deep Olive / Moss Accent
          dark: '#2A2A23',      // Dark Neutral
          paper: '#FFFFFF',
          border: '#E8E2D9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
