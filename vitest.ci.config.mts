import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Only run tests that don't require Convex
    include: [
      'convex/demo.test.ts',
      // Add other non-Convex tests here
    ],
    exclude: [
      'convex/tests/**/*.test.ts', // Exclude Convex-dependent tests
      'convex/featureGating.test.ts',
    ],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'testing/reports/coverage',
      include: ['convex/**/*.ts'],
      exclude: [
        'convex/_generated/**',
        'convex/tests/**',
        'convex/**/*.test.ts',
        'convex/**/*.spec.ts',
      ],
    },
    reporters: ['verbose', 'json'],
    outputFile: {
      json: 'testing/reports/test-results.json',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
