import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'fitness_remote',
      filename: 'remoteEntry.js',
      exposes: { './FitnessApp': './src/App.tsx' },
      shared: ['react', 'react-dom'],
    }),
  ],
  preview: { port: 5003, strictPort: true }
});