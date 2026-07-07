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
        bmj: {
          black:         "#0D0C0B",
          cream:         "#E8DCC8",
          red:           "#C0281F",
          amber:         "#C8852A",
          brown:         "#3B2417",
          tan:           "#B8986A",
          white:         "#F2EDE4",
          paper:         "#F0DDBC",
          "deep-black":  "#1C130E",
          crimson:       "#712414",
          "medium-brown":"#5D3F2E",
          olive:         "#416100",
          gold:          "#C77A0E",
          purple:        "#554978",
          "text-body":   "rgba(232, 220, 200, 0.84)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "'Bebas Neue'", "sans-serif"],
        body:    ["var(--font-body)",    "Libre Baskerville", "serif"],
        label:   ["var(--font-label)",   "Oswald", "sans-serif"],
        mono:    ["var(--font-mono)",    "IBM Plex Mono", "monospace"],
        typewriter: ["var(--font-typewriter)", "Courier Prime", "monospace"],
      },
      letterSpacing: {
        display:       "var(--tracking-display)",
        section:       "var(--tracking-section)",
        wordmark:      "var(--tracking-wordmark)",
        label:         "var(--tracking-label)",
        "label-lg":    "var(--tracking-label-lg)",
        "label-wide":  "var(--tracking-label-wide)",
        "label-xl":    "var(--tracking-label-xl)",
        "label-max":   "var(--tracking-label-max)",
      },
      fontSize: {
        micro: ["var(--text-micro)", { lineHeight: "1.4" }],
        stamp: ["var(--text-stamp)", { lineHeight: "1.4" }],
      },
      lineHeight: {
        article: "var(--leading-article)",
      },
      maxWidth: {
        content: "1200px",
        article: "720px",
        wide:    "1440px",
      },
      backgroundImage: {
        "grain-texture": "var(--texture-url)",
      },
      boxShadow: {
        'elevation-1': 'var(--shadow-sm)',
        'elevation-2': 'var(--shadow-md)',
        'elevation-3': 'var(--shadow-lg)',
        'elevation-4': 'var(--shadow-xl)',
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'glow-red': 'var(--shadow-glow-red)',
        'glow-amber': 'var(--shadow-glow-amber)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
        'dramatic': '500ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'snappy': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'entrance': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      zIndex: {
        'dropdown': '100',
        'sticky': '200',
        'fixed': '300',
        'modal-backdrop': '400',
        'modal': '500',
        'popover': '600',
        'tooltip': '700',
        'notification': '800',
        'grain': '9999',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'fade-in-up': 'fadeInUp 400ms ease-out',
        'fade-in-down': 'fadeInDown 400ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'slide-in-left': 'slideInLeft 300ms ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% center' },
          '50%': { backgroundPosition: '100% center' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        tooltipPop: {
          '0%': { opacity: '0', transform: 'scale(0.8) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        rippleEffect: {
          '0%': { width: '0', height: '0', opacity: '1' },
          '100%': { width: '300px', height: '300px', opacity: '0' },
        },
        borderShift: {
          '0%': { filter: 'hue-rotate(0deg)', opacity: '1' },
          '100%': { filter: 'hue-rotate(360deg)', opacity: '1' },
        },
        loadingPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

