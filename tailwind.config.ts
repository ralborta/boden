import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4A90E2",
        secondary: "#50E3C2",
        "background-light": "#F8F9FA",
        "card-light": "#FFFFFF",
        "text-light": "#212529",
        "subtext-light": "#6c757d",
        "border-light": "#DEE2E6"
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem"
      },
      boxShadow: {
        soft: "0 4px 10px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
}
export default config

