import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@liuzu/domain': fileURLToPath(
        new URL('./packages/domain/src/index.ts', import.meta.url),
      ),
      '@liuzu/ui': fileURLToPath(
        new URL('./packages/ui/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['apps/**/*.{test,spec}.{ts,tsx}', 'packages/**/*.{test,spec}.{ts,tsx}'],
    css: true,
  },
});
