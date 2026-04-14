import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    port: 5173,
    proxy: {
      // anything starting with /api is proxied to your backend
      "/api": {
        target: "https://sajoan-b.techoptima.ai",
        changeOrigin: true,
        secure: false,
        // strip the leading /api when forwarding (keeps paths identical)
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
