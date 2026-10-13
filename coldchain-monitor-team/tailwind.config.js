/** @type {import('tailwindcss').Config} */

/**
 * Design tokens are exposed as CSS variables (see `src/styles/index.css`) and
 * mapped to semantic Tailwind colour names here.
 *
 * Never use raw hex values or raw palette colours (e.g. `bg-slate-800`) in
 * components — always use the semantic tokens below so the whole product can
 * be re-themed from a single place.
 */
const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Application background (page canvas, sidebar, top bar) */
        app: withOpacity('--color-app'),

        /* Cards, panels, popovers */
        surface: {
          DEFAULT: withOpacity('--color-surface'),
          muted: withOpacity('--color-surface-muted'),
          hover: withOpacity('--color-surface-hover'),
        },

        /* Borders and dividers */
        line: {
          DEFAULT: withOpacity('--color-line'),
          strong: withOpacity('--color-line-strong'),
        },

        /* Text */
        content: {
          primary: withOpacity('--color-content-primary'),
          secondary: withOpacity('--color-content-secondary'),
          muted: withOpacity('--color-content-muted'),
          inverted: withOpacity('--color-content-inverted'),
        },

        /* Brand / interactive */
        brand: {
          DEFAULT: withOpacity('--color-brand'),
          hover: withOpacity('--color-brand-hover'),
          soft: withOpacity('--color-brand-soft'),
        },

        /* Status */
        success: {
          DEFAULT: withOpacity('--color-success'),
          soft: withOpacity('--color-success-soft'),
        },
        warning: {
          DEFAULT: withOpacity('--color-warning'),
          soft: withOpacity('--color-warning-soft'),
        },
        danger: {
          DEFAULT: withOpacity('--color-danger'),
          soft: withOpacity('--color-danger-soft'),
        },
        info: {
          DEFAULT: withOpacity('--color-info'),
          soft: withOpacity('--color-info-soft'),
        },
      },
      fontFamily: {
        sans: [
          'Inter Variable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        control: '10px',
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.16)',
        elevated: '0 4px 16px -4px rgb(0 0 0 / 0.24), 0 1px 2px 0 rgb(0 0 0 / 0.12)',
        popover: '0 12px 32px -8px rgb(0 0 0 / 0.36), 0 2px 6px -2px rgb(0 0 0 / 0.20)',
        focus: '0 0 0 3px rgb(var(--color-brand) / 0.28)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      spacing: {
        sidebar: '16rem',
        'sidebar-collapsed': '4.5rem',
        topbar: '3.75rem',
      },
      zIndex: {
        sidebar: '40',
        topbar: '30',
        overlay: '50',
        popover: '60',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 200ms ease-out',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
