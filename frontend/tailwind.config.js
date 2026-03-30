/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary, #ffffff)',
          secondary: 'var(--brand-secondary, #a0a0a0)',
          accent: 'var(--brand-accent, #ffffff)',
        },
      },
      fontFamily: {
        brand: ['var(--brand-font, "Inter")', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
