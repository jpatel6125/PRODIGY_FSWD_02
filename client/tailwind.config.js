/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#f8f9fa',
        'bg-secondary': '#edf2f7',
        'card-bg': '#ffffff',
        'input-bg': '#f7fafc',
        'text-primary': '#2d3748',
        'text-secondary': '#718096',
        'accent-primary': '#ff6b9d', // Modern pink
        'accent-secondary': '#ff4184', // Darker pink for hover states
        'danger': '#e53e3e',
      }
    },
  },
  plugins: [],
}
