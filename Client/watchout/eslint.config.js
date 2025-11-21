/* eslint-env node */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'react/display-name': 'off',
      'no-restricted-imports': [
        'error',
        {
          'patterns': ['../*']
        }
      ],
      '@typescript-eslint/no-unused-vars': ['warn'],
      'eqeqeq': 'error',
      'prefer-const': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react/no-array-index-key': 'warn',
      'react/jsx-pascal-case': 'error',
    },
  },
]);