import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // CLI integration tests spawn Node/tsx workers and legitimately take >5s on Windows.
    // Limit parallelism so child-process tests do not starve each other.
    maxWorkers: 4,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
