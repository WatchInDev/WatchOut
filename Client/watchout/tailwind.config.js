/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        light: ['Roboto_300Light', 'sans-serif'],
        medium: ['Roboto_500Medium', 'sans-serif'],
        semibold: ['Roboto_600SemiBold', 'sans-serif'],
        bold: ['Roboto_700Bold', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
