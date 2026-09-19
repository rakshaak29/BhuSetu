import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bccadc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        status: {
          verified: {
            bg: '#f0fdf4',
            border: '#86efac',
            text: '#166534',
            badge: '#22c55e',
          },
          mismatch: {
            bg: '#fff1f2',
            border: '#fca5a5',
            text: '#991b1b',
            badge: '#ef4444',
          },
          disputed: {
            bg: '#fef2f2',
            border: '#f87171',
            text: '#7f1d1d',
            badge: '#dc2626',
          },
          pending: {
            bg: '#fffbe6',
            border: '#ffe58f',
            text: '#ad6800',
            badge: '#faad14',
          },
          superseded: {
            bg: '#f3e8ff',
            border: '#d8b4fe',
            text: '#6b21a8',
            badge: '#a855f7',
          },
          unavailable: {
            bg: '#f1f5f9',
            border: '#cbd5e1',
            text: '#475569',
            badge: '#64748b',
          }
        }
      },
    },
  },
  plugins: [],
};
export default config;
