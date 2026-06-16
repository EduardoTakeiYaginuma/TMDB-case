/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#F5C518',
          dark: '#E6B800',
        },
        surface: {
          DEFAULT: '#1a1a2e',
          card: '#16213e',
          elevated: '#0f3460',
        },
      },
    },
  },
  plugins: [],
}
