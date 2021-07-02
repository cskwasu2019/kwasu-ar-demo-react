const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./src/**/*.js', './src/**/*.jsx', './src/**/*.css'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      grey: colors.trueGray,
      white: colors.white,
      green: colors.green,
      red: colors.red,
    },
    fontFamily: {
      'open-sans': [
        'open sans',
        'Helvetica Neue',
        'Helvetica',
        'Arial',
        'sans-serif',
      ],
    },
    extend: {},
  },
  variants: {
    extend: {
      backgroundColor: ['odd', 'even'],
    },
  },
  plugins: [],
}
