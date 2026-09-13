// ESLint Flat Config (ESLint 9) – https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierPlugin = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  prettierPlugin,
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'web-build/**',
      'coverage/**',
      'android/**',
      'ios/**',
      'babel.config.js',
      'eslint.config.js',
      'jest.config.js',
    ],
  },
  {
    rules: {
      // Prettier-Verstöße als Warnung, damit `lint` nicht an Formatierung scheitert (Fix via `format`).
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // In Tests sind console.log und lockere Typen akzeptabel.
    files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx', 'jest.setup.ts'],
    rules: {
      'no-console': 'off',
      // Frische Modul-Instanzen (Singletons) brauchen require() nach jest.resetModules().
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);
