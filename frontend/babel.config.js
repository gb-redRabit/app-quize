module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    // Dodaj tę linię, aby włączyć obsługę optional chaining
    '@babel/plugin-proposal-optional-chaining',
  ],
};
