const js = require('@eslint/js');
const vue = require('eslint-plugin-vue');
const globals = require('globals');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**', 'coverage/**'],
  },

  js.configs.recommended,
  ...vue.configs['flat/essential'],

  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Na start traktujemy „szum” jako ostrzeżenia, żeby nie blokować repo.
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'warn',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },

  {
    files: ['**/*.test.js', 'vitest.setup.js', 'vitest.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
];
