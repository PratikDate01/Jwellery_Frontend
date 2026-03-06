/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF0',
          100: '#FBF5D5',
          200: '#F5E6A3',
          300: '#EED36C',
          400: '#E7BD3D',
          500: '#D4AF37', // Primary Luxury Gold
          600: '#B59129',
          700: '#8E7022',
          800: '#6C541C',
          900: '#524018',
        },
        luxury: {
          ivory: '#FAF9F6',
          cream: '#F5F5DC',
          slate: '#2C3E50',
          gold: '#C5A021',
          soft: '#F8F8F8',
          border: '#E5E5E5',
          gray: '#F8F9FA',
          black: '#1A1A1A',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
