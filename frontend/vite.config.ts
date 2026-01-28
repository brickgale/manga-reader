import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const BACKEND_PORT = parseInt(process.env.BACKEND_PORT || '3000')
const FRONTEND_PORT = parseInt(process.env.FRONTEND_PORT || '5173')
const VHOST_DOMAIN = process.env.VHOST_DOMAIN || 'mangareader.local'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: FRONTEND_PORT,
    host: true,
    allowedHosts: [VHOST_DOMAIN, 'localhost'],
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: `http://backend:${BACKEND_PORT}`,
        changeOrigin: true,
      },
    },
  },
})
