
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color scheme from existing CSS
        bg: {
          DEFAULT: '#050816',
          elevated: '#070b16',
          soft: '#0b1020',
        },
        card: {
          DEFAULT: '#0f172a',
          hover: '#1e293b',
        },
        border: {
          subtle: 'rgba(148, 163, 184, 0.2)',
          DEFAULT: 'rgba(148, 163, 184, 0.3)',
        },
        accent: {
          DEFAULT: '#fbbf24',
          soft: 'rgba(251, 191, 36, 0.1)',
          hover: '#fcd34d',
        },
        accent2: '#a855f7',
        text: {
          primary: '#e5e7eb',
          muted: '#9ca3af',
          soft: '#6b7280',
        },
        danger: '#f97373',
        success: '#4ade80',
      },
      borderRadius: {
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        soft: '0 22px 60px rgba(15, 23, 42, 0.65)',
        glow: '0 0 20px rgba(251, 191, 36, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionDuration: {
        'fast': '180ms',
      },
    },
  },
  plugins: [],
}
