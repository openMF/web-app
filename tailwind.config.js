/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: process.env.TAILWIND_MODE ? 'jit' : '',
  content: [
    "./src/app/**/*.{html,js}",
    './index.html',
  ],
  theme: {
    extends: {
      animation: {
        wiggle: 'wiggle 1s ease-in-out infinite',
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'fade-out-down': 'fade-out-down 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'fade-out-up': 'fade-out-up 0.3s ease-out',
      },
      boxShadow: {
        custom: '0px 0px 50px 0px rgb(82 63 105 / 15%)',
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")
  ],
}

