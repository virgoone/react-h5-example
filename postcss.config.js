module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-mobile-forever': {
      unitPrecision: 6,
      viewportWidth: 375,
      // mobileUnit: 'vmin',
      exclude: /@tanstack\/react-query-devtools/,
    },
  },
};
