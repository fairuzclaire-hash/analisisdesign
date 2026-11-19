import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  define: {
    // Expose OPENROUTER_API_KEY to client (without VITE_ prefix)
    'import.meta.env.OPENROUTER_API_KEY': JSON.stringify(process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY)
  }
});