import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const mapplsStaticKey =
    env.VITE_MAPPLS_STATIC_KEY ||
    process.env.VITE_MAPPLS_STATIC_KEY ||
    env.VITE_MAPPLS_KEY ||
    process.env.VITE_MAPPLS_KEY ||
    env.VITE_MAPPLS_API_KEY ||
    process.env.VITE_MAPPLS_API_KEY ||
    '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      ...(mapplsStaticKey
        ? {
            'import.meta.env.VITE_MAPPLS_STATIC_KEY': JSON.stringify(mapplsStaticKey),
          }
        : {}),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
