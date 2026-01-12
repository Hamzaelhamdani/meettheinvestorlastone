import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: 'inline-cheap-module-source-map'
  },
  server: {
    hmr: {
      overlay: false
    }
  }
})
