/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          1: '#0d0d0d',
          2: '#161616',
          3: '#1e1e1e',
          4: '#272727',
          5: '#303030',
        },
        accent: {
          DEFAULT: '#1ed760',
          dim: '#16a349',
        },
        danger: '#ff4d4d',
      },
      borderColor: {
        subtle: 'rgba(255,255,255,0.07)',
        DEFAULT: 'rgba(255,255,255,0.11)',
      },
    },
  },
  plugins: [],
}
