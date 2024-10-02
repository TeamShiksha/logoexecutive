import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { babel } from '@rollup/plugin-babel';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic', // Enable the new JSX transform
    }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      include: ['src/**/*'],
      babelrc: false, // Set to false if you don't use a separate .babelrc
      presets: [
        '@babel/preset-env',
        ['@babel/preset-react', { runtime: 'automatic' }]
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js'],
    include: ['src/**/*.test.js'],
    exclude: ['src/@types', 'node_modules'],
  },
});