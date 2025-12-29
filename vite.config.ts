import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // We use process.cwd() which is standard in Node.js environments (like Netlify build).
  // Cast process to any to avoid TypeScript error about cwd() missing on Process interface
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Netlify injects environment variables into process.env during the build.
  // We check the loaded env first, then fall back to the process environment.
  const apiKey = env.API_KEY || process.env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // This injects the API key into the client-side code.
      'process.env.API_KEY': JSON.stringify(apiKey),
      // This prevents "process is not defined" errors in client-side dependencies.
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});