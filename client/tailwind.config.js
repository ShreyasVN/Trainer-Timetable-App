module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: {
            transform: 'translateY(100%)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'xs': '0 0 0 1px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'inner-glow': 'inset 0 1px 3px rgba(255, 255, 255, 0.6)',
      },
      colors: {
        'glass-light': 'rgba(255, 255, 255, 0.3)',
        'glass-dark': 'rgba(31, 38, 135, 0.37)',
      },
    },
  },
  plugins: [],
};

