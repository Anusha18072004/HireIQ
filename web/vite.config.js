import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        // Explicitly forward the Authorization header so the JWT token
        // reaches Spring Boot even if a proxy layer would otherwise strip it.
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const auth = req.headers['authorization'];
            if (auth) {
              proxyReq.setHeader('authorization', auth);
            }
          });
          proxy.on('error', (err) => {
            console.error('[vite proxy error]', err.message);
          });
        },
      }
    }
  }
})
