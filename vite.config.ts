import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import { chatApiPlugin } from './api/vite-plugin-chat';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.GROQ_API_KEY = env.GROQ_API_KEY;

  return {
    plugins: [
      react(),
      chatApiPlugin(),
      federation({
        name: 'fitness_remote',
        filename: 'remoteEntry.js',
        exposes: {
          './FitnessApp': './src/App.tsx',
          './HuberfitApp': './src/pages/Huberfit/HuberfitApp.tsx',
        },
        shared: ['react', 'react-dom'],
      }),
    ],
    // ESTA PARTE ES CRUCIAL PARA ARREGLAR EL ERROR DE FOR-EACH
    build: {
      modulePreload: false,
      target: 'esnext',
      minify: false,
      cssCodeSplit: false, // Fuerza a que todo el CSS vaya junto
    },
    preview: {
      port: 5003,
      strictPort: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  };
});