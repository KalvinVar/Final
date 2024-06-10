import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Final/finaltest/', // Set the base path to match your GitHub Pages URL
  plugins: [react()],
});
