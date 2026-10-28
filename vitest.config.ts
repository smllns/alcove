import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// The tests: the API against a database of its own, made for the run and
// gone after it (server/test), and the client's plain logic (src, *.test.ts)
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['server/test/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'node',
    globalSetup: ['server/test/globalSetup.ts'],
    // Each file in a process of its own, starting from the environment the
    // setup prepared
    pool: 'forks',
  },
});
