module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{vue,js,ts,jsx,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        nav: '0 -4px 16px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
