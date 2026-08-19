import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: 'dist',
    // Content ist Teil des Bundles (statisches JSON, vgl. docs/01-architektur.md)
    assetsInlineLimit: 4096,
  },
})
