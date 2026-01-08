import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/face-marker-web/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          detection: ['@mediapipe/tasks-vision', 'face-api.js']
        }
      }
    }
  },
  server: {
    port: 61109,
    host: true,  // Allow external connections
    allowedHosts: ['dev.9bow.io', 'localhost']
  },
  preview: {
    port: 61109,
    host: true // Allow external connections
  }
})
