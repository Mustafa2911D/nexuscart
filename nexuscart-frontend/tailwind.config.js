/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1', 
        secondary: '#10b981', 
        dark: '#1f2937', 
        light: '#f9fafb', 
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceOnce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      },
      animation: {
        pop: 'pop 220ms ease-out',
        bounceOnce: 'bounceOnce 350ms ease-out',
        slideInRight: 'slideInRight 280ms ease-out',
        fadeIn: 'fadeIn 300ms ease-out',
      },
      boxShadow: {
        'elevated': '0 10px 25px rgba(0,0,0,0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
