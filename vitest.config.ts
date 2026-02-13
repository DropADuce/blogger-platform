import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    cache: false,
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
    },
    pool: 'forks',
    isolate: false,
    fileParallelism: false,
  },
});
