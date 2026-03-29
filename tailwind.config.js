/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Base backgrounds
        'void':       '#050a12',
        'main':       '#080f1c',
        'secondary':  '#0d1626',
        'elevated':   '#111e33',
        'surface':    '#162035',
        'surface2':   '#1a2640',

        // Accent
        'cyan':       '#00d4ff',
        'cyan-dim':   '#0099bb',

        // Semantic
        'positive':   '#00e5a0',
        'negative':   '#ff4d6d',
        'warning':    '#ffb347',

        // Text
        'primary-text':   '#f0f4ff',
        'secondary-text': '#8b9ab8',
        'muted-text':     '#4a5a78',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.7rem',
        'xs':  '0.78rem',
        'sm':  '0.875rem',
        'base':'0.9375rem',
      },
      borderRadius: {
        'sm':   '6px',
        'md':   '10px',
        'lg':   '16px',
        'xl':   '20px',
        '2xl':  '28px',
        'full': '9999px',
      },
      boxShadow: {
        'card':   '0 2px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
        'lg':     '0 8px 32px rgba(0,0,0,0.5)',
        'cyan':   '0 0 24px rgba(0,212,255,0.15)',
        'cyan-btn': '0 4px 20px rgba(0,212,255,0.3)',
        'glow':   '0 0 8px rgba(0,212,255,0.5)',
      },
      backgroundImage: {
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 60%)',
        'top-accent': 'linear-gradient(to right, transparent, #0099bb, transparent)',
        'sidebar-glow': 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.25), transparent)',
      },
      animation: {
        'fade-in':    'fadeIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'spin-slow':  'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 },                        to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};