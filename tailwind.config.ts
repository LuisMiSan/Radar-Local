import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#1a1f3c',
          50: '#f0f1f8',
          100: '#d9dbe8',
          200: '#b3b7d1',
          300: '#8d93ba',
          400: '#676fa3',
          500: '#414b8c',
          600: '#333d70',
          700: '#262e54',
          800: '#1a1f3c',
          900: '#0d1020',
        },
        accent: {
          DEFAULT: '#00d4a0',
          50: '#e6faf5',
          100: '#b3f0e0',
          200: '#80e6cb',
          300: '#4ddcb6',
          400: '#1ad2a1',
          500: '#00d4a0',
          600: '#00aa80',
          700: '#008060',
          800: '#005540',
          900: '#002b20',
        },
        neutral: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
      },
    },
  },
  plugins: [],
};
export default config;
