/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080B09',
          secondary: '#101510',
          card: '#151B16',
          elevated: '#1B231C',
        },
        accent: {
          lime: '#B7F56A',
          green: '#65C46D',
          muted: '#344A35',
        },
        text: {
          primary: '#F2F5F1',
          secondary: '#9BA69B',
        },
        border: {
          subtle: '#273128',
          card: '#1e2920',
        },
        aqi: {
          good: '#65C46D',
          moderate: '#FACC15',
          poor: '#FB923C',
          veryPoor: '#EF4444',
          severe: '#7F1D1D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
