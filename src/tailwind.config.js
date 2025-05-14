/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        backgroundColor: {
          'page': '#f9fafb',
          'card': '#ffffff',
        },
        textColor: {
          'primary': '#111827',
          'secondary': '#4b5563',
        },
        borderColor: {
          'default': '#e5e7eb',
        },
      },
    },
    plugins: [],
  }