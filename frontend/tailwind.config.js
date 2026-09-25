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
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        // CargoPulse brand identity — Primary/Dark Orange
        brand: {
          50: '#FFF3E8',
          100: '#FFE1C7',
          200: '#FFC58F',
          300: '#FFA352',
          400: '#FF8724',
          500: '#FF6B00', // Primary Orange
          600: '#E85D00', // Dark Orange
          700: '#C24C00',
          800: '#9C3D00',
          900: '#7A3000',
          950: '#451A00',
        },
        // Secondary warm gold accent (replaces the old teal accent app-wide)
        teal: {
          50: '#FFFAEB',
          100: '#FFF3C4',
          200: '#FCE588',
          300: '#FADB5F',
          400: '#F7C948',
          500: '#F0B429',
          600: '#DE911D',
          700: '#CB6E17',
          800: '#B44D12',
          900: '#8D2B0B',
          950: '#5C1A06',
        },
        // Charcoal-based neutral scale (replaces default cool "slate" app-wide)
        slate: {
          50: '#F5F5F5',
          100: '#E8E8E8',
          200: '#D4D4D4',
          300: '#B0B0B0',
          400: '#8A8A8A',
          500: '#6B6B6B',
          600: '#4A4A4A',
          700: '#3A3A3A',
          800: '#2B2B2B', // Charcoal
          900: '#1E1E1E',
          950: '#141414',
        },
        navy: {
          800: '#2B2B2B',
          900: '#1E1E1E',
          950: '#141414',
        }
      },
    },
  },
  plugins: [],
}
