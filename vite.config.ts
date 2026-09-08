import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Honour the port the harness assigns; fall back to Vite's default locally.
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
});
