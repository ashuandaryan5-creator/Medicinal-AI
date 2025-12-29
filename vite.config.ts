import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Robustly get the API key, favoring the loaded env but falling back to process.env 
  // which is populated by Netlify's build system.
  const apiKey = env.API_KEY || process.env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // This is necessary to polyfill process.env.API_KEY for the @google/genai SDK
      // which expects to read from process.env.
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Prevent other process.env access from crashing client-side code
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});