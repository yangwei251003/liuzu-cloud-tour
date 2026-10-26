import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.PAGES_BASE_PATH ? `${process.env.PAGES_BASE_PATH}admin/` : '/admin/',
  plugins: [react(), tailwindcss()],
  server: { port: 5174 },
  preview: { port: 4174 },
});
