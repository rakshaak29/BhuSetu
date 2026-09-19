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
        },
        // Organic / Natural Design Tokens
        organic: {
          bg: '#FDFCF8',           // Rice Paper / Off-white
          fg: '#2C2C24',           // Deep Loam / Charcoal
          primary: '#5D7052',      // Moss Green
          'primary-hover': '#4E5E44',
          'primary-fg': '#F3F4F1', // Pale Mist
          clay: '#C18C5D',         // Terracotta / Clay
          'clay-hover': '#AF7B4E',
          'clay-fg': '#FFFFFF',
          sand: '#E6DCCD',         // Sand / Beige
          bark: '#4A4A40',         // Bark
          stone: '#F0EBE5',        // Stone
          'stone-muted': '#78786C',// Dried Grass
          timber: '#DED8CF',       // Raw Timber
          destructive: '#A85448',  // Burnt Sienna
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(93, 112, 82, 0.15)',
        'float': '0 10px 40px -10px rgba(193, 140, 93, 0.20)',
        'lift': '0 20px 40px -10px rgba(93, 112, 82, 0.15)',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-nunito)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
};
export default config;
