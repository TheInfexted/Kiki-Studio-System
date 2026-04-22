import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#faf3ec',
        surface: '#f3e8de',
        tan: '#d9b99a',
        caramel: '#b5835a',
        warmbrown: '#7a5a46',
        espresso: '#3a2a23',
        brand: {
          50: '#fdf7f4',
          100: '#fbe9e1',
          500: '#b5835a',
          700: '#8a4a36',
        },
      },
      fontFamily: {
        display: [
          'var(--font-display)',
          '"Noto Serif SC"',
          'Georgia',
          'serif',
        ],
        serif: [
          'var(--font-display)',
          '"Noto Serif SC"',
          'Georgia',
          'serif',
        ],
        sans: [
          'var(--font-sans)',
          '"Noto Sans SC"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      maxWidth: {
        content: '1120px',
      },
      letterSpacing: {
        eyebrow: '0.18em',
      },
    },
  },
  plugins: [],
} satisfies Config;
