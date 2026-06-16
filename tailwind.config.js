/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#F5C518',
          dark: '#E6B800',
        },
        surface: {
          DEFAULT: '#121212',
          card: '#1E1E1E',
          elevated: '#2A2A2A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A9A9A9',
        }
      },
    },
  },
  plugins: [],
}
