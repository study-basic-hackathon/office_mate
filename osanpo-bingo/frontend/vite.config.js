import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Renderの静的サイトとして build/dist を公開
  build: {
    outDir: 'dist',
  },
})
