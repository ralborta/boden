import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C3AED",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        secondary: {
          DEFAULT: "#10B981",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        "background-light": "#F8F9FA",
        "card-light": "#FFFFFF",
        "text-light": "#1F2937",
        "subtext-light": "#6B7280",
        "border-light": "#E5E7EB",
        "whatsapp-green": "#25D366",
        "whatsapp-dark": "#075E54",
        "whatsapp-light": "#DCF8C6",
      },
      borderRadius: {
        DEFAULT: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.08)",
        medium: "0 4px 16px rgba(0,0,0,0.12)",
        large: "0 8px 24px rgba(0,0,0,0.16)",
        "inner-soft": "inset 0 2px 4px rgba(0,0,0,0.06)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
        "gradient-secondary": "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
        "gradient-purple": "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
      },
    },
  },
  plugins: [],
}
export default config

