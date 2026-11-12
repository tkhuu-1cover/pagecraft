import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    // Forwards the assistant's requests to server/ai-proxy.mjs during development.
    proxy: { '/api': 'http://localhost:8787' }
  }
});
