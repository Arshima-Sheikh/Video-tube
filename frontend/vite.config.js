import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      // Proxy all API requests to the backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/like': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/comment': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/playlist': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/dashboard': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/healthcheck': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
