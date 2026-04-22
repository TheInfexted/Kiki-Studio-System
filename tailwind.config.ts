import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf7f4',
          100: '#fbe9e1',
          500: '#c9826d',
          700: '#8a4a36',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
