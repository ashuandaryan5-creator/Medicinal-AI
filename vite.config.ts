import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // This is necessary to polyfill process.env.API_KEY for the @google/genai SDK.
      // We use JSON.stringify to ensure it is inserted as a string literal.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process.env as an empty object to prevent crashes if libraries try to access it.
      'process.env': JSON.stringify({})
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});