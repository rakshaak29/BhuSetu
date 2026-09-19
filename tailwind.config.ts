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
        parchment: {
          base: '#FAF9F5',
          muted: '#F5F4F0',
          elevated: '#FFFFFF',
          border: '#E4E2DC',
          borderStrong: '#D0CDC4',
        },
        carbon: {
          primary: '#14191F',
          secondary: '#2A323D',
          muted: '#556070',
        },
        terracotta: {
          DEFAULT: '#C85A32',
          hover: '#B85028',
          light: '#FDF4F0',
        },
        status: {
          verified: {
            bg: '#E8F5EE',
            border: '#A7F3D0',
            text: '#1E7B4D',
            badge: '#1E7B4D',
          },
          mismatch: {
            bg: '#FFF1F2',
            border: '#FCA5A5',
            text: '#991B1B',
            badge: '#DC2626',
          },
          disputed: {
            bg: '#FEE2E2',
            border: '#FECACA',
            text: '#DC2626',
            badge: '#DC2626',
          },
          pending: {
            bg: '#FEF3C7',
            border: '#FDE68A',
            text: '#D97706',
            badge: '#D97706',
          },
          superseded: {
            bg: '#F3E8FF',
            border: '#D8B4FE',
            text: '#6B21A8',
            badge: '#8B5CF6',
          },
          unavailable: {
            bg: '#F1F5F9',
            border: '#CBD5E1',
            text: '#475569',
            badge: '#64748B',
          }
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      }
    },
  },
  plugins: [],
};
export default config;
