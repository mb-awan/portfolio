import type { Config } from 'tailwindcss';
const { default: flattenColorPalette } = require('tailwindcss/lib/util/flattenColorPalette');

const config = {
  content: ['src/app/**/*.{js,ts,jsx,tsx,mdx,json}', 'src/components/**/*.{js,ts,jsx,tsx,mdx,json}'],
  darkMode: ['selector'],
  plugins: [require('tailwindcss-animate'), addVariablesForColors],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        aurora: 'aurora 60s linear infinite',
        reveal: 'reveal 0.7s ease-in-out',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        border: 'hsl(var(--border))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        foreground: 'hsl(var(--foreground))',
        input: 'hsl(var(--input))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        ring: 'hsl(var(--ring))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
      },
      fontFamily: {
        heading: 'var(--heading-font)',
      },
      fontSize: {
        '2xl': '1.563rem',
        '3xl': '1.954rem',
        '4xl': '2.442rem',
        '5xl': '3.053rem',
        base: '1rem',
        sm: '0.800rem',
        xl: '1.250rem',
      },
      fontWeight: {
        bold: '700',
        normal: '400',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        aurora: {
          from: {
            backgroundPosition: '50% 50%, 50% 50%',
          },
          to: {
            backgroundPosition: '350% 50%, 350% 50%',
          },
        },
        reveal: {
          '0%': { filter: 'brightness(1) blur(15px)', opacity: '0', scale: '1.0125' },
          '10%': { filter: 'brightness(1.25) blur(10px)', opacity: '1' },
          '100%': { filter: 'brightness(1) blur(0)', opacity: '1', scale: '1' },
        },
      },
      lineHeight: {
        slacker: '1.75',
      },
    },
  },
} satisfies Config;

export default config;

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme('colors'));
  let newVars = Object.fromEntries(Object.entries(allColors).map(([key, val]) => [`--${key}`, val]));

  addBase({
    ':root': newVars,
  });
}
