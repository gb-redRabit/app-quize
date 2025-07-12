module.exports = {
  presets: [
    [
      '@vue/cli-plugin-babel/preset',
      {
        useBuiltIns: 'entry',
        polyfills: ['es.array.iterator', 'es.promise', 'es.object.assign', 'es.promise.finally'],
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@vue/babel-plugin-jsx',
    '@babel/plugin-proposal-nullish-coalescing-operator',
  ],
};