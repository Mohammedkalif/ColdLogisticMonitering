import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration.
 *
 * - `@` is aliased to `src` so imports stay stable when files move.
 * - The dev server binds to all interfaces so it can be reached from
 *   containers / remote preview environments.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    // Allows HMR to work behind an HTTPS reverse proxy (preview environments).
    hmr: process.env.VITE_HMR_CLIENT_PORT
      ? { clientPort: Number(process.env.VITE_HMR_CLIENT_PORT), protocol: 'wss' }
      : undefined,
  },
  preview: {
    host: true,
    port: 4173,
    // Required when the production preview is served through a reverse proxy
    // (cloud preview environments, staging domains).
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Keep heavy, rarely-changing libraries in their own chunks.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
});
