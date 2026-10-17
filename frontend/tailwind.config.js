/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "'Inter Variable'",
          "Inter",
          "'Noto Sans Devanagari'",
          "'Noto Sans Bengali'",
          "'Noto Sans Telugu'",
          "'Noto Sans Tamil'",
          "'Noto Sans Kannada'",
          "'Noto Sans Malayalam'",
          "'Noto Sans Gujarati'",
          "'Noto Sans Gurmukhi'",
          "'Noto Sans Oriya'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "'JetBrains Mono Variable'",
          "'JetBrains Mono'",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['20px', { lineHeight: '28px' }],
        xl: ['24px', { lineHeight: '32px' }],
        '2xl': ['28px', { lineHeight: '36px' }],
        '3xl': ['32px', { lineHeight: '40px' }],
      },
      spacing: {
        '4.5': '18px',
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        card: 'var(--shadow-card)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.15)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        none: 'none',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        DEFAULT: '150ms',
      },
      colors: {
        // Direct Semantic Design Tokens
        background: {
          DEFAULT: "var(--color-bg)",
          secondary: "var(--color-surface-raised)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
        },
        border: "var(--color-border)",
        text: {
          DEFAULT: "var(--color-text)",
          primary: "var(--color-text)",
          secondary: "var(--color-text-muted)",
          muted: "var(--color-text-muted)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          cool: "var(--color-info)",
        },
        critical: "var(--color-critical)",
        high: "var(--color-high)",
        medium: "var(--color-medium)",
        low: "var(--color-low)",
        info: "var(--color-info)",

        // Backward compatibility mappings
        base: "var(--bg-base)",
        panel: {
          DEFAULT: "var(--bg-panel)",
          alt: "var(--bg-panel-alt)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        card: {
          DEFAULT: "var(--card)",
          border: "var(--card-border)",
          secondary: "var(--card-bg-secondary)",
        },
        severity: {
          critical: "var(--severity-critical)",
          high: "var(--severity-high)",
          medium: "var(--severity-medium)",
          low: "var(--severity-low)",
        }
      }
    },
  },
  plugins: [],
}

