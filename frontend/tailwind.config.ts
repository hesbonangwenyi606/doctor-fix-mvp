import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12213D',      // deep navy — headers, primary text
        signal: '#E85D2F',   // safety-orange — urgent actions, emergency accents
        fix: '#1F8A70',      // repair-green — success, completed, verified
        haze: '#F6F5F2',     // warm light grey — page background
        line: '#E4E1D8',     // hairline borders
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
};
export default config;
