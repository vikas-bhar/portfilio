import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/**/*.test.ts'],
    restoreMocks: true,
    maxWorkers: 2,
    testTimeout: 15_000,
  },
});
