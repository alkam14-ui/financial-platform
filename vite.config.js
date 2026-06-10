import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/financial-platform/',
  plugins: [react()],
  build: {
    outDir: 'docs'
  },
  server: {
    port: 3000,
    open: true
  }
})
