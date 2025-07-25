import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      '/uploads': 'http://localhost:5000' // your Express backend port
    }
  },
  resolve: {
    alias: {
      '@': path.resolve('__dirname', 'src')
    }
  }
})
